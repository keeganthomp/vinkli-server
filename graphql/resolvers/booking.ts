import db from '@db/index';
import schemas from '@db/schema';
import { GraphQLError } from 'graphql';
import { BookingType, Resolvers } from '@type/graphql';
import { User } from '@type/db';
import { generateImageUrls } from '@utils/image';
import { StorageBucket } from '@type/storage';
import { desc, eq } from 'drizzle-orm';
import { getBookingDuration, getAmountDue } from '@utils/booking';
import { supabase } from '@lib/supabase';

type NewBooking = typeof schemas.bookingSchema.$inferInsert;

const resolvers: Resolvers = {
  Query: {
    userBooking: async (_, { id: bookingId }, { user }) => {
      const bookingKey = user.userType === 'ARTIST' ? 'artistId' : 'userId';
      const booking = await db.query.booking.findFirst({
        where: (booking, { eq, and }) =>
          and(eq(booking.id, bookingId), eq(booking[bookingKey], user.id)),
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
      const totalDue = await getAmountDue(booking.artist, booking);
      return {
        ...bookingPayload,
        totalDue,
      };
    },
    userBookings: async (_, { status }, { user }) => {
      const bookingKey = user.userType === 'ARTIST' ? 'artistId' : 'userId';
      console.log('status', status);
      if (status) {
        const bookings = await db.query.booking.findMany({
          where: (booking, { eq, and }) =>
            and(eq(booking[bookingKey], user.id), eq(booking.status, status)),
          orderBy: [desc(schemas.bookingSchema.createdAt)],
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
        where: (booking, { eq }) => eq(booking[bookingKey], user.id),
        orderBy: [desc(schemas.bookingSchema.createdAt)],
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
      const { phone, tattoo: newTattooInput } = input;
      let customer = await db.query.users.findFirst({
        where: (user, { eq, and }) =>
          and(eq(user.phone, phone), eq(user.userType, 'CUSTOMER')),
      });
      if (!customer) {
        const { data, error: errorCreatingNewCustomer } =
          await supabase.auth.admin.createUser({
            phone,
          });
        if (errorCreatingNewCustomer) {
          throw new GraphQLError('Error creating new customer');
        }
        customer = {
          id: data.user.id,
          createdAt: new Date(data.user.created_at),
          updatedAt: data.user.updated_at
            ? new Date(data.user.updated_at)
            : null,
          email: data.user.email,
          phone: data.user.phone,
          userType: data.user.user_metadata.user_type,
          name: data.user.user_metadata.name,
          // to satisfy User type
          // don't need this explicitely for anything for the customer type
          phoneNumber: null,
          stripeAccountId: null,
          stripeCustomerId: null,
          hasOnboardedToStripe: null,
        } as User;
      }
      const newBookingPayload: Omit<NewBooking, 'tattooId'> = {
        artistId: currentUser.id,
        userId: customer.id,
        type: input.type as BookingType,
        startDate: input.startDate,
        endDate: input.endDate,
        status: 'CONFIRMED',
      };
      // create booking with existing tattoo
      if (input.tattooId) {
        const tattoo = await db.query.tattoo.findFirst({
          where: (tattoo, { eq }) => eq(tattoo.id, input.tattooId as string),
        });
        if (!tattoo) {
          throw new GraphQLError('Tattoo not found');
        }
        const newBooking = await db.transaction(async (tx) => {
          const [newBooking] = await tx
            .insert(schemas.bookingSchema)
            .values({
              ...newBookingPayload,
              tattooId: input.tattooId as string,
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
      // we need all transactions to be atomic
      // meaning if one fails, all should fail
      const newBooking = await db.transaction(async (tx) => {
        const newTattooPayload = newTattooInput || {};
        const [newTattoo] = await tx
          .insert(schemas.tattooSchema)
          .values({
            ...newTattooPayload,
            userId: customer?.id as string,
            imagePaths: newTattooPayload?.imagePaths || [],
          })
          .returning();
        const [newBooking] = await tx
          .insert(schemas.bookingSchema)
          .values({
            ...newBookingPayload,
            tattooId: newTattoo.id,
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
        throw new GraphQLError('User is not an artist', {
          extensions: { code: 'FORBIDDEN' },
        });
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
        .update(schemas.bookingSchema)
        .set({
          status: newStatus,
          endDate: endsAt,
          completedAt: isCompleted ? new Date() : null,
        })
        .where(eq(schemas.bookingSchema.id, id))
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
    customerCreateBooking: async (_, { input }) => {
      const artistForBooking = await db.query.users.findFirst({
        where: (user, { eq, and }) =>
          and(eq(user.id, input.artistId), eq(user.userType, 'ARTIST')),
      });
      if (!artistForBooking) {
        throw new GraphQLError('Artist not found');
      }
      // check for customer
      let customer = await db.query.users.findFirst({
        where: (user, { eq, and }) =>
          and(eq(user.phone, input.phone), eq(user.userType, 'CUSTOMER')),
      });
      const isAnExistingCustomer = !!customer;
      let isUserConfirmed = false;
      let userInviteSent = false;
      // if no customer, create new customer
      const booking = await db.transaction(async (tx) => {
        if (!customer) {
          const { data, error: errorCreatingCustomer } =
            await supabase.auth.admin.createUser({
              phone: input.phone,
              user_metadata: { name: input.name, user_type: 'CUSTOMER' },
            });
          if (errorCreatingCustomer) {
            console.error(
              'Error creating auth user in db',
              errorCreatingCustomer,
            );
            throw new GraphQLError('Error creating customer');
          }
          customer = {
            id: data.user.id,
            createdAt: new Date(data.user.created_at),
            updatedAt: data.user.updated_at
              ? new Date(data.user.updated_at)
              : null,
            email: data.user.email,
            phone: data.user.phone,
            userType: data.user.user_metadata.user_type,
            name: data.user.user_metadata.name,
            // to satisfy User type
            // don't need this explicitely for anything for the customer type
            phoneNumber: null,
            stripeAccountId: null,
            stripeCustomerId: null,
            hasOnboardedToStripe: null,
          } as User;
        }
        // get user's auth status from supabase
        const { data: supabaseUserData, error: errorFetchingSupabaseUser } =
          await supabase.auth.admin.getUserById(customer.id);
        console.log('supabase auth user info:', supabaseUserData);
        if (!errorFetchingSupabaseUser) {
          // confirm user info
          isUserConfirmed = !!supabaseUserData?.user?.confirmed_at; // if there is a confirmed_at date, user has confirmed email
          const userAlreadyInvited =
            !!supabaseUserData?.user?.confirmation_sent_at;
          // if never been invited, send invite email
          if (!userAlreadyInvited) {
            const { data: inviteResponseData, error: errorSendingInvite } =
              await supabase.auth.admin.inviteUserByEmail(input.phone);
            if (errorSendingInvite) {
              console.error(
                'Error sending invite to new customer',
                errorSendingInvite,
              );
            } else {
              console.log('INVITEDD!!!');
              userInviteSent = true;
            }
          }
        } else {
          console.error(
            'Error fetching user from supabase',
            errorFetchingSupabaseUser,
          );
        }
        const [newTattoo] = await tx
          .insert(schemas.tattooSchema)
          .values({
            userId: customer.id,
            ...input.tattoo,
            imagePaths: input?.tattoo?.imagePaths || [],
          })
          .returning();
        const [newBooking] = await tx
          .insert(schemas.bookingSchema)
          .values({
            artistId: input.artistId,
            userId: customer.id,
            type: input.type as BookingType,
            status: 'PENDING',
            tattooId: newTattoo.id,
          })
          .returning();
        return {
          ...newBooking,
          customer,
          artist: artistForBooking,
        };
      });
      return {
        booking,
        customerInfo: {
          isNewCustomer: !isAnExistingCustomer,
          isConfirmed: isUserConfirmed,
          inviteSent: userInviteSent,
        },
      };
    },
  },
};

export default resolvers;
