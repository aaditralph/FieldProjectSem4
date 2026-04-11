const express = require('express');
const router = express.Router();
const {
  getDateSlots,
  createDateSlots,
  updateDateSlot,
  deleteDateSlot,
  generateDefaultSlots,
  getTicketCount,
} = require('../controllers/dateSlotController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are protected and admin-only
router.get('/', protect, adminOnly, getDateSlots);
router.post('/', protect, adminOnly, createDateSlots);
router.post('/generate', protect, adminOnly, generateDefaultSlots);
router.get('/ticket-count', protect, adminOnly, getTicketCount);
router.put('/:id', protect, adminOnly, updateDateSlot);
router.delete('/:id', protect, adminOnly, deleteDateSlot);

module.exports = router;
