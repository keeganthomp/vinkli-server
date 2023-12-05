import { Router } from 'express';
const router = Router();

import stripe from 'lib/stripe';
import db from '@db/index';
import { users as userSchema } from 'db/schema/user';
import { eq } from 'drizzle-orm';
import bp from 'body-parser';

type UserFromHook = {
  id: string;
  email: string;
  last_name: string;
  user_type: 'ARTIST' | 'CUSTOMER';
  created_at: string;
  first_name: string;
  updated_at: string;
  phone_number: string | null;
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
};

router.post('/stripe-create-account', bp.json(), async (req, res) => {
  try {
    const user = req?.body?.record as UserFromHook;
    if (!user) return res.status(400).send('No body found');
    const {
      email,
      first_name,
      last_name,
      id: user_id,
      user_type,
      stripe_account_id,
      stripe_customer_id,
    } = user;
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
        // create account in stripe
        const account = await stripe.accounts.create({
          type: CONNECT_ACCOUNT_TYPE,
          default_currency: 'usd',
          email,
          business_type: 'individual',
          individual: {
            first_name,
            last_name,
          },
          metadata: {
            user_id,
            user_type,
          },
        });
        console.log('Stripe account created');
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
        // create stripe customer
        const customer = await stripe.customers.create({
          email,
          name: `${first_name} ${last_name}`,
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
        return res
          .status(400)
          .send(
            `User ${user_id} has no user type. This is a problem if you are seeing this message.`,
          );
      }
    }
  } catch (err) {
    console.log('Error in stripe-create-account webhook:', err);
    res.status(400).send('stripe-create-account webhook failed');
  }
});

export default router;
