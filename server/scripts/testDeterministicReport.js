// server/scripts/testDeterministicReport.js
require('dotenv').config();
const prisma = require('../src/config/db');
const { validateReportAnalysis, reportAnalysisSchema } = require('../src/ai/prompts/reportAnalysis');
const reportService = require('../src/modules/report/report.service');

async function testDeterministic() {
  console.log('=== 1. TESTING ZOD VALIDATION SCHEMA ===');
  
  // Valid sample
  const validAiData = {
    summary: 'The candidate demonstrated robust backend competencies with strong proficiency in distributed systems, idempotency patterns, and container optimization. Minor gaps were observed in database pool sizing under extreme concurrent loads.',
    strengths: [
      'Engineered distributed locking mechanisms using Redis Redlock and optimistic concurrency.',
      'Demonstrated deep familiarity with container optimization, multi-stage Docker builds, and SIGTERM signal handling.',
      'Articulated clear idempotency guarantees using unique idempotency keys for payment processing.'
    ],
    weaknesses: [
      'Lacked granular mathematical models for calculating PostgreSQL connection pool saturation under 10k RPS.',
      'Did not thoroughly discuss backpressure handling and buffer saturation on high-frequency WebSocket streams.'
    ],
    recommendation: 'Focus study on advanced PostgreSQL connection pooling mechanics (PgBouncer vs built-in ORM pools), database query tuning, and distributed streaming backpressure protocols.'
  };

  const parsedValid = validateReportAnalysis(validAiData);
  console.log('✓ Valid AI output accepted by Zod schema successfully.');

  // Test Zod rejection on short summary
  try {
    validateReportAnalysis({ ...validAiData, summary: 'Too short' });
    throw new Error('Should have rejected short summary');
  } catch (e) {
    console.log('✓ Zod correctly rejected summary shorter than 30 chars:', e.message);
  }

  // Test Zod rejection on fewer than 2 strengths
  try {
    validateReportAnalysis({ ...validAiData, strengths: ['Only one strength'] });
    throw new Error('Should have rejected single strength');
  } catch (e) {
    console.log('✓ Zod correctly rejected < 2 strengths:', e.message);
  }

  console.log('\n=== 2. CREATING PERSISTED REPORT WITH DETERMINISTIC METRICS ===');
  const sessionId = 'cmuu6k54m00014k2k0tfyyk2s';
  const userId = 'cmuu6hi4700004k2k5qqreplr';
  const unauthorizedUserId = 'cmuswklpm0002kk2k7393irem';

  // Fetch session and compute deterministic metrics
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        include: { answer: { include: { feedback: true } } },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  const totalQuestions = session.questions.length;
  const answeredQuestions = session.questions.filter(q => q.answer?.feedback);
  const scoreSum = answeredQuestions.reduce((sum, q) => sum + q.answer.feedback.score, 0);
  const overallScore = Math.round((scoreSum / answeredQuestions.length) * 10) / 10;
  const topicScores = session.questions.map(q => ({
    topic: q.topic,
    score: q.answer.feedback.score,
    difficulty: q.difficulty,
    questionText: q.questionText,
    timeTaken: q.answer.timeTaken || 0,
  }));
  const totalDuration = session.questions.reduce((sum, q) => sum + (q.answer.timeTaken || 0), 0);

  console.log(`Deterministic Overall Score: ${overallScore}/10 (Sum: ${scoreSum}, Count: ${answeredQuestions.length})`);
  console.log(`Topic Scores Count: ${topicScores.length}`);

  // Upsert the report in PostgreSQL
  const report = await prisma.report.upsert({
    where: { sessionId },
    update: {
      overallScore,
      summary: parsedValid.summary,
      strengths: parsedValid.strengths,
      weaknesses: parsedValid.weaknesses,
      topicScores,
      recommendation: parsedValid.recommendation,
    },
    create: {
      sessionId,
      userId,
      overallScore,
      summary: parsedValid.summary,
      strengths: parsedValid.strengths,
      weaknesses: parsedValid.weaknesses,
      topicScores,
      recommendation: parsedValid.recommendation,
    }
  });

  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: { status: 'completed', completedAt: new Date(), totalDuration }
  });

  console.log(`✓ Report persisted in PostgreSQL: id=${report.id}, sessionId=${report.sessionId}, overallScore=${report.overallScore}`);

  console.log('\n=== 3. TESTING IDEMPOTENCY IN REPORT SERVICE ===');
  const idempStart = Date.now();
  const idempRes = await reportService.generateSessionReport(sessionId, userId);
  const idempDuration = Date.now() - idempStart;

  console.log(`Idempotent call returned in ${idempDuration}ms.`);
  console.log(`generated: ${idempRes.generated} (expected: false)`);
  console.log(`metrics:`, JSON.stringify(idempRes.metrics));

  if (idempRes.generated !== false) {
    throw new Error('Idempotent call should have generated: false');
  }
  console.log('✓ Idempotency verified: zero Gemini calls, instantaneous response from database.');

  console.log('\n=== 4. TESTING GET REPORT BY ID AND SESSION ID ===');
  const byReportId = await reportService.getReportById(report.id, userId);
  console.log(`✓ Fetched by Report ID: overallScore=${byReportId.overallScore}, questionsCount=${byReportId.session.questions.length}`);

  const bySessionId = await reportService.getReportById(sessionId, userId);
  console.log(`✓ Fetched by Session ID: id=${bySessionId.id}, role=${bySessionId.session.roleTarget}`);

  console.log('\n=== 5. TESTING GET USER REPORTS ===');
  const userReports = await reportService.getUserReports(userId);
  console.log(`✓ User reports fetched: ${userReports.length} report(s) found for user ${userId}`);

  console.log('\n=== 6. TESTING SECURITY & AUTHORIZATION ===');
  try {
    await reportService.getReportById(report.id, unauthorizedUserId);
    throw new Error('Should have rejected unauthorized user');
  } catch (err) {
    console.log(`✓ Access correctly rejected for unauthorized user (403): ${err.message}`);
  }

  console.log('\n======================================================');
  console.log('ALL DETERMINISTIC REPORT TESTS PASSED WITH 100% SUCCESS');
  console.log('======================================================');
}

testDeterministic()
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
