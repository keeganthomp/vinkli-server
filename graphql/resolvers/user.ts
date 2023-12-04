import { GraphQLError } from 'graphql';
import { Resolvers } from 'types/graphql';
import stripe from 'lib/stripe';
import db from '@db/index';
import { users as userSchema } from 'db/schema/user';
import { eq } from 'drizzle-orm';
import {
  DEFAULT_CURRENCY,
  MAX_STRIPE_PRODUCT_PRICE,
  getStripeHourlyProductId,
  getStripeConsultationProductId,
  getPriceInCents,
  getPriceInDollars,
} from 'utils/stripe';

const resolvers: Resolvers = {
  Query: {
    user: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        return user;
      }
      // check if user/artist has onboarded via stripe connect
      let hasOnboardedToStripe = false;
      if (user.stripeAccountId) {
        const { details_submitted } = await stripe.accounts.retrieve(
          user.stripeAccountId,
        );
        hasOnboardedToStripe = details_submitted;
      }
      return {
        ...user,
        hasOnboardedToStripe,
      };
    },
    artist: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist');
      }
      // check if user/artist has onboarded via stripe connect
      let hasOnboardedToStripe = false;
      let hourlyRate = null;
      let consultationFee = null;
      // fetch stripe products, prices, and onboarding status
      if (user.stripeAccountId) {
        const { details_submitted } = await stripe.accounts.retrieve(
          user.stripeAccountId,
        );
        const tattooProductId = getStripeHourlyProductId(user);
        const consultationProductId = getStripeConsultationProductId(user);
        const { data: usersStripePrices } = await stripe.prices.list(
          {
            active: true,
          },
          {
            stripeAccount: user.stripeAccountId,
          },
        );
        const tattooPrice = usersStripePrices.find(
          (price) => price.product === tattooProductId,
        );
        const consultationPrice = usersStripePrices.find(
          (price) => price.product === consultationProductId,
        );
        if (tattooPrice) {
          hourlyRate = getPriceInDollars(tattooPrice?.unit_amount);
        }
        if (consultationPrice) {
          consultationFee = getPriceInDollars(consultationPrice?.unit_amount);
        }
        hasOnboardedToStripe = details_submitted;
      }
      return {
        ...user,
        hasOnboardedToStripe,
        hourlyRate,
        consultationFee,
      };
    },
  },
  Mutation: {
    generateStripeConnectOnboardingLink: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist');
      }
      if (!user.stripeAccountId) {
        throw new GraphQLError('User does not have stripe account');
      }
      // generate stripe connect onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        type: 'account_onboarding',
        refresh_url: 'https://example.com/reauth',
        return_url: 'https://example.com/return',
      });
      // send onboarding link to client
      return accountLink.url;
    },
    updateArtistRates: async (_, { hourlyRate, consultationFee }, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist');
      }
      const existingArtist = await db.query.users.findFirst({
        where: eq(userSchema.id, user.id),
      });
      if (!existingArtist) {
        throw new GraphQLError('Artist not found');
      }
      if (!user.stripeAccountId) {
        throw new GraphQLError('User does not have stripe account');
      }
      const { data: usersStripeProducts } = await stripe.products.list(
        {
          active: true,
        },
        {
          stripeAccount: user.stripeAccountId,
        },
      );
      const { data: usersStripePrices } = await stripe.prices.list(
        {
          active: true,
        },
        {
          stripeAccount: user.stripeAccountId,
        },
      );
      const tattooProductId = getStripeHourlyProductId(user);
      const consultationProductId = getStripeConsultationProductId(user);
      let tattooProduct = usersStripeProducts.find(
        (product) => product.id === tattooProductId,
      );
      let consultationProduct = usersStripeProducts.find(
        (product) => product.id === consultationProductId,
      );
      const currentHourlyPrice = usersStripePrices.find(
        (price) => price.product === tattooProductId,
      );
      const currentConsultationFeePrice = usersStripePrices.find(
        (price) => price.product === consultationProductId,
      );
      const hourlyRateInCents = getPriceInCents(hourlyRate);
      const consultationFeeInCents = getPriceInCents(consultationFee);
      if (
        hourlyRateInCents > MAX_STRIPE_PRODUCT_PRICE ||
        consultationFeeInCents > MAX_STRIPE_PRODUCT_PRICE
      ) {
        throw new GraphQLError('Rates must be less than $10,000');
      }
      // create stripe procucts if they don't exist
      if (!tattooProduct) {
        tattooProduct = await stripe.products.create(
          {
            id: tattooProductId,
            name: 'Tattoo Hourly Rate',
            type: 'service',
            metadata: {
              userId: user.id,
            },
          },
          {
            stripeAccount: user.stripeAccountId,
          },
        );
      }
      if (!consultationProduct) {
        consultationProduct = await stripe.products.create(
          {
            id: consultationProductId,
            name: 'Consultation Fee',
            type: 'service',
            metadata: {
              userId: user.id,
            },
          },
          {
            stripeAccount: user.stripeAccountId,
          },
        );
      }
      // check if prices are the same
      const isSameHourlyPrice =
        currentHourlyPrice?.unit_amount === hourlyRateInCents;
      const isSameConsultationPrice =
        currentConsultationFeePrice?.unit_amount === consultationFeeInCents;
      const shouldUpdateHourlyPrice = hourlyRate && !isSameHourlyPrice;
      const shouldUpdateConsultationPrice =
        consultationFee && !isSameConsultationPrice;
      // we need a new price object any time the price updates
      // regardless of whether or not their is already a price
      // this is a requirement of stripe
      // https://stripe.com/docs/products-prices/manage-prices#:~:text=Note%20that%20you%20can%20not,old%20price%20to%20be%20inactive.
      if (shouldUpdateHourlyPrice) {
        // create new price object for tattoo hourly rate
        const newProductPrice = await stripe.prices.create(
          {
            unit_amount: hourlyRateInCents,
            currency: DEFAULT_CURRENCY,
            product: tattooProduct.id,
            metadata: {
              userId: user.id,
            },
          },
          {
            stripeAccount: user.stripeAccountId,
          },
        );
        // update the default price for the product
        await stripe.products.update(
          tattooProduct.id,
          {
            default_price: newProductPrice.id,
          },
          {
            stripeAccount: user.stripeAccountId,
          },
        );
        // de-active old price if it exists
        if (currentHourlyPrice) {
          await stripe.prices.update(
            currentHourlyPrice.id,
            {
              active: false,
            },
            {
              stripeAccount: user.stripeAccountId,
            },
          );
        }
      }
      if (shouldUpdateConsultationPrice) {
        // create new price object for consultation fee
        const newConsultationFeePrice = await stripe.prices.create(
          {
            unit_amount: consultationFeeInCents,
            currency: DEFAULT_CURRENCY,
            product: consultationProduct.id,
            metadata: {
              userId: user.id,
            },
          },
          {
            stripeAccount: user.stripeAccountId,
          },
        );
        // update the default price for the product
        await stripe.products.update(
          consultationProduct.id,
          {
            default_price: newConsultationFeePrice.id,
          },
          {
            stripeAccount: user.stripeAccountId,
          },
        );
        // de-active old price if it exists
        if (currentConsultationFeePrice) {
          await stripe.prices.update(
            currentConsultationFeePrice.id,
            {
              active: false,
            },
            {
              stripeAccount: user.stripeAccountId,
            },
          );
        }
      }
      return {
        ...existingArtist,
        hasOnboardedToStripe: true,
        hourlyRate,
        consultationFee,
      };
    },
  },
};

export default resolvers;
