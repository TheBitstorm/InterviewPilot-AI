// src/modules/resume/resume.upload.js
// Multer configuration for PDF resume uploads.
// Stored as a temp file — resume.service.js deletes it after parsing.

const multer = require('multer');
const path = require('path');
const AppError = require('../../utils/AppError');

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Store in local temp dir; service deletes after parsing
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // userId_timestamp_originalname — avoids collisions
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${req.user.id}_${Date.now()}_${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF files are accepted. Please upload a .pdf file.', 415), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

/**
 * Express error handler for Multer-specific errors.
 * Must be called AFTER the upload middleware to catch its errors.
 */
const handleUploadError = (err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return next(new AppError(`File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`, 413));
  }
  next(err);
};

module.exports = { upload, handleUploadError };
