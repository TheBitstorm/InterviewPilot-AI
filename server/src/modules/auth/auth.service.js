// src/modules/auth/auth.service.js
// Business logic for authentication.
// Controllers call these functions — no DB code in controllers.

const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { signToken } = require('../../utils/jwtHelper');
const AppError = require('../../utils/AppError');

/**
 * Register a new user.
 * Returns the user object and a signed JWT.
 */
const register = async ({ name, email, password }) => {
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const trimmedName = name ? name.trim() : '';

  // Check if email already taken
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name: trimmedName, email: normalizedEmail, passwordHash },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return { user, token };
};

/**
 * Log in an existing user.
 * Returns the user object and a signed JWT.
 */
const login = async ({ email, password }) => {
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    // Generic message — don't reveal whether email exists
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
};

/**
 * Get the currently logged-in user by their ID.
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) throw new AppError('User not found.', 404);
  return user;
};

module.exports = { register, login, getMe };
