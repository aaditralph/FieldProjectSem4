const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getVendors,
  assignVendor,
  getAllRequests,
  getDriveRequests,
  approveDriveRequest,
  rejectDriveRequest,
} = require('../controllers/adminController');

// All routes require admin role
router.use(protect);
router.use(authorize('ADMIN'));

// Routes
router.get('/vendors', getVendors);
router.get('/requests', getAllRequests);
router.post('/requests/:id/assign', assignVendor);

// Drive request management
router.get('/drive-requests', getDriveRequests);
router.post('/drive-requests/:id/approve', approveDriveRequest);
router.post('/drive-requests/:id/reject', rejectDriveRequest);

module.exports = router;
