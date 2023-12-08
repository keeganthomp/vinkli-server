import { GraphQLError } from 'graphql';
import { Resolvers } from 'types/graphql';
import stripe from 'lib/stripe';
import db from '@db/index';
import { getArtistProducts } from 'utils/stripe';
import { getBookingDuration } from 'utils/booking';

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
      if (!booking.endDate) {
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
      const paymentLink = await stripe.paymentLinks.create(
        {
          line_items: [
            {
              price: stripePrice,
              quantity: duration,
            },
          ],
        },
        {
          stripeAccount: user.stripeAccountId,
        },
      );
      console.log(paymentLink);
      return paymentLink.url;
    },
  },
};

export default resolvers;
