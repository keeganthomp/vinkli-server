import db from '.';
import { faker } from '@faker-js/faker';

import { users } from './schema/user';
import { booking } from './schema/booking';

const NUM_OF_ARTISTS = 2;
const NUM_OF_CUSTOMERS = 5;
const NUM_OF_BOOKINGS = 10;

const seed = async () => {
  try {
    console.log('Seeding db...');

    // artists
    const artists: (typeof users.$inferInsert)[] = [];
    for (let i = 0; i < NUM_OF_ARTISTS; i++) {
      const userPayload = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        userType: 'ARTIST' as const,
      };
      artists.push(userPayload);
    }
    await db.insert(users).values(artists);

    // customers
    const customers: (typeof users.$inferInsert)[] = [];
    for (let i = 0; i < NUM_OF_CUSTOMERS; i++) {
      const userPayload = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        userType: 'CUSTOMER' as const,
      };
      customers.push(userPayload);
    }
    await db.insert(users).values(customers);

    // customer bookings
    const customerBookings: (typeof booking.$inferInsert)[] = [];
    for (let i = 0; i < NUM_OF_BOOKINGS; i++) {
      const customerIndex = Math.floor(Math.random() * NUM_OF_CUSTOMERS);
      const artistIndex = Math.floor(Math.random() * NUM_OF_ARTISTS);
      const bookingPayload = {
        id: faker.string.uuid(),
        artistId: artists[artistIndex].id,
        customerId: customers[customerIndex].id,
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        date: faker.date.future(),
      };
      customerBookings.push(bookingPayload);
    }
    await db.insert(booking).values(customerBookings);

    console.log('Seeded Successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding db:', error);
    process.exit(1);
  }
};

seed();
