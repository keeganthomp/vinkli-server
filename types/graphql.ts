import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ContextT } from './context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type Artist = {
  __typename?: 'Artist';
  consultationFee?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['Date']['output'];
  email: Scalars['String']['output'];
  hasOnboardedToStripe?: Maybe<Scalars['Boolean']['output']>;
  hourlyRate?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  stripeAccountId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Date']['output'];
};

export type ArtistCreateBookingInput = {
  customerEmail: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['Date']['input']>;
  startDate: Scalars['Date']['input'];
  tattoo?: InputMaybe<TattooForBookingInput>;
  tattooId?: InputMaybe<Scalars['ID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<BookingType>;
};

export type ArtistCreateTattooInput = {
  color?: InputMaybe<TattooColor>;
  customerEmail: Scalars['String']['input'];
  date?: InputMaybe<Scalars['Date']['input']>;
  description: Scalars['String']['input'];
  imagePaths?: InputMaybe<Array<Scalars['String']['input']>>;
  placement?: InputMaybe<Scalars['String']['input']>;
  style?: InputMaybe<TattooStyle>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ArtistFinancials = {
  __typename?: 'ArtistFinancials';
  balance: Balance;
  charges: Array<Charge>;
  payouts: Array<Payout>;
  refunds: Array<Refund>;
};

export type ArtistPayment = {
  __typename?: 'ArtistPayment';
  amount: Scalars['Int']['output'];
  artist?: Maybe<User>;
  artistId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['Date']['output'];
  currency: Scalars['String']['output'];
  customer: User;
  customerId: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  stripeChargeId: Scalars['String']['output'];
  stripeRefundId?: Maybe<Scalars['String']['output']>;
  stripeRefundReversalId?: Maybe<Scalars['String']['output']>;
  stripeTransferId: Scalars['String']['output'];
  stripeTransferReversalId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Date']['output'];
};

export type ArtistPaymentPayload = {
  __typename?: 'ArtistPaymentPayload';
  payments: Array<ArtistPayment>;
  totalReceived: Scalars['Int']['output'];
};

export type Balance = {
  __typename?: 'Balance';
  available: Array<BalanceObject>;
  instantAvailable?: Maybe<Array<BalanceObject>>;
  pending: Array<BalanceObject>;
  reserved?: Maybe<Array<BalanceObject>>;
};

export type BalanceObject = {
  __typename?: 'BalanceObject';
  amount: Scalars['Int']['output'];
  currency: Scalars['String']['output'];
  sourceTypes?: Maybe<BalanceSourceTypes>;
};

export type BalanceSourceTypes = {
  __typename?: 'BalanceSourceTypes';
  bank_account?: Maybe<Scalars['Int']['output']>;
  card?: Maybe<Scalars['Int']['output']>;
  fpx?: Maybe<Scalars['Int']['output']>;
};

export type Booking = {
  __typename?: 'Booking';
  artist?: Maybe<User>;
  artistId?: Maybe<Scalars['ID']['output']>;
  completedAt?: Maybe<Scalars['Date']['output']>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customer?: Maybe<User>;
  duration?: Maybe<Scalars['Float']['output']>;
  endDate?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  payment?: Maybe<Payment>;
  paymentReceived: Scalars['Boolean']['output'];
  startDate?: Maybe<Scalars['Date']['output']>;
  status: BookingStatus;
  tattoo?: Maybe<Tattoo>;
  tattooId: Scalars['ID']['output'];
  totalDue?: Maybe<Scalars['Int']['output']>;
  type: BookingType;
  updatedAt?: Maybe<Scalars['Date']['output']>;
  userId: Scalars['ID']['output'];
};

export type BookingStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'REJECTED';

export type BookingType =
  | 'CONSULTATION'
  | 'TATTOO_SESSION';

export type Charge = {
  __typename?: 'Charge';
  amount: Scalars['Int']['output'];
  createdAt: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  paid: Scalars['Boolean']['output'];
  paymentType?: Maybe<PaymentType>;
};

export type CustomerCreateBookingInput = {
  artistId?: InputMaybe<Scalars['ID']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerCreateTattooInput = {
  artistId?: InputMaybe<Scalars['ID']['input']>;
  color?: InputMaybe<TattooColor>;
  description: Scalars['String']['input'];
  imagePaths?: InputMaybe<Array<Scalars['String']['input']>>;
  placement?: InputMaybe<Scalars['String']['input']>;
  style?: InputMaybe<TattooStyle>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  artistCreateBooking: Booking;
  artistUpdateBookingStatus: Booking;
  customerCreateBooking: Booking;
  customerCreateTattoo: Tattoo;
  deleteBooking?: Maybe<Booking>;
  generateStripeConnectOnboardingLink: Scalars['String']['output'];
  updateArtistRates: Artist;
};


export type MutationArtistCreateBookingArgs = {
  input: ArtistCreateBookingInput;
};


export type MutationArtistUpdateBookingStatusArgs = {
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  status: BookingStatus;
};


export type MutationCustomerCreateBookingArgs = {
  input: CustomerCreateBookingInput;
};


export type MutationCustomerCreateTattooArgs = {
  input: CustomerCreateTattooInput;
};


export type MutationDeleteBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateArtistRatesArgs = {
  consultationFee?: InputMaybe<Scalars['Int']['input']>;
  hourlyRate?: InputMaybe<Scalars['Int']['input']>;
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Int']['output'];
  booking: Booking;
  bookingId: Scalars['ID']['output'];
  chargeId: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  paymentIntentId?: Maybe<Scalars['String']['output']>;
  status: PaymentStatus;
};

export type PaymentStatus =
  | 'FAILED'
  | 'PENDING'
  | 'SUCCESS';

export type PaymentType =
  | 'ach_credit_transfer'
  | 'ach_debit'
  | 'acss_debit'
  | 'alipay'
  | 'au_becs_debit'
  | 'bancontact'
  | 'card'
  | 'card_present'
  | 'eps'
  | 'giropay'
  | 'ideal'
  | 'klarna'
  | 'multibanco'
  | 'p24'
  | 'sepa_debit'
  | 'sofort'
  | 'stripe_account'
  | 'wechat';

export type Payout = {
  __typename?: 'Payout';
  amount: Scalars['Int']['output'];
  arrivalDate: Scalars['Date']['output'];
  createdAt: Scalars['Date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  sourceType: SourceType;
  status: PayoutStatus;
};

export type PayoutStatus =
  | 'canceled'
  | 'failed'
  | 'in_transit'
  | 'paid'
  | 'pending';

export type Query = {
  __typename?: 'Query';
  artist: Artist;
  artistBooking: Booking;
  artistBookings: Array<Booking>;
  artistFinancials: ArtistFinancials;
  customerBooking: Booking;
  customerBookings: Array<Booking>;
  customerTattoos: Array<Tattoo>;
  getPaymentLink: Scalars['String']['output'];
  getPayments: Array<Payment>;
  stripeTerminalConnectionToken: Scalars['String']['output'];
  user: User;
  users: Array<Maybe<User>>;
};


export type QueryArtistBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryArtistBookingsArgs = {
  statuses?: InputMaybe<Array<InputMaybe<BookingStatus>>>;
};


export type QueryCustomerBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCustomerBookingsArgs = {
  status?: InputMaybe<BookingStatus>;
};


export type QueryGetPaymentLinkArgs = {
  bookingId: Scalars['ID']['input'];
};

export type Refund = {
  __typename?: 'Refund';
  amount: Scalars['Int']['output'];
  chargeId: Scalars['String']['output'];
  createdAt: Scalars['Date']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  status: RefundStatus;
};

export type RefundStatus =
  | 'canceled'
  | 'failed'
  | 'pending'
  | 'requires_action'
  | 'succeeded';

export type SourceType =
  | 'bank_account'
  | 'card'
  | 'fpx';

export type Tattoo = {
  __typename?: 'Tattoo';
  artist?: Maybe<User>;
  color?: Maybe<TattooColor>;
  consultation?: Maybe<Booking>;
  createdAt?: Maybe<Scalars['Date']['output']>;
  customer?: Maybe<User>;
  customerId?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrls: Array<Scalars['String']['output']>;
  placement?: Maybe<Scalars['String']['output']>;
  sessions?: Maybe<Array<Booking>>;
  style?: Maybe<TattooStyle>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['Date']['output']>;
};

export type TattooColor =
  | 'BLACK_AND_GREY'
  | 'COLOR';

export type TattooForBookingInput = {
  color?: InputMaybe<TattooColor>;
  date?: InputMaybe<Scalars['Date']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imagePaths?: InputMaybe<Array<Scalars['String']['input']>>;
  placement?: InputMaybe<Scalars['String']['input']>;
  style?: InputMaybe<TattooStyle>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type TattooStyle =
  | 'BLACKWORK'
  | 'DOTWORK'
  | 'JAPANESE_IREZUMI'
  | 'NEW_SCHOOL'
  | 'REALISM'
  | 'TRADITIONAL_AMERICAN'
  | 'TRIBAL'
  | 'WATERCOLOR';

export type User = {
  __typename?: 'User';
  consultationFee?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['Date']['output'];
  email: Scalars['String']['output'];
  hasOnboardedToStripe?: Maybe<Scalars['Boolean']['output']>;
  hourlyRate?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  stripeAccountId?: Maybe<Scalars['String']['output']>;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['Date']['output'];
  userType?: Maybe<UserType>;
};

export type UserType =
  | 'ARTIST'
  | 'CUSTOMER';

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Artist: ResolverTypeWrapper<Artist>;
  ArtistCreateBookingInput: ArtistCreateBookingInput;
  ArtistCreateTattooInput: ArtistCreateTattooInput;
  ArtistFinancials: ResolverTypeWrapper<ArtistFinancials>;
  ArtistPayment: ResolverTypeWrapper<ArtistPayment>;
  ArtistPaymentPayload: ResolverTypeWrapper<ArtistPaymentPayload>;
  Balance: ResolverTypeWrapper<Balance>;
  BalanceObject: ResolverTypeWrapper<BalanceObject>;
  BalanceSourceTypes: ResolverTypeWrapper<BalanceSourceTypes>;
  Booking: ResolverTypeWrapper<Booking>;
  BookingStatus: BookingStatus;
  BookingType: BookingType;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Charge: ResolverTypeWrapper<Charge>;
  CustomerCreateBookingInput: CustomerCreateBookingInput;
  CustomerCreateTattooInput: CustomerCreateTattooInput;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Payment: ResolverTypeWrapper<Payment>;
  PaymentStatus: PaymentStatus;
  PaymentType: PaymentType;
  Payout: ResolverTypeWrapper<Payout>;
  PayoutStatus: PayoutStatus;
  Query: ResolverTypeWrapper<{}>;
  Refund: ResolverTypeWrapper<Refund>;
  RefundStatus: RefundStatus;
  SourceType: SourceType;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Tattoo: ResolverTypeWrapper<Tattoo>;
  TattooColor: TattooColor;
  TattooForBookingInput: TattooForBookingInput;
  TattooStyle: TattooStyle;
  User: ResolverTypeWrapper<User>;
  UserType: UserType;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Artist: Artist;
  ArtistCreateBookingInput: ArtistCreateBookingInput;
  ArtistCreateTattooInput: ArtistCreateTattooInput;
  ArtistFinancials: ArtistFinancials;
  ArtistPayment: ArtistPayment;
  ArtistPaymentPayload: ArtistPaymentPayload;
  Balance: Balance;
  BalanceObject: BalanceObject;
  BalanceSourceTypes: BalanceSourceTypes;
  Booking: Booking;
  Boolean: Scalars['Boolean']['output'];
  Charge: Charge;
  CustomerCreateBookingInput: CustomerCreateBookingInput;
  CustomerCreateTattooInput: CustomerCreateTattooInput;
  Date: Scalars['Date']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: {};
  Payment: Payment;
  Payout: Payout;
  Query: {};
  Refund: Refund;
  String: Scalars['String']['output'];
  Tattoo: Tattoo;
  TattooForBookingInput: TattooForBookingInput;
  User: User;
}>;

export type ArtistResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Artist'] = ResolversParentTypes['Artist']> = ResolversObject<{
  consultationFee?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasOnboardedToStripe?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hourlyRate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeAccountId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ArtistFinancialsResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['ArtistFinancials'] = ResolversParentTypes['ArtistFinancials']> = ResolversObject<{
  balance?: Resolver<ResolversTypes['Balance'], ParentType, ContextType>;
  charges?: Resolver<Array<ResolversTypes['Charge']>, ParentType, ContextType>;
  payouts?: Resolver<Array<ResolversTypes['Payout']>, ParentType, ContextType>;
  refunds?: Resolver<Array<ResolversTypes['Refund']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ArtistPaymentResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['ArtistPayment'] = ResolversParentTypes['ArtistPayment']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  artist?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  artistId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  customer?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  customerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stripeChargeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stripeRefundId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeRefundReversalId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeTransferId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stripeTransferReversalId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ArtistPaymentPayloadResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['ArtistPaymentPayload'] = ResolversParentTypes['ArtistPaymentPayload']> = ResolversObject<{
  payments?: Resolver<Array<ResolversTypes['ArtistPayment']>, ParentType, ContextType>;
  totalReceived?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalanceResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Balance'] = ResolversParentTypes['Balance']> = ResolversObject<{
  available?: Resolver<Array<ResolversTypes['BalanceObject']>, ParentType, ContextType>;
  instantAvailable?: Resolver<Maybe<Array<ResolversTypes['BalanceObject']>>, ParentType, ContextType>;
  pending?: Resolver<Array<ResolversTypes['BalanceObject']>, ParentType, ContextType>;
  reserved?: Resolver<Maybe<Array<ResolversTypes['BalanceObject']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalanceObjectResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['BalanceObject'] = ResolversParentTypes['BalanceObject']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sourceTypes?: Resolver<Maybe<ResolversTypes['BalanceSourceTypes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalanceSourceTypesResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['BalanceSourceTypes'] = ResolversParentTypes['BalanceSourceTypes']> = ResolversObject<{
  bank_account?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  card?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fpx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BookingResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Booking'] = ResolversParentTypes['Booking']> = ResolversObject<{
  artist?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  artistId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  customer?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  payment?: Resolver<Maybe<ResolversTypes['Payment']>, ParentType, ContextType>;
  paymentReceived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['BookingStatus'], ParentType, ContextType>;
  tattoo?: Resolver<Maybe<ResolversTypes['Tattoo']>, ParentType, ContextType>;
  tattooId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  totalDue?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['BookingType'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChargeResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Charge'] = ResolversParentTypes['Charge']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  paid?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  paymentType?: Resolver<Maybe<ResolversTypes['PaymentType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  artistCreateBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationArtistCreateBookingArgs, 'input'>>;
  artistUpdateBookingStatus?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationArtistUpdateBookingStatusArgs, 'id' | 'status'>>;
  customerCreateBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationCustomerCreateBookingArgs, 'input'>>;
  customerCreateTattoo?: Resolver<ResolversTypes['Tattoo'], ParentType, ContextType, RequireFields<MutationCustomerCreateTattooArgs, 'input'>>;
  deleteBooking?: Resolver<Maybe<ResolversTypes['Booking']>, ParentType, ContextType, RequireFields<MutationDeleteBookingArgs, 'id'>>;
  generateStripeConnectOnboardingLink?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updateArtistRates?: Resolver<ResolversTypes['Artist'], ParentType, ContextType, Partial<MutationUpdateArtistRatesArgs>>;
}>;

export type PaymentResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Payment'] = ResolversParentTypes['Payment']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  booking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType>;
  bookingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  chargeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  paymentIntentId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PaymentStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PayoutResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Payout'] = ResolversParentTypes['Payout']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  arrivalDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sourceType?: Resolver<ResolversTypes['SourceType'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PayoutStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  artist?: Resolver<ResolversTypes['Artist'], ParentType, ContextType>;
  artistBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<QueryArtistBookingArgs, 'id'>>;
  artistBookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType, Partial<QueryArtistBookingsArgs>>;
  artistFinancials?: Resolver<ResolversTypes['ArtistFinancials'], ParentType, ContextType>;
  customerBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<QueryCustomerBookingArgs, 'id'>>;
  customerBookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType, Partial<QueryCustomerBookingsArgs>>;
  customerTattoos?: Resolver<Array<ResolversTypes['Tattoo']>, ParentType, ContextType>;
  getPaymentLink?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryGetPaymentLinkArgs, 'bookingId'>>;
  getPayments?: Resolver<Array<ResolversTypes['Payment']>, ParentType, ContextType>;
  stripeTerminalConnectionToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  users?: Resolver<Array<Maybe<ResolversTypes['User']>>, ParentType, ContextType>;
}>;

export type RefundResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Refund'] = ResolversParentTypes['Refund']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  chargeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RefundStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TattooResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['Tattoo'] = ResolversParentTypes['Tattoo']> = ResolversObject<{
  artist?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['TattooColor']>, ParentType, ContextType>;
  consultation?: Resolver<Maybe<ResolversTypes['Booking']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  customer?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  customerId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrls?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  placement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sessions?: Resolver<Maybe<Array<ResolversTypes['Booking']>>, ParentType, ContextType>;
  style?: Resolver<Maybe<ResolversTypes['TattooStyle']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = ContextT, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  consultationFee?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasOnboardedToStripe?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hourlyRate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeAccountId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeCustomerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  userType?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = ContextT> = ResolversObject<{
  Artist?: ArtistResolvers<ContextType>;
  ArtistFinancials?: ArtistFinancialsResolvers<ContextType>;
  ArtistPayment?: ArtistPaymentResolvers<ContextType>;
  ArtistPaymentPayload?: ArtistPaymentPayloadResolvers<ContextType>;
  Balance?: BalanceResolvers<ContextType>;
  BalanceObject?: BalanceObjectResolvers<ContextType>;
  BalanceSourceTypes?: BalanceSourceTypesResolvers<ContextType>;
  Booking?: BookingResolvers<ContextType>;
  Charge?: ChargeResolvers<ContextType>;
  Date?: GraphQLScalarType;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Payment?: PaymentResolvers<ContextType>;
  Payout?: PayoutResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Refund?: RefundResolvers<ContextType>;
  Tattoo?: TattooResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

