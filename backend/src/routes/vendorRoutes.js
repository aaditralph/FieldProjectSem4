const express = require('express');
const router = express.Router();
const { getPickups, getPickupById, acceptPickup, startPickup, completePickup, getDrives, completeDrive } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

// Pickup routes
router.get('/pickups', protect, authorize('VENDOR'), getPickups);
router.get('/pickups/:id', protect, authorize('VENDOR'), getPickupById);
router.post('/pickups/:id/accept', protect, authorize('VENDOR'), acceptPickup);
router.post('/pickups/:id/start', protect, authorize('VENDOR'), startPickup);
router.post('/pickups/:id/complete', protect, authorize('VENDOR'), completePickup);

// Drive routes
router.get('/drives', protect, authorize('VENDOR'), getDrives);
router.post('/drives/:id/complete', protect, authorize('VENDOR'), completeDrive);

module.exports = router;
