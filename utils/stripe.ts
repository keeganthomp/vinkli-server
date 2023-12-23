import { User } from 'types/db';
import { StripeProduct } from 'types/stripe';
import stripe from 'lib/stripe';

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

export const createStripeProduct = ({
  user,
  type,
  name,
  id,
}: {
  user: User;
  type: StripeProduct;
  name: string;
  id?: string;
}) => {
  if (!user.stripeAccountId) {
    throw new Error('User does not have a stripe account');
  }
  let productId = id;
  if (!productId) {
    switch (type) {
      case StripeProduct.TATTOO_HOURLY:
        productId = getStripeHourlyProductId(user);
        break;
      case StripeProduct.CONSULTATION_FEE:
        productId = getStripeConsultationProductId(user);
        break;
      default:
        throw new Error('Invalid stripe product type');
    }
  }
  return stripe.products.create(
    {
      id: productId,
      name,
      type: 'service',
      active: true,
      metadata: {
        userId: user.id,
        productType: type,
      },
    },
    {
      stripeAccount: user.stripeAccountId,
    },
  );
};

export const createStripePrice = ({
  user,
  productId,
  amount,
}: {
  user: User;
  productId: string;
  amount: number;
}) => {
  if (!user.stripeAccountId) {
    throw new Error('User does not have a stripe account');
  }
  return stripe.prices.create(
    {
      unit_amount: amount,
      currency: DEFAULT_CURRENCY,
      product: productId,
      active: true,
      metadata: {
        userId: user.id,
      },
    },
    {
      stripeAccount: user.stripeAccountId,
    },
  );
};

export const updateProductPrice = ({
  user,
  priceId,
  productId,
}: {
  user: User;
  priceId: string;
  productId: string;
}) => {
  if (!user.stripeAccountId) {
    throw new Error('User does not have a stripe account');
  }
  return stripe.products.update(
    productId,
    {
      default_price: priceId,
    },
    {
      stripeAccount: user.stripeAccountId,
    },
  );
};

export const deactivateProductPrice = ({
  user,
  priceId,
}: {
  user: User;
  priceId: string;
}) => {
  if (!user.stripeAccountId) {
    throw new Error('User does not have a stripe account');
  }
  return stripe.prices.update(
    priceId,
    {
      active: false,
    },
    {
      stripeAccount: user.stripeAccountId,
    },
  );
};

export const getArtistProducts = async (user: User) => {
  if (!user.stripeAccountId) {
    throw new Error(
      'Unable to get products. User does not have a stripe account',
    );
  }
  const tattooProductId = getStripeHourlyProductId(user);
  const consultationProductId = getStripeConsultationProductId(user);
  const { data: usersStripeProducts } = await stripe.products.list(
    {
      active: true,
    },
    {
      stripeAccount: user.stripeAccountId,
    },
  );
  const tattooProduct = usersStripeProducts.find(
    (product) => product.id === tattooProductId,
  );
  const consultationProduct = usersStripeProducts.find(
    (product) => product.id === consultationProductId,
  );
  return {
    tattooProduct,
    consultationProduct,
  };
};

export const getArtistPrices = async (user: User) => {
  if (!user.stripeAccountId) {
    throw new Error(
      'Unable to get prices. User does not have a stripe account',
    );
  }
  const tattooProductId = getStripeHourlyProductId(user);
  const consultationProductId = getStripeConsultationProductId(user);
  const { data: usersStripePrices } = await stripe.prices.list(
    {
      active: true,
    },
    {
      stripeAccount: user.stripeAccountId,
    },
  );

  const hourlyRatePrice = usersStripePrices.find(
    (price) => price.product === tattooProductId,
  );
  const consultationFeePrice = usersStripePrices.find(
    (price) => price.product === consultationProductId,
  );
  return {
    hourlyRatePrice,
    consultationFeePrice,
  };
};
