import { GraphQLError } from 'graphql';
import {
  Resolvers,
  PaymentType,
  SourceType,
  PayoutStatus,
  RefundStatus,
} from '@type/graphql';
import stripe from '@lib/stripe';

const resolvers: Resolvers = {
  Query: {
    artistFinancials: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('User not authenticated');
      }
      if (user.userType !== 'ARTIST') {
        throw new GraphQLError('User is not an artist');
      }
      if (!user.stripeAccountId) {
        throw new GraphQLError('User does not have stripe account');
      }
      // charges
      const charges = await stripe.charges.list(
        {
          limit: 100,
        },
        {
          stripeAccount: user.stripeAccountId,
        },
      );
      // payouts
      const payouts = await stripe.payouts.list(
        {
          limit: 100,
        },
        {
          stripeAccount: user.stripeAccountId,
        },
      );
      // refunds
      const refunds = await stripe.refunds.list(
        {
          limit: 100,
        },
        {
          stripeAccount: user.stripeAccountId,
        },
      );
      // balance
      const balance = await stripe.balance.retrieve({
        stripeAccount: user.stripeAccountId,
      });
      // format payloads for client
      const formattedCharges = charges.data.map((charge) => ({
        id: charge.id,
        amount: charge.amount,
        createdAt: charge.created,
        paid: charge.paid,
        paymentType: charge?.payment_method_details?.type as PaymentType,
        description: charge.description,
      }));
      const formattedPayouts = payouts.data.map((payout) => ({
        id: payout.id,
        amount: payout.amount,
        createdAt: payout.created,
        description: payout.description,
        sourceType: payout.source_type as SourceType,
        status: payout.status as PayoutStatus,
        arrivalDate: payout.arrival_date,
      }));
      const formattedRefunds = refunds.data.map((refund) => ({
        id: refund.id,
        amount: refund.amount,
        chargeId: refund.charge as string,
        createdAt: refund.created,
        currency: refund.currency,
        status: refund.status as RefundStatus,
      }));
      const formattedBalance = {
        available: balance.available.map((available) => ({
          amount: available.amount,
          currency: available.currency,
          sourceTypes: available.source_types,
        })),
        pending: balance.pending.map((pending) => ({
          amount: pending.amount,
          currency: pending.currency,
          sourceTypes: pending.source_types,
        })),
        reserved: balance?.connect_reserved?.map((reserved) => ({
          amount: reserved.amount,
          currency: reserved.currency,
          sourceTypes: reserved.source_types,
        })),
        instantAvailable: balance?.instant_available?.map(
          (instantAvailable) => ({
            amount: instantAvailable.amount,
            currency: instantAvailable.currency,
            sourceTypes: instantAvailable.source_types,
          }),
        ),
      };
      return {
        charges: formattedCharges,
        payouts: formattedPayouts,
        refunds: formattedRefunds,
        balance: formattedBalance,
      };
    },
  },
};

export default resolvers;
