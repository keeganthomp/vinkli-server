import { migrate } from 'drizzle-orm/postgres-js/migrator';
import db from '.';

const migrateDB = async () => {
  try {
    console.log('migrating db..');
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('db migrated!');
    process.exit(0);
  } catch (err) {
    console.error('Error migrating db:', err);
    process.exit(1);
  }
};

migrateDB();
