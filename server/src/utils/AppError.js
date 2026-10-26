// src/utils/AppError.js
// Custom error class — carries an HTTP status code alongside the message.
// Allows the global error handler to distinguish operational errors
// (thrown intentionally) from unexpected crashes.

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // flag: known, safe-to-expose error
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
