const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Attempt to remove the restrictive jsonSchema validation
    await db.command({ collMod: 'users', validator: {} });
    console.log('✅ Removed MongoDB jsonSchema validation from users collection');
    
  } catch (error) {
    console.error('❌ Error fixing DB:', error.message);
  } finally {
    process.exit(0);
  }
}

fixDb();
