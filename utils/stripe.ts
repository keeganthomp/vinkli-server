import { User } from 'db/types';

export const MAX_STRIPE_PRODUCT_PRICE = 99999999; // in cents as stripe only accepts cents
export const DEFAULT_CURRENCY = 'usd';

export const getStripeHourlyProductId = (user: User) => {
  return `${user.id}_tattoo_hourly`;
};
export const getStripeConsultationProductId = (user: User) => {
  return `${user.id}_consultation_fee`;
};
export const getPriceInCents = (price?: number | null | undefined) => {
  return (price || 0) * 100;
};
export const getPriceInDollars = (price?: number | null | undefined) => {
  return (price || 0) / 100;
};
