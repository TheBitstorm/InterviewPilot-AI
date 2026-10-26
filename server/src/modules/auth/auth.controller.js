// src/modules/auth/auth.controller.js
// Thin HTTP layer — delegates all logic to auth.service.js.
// Controllers only: parse request, call service, send response.

const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 'Account created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, user, 'User profile fetched.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
