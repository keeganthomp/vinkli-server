import { pgTable, text, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './user';
import { tattoo } from './tattoo';

export const bookingTypeEnum = pgEnum('bookingType', [
  'CONSULTATION',
  'TATTOO_SESSION',
]);

export const bookingStatusEnum = pgEnum('bookingStatus', [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
]);

export const booking = pgTable('booking', {
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
  artistId: uuid('artist_id').notNull(),
  userId: uuid('user_id').notNull(),
  tattooId: uuid('tattoo_id').notNull(),
  type: bookingTypeEnum('type').default('CONSULTATION').notNull(),
  status: bookingStatusEnum('status').default('PENDING').notNull(),
  startDate: timestamp('start_date', {
    withTimezone: true,
  }).notNull(),
  endDate: timestamp('end_date', {
    withTimezone: true,
  }),
  completedAt: timestamp('completed_at', {
    withTimezone: true,
  }),
});

export const bookingRelations = relations(booking, ({ one, many }) => ({
  artist: one(users, {
    fields: [booking.artistId],
    references: [users.id],
  }),
  customer: one(users, {
    fields: [booking.userId],
    references: [users.id],
  }),
  tattoo: one(tattoo, {
    fields: [booking.tattooId],
    references: [tattoo.id],
  }),
}));
