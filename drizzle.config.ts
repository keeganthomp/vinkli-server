import dotenv from 'dotenv';
dotenv.config();

import type { Config } from 'drizzle-kit';

const connectionString = process.env.DATABASE_CONNECTION_STRING as string;

if (!connectionString) {
  throw new Error('DATABASE_CONNECTION_STRING is missing');
}

export default {
  schema: './db/schema/*',
  out: 'db/drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString,
  },
} satisfies Config;
