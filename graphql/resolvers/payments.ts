import { GraphQLError } from 'graphql';
import { Resolvers } from 'types/graphql';
import stripe from 'lib/stripe';

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
  },
};

export default resolvers;
