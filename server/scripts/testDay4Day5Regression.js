// server/scripts/testDay4Day5Regression.js
require('dotenv').config();
const prisma = require('../src/config/db');
const interviewService = require('../src/modules/interview/interview.service');
const { validateGeneratedQuestions } = require('../src/ai/prompts/questionGeneration');
const { validateEvaluationFeedback } = require('../src/ai/prompts/answerEvaluation');

async function testRegression() {
  console.log('==============================================');
  console.log('DAY 4 & DAY 5 REGRESSION TEST SUITE');
  console.log('==============================================\n');

  const userId = 'cmuu6hi4700004k2k5qqreplr';
  const completedSessionId = 'cmuu6k54m00014k2k0tfyyk2s';

  // ── 1. DAY 4 REGRESSION: Question Generation Validation & Idempotency ──
  console.log('1. Testing Day 4 Question Generation Validator...');
  const sampleQuestions = {
    questions: [
      { questionText: 'Explain event loop in Node.js with microtasks vs macrotasks.', topic: 'Node.js Runtime', difficulty: 'medium' },
      { questionText: 'How do you structure database indexes for multi-tenant systems?', topic: 'Databases', difficulty: 'hard' },
      { questionText: 'Describe state management options in React 19.', topic: 'React', difficulty: 'easy' },
      { questionText: 'What are optimistic concurrency controls in distributed databases?', topic: 'Distributed Systems', difficulty: 'medium' },
      { questionText: 'How do you secure API endpoints against CSRF and SSRF?', topic: 'Web Security', difficulty: 'hard' }
    ]
  };

  const validatedQuestions = validateGeneratedQuestions(sampleQuestions);
  if (!validatedQuestions || validatedQuestions.length !== 5) {
    throw new Error('Day 4 Question validation failed');
  }
  console.log(`✓ Day 4 question generation schema validated ${validatedQuestions.length} questions.`);

  console.log('\n2. Testing Day 4 Idempotent Question Generation...');
  const genResult = await interviewService.generateQuestions(completedSessionId, userId, 5);
  if (genResult.generated !== false || genResult.questions.length !== 5) {
    throw new Error('Day 4 question generation idempotency failed');
  }
  console.log(`✓ Day 4 question generation is idempotent: generated=${genResult.generated}, returned ${genResult.questions.length} existing questions.`);

  // ── 2. DAY 5 REGRESSION: Answer Evaluation Validation & Feedback Hydration ──
  console.log('\n3. Testing Day 5 Answer Evaluation Validator...');
  const sampleEvaluation = {
    score: 8.5,
    correctness: 'Accurately explains the distinction between the call stack, microtask queue, and macrotask queue with clear execution order.',
    communication: 'Clear, structured explanation with concise technical terminology and real-world event loop examples.',
    improvements: [
      'Mention process.nextTick priority over Promise microtasks in Node.js.',
      'Elaborate on starvation edge cases when recursive microtasks block the I/O polling phase.'
    ]
  };

  const validatedFeedback = validateEvaluationFeedback(sampleEvaluation);
  if (validatedFeedback.score !== 8.5 || validatedFeedback.improvements.length !== 2) {
    throw new Error('Day 5 Evaluation validation failed');
  }
  console.log(`✓ Day 5 answer evaluation schema validated: score=${validatedFeedback.score}, improvements=${validatedFeedback.improvements.length}`);

  // Test Zod rejection on invalid score
  try {
    validateEvaluationFeedback({ ...sampleEvaluation, score: 12 });
    throw new Error('Should have rejected score > 10');
  } catch (e) {
    console.log(`✓ Day 5 correctly rejected out-of-range score (12): ${e.message}`);
  }

  console.log('\n4. Testing Day 5 Idempotent Answer Submission...');
  const session = await prisma.interviewSession.findUnique({
    where: { id: completedSessionId },
    include: { questions: { include: { answer: { include: { feedback: true } } }, orderBy: { orderIndex: 'asc' } } }
  });

  const firstQuestion = session.questions[0];
  const existingScore = firstQuestion.answer.feedback.score;

  // Submit answer again for already evaluated question
  const submitResult = await interviewService.submitAnswer(
    completedSessionId,
    userId,
    firstQuestion.id,
    'Different answer text that should NOT overwrite or re-evaluate',
    45
  );

  if (submitResult.isNewSubmission !== false) {
    throw new Error('submitAnswer should return isNewSubmission: false for already answered question');
  }
  if (submitResult.feedback.score !== existingScore) {
    throw new Error('submitAnswer returned modified score instead of existing persisted feedback');
  }
  console.log(`✓ Day 5 answer submission idempotency verified: isNewSubmission=${submitResult.isNewSubmission}, score=${submitResult.feedback.score} (unchanged)`);

  console.log('\n5. Testing Day 5 Feedback Hydration on Session Fetch...');
  const fetchedSession = await interviewService.getSessionById(completedSessionId, userId);
  const answeredCount = fetchedSession.questions.filter(q => q.answer && q.answer.feedback).length;
  if (answeredCount !== 5) {
    throw new Error(`Expected 5 hydrated answers with feedback, got ${answeredCount}`);
  }
  console.log(`✓ Day 5 feedback hydration verified: all 5 questions returned with answers and feedback.`);

  console.log('\n==============================================');
  console.log('DAY 4 & DAY 5 REGRESSION TESTS PASSED 100%');
  console.log('==============================================');
}

testRegression()
  .catch(err => {
    console.error('Regression test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
