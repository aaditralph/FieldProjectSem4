const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  evaluatedItems: [{
    category: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0.1, 'Weight must be at least 0.1 kg'],
    },
    condition: {
      type: String,
      enum: ['WORKING', 'PARTIAL', 'SCRAP'],
      required: [true, 'Condition is required'],
    },
  }],
  finalPrice: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pickup', pickupSchema);
