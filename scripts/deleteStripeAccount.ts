import stripe from 'lib/stripe';

const { data: connectedAccounts } = await stripe.accounts.list({
  limit: 100,
});

const deleteStripeAccount = async (stripeAccountId: string) => {
  const deletedStripeAccount = await stripe.accounts.del(stripeAccountId);
  return deletedStripeAccount;
};

const deleteStripeAccounts = async () => {
  console.log(`deleting ${connectedAccounts.length} stripe accounts`);
  for (const account of connectedAccounts) {
    await deleteStripeAccount(account.id);
    console.log(`Deleted account ${account.id}`);
  }
  console.log(`Finished deleting ${connectedAccounts.length} accounts`);
};

await deleteStripeAccounts();
