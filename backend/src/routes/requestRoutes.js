const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  scheduleRequest,
  cancelRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequestById);
router.post('/:id/schedule', protect, scheduleRequest);
router.post('/:id/cancel', protect, cancelRequest);

module.exports = router;
