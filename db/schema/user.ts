import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  integer,
  boolean,
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
  phone: text('phone').notNull().unique(),
  userType: userTypeEnum('user_type'),
  email: text('email').unique(),
  name: text('name'),
  stripeAccountId: text('stripe_account_id').unique(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  hasOnboardedToStripe: boolean('has_onboarded_to_stripe').default(false),
});
