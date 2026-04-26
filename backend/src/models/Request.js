const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Mobile Phone',
      'Laptop',
      'Desktop Computer',
      'Television',
      'Printer',
      'Battery',
      'Other Electronics',
    ],
    // Required for HOME_PICKUP; optional for DRIVE (defaults to 'Other Electronics')
    required: function () {
      return this.type === 'HOME_PICKUP';
    },
    default: function () {
      return this.type === 'DRIVE' ? 'Other Electronics' : undefined;
    },
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  status: {
    type: String,
    enum: ['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'APPROVED', 'REJECTED'],
    default: 'CREATED',
  },
  scheduledTime: {
    type: Date,
  },
  imageUrl: {
    type: String,
  },
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
});

// Update the updatedAt timestamp before saving
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for frontend compatibility
requestSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtuals are included in JSON
requestSchema.set('toJSON', { virtuals: true });

// Indexes for performance
requestSchema.index({ userId: 1 });
requestSchema.index({ type: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ driveId: 1 });

module.exports = mongoose.model('Request', requestSchema);
