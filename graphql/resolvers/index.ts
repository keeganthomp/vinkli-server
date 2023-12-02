import userResolvers from './user';
import bookingResolvers from './booking';
import tattooResolvers from './tattoo';
import financialResolvers from './financials';
import paymentResolvers from './payments';

const resolvers = [
  userResolvers,
  bookingResolvers,
  tattooResolvers,
  financialResolvers,
  paymentResolvers,
];

export default resolvers;
