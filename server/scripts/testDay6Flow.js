// server/scripts/testDay6Flow.js
require('dotenv').config();
const prisma = require('../src/config/db');
const reportService = require('../src/modules/report/report.service');

async function runTests() {
  console.log('==============================================');
  console.log('DAY 6 END-TO-END AUTOMATED VERIFICATION SUITE');
  console.log('==============================================\n');

  const validSessionId = 'cmuu6k54m00014k2k0tfyyk2s';
  const validUserId = 'cmuu6hi4700004k2k5qqreplr';
  const unauthorizedUserId = 'cmuswklpm0002kk2k7393irem';
  const incompleteSessionId = 'cmutsfn7g000mkk2k9q6fr2fw';

  // ── TEST 1: Incomplete Session Eligibility Validation ──
  console.log('TEST 1: Incomplete Session Report Eligibility Check...');
  // 1A. Session with 0 questions
  try {
    await reportService.generateSessionReport(incompleteSessionId, 'cmuse06p70001f42ks5kzxz25');
    console.error('FAIL: Incomplete session report generation should have thrown an error!');
    process.exit(1);
  } catch (err) {
    if (err.statusCode === 400 && err.message.includes('Cannot generate a report for a session with no questions')) {
      console.log('PASS: Correctly rejected 0-question session with 400 error:', err.message);
    } else {
      console.error('FAIL: Unexpected error for 0-question session:', err.message);
      process.exit(1);
    }
  }

  // 1B. Session with unanswered questions (create temporary session with 2 questions, 1 answer)
  const partialSession = await prisma.interviewSession.create({
    data: {
      userId: validUserId,
      roleTarget: 'Backend Engineer',
      type: 'technical',
      difficulty: 'medium',
      status: 'active',
      questions: {
        create: [
          { questionText: 'What is ACID?', topic: 'Databases', difficulty: 'medium', orderIndex: 0 },
          { questionText: 'What is CAP theorem?', topic: 'Distributed Systems', difficulty: 'medium', orderIndex: 1 }
        ]
      }
    },
    include: { questions: true }
  });

  try {
    await reportService.generateSessionReport(partialSession.id, validUserId);
    console.error('FAIL: Partially answered session should have thrown an error!');
    process.exit(1);
  } catch (err) {
    if (err.statusCode === 400 && err.message.includes('questions remain unanswered')) {
      console.log('PASS: Correctly rejected partially answered session with 400 error:', err.message);
    } else {
      console.error('FAIL: Unexpected error for partially answered session:', err.message);
      process.exit(1);
    }
  } finally {
    // Cleanup temporary partial session
    await prisma.sessionQuestion.deleteMany({ where: { sessionId: partialSession.id } });
    await prisma.interviewSession.delete({ where: { id: partialSession.id } });
  }

  // ── TEST 2: Ownership Security on Generation ──
  console.log('\nTEST 2: Ownership Security on Generation...');
  try {
    await reportService.generateSessionReport(validSessionId, unauthorizedUserId);
    console.error('FAIL: Unauthorized user should have been rejected!');
    process.exit(1);
  } catch (err) {
    if (err.statusCode === 403) {
      console.log('PASS: Correctly rejected unauthorized user with 403 Forbidden.');
    } else {
      console.error('FAIL: Unexpected error for unauthorized user:', err.message);
      process.exit(1);
    }
  }

  // ── TEST 3: Generate Session Report via Gemini 3.8 Flash ──
  console.log('\nTEST 3: Generating Session Report via Gemini 3.8 Flash...');
  const genStart = Date.now();
  const genResult = await reportService.generateSessionReport(validSessionId, validUserId);
  const genDuration = Date.now() - genStart;
  console.log(`Report generation completed in ${genDuration}ms.`);
  console.log('Result flags: generated =', genResult.generated);
  console.log('Report ID:', genResult.report.id);
  console.log('Deterministic Overall Score:', genResult.report.overallScore);
  console.log('Metrics:', JSON.stringify(genResult.metrics, null, 2));

  if (!genResult.report || !genResult.report.id) {
    console.error('FAIL: Report was not returned!');
    process.exit(1);
  }

  if (Math.abs(genResult.report.overallScore - 8.0) > 0.05) {
    console.error(`FAIL: Expected overall score 8.0, got ${genResult.report.overallScore}`);
    process.exit(1);
  }
  console.log('PASS: Deterministic overallScore matches arithmetic average of feedback scores (8.0).');

  // Verify Zod-validated fields
  if (!genResult.report.summary || genResult.report.summary.length < 30) {
    console.error('FAIL: Summary is missing or less than 30 chars:', genResult.report.summary);
    process.exit(1);
  }
  console.log(`PASS: Executive summary validated (length: ${genResult.report.summary.length} chars).`);
  console.log('Summary snippet:', genResult.report.summary.slice(0, 120) + '...');

  if (!Array.isArray(genResult.report.strengths) || genResult.report.strengths.length < 2) {
    console.error('FAIL: Strengths array invalid:', genResult.report.strengths);
    process.exit(1);
  }
  console.log(`PASS: Strengths validated (${genResult.report.strengths.length} items).`);
  genResult.report.strengths.forEach((s, i) => console.log(`  - Strength ${i+1}: ${s.slice(0, 70)}...`));

  if (!Array.isArray(genResult.report.weaknesses) || genResult.report.weaknesses.length < 2) {
    console.error('FAIL: Weaknesses array invalid:', genResult.report.weaknesses);
    process.exit(1);
  }
  console.log(`PASS: Weaknesses validated (${genResult.report.weaknesses.length} items).`);
  genResult.report.weaknesses.forEach((w, i) => console.log(`  - Weakness ${i+1}: ${w.slice(0, 70)}...`));

  if (!genResult.report.recommendation || genResult.report.recommendation.length < 30) {
    console.error('FAIL: Recommendation missing or too short:', genResult.report.recommendation);
    process.exit(1);
  }
  console.log(`PASS: Roadmap recommendation validated (length: ${genResult.report.recommendation.length} chars).`);

  if (!Array.isArray(genResult.report.topicScores) || genResult.report.topicScores.length !== 5) {
    console.error('FAIL: topicScores missing or length != 5:', genResult.report.topicScores);
    process.exit(1);
  }
  console.log('PASS: topicScores validated (5 topics):');
  genResult.report.topicScores.forEach(t => console.log(`  * [${t.topic}]: ${t.score}/10 (${t.difficulty})`));

  // ── TEST 4: Session Status Updated in Database ──
  console.log('\nTEST 4: Verifying InterviewSession updated to completed...');
  const updatedSession = await prisma.interviewSession.findUnique({ where: { id: validSessionId } });
  if (updatedSession.status !== 'completed' || !updatedSession.completedAt) {
    console.error('FAIL: Session status not updated to completed:', updatedSession);
    process.exit(1);
  }
  console.log('PASS: Session status is "completed" with completedAt:', updatedSession.completedAt);

  // ── TEST 5: Idempotency Verification ──
  console.log('\nTEST 5: Testing Idempotency (calling generate again)...');
  const idempStart = Date.now();
  const idempResult = await reportService.generateSessionReport(validSessionId, validUserId);
  const idempDuration = Date.now() - idempStart;
  console.log(`Idempotency check completed in ${idempDuration}ms.`);

  if (idempResult.generated !== false) {
    console.error('FAIL: Expected generated: false on subsequent call, got:', idempResult.generated);
    process.exit(1);
  }
  if (idempDuration > 1500) {
    console.error('FAIL: Call took longer than expected for cache hit, might have called LLM:', idempDuration);
    process.exit(1);
  }
  console.log('PASS: Idempotency confirmed (generated: false, 0 Gemini calls, instantaneous response).');

  // ── TEST 6: GET Report by ID and by Session ID ──
  console.log('\nTEST 6: Testing GET Report by Report ID and Session ID...');
  const byReportId = await reportService.getReportById(genResult.report.id, validUserId);
  if (!byReportId || byReportId.id !== genResult.report.id) {
    console.error('FAIL: Failed to fetch report by Report ID');
    process.exit(1);
  }
  console.log('PASS: getReportById with Report ID succeeded.');

  const bySessionId = await reportService.getReportById(validSessionId, validUserId);
  if (!bySessionId || bySessionId.id !== genResult.report.id) {
    console.error('FAIL: Failed to fetch report by Session ID');
    process.exit(1);
  }
  console.log('PASS: getReportById with Session ID succeeded.');

  // ── TEST 7: GET User Reports ──
  console.log('\nTEST 7: Testing getUserReports...');
  const userReports = await reportService.getUserReports(validUserId);
  if (!Array.isArray(userReports) || userReports.length === 0) {
    console.error('FAIL: getUserReports returned empty list');
    process.exit(1);
  }
  console.log(`PASS: getUserReports returned ${userReports.length} report(s).`);

  // ── TEST 8: Security on GET Report ──
  console.log('\nTEST 8: Testing Ownership Protection on GET Report...');
  try {
    await reportService.getReportById(genResult.report.id, unauthorizedUserId);
    console.error('FAIL: Unauthorized user was able to fetch report!');
    process.exit(1);
  } catch (err) {
    if (err.statusCode === 403) {
      console.log('PASS: Unauthorized report access rejected with 403 Forbidden.');
    } else {
      console.error('FAIL: Unexpected error on unauthorized getReportById:', err.message);
      process.exit(1);
    }
  }

  console.log('\n==============================================');
  console.log('ALL DAY 6 TESTS PASSED SUCCESSFULLY!');
  console.log('==============================================');
}

runTests()
  .catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
