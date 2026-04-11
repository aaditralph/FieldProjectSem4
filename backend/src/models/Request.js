const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required'],
  },
  preferredTimeSlot: {
    type: String,
    required: [true, 'Preferred time slot is required'],
  },
  notes: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'CREATED',
  },
  scheduledDate: {
    type: Date,
  },
  scheduledTimeSlot: {
    type: String,
  },
  completedAt: {
    type: Date,
  },
  completedNotes: {
    type: String,
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

module.exports = mongoose.model('Request', requestSchema);
