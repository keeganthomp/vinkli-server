import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const databaseUrl = process.env.DATABASE_URL as string;
const serverKey = process.env.SERVICE_KEY as string;

// server client
export const supabase = createClient(databaseUrl, serverKey);

export const authenticateUser = async (token: string) => {
  try {
    const { error, data } = await supabase.auth.getUser(token);
    const user = data?.user;
    if (error || !user) {
      throw error || new Error('User not found');
    }
    return user;
  } catch (error) {
    console.log('Error getting user from token', error);
    throw error;
  }
};
