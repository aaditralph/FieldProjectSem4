const Request = require('../models/Request');
const AuditLog = require('../models/AuditLog');
const { generateOTP } = require('../utils/helpers');

// @desc    Create a new e-waste request
// @route   POST /requests
// @access  Private (Citizen)
const createRequest = async (req, res) => {
  try {
    const { category, quantity, address, imageUrl, type, driveId, scheduledTime } = req.body;

    const requestType = type || 'HOME_PICKUP';

    // For community drives, category is optional — fall back to 'Other Electronics'
    const resolvedCategory = category || (requestType === 'DRIVE' ? 'Other Electronics' : undefined);

    if (requestType === 'HOME_PICKUP' && !resolvedCategory) {
      return res.status(400).json({ message: 'Category is required for home pickup requests' });
    }

    const request = await Request.create({
      userId: req.user.id,
      category: resolvedCategory,
      quantity: quantity || 1,
      address,
      imageUrl,
      type: requestType,
      driveId,
      scheduledTime,
    });

    // Log action
    await AuditLog.create({
      action: 'request_created',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { category: resolvedCategory, quantity, type: requestType },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all requests (filtered by user role)
// @route   GET /requests
// @access  Private
const getRequests = async (req, res) => {
  try {
    let query = {};

    // Citizens see only their requests
    if (req.user.role === 'CITIZEN') {
      query.userId = req.user.id;
    }

    const requests = await Request.find(query)
      .populate('userId', 'name phone')
      .populate('assignedVendorId', 'name phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single request by ID
// @route   GET /requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('userId', 'name phone email address')
      .populate('assignedVendorId', 'name phone')
      .populate('driveId', 'location date');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization
    if (
      req.user.role === 'CITIZEN' && 
      request.userId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Schedule a request
// @route   POST /requests/:id/schedule
// @access  Private (Citizen)
const scheduleRequest = async (req, res) => {
  try {
    const { timeSlot, date } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns this request
    if (request.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update request
    request.status = 'SCHEDULED';
    request.scheduledTime = new Date(`${date}T${timeSlot}`);
    request.assignedVendorId = process.env.DEFAULT_VENDOR_ID; // Assign to single vendor

    await request.save();

    // Log action
    await AuditLog.create({
      action: 'request_scheduled',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { 
        scheduledTime: request.scheduledTime,
        otp: request.otp,
      },
    });

    res.json(request);
  } catch (error) {
    console.error('Schedule request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel a request
// @route   POST /requests/:id/cancel
// @access  Private (Citizen)
const cancelRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns this request
    if (request.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if can be cancelled (before scheduled time)
    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Request cannot be cancelled' });
    }

    request.status = 'CANCELLED';
    await request.save();

    // Log action
    await AuditLog.create({
      action: 'request_cancelled',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
    });

    res.json(request);
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  scheduleRequest,
  cancelRequest,
};
