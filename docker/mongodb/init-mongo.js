// MongoDB initialization script
// This script runs automatically when the container is first created

// Switch to ewaste database
db = db.getSiblingDB('ewaste');

// Create application user with specific permissions
db.createUser({
  user: 'ewaste_user',
  pwd: 'ewaste_password_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'ewaste'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'phone', 'role'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'User full name - required'
        },
        phone: {
          bsonType: 'string',
          pattern: '^[0-9]{10}$',
          description: '10-digit phone number - required'
        },
        email: {
          bsonType: 'string',
          pattern: '^.+@.+\\..+$',
          description: 'Valid email address - optional'
        },
        role: {
          enum: ['CITIZEN', 'VENDOR', 'ADMIN'],
          description: 'User role - required'
        },
        address: {
          bsonType: 'string',
          description: 'User address'
        }
      }
    }
  }
});

db.createCollection('requests', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'category', 'quantity', 'address', 'status'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'Reference to user - required'
        },
        category: {
          enum: ['Mobile Phone', 'Laptop', 'Desktop Computer', 'Television', 'Printer', 'Battery', 'Other Electronics'],
          description: 'E-waste category - required'
        },
        quantity: {
          bsonType: 'int',
          minimum: 1,
          description: 'Number of items - required'
        },
        address: {
          bsonType: 'string',
          description: 'Pickup address - required'
        },
        status: {
          enum: ['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
          description: 'Request status - required'
        },
        scheduledTime: {
          bsonType: 'date',
          description: 'Scheduled pickup time'
        },
        assignedVendorId: {
          bsonType: 'string',
          description: 'Assigned vendor reference'
        }
      }
    }
  }
});

db.createCollection('drives');
db.createCollection('pickups');
db.createCollection('transactions');
db.createCollection('pricing_configs');
db.createCollection('audit_logs');

// Create indexes for better query performance
db.users.createIndex({ phone: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { sparse: true });
db.users.createIndex({ role: 1 });

db.requests.createIndex({ userId: 1 });
db.requests.createIndex({ status: 1 });
db.requests.createIndex({ createdAt: -1 });
db.requests.createIndex({ category: 1 });

db.drives.createIndex({ date: 1 });
db.drives.createIndex({ location: 1 });

db.pickups.createIndex({ requestId: 1 }, { unique: true });
db.pickups.createIndex({ vendorId: 1 });
db.pickups.createIndex({ completedAt: -1 });

db.transactions.createIndex({ requestId: 1 }, { unique: true });
db.transactions.createIndex({ status: 1 });

db.audit_logs.createIndex({ requestId: 1 });
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ actorRole: 1 });

print('✅ Database initialization completed successfully!');
print('📦 Collections created: users, requests, drives, pickups, transactions, pricing_configs, audit_logs');
print('🔑 User created: ewaste_user with readWrite access');
print('📊 Indexes created for optimal query performance');
