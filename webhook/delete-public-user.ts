/**
 * Delete user from public user table when they are deleted from auth table
 */

import { Router } from 'express';
const router = Router();

import db from '@db/index';
import { userSchema } from '@db/schema';
import { eq } from 'drizzle-orm';
import bp from 'body-parser';
import { checkValidSupabaseWebhook } from '@utils/webhook';

type DeletePayload = {
  type: 'DELETE';
  table: string;
  schema: string;
  record: null;
  old_record: Record<string, any>;
};

router.post('/delete-public-user', bp.json(), async (req, res) => {
  try {
    const isValidWebhook = checkValidSupabaseWebhook(req);
    if (!isValidWebhook) return res.status(400).send('Invalid webhook call');
    const payload: DeletePayload = req.body;
    if (!payload) return res.status(400).send('No body found');
    const deletedUser = payload.old_record;
    if (!deletedUser?.id)
      return res.status(400).send('No user id for deleted user');
    // delete user from public.users table
    await db
      .delete(userSchema)
      .where(eq(userSchema.id, deletedUser.id))
      .execute();
    console.log(`Deleted user ${deletedUser.id} from public.users table`);
  } catch (err) {
    console.error('Error in delete-public-user webhook:', err);
    res.status(400).send('delete-public-user webhook failed');
  }
});

export default router;
