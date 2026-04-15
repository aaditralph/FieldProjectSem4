const Request = require('../models/Request');
const AuditLog = require('../models/AuditLog');
const { generateOTP } = require('../utils/helpers');
const { deleteFiles } = require('../utils/fileUtils');

// @desc    Create a new e-waste request
// @route   POST /requests
// @access  Private (Citizen)
const createRequest = async (req, res) => {
  try {
    const { category, quantity, address, imageUrl, type, driveId, scheduledTime } = req.body;

    const request = await Request.create({
      userId: req.user.id,
      category,
      quantity,
      address,
      imageUrl,
      type: type || 'HOME_PICKUP',
      driveId,
      scheduledTime,
    });

    // Log action
    await AuditLog.create({
      action: 'request_created',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: { category, quantity, type },
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

  // Delete images from filesystem
  if (request.imageUrls && request.imageUrls.length > 0) {
    deleteFiles(request.imageUrls);
    request.imageUrls = [];
  }

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

// @desc Upload images for a request
// @route POST /requests/:id/upload-images
// @access Private (Citizen)
const uploadRequestImage = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      // Clean up uploaded files if request not found
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (file.path) {
            const fs = require('fs');
            fs.unlink(file.path, (err) => {
              if (err) console.error('Error deleting file:', err);
            });
          }
        });
      }
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user owns this request
    if (request.userId.toString() !== req.user.id) {
      // Clean up uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (file.path) {
            const fs = require('fs');
            fs.unlink(file.path, (err) => {
              if (err) console.error('Error deleting file:', err);
            });
          }
        });
      }
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request can accept images (status must be CREATED or SCHEDULED)
    if (!['CREATED', 'SCHEDULED'].includes(request.status)) {
      // Clean up uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (file.path) {
            const fs = require('fs');
            fs.unlink(file.path, (err) => {
              if (err) console.error('Error deleting file:', err);
            });
          }
        });
      }
      return res.status(400).json({ 
        message: 'Images can only be added to CREATED or SCHEDULED requests' 
      });
    }

    // Process uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Store file paths
    const uploadedFilenames = req.files.map(file => file.filename);
    
    // Append to existing imageUrls or create new array
    if (!request.imageUrls) {
      request.imageUrls = [];
    }
    request.imageUrls.push(...uploadedFilenames);

    await request.save();

    // Log action
    await AuditLog.create({
      action: 'request_images_uploaded',
      actorId: req.user.id,
      actorRole: req.user.role,
      requestId: request._id,
      meta: {
        imageCount: uploadedFilenames.length,
        filenames: uploadedFilenames,
      },
    });

    res.json({
      message: 'Images uploaded successfully',
      imageUrls: request.imageUrls,
      newImages: uploadedFilenames,
    });

  } catch (error) {
    console.error('Upload request image error:', error);
    
    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.path) {
          const fs = require('fs');
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
      });
    }
    
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
