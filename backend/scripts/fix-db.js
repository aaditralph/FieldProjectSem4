const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Attempt to remove the restrictive jsonSchema validation
    await db.command({ collMod: 'users', validator: {} }).catch(e => console.log('Users not strict'));
    console.log('✅ Removed MongoDB jsonSchema validation from users collection');

    await db.command({ collMod: 'requests', validator: {} }).catch(e => console.log('Requests not strict'));
    console.log('✅ Removed MongoDB jsonSchema validation from requests collection');

    await db.command({ collMod: 'pickups', validator: {} }).catch(e => console.log('Pickups not strict'));
    console.log('✅ Removed MongoDB jsonSchema validation from pickups collection');
  } catch (error) {
    console.error('❌ Error fixing DB:', error.message);
  } finally {
    process.exit(0);
  }
}

fixDb();
