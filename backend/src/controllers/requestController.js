const Request = require('../models/Request');
const DateSlot = require('../models/DateSlot');
const AuditLog = require('../models/AuditLog');

// @desc Create a new e-waste request
// @route POST /requests
// @access Private (Citizen)
const createRequest = async (req, res) => {
  try {
    const { address, contactPhone, preferredDate, preferredTimeSlot, notes, imageUrl } = req.body;

    // Validate required fields
    if (!address || !contactPhone || !preferredDate || !preferredTimeSlot) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if date slot exists and is available
    const slotDate = new Date(preferredDate);
    slotDate.setHours(0, 0, 0, 0);

    const dateSlot = await DateSlot.findOne({
      date: slotDate,
      isActive: true,
    });

    if (!dateSlot) {
      return res.status(400).json({ message: 'Selected date is not available for booking' });
    }

    const slot = dateSlot.timeSlots.find(s => s.slot === preferredTimeSlot);
    if (!slot || !slot.isActive) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    if (slot.bookedTickets >= slot.maxTickets) {
      return res.status(400).json({ message: 'Selected time slot is fully booked. Please choose another slot.' });
    }

    // Create the request
    const request = await Request.create({
      userId: req.user.id,
      address,
      contactPhone,
      preferredDate: new Date(preferredDate),
      preferredTimeSlot,
      notes: notes || '',
      imageUrl: imageUrl || '',
      status: 'CREATED',
    });

    // Book the slot
    dateSlot.bookSlot(preferredTimeSlot);
    await dateSlot.save();

    // Log action
    await AuditLog.create({
      action: 'request_created',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { address, preferredDate, preferredTimeSlot },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Get all requests (filtered by user role)
// @route GET /requests
// @access Private
const getRequests = async (req, res) => {
  try {
    let query = {};

    // Citizens see only their requests
    if (req.user.role === 'CITIZEN') {
      query.userId = req.user.id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const requests = await Request.find(query)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Get single request by ID
// @route GET /requests/:id
// @access Private
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('userId', 'name phone email address');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization - citizens can only see their own requests
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

// @desc Update request status (for BMC/Admin)
// @route PUT /requests/:id/status
// @access Private (Admin)
const updateRequestStatus = async (req, res) => {
  try {
    const { status, scheduledDate, scheduledTimeSlot, completedNotes } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Validate status transition
    const validStatuses = ['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const oldStatus = request.status;

    // Update status and related fields
    request.status = status;

    if (status === 'SCHEDULED') {
      if (!scheduledDate || !scheduledTimeSlot) {
        return res.status(400).json({ message: 'Scheduled date and time slot are required' });
      }
      request.scheduledDate = new Date(scheduledDate);
      request.scheduledTimeSlot = scheduledTimeSlot;
    }

    if (status === 'COMPLETED') {
      request.completedAt = new Date();
      if (completedNotes) {
        request.completedNotes = completedNotes;
      }
    }

    await request.save();

    // Log action
    await AuditLog.create({
      action: 'request_status_updated',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { oldStatus, newStatus: status },
    });

    res.json(request);
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Cancel a request
// @route POST /requests/:id/cancel
// @access Private (Citizen)
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

    // Check if can be cancelled (before completed)
    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Request cannot be cancelled' });
    }

    // Release the booked slot
    const slotDate = new Date(request.preferredDate);
    slotDate.setHours(0, 0, 0, 0);
    
    const dateSlot = await DateSlot.findOne({ date: slotDate });
    if (dateSlot) {
      dateSlot.cancelBooking(request.preferredTimeSlot);
      await dateSlot.save();
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

// @desc Get available date slots
// @route GET /requests/available-slots
// @access Public
const getAvailableSlots = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setDate(end.getDate() + 30); // Default to 30 days ahead
    end.setHours(23, 59, 59, 999);

    const dateSlots = await DateSlot.find({
      date: { $gte: start, $lte: end },
      isActive: true,
    }).sort({ date: 1 });

    // Format response to show only available slots
    const availableSlots = dateSlots.map(slot => ({
      date: slot.date,
      timeSlots: slot.timeSlots
        .filter(ts => ts.isActive && ts.bookedTickets < ts.maxTickets)
        .map(ts => ({
          slot: ts.slot,
          available: ts.maxTickets - ts.bookedTickets,
          max: ts.maxTickets,
        })),
    })).filter(slot => slot.timeSlots.length > 0);

    res.json(availableSlots);
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
  getAvailableSlots,
};
