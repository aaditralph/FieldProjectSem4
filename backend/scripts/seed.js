const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const PricingConfig = require('../src/models/PricingConfig');
const DateSlot = require('../src/models/DateSlot');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await User.deleteMany();
    await PricingConfig.deleteMany();
    await DateSlot.deleteMany();
    console.log('🗑️ Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Citizen User',
        phone: '9876543210',
        email: 'citizen@ewaste.com',
        role: 'CITIZEN',
        address: '123 Main Street, Mumbai, Maharashtra',
        password: 'password123',
      },
      {
        name: 'E-Waste Vendor',
        phone: '9876543211',
        email: 'vendor@ewaste.com',
        role: 'VENDOR',
        address: '456 Market Road, Mumbai, Maharashtra',
        password: 'password123',
      },
      {
        name: 'BMC Admin',
        phone: '9876543212',
        email: 'admin@bmc.gov.in',
        role: 'ADMIN',
        address: 'BMC Headquarters, Mumbai, Maharashtra',
        password: 'password123',
      },
    ]);

    console.log('✅ Created users');

    // Get vendor ID for environment variable
    const vendorId = users.find(u => u.role === 'VENDOR')._id;
    console.log(`\n📌 DEFAULT_VENDOR_ID=${vendorId}\n`);

    // Create pricing configurations
    const categories = [
      'Mobile Phone',
      'Laptop',
      'Desktop Computer',
      'Television',
      'Printer',
      'Battery',
      'Other Electronics',
    ];

    const rates = [100, 150, 120, 80, 90, 60, 70];

    const pricingConfigs = categories.map((category, index) => ({
      category,
      ratePerKg: rates[index],
      conditionFactors: {
        WORKING: 1.0,
        PARTIAL: 0.7,
        SCRAP: 0.4,
      },
    }));

    await PricingConfig.create(pricingConfigs);
    console.log('✅ Created pricing configurations');

    // Create default date slots for next 14 days
    const dateSlots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      dateSlots.push({
        date,
        timeSlots: [
          { slot: '09:00 AM - 12:00 PM', maxTickets: 10, bookedTickets: 0, isActive: true },
          { slot: '02:00 PM - 05:00 PM', maxTickets: 10, bookedTickets: 0, isActive: true },
        ],
        isActive: true,
      });
    }

    await DateSlot.create(dateSlots);
    console.log('✅ Created date slots for next 14 days');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📱 Test Credentials:');
    console.log('Citizen: 9876543210 / password123');
    console.log('Vendor: 9876543211 / password123');
    console.log('Admin: 9876543212 / password123');
    console.log('\n🔑 OTP for login: 1234\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
