// server/scripts/checkSessionScores.js
require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  const sessionId = 'cmuu6k54m00014k2k0tfyyk2s';
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: {
        include: {
          answer: {
            include: { feedback: true }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  console.log(`Session: ${session.id}, Role: ${session.roleTarget}`);
  const scores = [];
  session.questions.forEach((q, idx) => {
    const s = q.answer.feedback.score;
    scores.push(s);
    console.log(`Q${idx+1}: [${q.topic}] (difficulty: ${q.difficulty}) Score: ${s}/10 | Answer: "${q.answer.answerText.slice(0, 40)}..."`);
  });

  const sum = scores.reduce((a, b) => a + b, 0);
  const avg = Math.round((sum / scores.length) * 10) / 10;
  console.log(`Scores: [${scores.join(', ')}]`);
  console.log(`Sum: ${sum}, Count: ${scores.length}, Expected Overall Score: ${avg}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
