const Request = require('../models/Request');
const Pickup = require('../models/Pickup');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const PricingConfig = require('../models/PricingConfig');
const { calculatePrice, generateOTP } = require('../utils/helpers');

// @desc    Get all pickups for vendor
// @route   GET /vendor/pickups
// @access  Private (Vendor)
const getPickups = async (req, res) => {
  try {
    const requests = await Request.find({
      assignedVendorId: req.user.id,
      status: { $in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] },
    })
      .populate('userId', 'name phone address')
      .sort({ scheduledTime: 1 });

    res.json(requests);
  } catch (error) {
    console.error('Get pickups error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept a pickup (vendor acknowledges assignment)
// @route   POST /vendor/pickups/:id/accept
// @access  Private (Vendor)
const acceptPickup = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    // Verify this pickup is assigned to this vendor
    if (request.assignedVendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status and generate OTP
    request.status = 'IN_PROGRESS';
    request.otp = generateOTP();
    await request.save();

    // Log action
    await AuditLog.create({
      action: 'pickup_accepted',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { 
        vendorId: req.user.id,
        vendorName: req.user.name,
      },
    });

    const updatedRequest = await Request.findById(request._id)
      .populate('userId', 'name phone address')
      .populate('assignedVendorId', 'name phone');

    res.json(updatedRequest);
  } catch (error) {
    console.error('Accept pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Start pickup (vendor is on the way or at location)
// @route   POST /vendor/pickups/:id/start
// @access  Private (Vendor)
const startPickup = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    // Verify this pickup is assigned to this vendor
    if (request.assignedVendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Status already IN_PROGRESS, just log the action
    await AuditLog.create({
      action: 'pickup_started',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { 
        vendorId: req.user.id,
        vendorName: req.user.name,
        scheduledTime: request.scheduledTime,
      },
    });

    const updatedRequest = await Request.findById(request._id)
      .populate('userId', 'name phone address')
      .populate('assignedVendorId', 'name phone');

    res.json(updatedRequest);
  } catch (error) {
    console.error('Start pickup error:', error);
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
    const { otp, evaluatedItems, finalPrice: manualPrice } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    // Verify OTP
    if (request.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    let calculatedFinalPrice = 0;
    
    // Calculate total price by looping over items
    for (const item of evaluatedItems) {
      const pricingConfig = await PricingConfig.findOne({ category: item.category });
      let itemPrice = 0;
      
      if (pricingConfig) {
        const conditionFactor = pricingConfig.conditionFactors[item.condition] || 0.1;
        itemPrice = calculatePrice(pricingConfig.ratePerKg, item.weight, conditionFactor);
      }
      calculatedFinalPrice += itemPrice;
    }

    const finalPrice = manualPrice !== undefined ? Number(manualPrice) : calculatedFinalPrice;

    // Create pickup record
    const pickup = await Pickup.create({
      requestId: request._id,
      vendorId: req.user.id,
      evaluatedItems,
      finalPrice,
    });

    // Update request status
    request.status = 'COMPLETED';
    request.finalPrice = finalPrice;
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
      meta: { evaluatedItems, finalPrice },
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
  acceptPickup,
  startPickup,
  completePickup,
};
