// src/app.js
// Express application setup.
// Registers middleware, mounts all module routes, attaches global error handler.

require('dotenv').config();
require('./config/env'); // Validates env vars — exits early if invalid

const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const resumeRoutes = require('./modules/resume/resume.routes');
const interviewRoutes = require('./modules/interview/interview.routes');
const reportRoutes = require('./modules/report/report.routes');
const roadmapRoutes = require('./modules/roadmap/roadmap.routes');

const app = express();

// ─── Core Middleware ───────────────────────────────────────────────────────────

const clientUrls = (env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...clientUrls,
  'https://interview-pilot-ai-weld.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Vercel proxy)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/interview-pilot-ai.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (resumes) as static assets
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ──────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'InterviewPilot AI server is running.',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/roadmaps', roadmapRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.path} not found.` },
  });
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────

app.use(errorHandler);

module.exports = app;
