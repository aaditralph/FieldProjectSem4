const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/requests');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter - accept images only (no restrictions for demo)
const fileFilter = (req, file, cb) => {
  // Allow any file type for demo purposes
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  // No file size limit for demo
});

// Middleware for single image upload
const uploadSingle = upload.single('image');

// Middleware for multiple images
const uploadMultiple = upload.array('images', 10); // Max 10 images

module.exports = {
  uploadSingle,
  uploadMultiple
};