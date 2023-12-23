import { users as userSchema } from './user';
import { booking as bookingSchema } from './booking';
import { tattoo as tattooSchema } from './tattoo';

export { userSchema, bookingSchema, tattooSchema };

const schemas = {
  userSchema,
  bookingSchema,
  tattooSchema,
};

export default schemas;
