const express = require('express');
const router = express.Router();
const {
  getDrives,
  createDrive,
  joinDrive,
  updateDrive,
  deleteDrive,
} = require('../controllers/driveController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDrives);
router.post('/', protect, authorize('ADMIN'), createDrive);
router.post('/:id/join', protect, joinDrive);
router.put('/:id', protect, authorize('ADMIN'), updateDrive);
router.delete('/:id', protect, authorize('ADMIN'), deleteDrive);

module.exports = router;
