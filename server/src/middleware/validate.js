// src/middleware/validate.js
// Zod-based request body validator middleware factory.
// Usage: router.post('/route', validate(schema), controller)

const { sendError } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return sendError(res, 'Validation failed', 422, details);
  }

  req.body = result.data; // use the parsed + coerced data
  next();
};

module.exports = validate;
