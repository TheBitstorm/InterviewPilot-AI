// src/modules/report/report.service.js
// Business logic for interview reports and skill gap analytics.
// Enforces deterministic database metrics and utilizes Gemini for qualitative synthesis.

const prisma = require('../../config/db');
const AppError = require('../../utils/AppError');
const { chat } = require('../../ai/aiProvider');
const {
  buildReportAnalysisPrompt,
  parseReportAIJson,
  validateReportAnalysis,
} = require('../../ai/prompts/reportAnalysis');

/**
 * Generate a comprehensive interview report for a completed interview session.
 *
 * Rules:
 * 1. Verifies session ownership.
 * 2. Enforces that ALL questions in the session have a persisted UserAnswer AND AIFeedback.
 * 3. Idempotent: If report already exists for the session, returns existing report with generated: false.
 * 4. Deterministic metrics (overallScore, topicScores, answeredCount, totalDuration) are computed in code/DB.
 * 5. Gemini is invoked only for qualitative analysis (executive summary, strengths, weaknesses, skill gap recommendations).
 * 6. Persists Report in PostgreSQL and marks InterviewSession as 'completed'.
 *
 * @param {string} sessionId
 * @param {string} userId
 */
const generateSessionReport = async (sessionId, userId) => {
  // 1. Fetch the session with all required relations
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
          parsedText: true,
        },
      },
      questions: {
        include: {
          answer: {
            include: {
              feedback: true,
            },
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!session) {
    throw new AppError('Interview session not found.', 404);
  }

  // 2. Ownership verification
  if (session.userId !== userId) {
    throw new AppError('You do not have permission to access this interview session.', 403);
  }

  const totalQuestions = session.questions.length;
  if (totalQuestions === 0) {
    throw new AppError('Cannot generate a report for a session with no questions.', 400);
  }

  // 3. Strict eligibility check: ALL questions must have both UserAnswer and AIFeedback
  const answeredQuestions = session.questions.filter(
    (q) => q.answer && q.answer.feedback
  );
  const answeredCount = answeredQuestions.length;

  if (answeredCount < totalQuestions) {
    const remaining = totalQuestions - answeredCount;
    throw new AppError(
      `Cannot generate final report: ${remaining} of ${totalQuestions} questions remain unanswered. All questions must be answered and evaluated before generating a report.`,
      400
    );
  }

  // 4. Idempotency Check: return existing report if already generated
  const existingReport = await prisma.report.findUnique({
    where: { sessionId },
    include: {
      session: {
        select: {
          id: true,
          roleTarget: true,
          type: true,
          difficulty: true,
          status: true,
          createdAt: true,
          completedAt: true,
          totalDuration: true,
        },
      },
    },
  });

  if (existingReport) {
    return {
      report: existingReport,
      generated: false,
      metrics: {
        totalQuestions,
        answeredCount,
        completionRate: 100,
        overallScore: existingReport.overallScore,
        totalDuration: session.totalDuration || 0,
      },
    };
  }

  // 5. Deterministic Metrics Computation (Database/Code)
  const totalDuration = session.questions.reduce(
    (acc, q) => acc + (q.answer.timeTaken || 0),
    0
  );

  const scoreSum = answeredQuestions.reduce(
    (acc, q) => acc + q.answer.feedback.score,
    0
  );
  const overallScore = Math.round((scoreSum / answeredCount) * 10) / 10;

  const topicScores = session.questions.map((q) => ({
    topic: q.topic,
    score: q.answer.feedback.score,
    difficulty: q.difficulty,
    questionText: q.questionText,
    timeTaken: q.answer.timeTaken || 0,
  }));

  // 6. Build prompt and call Gemini for executive performance & skill-gap reasoning
  const messages = buildReportAnalysisPrompt({
    targetRole: session.roleTarget,
    interviewType: session.type,
    difficulty: session.difficulty,
    overallScore,
    questionEvaluations: session.questions,
    resumeText: session.resume?.parsedText || null,
  });

  let rawAiResponse;
  try {
    rawAiResponse = await chat(messages, {
      responseFormat: { type: 'json_object' },
    });
  } catch (err) {
    console.error('Error contacting Gemini AI for report analysis:', err.message);
    throw new AppError('Failed to generate interview report from AI. Please try again.', 502);
  }

  // 7. Validate Gemini analysis with Zod
  let validatedAnalysis;
  try {
    const parsedJson = parseReportAIJson(rawAiResponse);
    validatedAnalysis = validateReportAnalysis(parsedJson);
  } catch (err) {
    console.error('Validation error on AI report analysis:', err.message);
    throw new AppError(`AI generated invalid report format: ${err.message}`, 502);
  }

  // 8. Atomic database transaction: persist Report and mark InterviewSession completed
  const result = await prisma.$transaction(async (tx) => {
    const createdReport = await tx.report.create({
      data: {
        sessionId,
        userId,
        overallScore,
        summary: validatedAnalysis.summary,
        strengths: validatedAnalysis.strengths,
        weaknesses: validatedAnalysis.weaknesses,
        topicScores,
        recommendation: validatedAnalysis.recommendation,
      },
    });

    const updatedSession = await tx.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: session.completedAt || new Date(),
        totalDuration,
      },
      select: {
        id: true,
        roleTarget: true,
        type: true,
        difficulty: true,
        status: true,
        createdAt: true,
        completedAt: true,
        totalDuration: true,
      },
    });

    return {
      report: {
        ...createdReport,
        session: updatedSession,
      },
      generated: true,
      metrics: {
        totalQuestions,
        answeredCount,
        completionRate: 100,
        overallScore,
        totalDuration,
      },
    };
  });

  return result;
};

/**
 * Get a report by its Report ID or its Session ID.
 * Verifies authenticated ownership.
 *
 * @param {string} identifier - Report ID or Session ID
 * @param {string} userId - Authenticated user ID
 */
const getReportById = async (identifier, userId) => {
  // Query report matching id OR sessionId
  const report = await prisma.report.findFirst({
    where: {
      OR: [{ id: identifier }, { sessionId: identifier }],
    },
    include: {
      session: {
        include: {
          resume: {
            select: {
              id: true,
              fileName: true,
            },
          },
          questions: {
            include: {
              answer: {
                include: {
                  feedback: true,
                },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  if (!report) {
    throw new AppError('Interview report not found.', 404);
  }

  if (report.userId !== userId) {
    throw new AppError('You do not have permission to view this report.', 403);
  }

  const totalQuestions = report.session?.questions?.length || 0;
  const answeredCount =
    report.session?.questions?.filter((q) => q.answer && q.answer.feedback).length || 0;
  const completionRate =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const totalDuration =
    report.session?.totalDuration ||
    report.session?.questions?.reduce((sum, q) => sum + (q.answer?.timeTaken || 0), 0) ||
    0;

  return {
    ...report,
    metrics: {
      totalQuestions,
      answeredCount,
      completionRate,
      overallScore: report.overallScore,
      totalDuration,
    },
  };
};

/**
 * Get all historical reports for the authenticated user.
 *
 * @param {string} userId - Authenticated user ID
 */
const getUserReports = async (userId) => {
  const reports = await prisma.report.findMany({
    where: { userId },
    include: {
      session: {
        select: {
          id: true,
          roleTarget: true,
          type: true,
          difficulty: true,
          status: true,
          createdAt: true,
          completedAt: true,
          totalDuration: true,
          _count: {
            select: { questions: true },
          },
        },
      },
    },
    orderBy: { generatedAt: 'desc' },
  });

  return reports;
};

module.exports = {
  generateSessionReport,
  getReportById,
  getUserReports,
};
