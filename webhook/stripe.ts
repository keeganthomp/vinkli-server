import express, { Router } from 'express';
const router = Router();

import stripe from 'lib/stripe';
import db from '@db/index';
import { users as userSchema } from 'db/schema/user';
import { eq } from 'drizzle-orm';

const { STRIPE_WEBHOOK_SECRET } = process.env;

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send('Missing stripe webhook secret');
    }

    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).send('Missing stripe signature');
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET,
      );
      switch (event.type) {
        case 'account.updated': {
          const connectedAccount = event?.data?.object;
          if (!connectedAccount) {
            return res.status(200).send('No account info to process');
          }
          // I believe this is the only way to check if an account has completed onboarding
          const hasCompletedOnboarding = connectedAccount?.details_submitted;
          if (!hasCompletedOnboarding) {
            console.log('Account has not completed onboarding');
            return res
              .status(200)
              .send(
                `Account ${connectedAccount.id} has not completed onboarding`,
              );
          }
          // make sure user exist in database
          const user = await db.query.users.findFirst({
            where: eq(userSchema.stripeAccountId, connectedAccount.id),
          });
          if (!user) {
            console.log(
              `User with stripe account ${connectedAccount.id} not found`,
            );
            return res
              .status(200)
              .send(
                `User with stripe account ${connectedAccount.id} not found`,
              );
          }
          // update user database
          const [updatedUser] = await db
            .update(userSchema)
            .set({
              hasOnboardedToStripe: true,
            })
            .where(eq(userSchema.stripeAccountId, connectedAccount.id))
            .returning();
          console.log(`${updatedUser.name} has completed onboarding!`);
          return res
            .status(200)
            .send(
              `Stripe account ${connectedAccount.id} has completed onboarding`,
            );
        }
        default:
          return res
            .status(200)
            .send(`Skipping stripe event ${event.type}. Not handling.`);
      }
    } catch (err: any) {
      console.log('Error in stripe webhook:', JSON.stringify(err, null, 2));
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  },
);

export default router;
