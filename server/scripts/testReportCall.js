// server/scripts/testReportCall.js
require('dotenv').config();
const prisma = require('../src/config/db');
const { chat } = require('../src/ai/aiProvider');
const {
  buildReportAnalysisPrompt,
  parseReportAIJson,
  validateReportAnalysis
} = require('../src/ai/prompts/reportAnalysis');

async function testCall() {
  const sessionId = 'cmuu6k54m00014k2k0tfyyk2s';
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      resume: true,
      questions: {
        include: { answer: { include: { feedback: true } } },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  const overallScore = 8.0;
  const messages = buildReportAnalysisPrompt({
    targetRole: session.roleTarget,
    interviewType: session.type,
    difficulty: session.difficulty,
    overallScore,
    questionEvaluations: session.questions,
    resumeText: session.resume?.parsedText || null,
  });

  console.log('Messages length:', messages.length);
  console.log('System prompt length:', messages[0].content.length);
  console.log('User prompt length:', messages[1].content.length);

  console.log('\nSending to Gemini 3.8 Flash...');
  const start = Date.now();
  const raw = await chat(messages, {
    responseFormat: { type: 'json_object' },
  });
  console.log(`Received in ${Date.now() - start}ms.`);
  console.log('RAW RESPONSE:\n', raw);

  const parsed = parseReportAIJson(raw);
  const validated = validateReportAnalysis(parsed);
  console.log('\nVALIDATED RESULT:\n', JSON.stringify(validated, null, 2));
}

testCall()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
