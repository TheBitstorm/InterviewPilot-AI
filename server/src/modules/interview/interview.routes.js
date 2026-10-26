// src/modules/interview/interview.routes.js
// Express routes for interview sessions.

const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { createInterviewSchema, submitAnswerSchema } = require('./interview.validator');
const interviewController = require('./interview.controller');

const router = Router();

// All interview routes require JWT authentication
router.use(authenticate);

// POST /api/v1/interviews — create new session
router.post('/', validate(createInterviewSchema), interviewController.createInterview);

// GET /api/v1/interviews — get sessions for current user
router.get('/', interviewController.getUserInterviews);

// GET /api/v1/interviews/:id — get specific session by ID (restricted to owner)
router.get('/:id', interviewController.getInterviewById);

// POST /api/v1/interviews/:id/questions — generate or retrieve questions for session
router.post('/:id/questions', interviewController.generateInterviewQuestions);

// PATCH /api/v1/interviews/:id/start — alias to activate & get/generate questions
router.patch('/:id/start', interviewController.generateInterviewQuestions);

// POST /api/v1/interviews/:id/answers — submit candidate answer for AI evaluation
router.post('/:id/answers', validate(submitAnswerSchema), interviewController.submitAnswer);

module.exports = router;

