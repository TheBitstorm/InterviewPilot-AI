// src/utils/apiResponse.js
// Standardized JSON response helpers.
// All controllers use these — never call res.json() directly.

const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = 'Something went wrong', statusCode = 500, details = null) => {
  const body = {
    success: false,
    error: { message },
  };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
