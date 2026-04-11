const express = require('express');
const router = express.Router();
const { getPricing, updatePricing } = require('../controllers/pricingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getPricing);
router.put('/', protect, authorize('ADMIN'), updatePricing);

module.exports = router;
