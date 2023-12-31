import db from '@db/index';
import schemas from '@db/schema';
import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { Resolvers } from '@type/graphql';
import { User } from '@type/db';
import stripe from '@lib/stripe';
import { StripeProduct } from '@type/stripe';
import {
  MAX_STRIPE_PRODUCT_PRICE,
  getPriceInCents,
  getPriceInDollars,
  createStripePrice,
  createStripeProduct,
  updateProductPrice,
  deactivateProductPrice,
  getArtistProducts,
  getArtistPrices,
} from '@utils/stripe';

const PHONE_REGEX = /^\d{1,3}\d{10}$/;

const { STRIPE_CONNECT_REDIRECT_URI, STRIPE_CONNECT_REAUTH_URI } = process.env;

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
      return user;
    },
    existingCustomer: async (_, { phone }, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('Not Allowed');
      }
      const customer = await db.query.users.findFirst({
        where: (user, { eq, and, like }) =>
          and(
            like(user.phone, '%' + phone + '%'),
            eq(user.userType, 'CUSTOMER'),
          ),
      });
      return customer || null;
    },
    artist: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist');
      }
      // check if user/artist has onboarded via stripe connect
      let hourlyRate = null;
      let consultationFee = null;
      // fetch stripe products, prices, and onboarding status
      if (user.stripeAccountId) {
        const { details_submitted } = await stripe.accounts.retrieve(
          user.stripeAccountId,
        );
        const { hourlyRatePrice, consultationFeePrice } =
          await getArtistPrices(user);
        if (hourlyRatePrice) {
          hourlyRate = getPriceInDollars(hourlyRatePrice?.unit_amount);
        }
        if (consultationFeePrice) {
          consultationFee = getPriceInDollars(
            consultationFeePrice?.unit_amount,
          );
        }
      }
      return {
        ...user,
        hourlyRate,
        consultationFee,
      };
    },
    publicArtistProfile: async (_, { artistId }) => {
      const artist = await db.query.users.findFirst({
        where: (user, { eq, and }) =>
          and(eq(user.id, artistId), eq(user.userType, 'ARTIST')),
      });
      if (!artist) {
        throw new GraphQLError('Artist not found');
      }
      return artist;
    },
    checkIfUserOnboarded: async (_, { phone }) => {
      const isValidPhone = PHONE_REGEX.test(phone);
      if (!isValidPhone) {
        throw new GraphQLError('Invalid phone number');
      }
      const user = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.phone, phone),
      });
      if (!user) {
        throw new GraphQLError('User does not exist');
      }
      const requiredFields: (keyof User)[] = ['name', 'userType'];
      const missingFields = requiredFields.filter(
        (field) => !user[field as keyof typeof user],
      );
      const hasOnboarded = missingFields.length === 0;
      return hasOnboarded;
    },
  },
  Mutation: {
    onboardUser: async (_, { input }, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      const [updatedUser] = await db
        .update(schemas.userSchema)
        .set({
          name: input.name,
          userType: input.userType,
        })
        .where(eq(schemas.userSchema.id, user.id))
        .returning();
      return updatedUser;
    },
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
        refresh_url: STRIPE_CONNECT_REAUTH_URI,
        return_url: STRIPE_CONNECT_REDIRECT_URI,
      });
      // send onboarding link to client
      return accountLink.url;
    },
    updateArtistRates: async (
      _,
      { hourlyRate: newHourlyRate, consultationFee: newConsultationFee },
      { user },
    ) => {
      const currentArtist = user;
      if (!currentArtist) {
        throw new GraphQLError('User not authenticated');
      }
      if (currentArtist.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist');
      }
      if (!currentArtist.stripeAccountId) {
        throw new GraphQLError('User does not have stripe account');
      }
      const newHourlyRateInCents = getPriceInCents(newHourlyRate);
      const newConsultationFeeInCents = getPriceInCents(newConsultationFee);
      if (
        newHourlyRateInCents > MAX_STRIPE_PRODUCT_PRICE ||
        newConsultationFeeInCents > MAX_STRIPE_PRODUCT_PRICE
      ) {
        throw new GraphQLError('Rates must be less than $10,000');
      }
      let { tattooProduct, consultationProduct } =
        await getArtistProducts(currentArtist);
      const {
        hourlyRatePrice: currentHourlyPrice,
        consultationFeePrice: currentConsultationFeePrice,
      } = await getArtistPrices(currentArtist);
      // create stripe procucts if they don't exist
      if (!tattooProduct) {
        tattooProduct = await createStripeProduct({
          user: currentArtist,
          type: StripeProduct.TATTOO_HOURLY,
          name: 'Tattoo Hourly Rate',
        });
      }
      if (!consultationProduct) {
        consultationProduct = await createStripeProduct({
          user: currentArtist,
          type: StripeProduct.CONSULTATION_FEE,
          name: 'Consultation Fee',
        });
      }
      // check if prices are the same
      const isSameHourlyPrice =
        currentHourlyPrice?.unit_amount === newHourlyRateInCents;
      const isSameConsultationPrice =
        currentConsultationFeePrice?.unit_amount === newConsultationFeeInCents;
      // check if we need to update prices
      const shouldUpdateHourlyPrice = newHourlyRate && !isSameHourlyPrice;
      const shouldUpdateConsultationPrice =
        newConsultationFee && !isSameConsultationPrice;
      // we need a new price object any time the price updates
      // regardless of whether or not their is already a price
      // this is a requirement of stripe
      // https://stripe.com/docs/products-prices/manage-prices#:~:text=Note%20that%20you%20can%20not,old%20price%20to%20be%20inactive.
      if (shouldUpdateHourlyPrice) {
        // create new price object for tattoo hourly rate
        const newProductPrice = await createStripePrice({
          user: currentArtist,
          productId: tattooProduct.id,
          amount: newHourlyRateInCents,
        });
        // update the default price for the product
        await updateProductPrice({
          user: currentArtist,
          productId: tattooProduct.id,
          priceId: newProductPrice.id,
        });
        // de-active old price if it exists
        if (currentHourlyPrice) {
          await deactivateProductPrice({
            user: currentArtist,
            priceId: currentHourlyPrice.id,
          });
        }
      }
      if (shouldUpdateConsultationPrice) {
        // create new price object for consultation fee
        const newConsultationFeePrice = await createStripePrice({
          user: currentArtist,
          productId: consultationProduct.id,
          amount: newConsultationFeeInCents,
        });
        // update the default price for the product
        await updateProductPrice({
          user: currentArtist,
          productId: consultationProduct.id,
          priceId: newConsultationFeePrice.id,
        });
        // de-active old price if it exists
        if (currentConsultationFeePrice) {
          await deactivateProductPrice({
            user: currentArtist,
            priceId: currentConsultationFeePrice.id,
          });
        }
      }
      return {
        ...currentArtist,
        hourlyRate: newHourlyRate,
        consultationFee: newConsultationFee,
      };
    },
  },
};

export default resolvers;
