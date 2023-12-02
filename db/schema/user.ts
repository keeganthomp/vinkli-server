import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// declaring enum in database
export const userTypeEnum = pgEnum('user_type', ['ARTIST', 'CUSTOMER']);

export const users = pgTable('users', {
  id: uuid('id').notNull().primaryKey(), // references subabase auth user id
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  userType: userTypeEnum('user_type').default('CUSTOMER').notNull(),
  email: text('email').notNull(),
  phoneNumber: integer('phone_number'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  stripeAccountId: text('stripe_account_id'),
  stripeCustomerId: text('stripe_customer_id'),
});
