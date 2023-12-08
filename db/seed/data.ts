import { users } from '../schema/user';
import { booking } from '../schema/booking';
import { tattoo } from '../schema/tattoo';

type NewUser = typeof users.$inferInsert;
type NewBooking = typeof booking.$inferInsert;
type NewTattoo = typeof tattoo.$inferInsert;

export const seedArtists: NewUser[] = [
  {
    id: '1',
    email: '',
    name: '',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
  {
    id: '1',
    email: '',
    name: '',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
  {
    id: '1',
    email: '',
    name: '',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
  {
    id: '1',
    email: '',
    name: '',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
  {
    id: '1',
    email: '',
    name: '',
    userType: 'ARTIST',
    hasOnboardedToStripe: false,
  },
];

export const seedCustomers: NewUser[] = [
  {
    id: '1',
    email: '',
    name: '',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
  {
    id: '1',
    email: '',
    name: '',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
  {
    id: '1',
    email: '',
    name: '',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
  {
    id: '1',
    email: '',
    name: '',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
  {
    id: '1',
    email: '',
    name: '',
    userType: 'CUSTOMER',
    hasOnboardedToStripe: false,
  },
];

export const seedTattoos: NewTattoo[] = [];

export const seedBookings: NewBooking[] = [
  {
    id: '1',
    artistId: '1',
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
  {
    id: '1',
    artistId: '1',
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
  {
    id: '1',
    artistId: '1',
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
  {
    id: '1',
    artistId: '1',
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
  {
    id: '1',
    artistId: '1',
    userId: '1',
    startDate: new Date(),
    type: 'CONSULTATION',
    tattooId: '1',
  },
];
