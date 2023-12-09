import express, { Router } from 'express';
const router = Router();

import stripe from 'lib/stripe';
import db from '@db/index';
import { users as userSchema } from 'db/schema/user';
import { booking as bookingSchema } from 'db/schema/booking';
import { eq } from 'drizzle-orm';
import { StripeObjectMeta } from 'types/stripe';

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
        case 'payment_intent.created': {
          console.log('in intent create hook');
          const paymentIntent = event?.data?.object;
          if (!paymentIntent) {
            return res.status(200).send('No payment intent to process');
          }
          const { metadata } = paymentIntent;
          if (!metadata) {
            return res.status(200).send('No metadata to process');
          }
          // meta data from stripe object
          const paymentIntentMeta = metadata as StripeObjectMeta;
          const { customerId, bookingId, artistId } = paymentIntentMeta;
          // only valid if all required metadata is present
          const isValid = customerId && bookingId && artistId;
          if (!isValid) {
            console.log('Payment intent not handled. Missing metadata');
            return res
              .status(200)
              .send('Payment intent not handled. Missing metadata');
          }
          // make sure customer and aritst exist in database
          const [customer, artist] = await db.query.users.findMany({
            where: (user, { inArray }) =>
              inArray(user.id, [customerId, artistId]),
          });
          if (!customer) {
            console.log(`Customer with id ${customerId} not found`);
            return res.status(200).send(`User with id ${customerId} not found`);
          }
          if (!artist) {
            console.log(`Artist with id ${artistId} not found`);
            return res.status(200).send(`User with id ${artistId} not found`);
          }
          // make sure booking exist in database
          const booking = await db.query.booking.findFirst({
            where: eq(userSchema.id, bookingId),
          });
          if (!booking) {
            console.log(`Booking with id ${bookingId} not found`);
            return res
              .status(200)
              .send(`Booking with id ${bookingId} not found`);
          }
          // make sure booking belongs to artist
          if (booking.artistId !== artistId) {
            console.log(
              `Booking with id ${bookingId} does not belong to artist with id ${artistId}`,
            );
            return res
              .status(200)
              .send(
                `Booking with id ${bookingId} does not belong to artist with id ${artistId}`,
              );
          }
          if (booking?.paymentIntentId === paymentIntent.id) {
            console.log('Booking already has payment intent');
            return res.status(200).send('Booking already has payment intent');
          }
          // update booking with payment intent
          await db
            .update(bookingSchema)
            .set({
              paymentIntentId: paymentIntent.id,
            })
            .where(eq(bookingSchema.id, bookingId))
            .returning();
          console.log('Booking updated with payment intent');
          return res
            .status(200)
            .send(`Booking ${bookingId} updated with payment intent`);
        }
        case 'payment_intent.succeeded': {
          console.log('in intent succeed hook');
          const paymentIntent = event?.data?.object;
          if (!paymentIntent) {
            return res.status(200).send('No payment intent to process');
          }
          // check booking in db
          let booking = await db.query.booking.findFirst({
            where: eq(bookingSchema.paymentIntentId, paymentIntent.id),
          });
          // if we have the booking and the payment succeeds, mark booking as paid
          if (booking) {
            await db
              .update(bookingSchema)
              .set({
                paymentReceived: true,
              })
              .where(eq(bookingSchema.id, booking.id))
              .returning();
            console.log(`Booking ${booking.id} marked as paid`);
            return res.status(200).send(`Booking marked as paid`);
          }
          // if payment intent is automitcally succeed
          // then it will create the intent and succeed before we can update the booking in the db
          // in this case, we will try and use the meta data
          const { metadata } = paymentIntent;
          if (!metadata) {
            return res.status(200).send('No metadata to process');
          }
          // meta data from stripe object
          const paymentIntentMeta = metadata as StripeObjectMeta;
          const { customerId, bookingId, artistId } = paymentIntentMeta;
          // only valid if all required metadata is present
          const isValid = customerId && bookingId && artistId;
          if (!isValid) {
            console.log('Payment intent not handled. Missing metadata');
            return res
              .status(200)
              .send('Payment intent not handled. Missing metadata');
          }
          booking = await db.query.booking.findFirst({
            where: eq(userSchema.id, bookingId),
          });
          if (!booking) {
            console.log('Booking not found');
            return res.status(200).send('Booking not found');
          }
          // update booking with payment intent
          await db
            .update(bookingSchema)
            .set({
              paymentIntentId: paymentIntent.id,
              paymentReceived: true,
            })
            .where(eq(bookingSchema.id, booking.id))
            .returning();
          console.log(`Booking ${booking.id} marked as paid`);
          return res.status(200).send(`Booking marked as paid`);
        }
        case 'payment_link.created': {
          console.log('in payment link hook');
          const paymentLink = event?.data?.object;
          if (!paymentLink) {
            return res.status(200).send('No payment link to process');
          }
          const { metadata } = paymentLink;
          if (!metadata) {
            return res.status(200).send('No metadata to process');
          }
          // meta data from stripe object
          const paymentIntentMeta = metadata as StripeObjectMeta;
          const { customerId, bookingId, artistId } = paymentIntentMeta;
          // make sure customer and aritst exist in database
          const [customer, artist] = await db.query.users.findMany({
            where: (user, { inArray }) =>
              inArray(user.id, [customerId, artistId]),
          });
          if (!customer) {
            console.log(`Customer with id ${customerId} not found`);
            return res.status(200).send(`User with id ${customerId} not found`);
          }
          if (!artist) {
            console.log(`Artist with id ${artistId} not found`);
            return res.status(200).send(`User with id ${artistId} not found`);
          }
          // make sure booking exist in database
          const booking = await db.query.booking.findFirst({
            where: eq(userSchema.id, bookingId),
          });
          if (!booking) {
            console.log(`Booking with id ${bookingId} not found`);
            return res
              .status(200)
              .send(`Booking with id ${bookingId} not found`);
          }
          // make sure booking belongs to artist
          if (booking.artistId !== artistId) {
            console.log(
              `Booking with id ${bookingId} does not belong to artist with id ${artistId}`,
            );
            return res
              .status(200)
              .send(
                `Booking with id ${bookingId} does not belong to artist with id ${artistId}`,
              );
          }
          // update booking with payment link
          await db
            .update(bookingSchema)
            .set({
              paymentLinkId: paymentLink.id,
            })
            .where(eq(bookingSchema.id, bookingId))
            .returning();
          console.log('Booking updated with payment link');
          return res.status(200).send(`Booking ${bookingId} updated`);
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
