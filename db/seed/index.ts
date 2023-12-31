import db from '..';

import schemas from 'db/schema';
import { eq } from 'drizzle-orm';
import { artists, customers, tattoos, bookings } from './data';
import { supabase } from 'lib/supabase';

const seedAuthUsers = async () => {
  console.log('seeding auth table...');
  for (const user of [...artists, ...customers]) {
    const { error } = await supabase.auth.admin.createUser({
      phone: user.phone,
      phone_confirm: true,
    });
    if (error) {
      const isAlreadyRegistered = error.message
        .toLowerCase()
        .includes('already registered');
      if (isAlreadyRegistered) {
        console.log(
          `Phone ${user.phone} already added to auth table. skipping adding to auth table.`,
        );
      } else {
        console.error('Error seeding auth users:', error);
        process.exit(1);
      }
    }
  }
};

const seed = async () => {
  try {
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers();
    console.log('Seeding artists...');
    for (const artist of artists) {
      const authUser = users.find((u) => u.phone === artist.phone);
      await db
        .update(schemas.userSchema)
        .set({ ...artist })
        .where(eq(schemas.userSchema.id, authUser?.id as string));
    }
    console.log('Seeding customers...');
    for (const customer of customers) {
      const authUser = users.find((u) => u.phone === customer.phone);
      await db
        .update(schemas.userSchema)
        .set({ ...customer })
        .where(eq(schemas.userSchema.id, authUser?.id as string));
    }
    console.log('Seeding tattoos...');
    const customer = await db.query.users.findFirst({
      where: eq(schemas.userSchema.userType, 'CUSTOMER'),
    });
    const artist = await db.query.users.findFirst({
      where: eq(schemas.userSchema.userType, 'ARTIST'),
    });
    const tattoosWithUserIds = tattoos.map((t) => ({
      ...t,
      userId: customer?.id as string,
      artistId: artist?.id as string,
    }));
    await db
      .insert(schemas.tattooSchema)
      .values(tattoosWithUserIds)
      .onConflictDoNothing();
    console.log('Seeding bookings...');
    const bookingWithUserIds = bookings.map((b) => ({
      ...b,
      userId: customer?.id as string,
      artistId: artist?.id as string,
    }));
    await db
      .insert(schemas.bookingSchema)
      .values(bookingWithUserIds)
      .onConflictDoNothing();
    console.log('Seeded Successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding db:', error);
    process.exit(1);
  }
};

// seed supabase auth table
await seedAuthUsers();
// seed data
await seed();
