// src/modules/resume/resume.routes.js

const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const resumeController = require('./resume.controller');
const { upload, handleUploadError } = require('./resume.upload');

const router = Router();

// All resume routes require authentication
router.use(authenticate);

// POST /api/v1/resumes/upload — upload PDF, extract text, store in DB
router.post(
  '/upload',
  upload.single('resume'),
  handleUploadError,
  resumeController.uploadResume
);

// GET /api/v1/resumes — list all resumes for authenticated user
router.get('/', resumeController.getUserResumes);

// GET /api/v1/resumes/active — get active resume for authenticated user
router.get('/active', resumeController.getActiveResume);

// DELETE /api/v1/resumes/:id — delete a specific resume for authenticated user
router.delete('/:id', resumeController.deleteResume);

module.exports = router;

