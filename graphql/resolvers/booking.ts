import { GraphQLError } from 'graphql';
import { BookingType, Resolvers } from 'types/graphql';
import db from '@db/index';
import { booking as bookingSchema } from 'db/schema/booking';
import { tattoo as tattooSchema } from 'db/schema/tattoo';
import { generateImageUrls } from 'utils/image';
import { StorageBucket } from 'types/storage';
import { desc, eq } from 'drizzle-orm';
import { getBookingDuration } from 'utils/booking';
import { getArtistPrices } from 'utils/stripe';

const resolvers: Resolvers = {
  Query: {
    customerBooking: async (_, { id: bookingId }, { user }) => {
      const booking = await db.query.booking.findFirst({
        where: (booking, { eq, and }) =>
          and(eq(booking.id, bookingId), eq(booking.userId, user.id)),
        with: {
          customer: true,
          artist: true,
          tattoo: true,
        },
      });
      if (!booking) {
        throw new GraphQLError('Booking not found');
      }
      return {
        ...booking,
        duration: getBookingDuration(booking),
        tattoo: {
          ...booking.tattoo,
          id: booking.tattooId,
          imageUrls: generateImageUrls(
            booking.tattoo.imagePaths,
            StorageBucket.TATTOOS,
          ),
        },
      };
    },
    artistBooking: async (_, { id: bookingId }, { user }) => {
      const booking = await db.query.booking.findFirst({
        where: (booking, { eq, and }) =>
          and(eq(booking.id, bookingId), eq(booking.artistId, user.id)),
        with: {
          customer: true,
          artist: true,
          tattoo: true,
        },
      });
      if (!booking) {
        throw new GraphQLError('Booking not found');
      }
      const bookingPayload = {
        ...booking,
        duration: getBookingDuration(booking),
        tattoo: {
          ...booking.tattoo,
          id: booking.tattooId,
          imageUrls: generateImageUrls(
            booking.tattoo.imagePaths,
            StorageBucket.TATTOOS,
          ),
        },
      };
      if (booking.status !== 'COMPLETED') {
        return bookingPayload;
      }
      const { hourlyRatePrice, consultationFeePrice } =
        await getArtistPrices(user);
      if (booking.type === 'TATTOO_SESSION') {
        if (!hourlyRatePrice) {
          throw new GraphQLError('Hourly rate price not found');
        }
        return {
          ...bookingPayload,
          cost: hourlyRatePrice.unit_amount,
        };
      } else {
        if (!consultationFeePrice) {
          throw new GraphQLError('Consultation fee price not found');
        }
        return {
          ...bookingPayload,
          cost: consultationFeePrice.unit_amount,
        };
      }
    },
    artistBookings: async (_, __, { user }) => {
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      const bookings = await db.query.booking.findMany({
        where: (booking, { eq }) => eq(booking.artistId, user.id),
        orderBy: [desc(bookingSchema.createdAt)],
        with: {
          customer: true,
          artist: true,
          tattoo: true,
        },
      });
      return bookings.map((booking) => ({
        ...booking,
        duration: getBookingDuration(booking),
        tattoo: {
          ...booking.tattoo,
          id: booking.tattooId,
          imageUrls: generateImageUrls(
            booking.tattoo.imagePaths,
            StorageBucket.TATTOOS,
          ),
        },
      }));
    },
    customerBookings: async (_, { status }, { user }) => {
      if (user.userType !== 'CUSTOMER') {
        throw new GraphQLError('User is not a customer');
      }
      if (status) {
        const bookings = await db.query.booking.findMany({
          where: (booking, { eq, and }) =>
            and(eq(booking.userId, user.id), eq(booking.status, status)),
          orderBy: [desc(bookingSchema.createdAt)],
          with: {
            customer: true,
            artist: true,
            tattoo: true,
          },
        });
        return bookings.map((booking) => ({
          ...booking,
          duration: getBookingDuration(booking),
          tattoo: {
            ...booking.tattoo,
            id: booking.tattooId,
            imageUrls: generateImageUrls(
              booking.tattoo.imagePaths,
              StorageBucket.TATTOOS,
            ),
          },
        }));
      }
      const bookings = await db.query.booking.findMany({
        where: (booking, { eq }) => eq(booking.userId, user.id),
        orderBy: [desc(bookingSchema.createdAt)],
        with: {
          customer: true,
          artist: true,
          tattoo: true,
        },
      });
      return bookings.map((booking) => ({
        ...booking,
        duration: getBookingDuration(booking),
        tattoo: {
          ...booking.tattoo,
          id: booking.tattooId,
          imageUrls: generateImageUrls(
            booking.tattoo.imagePaths,
            StorageBucket.TATTOOS,
          ),
        },
      }));
    },
  },
  Mutation: {
    artistCreateBooking: async (_, { input }, { user: currentUser }) => {
      if (currentUser.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist');
      }
      const { customerEmail, tattoo: newTattooInput } = input;
      const customer = await db.query.users.findFirst({
        where: (user, { eq, and }) =>
          and(
            eq(user.email, customerEmail.toLowerCase()),
            eq(user.userType, 'CUSTOMER'),
          ),
      });
      if (!customer) {
        throw new GraphQLError('Customer not found');
      }
      // create booking with existing tattoo
      if (input.tattooId) {
        const tattoo = await db.query.tattoo.findFirst({
          where: (tattoo, { eq }) => eq(tattoo.id, input.tattooId as string),
        });
        if (!tattoo) {
          throw new GraphQLError(
            'Please provide a valid tattoo id or new tattoo info',
          );
        }
        const newBooking = await db.transaction(async (tx) => {
          const [newBooking] = await tx
            .insert(bookingSchema)
            .values({
              artistId: currentUser.id,
              userId: customer.id,
              tattooId: input.tattooId as string,
              type: input.type as BookingType,
              startDate: input.startDate,
              endDate: input.endDate,
            })
            .returning();
          return {
            ...newBooking,
            tattoo: {
              ...tattoo,
              imageUrls: generateImageUrls(
                tattoo.imagePaths,
                StorageBucket.TATTOOS,
              ),
            },
          };
        });
        return newBooking;
      }
      // create tattoo and associated booking for new tattoo
      if (!newTattooInput) {
        throw new GraphQLError(
          'Please provide a valid tattoo id or new tattoo info',
        );
      }
      // we need all transactions to be atomic
      // meaning if one fails, all should fail
      const newBooking = await db.transaction(async (tx) => {
        const [newTattoo] = await tx
          .insert(tattooSchema)
          .values({
            ...newTattooInput,
            userId: customer.id,
            imagePaths: newTattooInput.imagePaths || [],
          })
          .returning();
        const [newBooking] = await tx
          .insert(bookingSchema)
          .values({
            artistId: currentUser.id,
            userId: customer.id,
            tattooId: newTattoo.id,
            type: input.type as BookingType,
            startDate: input.startDate,
            endDate: input.endDate,
          })
          .returning();
        return {
          ...newBooking,
          tattoo: {
            ...newTattoo,
            imageUrls: generateImageUrls(
              newTattoo.imagePaths,
              StorageBucket.TATTOOS,
            ),
          },
        };
      });
      return newBooking;
    },
    artistUpdateBookingStatus: async (
      _,
      { id, status: newStatus, duration },
      { user },
    ) => {
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist');
      }
      // check if booking exists
      const booking = await db.query.booking.findFirst({
        where: (booking, { eq }) => eq(booking.id, id),
        with: {
          tattoo: true,
        },
      });
      if (!booking) {
        throw new GraphQLError('Booking not found');
      }
      // check if booking belongs to artist
      if (booking.artistId !== user.id) {
        throw new GraphQLError('Booking does not belong to artist');
      }
      const isSameStatus = booking.status === newStatus;
      if (isSameStatus) {
        throw new GraphQLError(`Booking already has status ${newStatus}`);
      }
      // declare end date for db update
      let endsAt = null;
      const isCompleted = newStatus === 'COMPLETED';
      // need to calculate duration for tattoo session for billing and records
      if (isCompleted && booking.type === 'TATTOO_SESSION') {
        if (!booking.startDate) {
          throw new GraphQLError('Booking has no start date');
        }
        if (!duration) {
          throw new GraphQLError('Please provide duration for tattoo session');
        }
        // get end date from start date and duration
        const startDateObj = new Date(booking.startDate);
        const durationInMilliseconds = duration * 60 * 60 * 1000; // convert duration from hours to milliseconds
        const endDateObj = new Date(
          startDateObj.getTime() + durationInMilliseconds,
        );
        endsAt = endDateObj;
      }
      const [updatedBooking] = await db
        .update(bookingSchema)
        .set({
          status: newStatus,
          endDate: endsAt,
          completedAt: isCompleted ? new Date() : null,
        })
        .where(eq(bookingSchema.id, id))
        .returning();
      return {
        ...updatedBooking,
        tattoo: {
          ...booking.tattoo,
          id: booking.tattooId,
          imageUrls: generateImageUrls(
            booking.tattoo.imagePaths,
            StorageBucket.TATTOOS,
          ),
        },
      };
    },
  },
};

export default resolvers;
