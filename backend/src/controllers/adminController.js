const Request = require('../models/Request');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Drive = require('../models/Drive');
const { generateOTP } = require('../utils/helpers');

// @desc    Get all vendors
// @route   GET /admin/vendors
// @access  Private (Admin)
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'VENDOR' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign vendor to a request
// @route   POST /admin/requests/:id/assign
// @access  Private (Admin)
const assignVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;

    // Verify vendor exists
    const vendor = await User.findOne({ _id: vendorId, role: 'VENDOR' });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if request can be assigned
    if (request.status !== 'SCHEDULED' && request.status !== 'CREATED') {
      return res.status(400).json({ 
        message: `Cannot assign vendor to request with status: ${request.status}` 
      });
    }

    // Assign vendor, update status, and generate OTP
    request.assignedVendorId = vendorId;
    request.status = 'IN_PROGRESS';
    request.otp = generateOTP();
    await request.save();

    // Log action
    await AuditLog.create({
      action: 'vendor_assigned',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { 
        vendorId, 
        vendorName: vendor.name,
        previousStatus: 'SCHEDULED',
        newStatus: 'IN_PROGRESS',
      },
    });

    // Populate vendor info for response
    const updatedRequest = await Request.findById(request._id)
      .populate('userId', 'name phone')
      .populate('assignedVendorId', 'name phone');

    res.json(updatedRequest);
  } catch (error) {
    console.error('Assign vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all requests with vendor assignments (excluding drive requests)
// @route   GET /admin/requests
// @access  Private (Admin)
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ type: { $ne: 'DRIVE' } })
      .populate('userId', 'name phone address')
      .populate('assignedVendorId', 'name phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all drive requests (type='DRIVE')
// @route   GET /admin/drive-requests
// @access  Private (Admin)
const getDriveRequests = async (req, res) => {
  try {
    const requests = await Request.find({ type: 'DRIVE' })
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get drive requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a drive request and create Drive with vendor assignment
// @route   POST /admin/drive-requests/:id/approve
// @access  Private (Admin)
const approveDriveRequest = async (req, res) => {
  try {
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor ID is required' });
    }

    // Verify vendor exists
    const vendor = await User.findOne({ _id: vendorId, role: 'VENDOR' });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.type !== 'DRIVE') {
      return res.status(400).json({ message: 'Request is not a drive request' });
    }

    if (request.status !== 'CREATED') {
      return res.status(400).json({ message: `Cannot approve request with status: ${request.status}` });
    }

    // Create Drive with vendor assignment
    const drive = await Drive.create({
      location: request.address,
      date: request.scheduledTime,
      capacity: 100, // default capacity for prototype
      creatorId: request.userId,
      registeredUsers: [request.userId],
      registeredCount: 1,
      assignedVendorId: vendorId,
      otp: generateOTP(), // Generate OTP for the drive creator
    });

    // Update request
    request.driveId = drive._id;
    request.assignedVendorId = vendorId;
    request.status = 'SCHEDULED';
    await request.save();

    // Log action
    await AuditLog.create({
      action: 'drive_approved',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { driveId: drive._id, vendorId, vendorName: vendor.name },
    });

    const response = await Drive.findById(drive._id).populate('assignedVendorId', 'name phone');
    res.status(201).json(response);
  } catch (error) {
    console.error('Approve drive request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a drive request
// @route   POST /admin/drive-requests/:id/reject
// @access  Private (Admin)
const rejectDriveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.type !== 'DRIVE') {
      return res.status(400).json({ message: 'Request is not a drive request' });
    }

    if (request.status !== 'CREATED') {
      return res.status(400).json({ message: `Cannot reject request with status: ${request.status}` });
    }

    request.status = 'REJECTED';
    await request.save();

    // Log action
    await AuditLog.create({
      action: 'drive_rejected',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
    });

    res.json(request);
  } catch (error) {
    console.error('Reject drive request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVendors,
  assignVendor,
  getAllRequests,
  getDriveRequests,
  approveDriveRequest,
  rejectDriveRequest,
};
