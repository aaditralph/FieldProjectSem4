const fs = require('fs');
const path = require('path');

// Delete a file from filesystem
const deleteFile = (filename) => {
  if (!filename) return;
  
  try {
    const filePath = path.join(__dirname, '../../uploads/requests', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted: ${filename}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error.message);
  }
};

// Delete multiple files
const deleteFiles = (filenames) => {
  if (!filenames || !Array.isArray(filenames)) return;
  
  filenames.forEach(filename => deleteFile(filename));
};

// Check if file exists
const fileExists = (filename) => {
  if (!filename) return false;
  
  try {
    const filePath = path.join(__dirname, '../../uploads/requests', filename);
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

module.exports = {
  deleteFile,
  deleteFiles,
  fileExists
};