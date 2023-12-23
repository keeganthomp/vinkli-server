import db from '..';

import { users } from '../schema/user';
import { booking } from '../schema/booking';
import { tattoo } from '../schema/tattoo';
import { seedArtists, seedCustomers, seedBookings, seedTattoos } from './data';

const seed = async () => {
  try {
    console.log('Seeding db...');
    console.log('Seeding artists...');
    await db.insert(users).values(seedArtists).onConflictDoNothing();
    console.log('Seeding customers...');
    await db.insert(users).values(seedCustomers).onConflictDoNothing();
    console.log('Seeding tattoos...');
    // await db.insert(tattoo).values(seedTattoos).onConflictDoNothing();
    // console.log('Seeding bookings...');
    // await db.insert(booking).values(seedBookings).onConflictDoNothing();
    // console.log('Seeded Successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding db:', error);
    process.exit(1);
  }
};

seed();
