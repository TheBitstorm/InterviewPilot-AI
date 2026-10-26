// src/modules/report/report.routes.js
// Express routes for interview performance reporting and skill-gap analytics.

const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const reportController = require('./report.controller');

const router = Router();

// All report routes require JWT authentication
router.use(authenticate);

// POST /api/v1/reports/generate/:sessionId — generate or retrieve report for completed session
router.post('/generate/:sessionId', reportController.generateReport);

// GET /api/v1/reports — get all reports for current user
router.get('/', reportController.getUserReports);

// GET /api/v1/reports/:id — get report by Report ID or Session ID
router.get('/:id', reportController.getReportById);

module.exports = router;
