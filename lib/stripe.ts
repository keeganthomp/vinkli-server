import dotenv from 'dotenv';
dotenv.config();

// @ts-ignore
import Stripe, { Stripe } from 'stripe';

const { STRIPE_SECRET_KEY } = process.env;

// @ts-ignore
const stripe: Stripe = Stripe(STRIPE_SECRET_KEY);

export default stripe;
