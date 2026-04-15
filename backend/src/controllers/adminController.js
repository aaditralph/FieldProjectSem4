const Request = require('../models/Request');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
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

// @desc    Get all requests with vendor assignments
// @route   GET /admin/requests
// @access  Private (Admin)
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({})
      .populate('userId', 'name phone address')
      .populate('assignedVendorId', 'name phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a vendor
// @route   POST /admin/vendors
// @access  Private (Admin)
const createVendor = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    let userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with that email or phone' });
    }

    const vendorData = {
      name,
      phone,
      password, // User model pre-save hook handles hashing
      role: 'VENDOR',
      isActive: true,
      address: 'Not Provided',
    };
    
    // Only include email if it actually has content to prevent RegEx schema break
    if (email && email.trim() !== '') {
      vendorData.email = email;
    }

    const vendor = await User.create(vendorData);

    res.status(201).json({
      _id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      role: vendor.role,
      isActive: vendor.isActive,
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    if (error.errInfo && error.errInfo.details) {
      console.error('Validation details:', JSON.stringify(error.errInfo.details, null, 2));
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle vendor active status
// @route   PUT /admin/vendors/:id/toggle-status
// @access  Private (Admin)
const toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'VENDOR' });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.isActive = !vendor.isActive;
    await vendor.save();

    res.json(vendor);
  } catch (error) {
    console.error('Toggle vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getVendors,
  assignVendor,
  getAllRequests,
  createVendor,
  toggleVendorStatus,
};
