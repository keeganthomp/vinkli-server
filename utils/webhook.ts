import { Request } from 'express';

const { SUPABASE_WEBHOOK_SECRET } = process.env;

export const checkValidSupabaseWebhook = (req: Request) => {
  const secretHeader = req?.headers['x-supabase-webhook-secret'];
  if (!secretHeader) return false;
  return secretHeader === SUPABASE_WEBHOOK_SECRET;
};
