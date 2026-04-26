const Drive = require('../models/Drive');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

// @desc    Get all drives
// @route   GET /drives
// @access  Public
const getDrives = async (req, res) => {
  try {
    const drives = await Drive.find({ completed: false })
      .sort({ date: 1 });

    res.json(drives);
  } catch (error) {
    console.error('Get drives error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new drive
// @route   POST /drives
// @access  Private (Admin)
const createDrive = async (req, res) => {
  try {
    const { location, date, capacity } = req.body;

    // Validate date is in the future
    if (new Date(date) < new Date()) {
      return res.status(400).json({ message: 'Drive date must be in the future' });
    }

    const drive = await Drive.create({
      location,
      date,
      capacity,
    });

    // Log action
    await AuditLog.create({
      action: 'drive_created',
      actorId: req.user.id,
      actorRole: req.user.role,
      meta: { location, date, capacity },
    });

    res.status(201).json(drive);
  } catch (error) {
    console.error('Create drive error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Join a drive
// @route   POST /drives/:id/join
// @access  Private (Citizen)
const joinDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    // Check capacity and prevent duplicate join atomically
    const result = await Drive.findOneAndUpdate(
      { 
        _id: req.params.id, 
        registeredCount: { $lt: drive.capacity }, 
        registeredUsers: { $ne: req.user.id } 
      },
      { $inc: { registeredCount: 1 }, $push: { registeredUsers: req.user.id } },
      { new: true }
    );

    if (!result) {
      // Determine if full or already joined
      const current = await Drive.findById(req.params.id);
      if (current.registeredCount >= current.capacity) {
        return res.status(400).json({ message: 'Drive is full' });
      }
      return res.status(400).json({ message: 'Already registered for this drive' });
    }

    // Log action
    await AuditLog.create({
      action: 'drive_joined',
      actorId: req.user.id,
      actorRole: req.user.role,
      meta: { driveId: drive._id },
    });

    res.json(result);
  } catch (error) {
    console.error('Join drive error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a drive
// @route   PUT /drives/:id
// @access  Private (Admin)
const updateDrive = async (req, res) => {
  try {
    const { location, date, capacity } = req.body;

    const drive = await Drive.findById(req.params.id);

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    if (location) drive.location = location;
    if (date) {
      if (new Date(date) < new Date()) {
        return res.status(400).json({ message: 'Drive date must be in the future' });
      }
      drive.date = date;
    }
    if (capacity) drive.capacity = capacity;

    await drive.save();

    // Log action
    await AuditLog.create({
      action: 'drive_updated',
      actorId: req.user.id,
      actorRole: req.user.role,
      meta: { driveId: drive._id },
    });

    res.json(drive);
  } catch (error) {
    console.error('Update drive error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a drive
// @route   DELETE /drives/:id
// @access  Private (Admin)
const deleteDrive = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    await drive.deleteOne();

    // Log action
    await AuditLog.create({
      action: 'drive_deleted',
      actorId: req.user.id,
      actorRole: req.user.role,
      meta: { driveId: drive._id },
    });

    res.json({ message: 'Drive deleted successfully' });
  } catch (error) {
    console.error('Delete drive error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDrives,
  createDrive,
  joinDrive,
  updateDrive,
  deleteDrive,
};
