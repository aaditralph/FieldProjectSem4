const express = require('express');
const router = express.Router();
const { getPickups, getPickupById, completePickup } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/pickups', protect, authorize('VENDOR'), getPickups);
router.get('/pickups/:id', protect, authorize('VENDOR'), getPickupById);
router.post('/pickups/:id/complete', protect, authorize('VENDOR'), completePickup);

module.exports = router;
