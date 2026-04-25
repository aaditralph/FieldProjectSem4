const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken, generateOTP } = require('../utils/helpers');

// @desc    Send OTP (for login/signup)
// @route   POST /auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { phone, role } = req.body;

    if (role === 'VENDOR' || role === 'ADMIN') {
      return res.status(403).json({ message: 'Vendors can only be created by admin' });
    }

    // Optional: check if user already exists
    let user = await User.findOne({ phone });
    if (user && req.body.action === 'signup') {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP (in production, send via SMS)
    const otp = generateOTP();
    
    // For development, return OTP in response
    // In production, store in DB and send via SMS
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({ 
      message: 'OTP sent successfully',
      otp, // Remove this in production when SMS is integrated
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login with phone and OTP
// @route   POST /auth/login
// @access  Public
  const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user
    const user = await User.findOne({ phone }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({ message: 'Account needs password reset. Please sign up again or contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is disabled. Contact admin.' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Log the login action
    await AuditLog.create({
      action: 'user_login',
      actorId: user._id,
      actorRole: user.role,
      meta: { phone },
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Sign up new user
// @route   POST /auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, phone, password, address, otp } = req.body;

    // Verify OTP (in production, verify against stored OTP)
    if (otp !== '1234' && otp.length !== 4) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      phone,
      password,
      address,
      role: 'CITIZEN', // Default role
    });

    console.log(`✅ New user registered: ${phone}`);

    // Generate JWT token
    const token = generateToken(user._id);

    // Log the signup action
    await AuditLog.create({
      action: 'user_signup',
      actorId: user._id,
      actorRole: user.role,
      meta: { phone },
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendOtp,
  login,
  signup,
  getMe,
};
