import { GraphQLError } from 'graphql';
import { Resolvers } from 'types/graphql';
import stripe from 'lib/stripe';

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
  },
};

export default resolvers;
