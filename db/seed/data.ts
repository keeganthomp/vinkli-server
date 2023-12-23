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

export const seedArtists: NewUser[] = [
  {
    id: UUIDS[0],
    email: 'artist1@gmail.com',
    name: 'Timmy Joe',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
  {
    id: UUIDS[1],
    email: 'artist2@gmail.com',
    name: 'Johnny Jim',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
  {
    id: UUIDS[2],
    email: 'artist3@gmail.com',
    name: 'Sarah Kin',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
  {
    id: UUIDS[3],
    email: 'artist4@gmail.com',
    name: 'Jane Street',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
  {
    id: UUIDS[4],
    email: 'artist5@gmail.com',
    name: 'Gee Lome',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
];

export const seedCustomers: NewUser[] = [
  {
    id: UUIDS[5],
    email: 'customer1@gmail.com',
    name: 'Kai Lee',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
  {
    id: UUIDS[6],
    email: 'customer2@gmail.com',
    name: 'Paul Gree',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
  {
    id: UUIDS[7],
    email: 'customer3@gmail.com',
    name: 'Finn Woo',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
  {
    id: UUIDS[8],
    email: 'customer4@gmail.com',
    name: 'Laura Paul',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
  {
    id: UUIDS[9],
    email: 'customer5@gmail.com',
    name: 'Higy Tome',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
];

export const seedTattoos: NewTattoo[] = [];

export const seedBookings: NewBooking[] = [
  {
    id: UUIDS[1],
    artistId: seedArtists[0].id,
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
  {
    id: UUIDS[2],
    artistId: seedArtists[0].id,
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
  {
    id: UUIDS[3],
    artistId: seedArtists[0].id,
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
  {
    id: UUIDS[4],
    artistId: seedArtists[2].id,
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
  {
    id: UUIDS[5],
    artistId: seedArtists[3].id,
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
];
