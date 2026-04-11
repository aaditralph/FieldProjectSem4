const mongoose = require('mongoose');

const pricingConfigSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
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
  ratePerKg: {
    type: Number,
    required: [true, 'Rate per kg is required'],
    min: [0, 'Rate must be positive'],
  },
  conditionFactors: {
    WORKING: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
    PARTIAL: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
    SCRAP: {
      type: Number,
      default: 0.4,
      min: 0,
      max: 1,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
