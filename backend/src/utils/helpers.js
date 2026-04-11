const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate random OTP (4-6 digits)
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Calculate final price
const calculatePrice = (ratePerKg, weight, conditionFactor) => {
  return ratePerKg * weight * conditionFactor;
};

module.exports = {
  generateOTP,
  generateToken,
  calculatePrice,
};
