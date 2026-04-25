const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getVendors,
  assignVendor,
  getAllRequests,
  createVendor,
  toggleVendorStatus,
  getDashboardAnalytics,
  rejectRequest,
} = require('../controllers/adminController');

// All routes require admin role
router.use(protect);
router.use(authorize('ADMIN'));

// Routes
router.get('/vendors', getVendors);
router.post('/vendors', createVendor);
router.put('/vendors/:id/toggle-status', toggleVendorStatus);
router.get('/requests', getAllRequests);
router.post('/requests/:id/assign', assignVendor);
router.put('/requests/:id/reject', rejectRequest);
router.get('/dashboard-analytics', getDashboardAnalytics);

module.exports = router;
