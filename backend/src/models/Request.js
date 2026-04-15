const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Mobile Phone',
        'Laptop',
        'Desktop Computer',
        'Television',
        'Printer',
        'Battery',
        'Other Electronics',
      ],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    }
  }],
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  status: {
    type: String,
    enum: ['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'CREATED',
  },
  scheduledTime: {
    type: Date,
  },
  imageUrls: [{
    type: String,
  }],
  otp: {
    type: String,
  },
  assignedVendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['HOME_PICKUP', 'DRIVE'],
    default: 'HOME_PICKUP',
  },
  driveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drive',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  finalPrice: {
    type: Number,
  },
});

// Update the updatedAt timestamp before saving
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', requestSchema);
