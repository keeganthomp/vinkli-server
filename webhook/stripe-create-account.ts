import { Router } from 'express';
const router = Router();

import db from '@db/index';
import { userSchema } from '@db/schema';
import stripe from '@lib/stripe';
import { eq } from 'drizzle-orm';
import bp from 'body-parser';
import { checkValidSupabaseWebhook } from 'utils/webhook';
import { Database } from 'types/supabase';

type UserFromDb = Database['public']['Tables']['users']['Row'];

router.post('/stripe-create-account', bp.json(), async (req, res) => {
  try {
    const isValidWebhook = checkValidSupabaseWebhook(req);
    if (!isValidWebhook) return res.status(400).send('Invalid webhook call');
    const user = req?.body?.record as UserFromDb;
    if (!user) return res.status(400).send('No body found');
    if (!user.id) return res.status(400).send('No user id provided in record');
    const {
      id: user_id,
      user_type,
      name,
      email,
      phone,
      stripe_account_id,
      stripe_customer_id,
    } = user;
    const first_name = name?.split(' ')[0];
    const last_name = name?.split(' ')[1];
    switch (user_type) {
      case 'ARTIST': {
        // check if user already has stripe account
        if (stripe_account_id) {
          return res
            .status(200)
            .send(`Artist ${user_id} already has stripe account associated`);
        }
        // express, standard, custom -- see stripe docs
        const CONNECT_ACCOUNT_TYPE = 'express';
        // build meta data object
        const individual = {
          phone,
        } as {
          first_name?: string;
          last_name?: string;
          phone: string;
        };
        if (first_name) {
          individual['first_name'] = first_name;
        }
        if (last_name) {
          individual['last_name'] = last_name;
        }
        // create account in stripe
        const account = await stripe.accounts.create({
          type: CONNECT_ACCOUNT_TYPE,
          default_currency: 'usd',
          business_type: 'individual',
          individual,
          metadata: {
            user_id,
            user_type,
            phone,
          },
        });
        // update user with stripe account id
        await db
          .update(userSchema)
          .set({
            stripeAccountId: account.id,
          })
          .where(eq(userSchema.id, user_id));
        console.log('Stripe account linked to user');
        return res.status(200).send('Stripe account linked to user');
      }
      case 'CUSTOMER': {
        // check if user already has stripe customer
        if (stripe_customer_id) {
          return res
            .status(200)
            .send(`User ${user_id} already has stripe customer associated`);
        }
        const name =
          first_name && last_name ? `${first_name} ${last_name}` : undefined;
        // create stripe customer
        const customer = await stripe.customers.create({
          phone,
          name,
          metadata: {
            user_id,
            user_type,
          },
        });
        console.log('Stripe customer created');
        // link customer to user
        await db
          .update(userSchema)
          .set({
            stripeCustomerId: customer.id,
          })
          .where(eq(userSchema.id, user_id));
        console.log('Stripe customer linked to user');
        return res.status(200).send('Stripe customer linked to user');
      }
      default: {
        console.error('Unable to handle new user. User has no type');
        console.log('payload:', req.body);
        return res
          .status(400)
          .send(
            `User ${user_id} has no user type. This is a problem if you are seeing this message.`,
          );
      }
    }
  } catch (err) {
    console.error('Error in stripe-create-account webhook:', err);
    res.status(400).send('stripe-create-account webhook failed');
  }
});

export default router;
