// src/middleware/errorHandler.js
// Global Express error handling middleware — must be registered LAST in app.js.
// Catches all errors forwarded via next(err).

const { sendError } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  // Log all errors server-side
  console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.path} — ${err.message}`);
  if (isDev && !err.isOperational) console.error(err.stack);

  // Handle Prisma-specific errors
  if (err.code === 'P2002') {
    return sendError(res, 'A record with that value already exists.', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found.', 404);
  }

  // Expose message only for operational errors; generic message for crashes
  const message = err.isOperational ? err.message : 'Something went wrong. Please try again.';
  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
