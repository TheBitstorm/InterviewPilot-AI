// src/modules/interview/interview.controller.js
// Thin HTTP layer delegating to interview.service.js.

const interviewService = require('./interview.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * POST /api/v1/interviews
 * Create a new interview session.
 */
const createInterview = async (req, res, next) => {
  try {
    const session = await interviewService.createSession({
      userId: req.user.id,
      ...req.body,
    });

    return sendSuccess(res, session, 'Interview session created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/interviews
 * Get all interview sessions for the authenticated user.
 */
const getUserInterviews = async (req, res, next) => {
  try {
    const sessions = await interviewService.getUserSessions(req.user.id);
    return sendSuccess(res, sessions, 'Interview sessions fetched successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/interviews/:id
 * Get single interview session by ID (ownership verified in service).
 */
const getInterviewById = async (req, res, next) => {
  try {
    const session = await interviewService.getSessionById(req.params.id, req.user.id);
    return sendSuccess(res, session, 'Interview session fetched successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/interviews/:id/questions
 * Generate (or get existing) interview questions for a session.
 */
const generateInterviewQuestions = async (req, res, next) => {
  try {
    const data = await interviewService.generateSessionQuestions(
      req.params.id,
      req.user.id,
      req.body?.questionCount,
      req.body?.questionLength
    );

    const message = data.generated
      ? 'Interview questions generated successfully.'
      : 'Existing interview questions retrieved successfully.';

    return sendSuccess(res, data, message, data.generated ? 201 : 200);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/interviews/:id/answers
 * Submit an answer for evaluation by Gemini AI.
 */
const submitAnswer = async (req, res, next) => {
  try {
    const data = await interviewService.submitAndEvaluateAnswer(
      req.params.id,
      req.user.id,
      req.body
    );

    const message = data.generated
      ? 'Answer evaluated successfully.'
      : 'Existing evaluation retrieved successfully.';

    return sendSuccess(res, data, message, data.generated ? 201 : 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInterview,
  getUserInterviews,
  getInterviewById,
  generateInterviewQuestions,
  submitAnswer,
};

