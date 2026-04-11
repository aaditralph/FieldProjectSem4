const Request = require('../models/Request');
const Pickup = require('../models/Pickup');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const PricingConfig = require('../models/PricingConfig');
const { calculatePrice } = require('../utils/helpers');

// @desc    Get all pickups for vendor
// @route   GET /vendor/pickups
// @access  Private (Vendor)
const getPickups = async (req, res) => {
  try {
    const requests = await Request.find({
      assignedVendorId: req.user.id,
      status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
    })
      .populate('userId', 'name phone address')
      .sort({ scheduledTime: 1 });

    res.json(requests);
  } catch (error) {
    console.error('Get pickups error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get pickup by ID
// @route   GET /vendor/pickups/:id
// @access  Private (Vendor)
const getPickupById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('userId', 'name phone address')
      .populate('assignedVendorId', 'name phone');

    if (!request) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Complete a pickup
// @route   POST /vendor/pickups/:id/complete
// @access  Private (Vendor)
const completePickup = async (req, res) => {
  try {
    const { otp, weight, condition } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    // Verify OTP
    if (request.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Get pricing config
    const pricingConfig = await PricingConfig.findOne({ category: request.category });

    if (!pricingConfig) {
      return res.status(404).json({ message: 'Pricing configuration not found' });
    }

    // Calculate final price
    const conditionFactor = pricingConfig.conditionFactors[condition];
    const finalPrice = calculatePrice(
      pricingConfig.ratePerKg,
      weight,
      conditionFactor
    );

    // Create pickup record
    const pickup = await Pickup.create({
      requestId: request._id,
      vendorId: req.user.id,
      weight,
      condition,
      finalPrice,
    });

    // Update request status
    request.status = 'COMPLETED';
    await request.save();

    // Create transaction
    const transaction = await Transaction.create({
      requestId: request._id,
      userId: request.userId,
      amount: finalPrice,
      paymentStatus: 'PAID',
      upiRef: `UPI${Date.now()}${Math.floor(Math.random() * 1000)}`,
    });

    // Log actions
    await AuditLog.create({
      action: 'pickup_completed',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { weight, condition, finalPrice },
    });

    await AuditLog.create({
      action: 'payment_done',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { amount: finalPrice, upiRef: transaction.upiRef },
    });

    res.json({
      pickup,
      transaction,
      finalPrice,
    });
  } catch (error) {
    console.error('Complete pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPickups,
  getPickupById,
  completePickup,
};
