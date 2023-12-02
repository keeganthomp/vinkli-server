import { users as userSchema } from 'db/schema/user';
import { booking as bookingSchema } from 'db/schema/booking';
import { tattoo as tattooSchema } from 'db/schema/tattoo';

export type User = typeof userSchema.$inferSelect;
export type Booking = typeof bookingSchema.$inferSelect;
export type Tattoo = typeof tattooSchema.$inferSelect;
