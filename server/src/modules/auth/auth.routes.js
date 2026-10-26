// src/modules/auth/auth.routes.js

const { Router } = require('express');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const { registerSchema, loginSchema } = require('./auth.validator');

const router = Router();

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// GET /api/v1/auth/me  (protected)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
