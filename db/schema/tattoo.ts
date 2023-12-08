import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './user';
import { booking as appointment } from './booking';

// declaring enum in database
export const tattooStyleEnum = pgEnum('tattooStyle', [
  'TRADITIONAL_AMERICAN',
  'REALISM',
  'TRIBAL',
  'NEW_SCHOOL',
  'JAPANESE_IREZUMI',
  'BLACKWORK',
  'DOTWORK',
  'WATERCOLOR',
]);

export const tattooColorEnum = pgEnum('tattooColor', [
  'BLACK_AND_GREY',
  'COLOR',
]);

export const tattoo = pgTable('tattoo', {
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
  userId: uuid('user_id').notNull(),
  title: text('title'),
  description: text('description'),
  style: tattooStyleEnum('style'),
  color: tattooColorEnum('color'),
  placement: text('placement'),
  imagePaths: text('image_paths')
    .array()
    .notNull()
    .default(sql`ARRAY[]::TEXT[]`), // array of paths in supabase storage bucket - will use this and the environemnt to build urls dynamically in the frontend
});

export const tattooRelations = relations(tattoo, ({ one, many }) => ({
  customer: one(users, {
    fields: [tattoo.userId],
    references: [users.id],
  }),
  appointments: many(appointment),
}));
