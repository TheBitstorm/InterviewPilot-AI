// src/modules/roadmap/roadmap.controller.js
// Controller delegating roadmap generation, retrieval, and progress tracking to roadmap.service.js.

const { z } = require('zod');
const roadmapService = require('./roadmap.service');
const { sendSuccess } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');

// Zod validation schemas for request bodies
const generateRoadmapSchema = z.object({
  reportId: z
    .string({ required_error: 'reportId is required.' })
    .min(1, 'reportId cannot be empty.'),
});

const updateTopicStatusSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'done'], {
    errorMap: () => ({
      message: 'status must be "not_started", "in_progress", or "done".',
    }),
  }),
});

/**
 * POST /api/v1/roadmaps/generate
 * Generate or retrieve an existing learning roadmap derived from a completed interview report.
 */
const generateRoadmap = async (req, res, next) => {
  try {
    const parseResult = generateRoadmapSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join('; ');
      throw new AppError(errorMsg, 400);
    }

    const { reportId } = parseResult.data;
    const data = await roadmapService.generateRoadmapFromReport(reportId, req.user.id);

    const message = data.generated
      ? 'Learning roadmap generated successfully.'
      : 'Existing learning roadmap retrieved successfully.';

    return sendSuccess(res, data, message, data.generated ? 201 : 200);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/roadmaps/:id
 * Fetch single learning roadmap by Roadmap ID or source Report ID.
 */
const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await roadmapService.getRoadmapById(req.params.id, req.user.id);
    return sendSuccess(res, roadmap, 'Learning roadmap fetched successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/roadmaps
 * Get all historical learning roadmaps for the authenticated user.
 */
const getUserRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await roadmapService.getUserRoadmaps(req.user.id);
    return sendSuccess(res, roadmaps, 'User roadmaps fetched successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/roadmaps/topics/:topicId/status
 * Update the learning progress / status of an individual roadmap topic.
 */
const updateTopicStatus = async (req, res, next) => {
  try {
    const parseResult = updateTopicStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join('; ');
      throw new AppError(errorMsg, 400);
    }

    const { status } = parseResult.data;
    const result = await roadmapService.updateTopicStatus(
      req.params.topicId,
      status,
      req.user.id
    );

    return sendSuccess(res, result, 'Topic status updated successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateRoadmap,
  getRoadmapById,
  getUserRoadmaps,
  updateTopicStatus,
};
