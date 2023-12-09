export enum StripeProduct {
  TATTOO_HOURLY = 'tattoo_hourly',
  CONSULTATION_FEE = 'consultation_fee',
}

export type StripeObjectMeta = {
  customerId: string;
  artistId: string;
  bookingId: string;
};
