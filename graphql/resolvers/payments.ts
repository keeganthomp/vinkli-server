import db from '@db/index';
import { GraphQLError } from 'graphql';
import { Resolvers, PaymentStatus, Booking } from 'types/graphql';
import stripe from 'lib/stripe';
import { getArtistProducts } from 'utils/stripe';
import { getBookingDuration } from 'utils/booking';
import { StripeObjectMeta } from 'types/stripe';

const stripeStatusMap: Record<string, PaymentStatus> = {
  succeeded: 'SUCCESS',
  pending: 'PENDING',
  failed: 'FAILED',
};

// from StripeObjectMeta
const metaDataKeys = ['bookingId', 'customerId', 'artistId'];

const resolvers: Resolvers = {
  Query: {
    stripeTerminalConnectionToken: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('Not allowed');
      }
      const connectionToken = await stripe.terminal.connectionTokens.create();
      return connectionToken.secret;
    },
    getPayments: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('Not allowed');
      }
      if (!user.stripeAccountId) {
        throw new GraphQLError('Stripe account not connected');
      }
      const { data: payments } = await stripe.charges.list(
        {
          limit: 100,
        },
        {
          stripeAccount: user.stripeAccountId,
        },
      );
      // payments that do not have the appropriate meta data not valid
      // they should all have a this meta data - if created via this API
      const validPayemnts = payments.filter((payment) =>
        metaDataKeys.every((key) => payment.metadata[key]),
      );
      // get bookings from database
      const bookingIds = validPayemnts.map(
        (payment) => payment.metadata.bookingId,
      );
      const bookings = await db.query.booking.findMany({
        where: (booking, { inArray }) => inArray(booking.id, bookingIds),
        with: {
          customer: true,
        },
      });
      // return payment with booking
      const paymentsWithBookings = validPayemnts.map((payment) => {
        const booking = bookings.find(
          (booking) => booking.id === payment.metadata.bookingId,
        );
        return {
          createdAt: new Date(payment.created * 1000), // date charge was created - convert epoch from stripe to milliseconds
          chargeId: payment.id,
          paymentIntentId: (payment.payment_intent as string) || '',
          status: stripeStatusMap[payment.status],
          amount: payment.amount,
          bookingId: payment.metadata?.bookingId,
          booking: booking as Booking,
        };
      });
      return paymentsWithBookings;
    },
    getPaymentLink: async (_, { bookingId }, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('Not allowed');
      }
      if (!user.stripeAccountId) {
        throw new GraphQLError('Stripe account not connected');
      }
      const booking = await db.query.booking.findFirst({
        where: (booking, { eq, and }) =>
          and(eq(booking.id, bookingId), eq(booking.artistId, user.id)),
        with: {
          artist: true,
          tattoo: true,
          customer: true,
        },
      });
      if (!booking) {
        throw new GraphQLError('Booking not found');
      }
      if (booking.artistId !== user.id) {
        throw new GraphQLError('Not allowed');
      }
      if (booking.status !== 'COMPLETED') {
        throw new GraphQLError('Booking is not completed');
      }
      // if already has a payment link. returning
      // TODO: will need to update it if the artist change the amount or hours that affects the price
      if (booking.paymentLinkId) {
        console.log('Already had payment link. returning it');
        const paymentLink = await stripe.paymentLinks.retrieve(
          booking.paymentLinkId,
          {
            stripeAccount: user.stripeAccountId,
          },
        );
        return paymentLink.url;
      }
      if (booking.type === 'TATTOO_SESSION' && !booking.endDate) {
        throw new GraphQLError('Booking has no end date');
      }
      // artist products from stripe
      const { tattooProduct, consultationProduct } =
        await getArtistProducts(user);
      // get appropriate price object for stripe
      let stripePrice: string | undefined;
      switch (booking.type) {
        case 'TATTOO_SESSION':
          if (!tattooProduct) {
            throw new GraphQLError('Tattoo product not found');
          }
          stripePrice = tattooProduct.default_price as string;
          break;
        case 'CONSULTATION':
          if (!consultationProduct) {
            throw new GraphQLError('Consultation product not found');
          }
          stripePrice = consultationProduct.default_price as string;
          break;
        default:
          throw new GraphQLError('Invalid booking type');
      }
      if (!stripePrice) {
        throw new GraphQLError('Stripe price not found');
      }
      const duration = getBookingDuration(booking);
      // meta data for stripe objects
      const metadata: StripeObjectMeta = {
        bookingId: booking.id,
        customerId: booking.customer.id,
        artistId: booking.artist.id,
      };
      const paymentLink = await stripe.paymentLinks.create(
        {
          line_items: [
            {
              price: stripePrice,
              quantity: duration,
            },
          ],
          metadata,
          payment_intent_data: {
            metadata,
          },
        },
        {
          stripeAccount: user.stripeAccountId,
        },
      );
      return paymentLink.url;
    },
  },
};

export default resolvers;
