import { users } from '../schema/user';
import { booking } from '../schema/booking';
import { tattoo } from '../schema/tattoo';

type NewUser = typeof users.$inferInsert;
type NewBooking = typeof booking.$inferInsert;
type NewTattoo = typeof tattoo.$inferInsert;

// id's need to be of UUID
// we can share these across different tables
// hardcoding these will allow us to skip duplicates in migration script to prevent test data clutter
const UUIDS = [
  '8acc1174-3c82-4acb-b3ff-4ee76c2b36de',
  '0dea7541-7fef-42bd-bef0-6b445712605b',
  '8bb9b586-e0e0-4761-b5f9-531728d7f3ba',
  '77dae94c-c24f-4377-a120-1b5a9c18945c',
  '2a557481-f7b1-49fe-8b25-91fdfbb810fe',
  'cd33da88-c1a8-4006-b785-c2a213099810',
  'ccae9aa5-3157-4d3f-b301-2c24064cc1e9',
  '486170e6-7263-4311-9df6-af20e79e3b65',
  '33a51464-27b9-4e92-a196-ad6f948f2dda',
  '746d84da-8ebd-47cb-b64f-1574bd0500e2',
];

// To add new phones, these MUST match the predifned phones in the supabase config nder otp
// add them there first then here
const USER_PHONES = ['13346189523', '16153065113'];

export const artists: Omit<NewUser, 'id'>[] = [
  {
    phone: USER_PHONES[0],
    name: 'Keegan Thompson',
    userType: 'ARTIST',
    stripeAccountId: 'acct_1OTTW8RfNGQTv5cx',
    hasOnboardedToStripe: true,
  },
];

export const customers: Omit<NewUser, 'id'>[] = [
  {
    phone: USER_PHONES[1],
    name: 'Julia Thompson',
    userType: 'CUSTOMER',
  },
];

export const tattoos: Omit<NewTattoo, 'userId'>[] = [
  {
    id: UUIDS[0],
    color: 'BLACK_AND_GREY',
    style: 'BLACKWORK',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper con',
  },
  {
    id: UUIDS[1],
    color: 'COLOR',
    style: 'JAPANESE_IREZUMI',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper con',
  },
];

export const bookings: Omit<NewBooking, 'userId' | 'artistId'>[] = [
  {
    id: UUIDS[1],
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: tattoos[0].id as string,
  },
  {
    id: UUIDS[2],
    startDate: new Date(),
    type: 'TATTOO_SESSION',
    tattooId: tattoos[0].id as string,
  },
];
