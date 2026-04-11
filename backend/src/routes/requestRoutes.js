const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
  getAvailableSlots,
} = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route - available slots
router.get('/available-slots', getAvailableSlots);

// Protected routes
router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id/status', protect, adminOnly, updateRequestStatus);
router.post('/:id/cancel', protect, cancelRequest);

module.exports = router;
