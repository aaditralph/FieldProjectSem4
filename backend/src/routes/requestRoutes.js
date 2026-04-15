const express = require('express');
const router = express.Router();
const { 
  createRequest,
  getRequests, 
  getRequestById, 
  scheduleRequest, 
  cancelRequest,
  uploadRequestImage,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequestById);
router.post('/:id/schedule', protect, scheduleRequest);
router.post('/:id/cancel', protect, cancelRequest);
router.post('/:id/upload-images', protect, uploadMultiple, uploadRequestImage);

module.exports = router;
