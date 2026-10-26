// src/modules/report/report.controller.js
// Thin HTTP controller delegating report generation and retrieval to report.service.js.

const reportService = require('./report.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * POST /api/v1/reports/generate/:sessionId
 * Generate or retrieve an interview report for a completed session.
 */
const generateReport = async (req, res, next) => {
  try {
    const data = await reportService.generateSessionReport(
      req.params.sessionId,
      req.user.id
    );

    const message = data.generated
      ? 'Interview report generated successfully.'
      : 'Existing interview report retrieved successfully.';

    return sendSuccess(res, data, message, data.generated ? 201 : 200);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/:id
 * Get single interview report by Report ID or Session ID.
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id, req.user.id);
    return sendSuccess(res, report, 'Interview report fetched successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports
 * Get all historical interview reports for the authenticated user.
 */
const getUserReports = async (req, res, next) => {
  try {
    const reports = await reportService.getUserReports(req.user.id);
    return sendSuccess(res, reports, 'User interview reports fetched successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateReport,
  getReportById,
  getUserReports,
};
