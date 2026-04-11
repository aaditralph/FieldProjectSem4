const mongoose = require('mongoose');

const dateSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  timeSlots: [{
    slot: {
      type: String,
      required: true,
    },
    maxTickets: {
      type: Number,
      required: true,
      default: 10,
    },
    bookedTickets: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
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

// Index for querying by date
dateSlotSchema.index({ date: 1 });

// Update the updatedAt timestamp before saving
dateSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if a slot is available
dateSlotSchema.methods.isSlotAvailable = function(slotTime) {
  const slot = this.timeSlots.find(s => s.slot === slotTime);
  if (!slot || !slot.isActive) return false;
  return slot.bookedTickets < slot.maxTickets;
};

// Method to book a ticket in a slot
dateSlotSchema.methods.bookSlot = function(slotTime) {
  const slot = this.timeSlots.find(s => s.slot === slotTime);
  if (!slot || !slot.isActive) return false;
  if (slot.bookedTickets >= slot.maxTickets) return false;
  slot.bookedTickets += 1;
  return true;
};

// Method to cancel a booking
dateSlotSchema.methods.cancelBooking = function(slotTime) {
  const slot = this.timeSlots.find(s => s.slot === slotTime);
  if (!slot) return false;
  if (slot.bookedTickets > 0) {
    slot.bookedTickets -= 1;
  }
  return true;
};

module.exports = mongoose.model('DateSlot', dateSlotSchema);
