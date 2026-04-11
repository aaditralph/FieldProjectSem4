const express = require('express');
const router = express.Router();
const { sendOtp, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
