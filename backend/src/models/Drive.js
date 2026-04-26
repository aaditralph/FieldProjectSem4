const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  registeredCount: {
    type: Number,
    default: 0,
  },
  assignedVendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  otp: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for frontend compatibility
driveSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtuals are included in JSON
driveSchema.set('toJSON', { virtuals: true });

// Indexes for performance
driveSchema.index({ registeredUsers: 1 });
driveSchema.index({ date: 1 });

module.exports = mongoose.model('Drive', driveSchema);
