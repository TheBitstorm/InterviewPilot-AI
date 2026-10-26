// src/modules/resume/resume.controller.js
// Thin HTTP layer — delegates all logic to resume.service.js.
// Controllers only: parse request, call service, send response.

const resumeService = require('./resume.service');
const { sendSuccess } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');

/**
 * POST /api/v1/resumes/upload
 * Requires: JWT auth, multipart/form-data with field "resume" (PDF)
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded. Please attach a PDF file.', 400));
    }

    const result = await resumeService.uploadResume({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
    });

    return sendSuccess(res, result, 'Resume uploaded successfully.', 201);
  } catch (err) {
    // If service throws before deleting the file, clean up here
    if (req.file?.path) {
      const fs = require('fs');
      try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
    }
    next(err);
  }
};

/**
 * GET /api/v1/resumes
 * Returns all resumes for the authenticated user.
 */
const getUserResumes = async (req, res, next) => {
  try {
    const resumes = await resumeService.getUserResumes(req.user.id);
    return sendSuccess(res, resumes, 'Resumes fetched successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/resumes/active
 * Returns the active resume for the authenticated user.
 */
const getActiveResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getActiveResume(req.user.id);
    return sendSuccess(res, resume, 'Active resume fetched successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/resumes/:id
 * Deletes a resume owned by the authenticated user.
 */
const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new AppError('Resume ID is required.', 400));
    }

    const result = await resumeService.deleteResume({
      userId: req.user.id,
      resumeId: id,
    });

    return sendSuccess(res, result, 'Resume deleted successfully.', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getUserResumes, getActiveResume, deleteResume };

