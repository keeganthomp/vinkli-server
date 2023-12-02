import { pgTable, text, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './user';

export const stripeCustomer = pgTable('stripe_customers', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
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
  stripeCustomerId: text('stripe_customer_id').notNull(),
  artistId: text('artist_id').notNull(),
  userId: uuid('user_id').notNull(),
});

export const stripeCustomerRelations = relations(stripeCustomer, ({ one }) => ({
  user: one(users, {
    fields: [stripeCustomer.userId],
    references: [users.id],
  }),
  artist: one(users, {
    fields: [stripeCustomer.artistId],
    references: [users.id],
  }),
}));
