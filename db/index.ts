import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// schemas
import * as userSchema from './schema/user';
import * as bookingSchema from './schema/booking';
import * as tattooSchema from './schema/tattoo';
import * as stripeCustomerSchema from './schema/stripeCustomer';

const connectionString = process.env.DATABASE_CONNECTION_STRING as string;

if (!connectionString) {
  throw new Error('DATABASE_CONNECTION_STRING is missing');
}

// merge all schemas for drizzle
const schema = {
  ...userSchema,
  ...bookingSchema,
  ...tattooSchema,
  ...stripeCustomerSchema,
};

// init drizzle
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export default db;
