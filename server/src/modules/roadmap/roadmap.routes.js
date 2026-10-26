// src/modules/roadmap/roadmap.routes.js
// Express routes for personalized learning roadmaps and topic progress tracking.

const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const roadmapController = require('./roadmap.controller');

const router = Router();

// All roadmap routes require JWT authentication
router.use(authenticate);

// POST /api/v1/roadmaps/generate — generate or retrieve roadmap for a completed report
router.post('/generate', roadmapController.generateRoadmap);

// GET /api/v1/roadmaps — get all roadmaps for the authenticated user
router.get('/', roadmapController.getUserRoadmaps);

// GET /api/v1/roadmaps/:id — get roadmap by Roadmap ID or source Report ID
router.get('/:id', roadmapController.getRoadmapById);

// PATCH /api/v1/roadmaps/topics/:topicId/status — update learning status for a specific topic
router.patch('/topics/:topicId/status', roadmapController.updateTopicStatus);

module.exports = router;
