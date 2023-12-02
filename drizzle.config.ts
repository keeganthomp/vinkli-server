import dotenv from 'dotenv';
dotenv.config();

import type { Config } from 'drizzle-kit';

const connectionString = process.env.CONNECTION_STRING as string;

if (!connectionString) {
  throw new Error('CONNECTION_STRING is missing');
}

export default {
  schema: './db/schema/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString,
  },
} satisfies Config;
