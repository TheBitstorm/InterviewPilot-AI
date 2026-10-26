// server/scripts/verifyDay6.js
require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  console.log('=== USERS ===');
  console.log(users);

  const sessions = await prisma.interviewSession.findMany({
    include: {
      questions: {
        include: {
          answer: {
            include: { feedback: true }
          }
        },
        orderBy: { orderIndex: 'asc' }
      },
      report: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`\n=== SESSIONS (Total: ${sessions.length}) ===`);
  for (const s of sessions) {
    const answeredWithFeedback = s.questions.filter(q => q.answer && q.answer.feedback).length;
    console.log({
      id: s.id,
      userId: s.userId,
      role: s.roleTarget,
      type: s.type,
      status: s.status,
      questionCount: s.questions.length,
      answeredWithFeedback,
      hasReport: !!s.report,
      reportId: s.report?.id || null,
      reportOverallScore: s.report?.overallScore || null
    });
  }

  const reports = await prisma.report.findMany();
  console.log(`\n=== REPORTS (Total: ${reports.length}) ===`);
  for (const r of reports) {
    console.log({
      id: r.id,
      sessionId: r.sessionId,
      userId: r.userId,
      overallScore: r.overallScore,
      summaryLength: r.summary?.length,
      strengthsCount: r.strengths?.length,
      weaknessesCount: r.weaknesses?.length,
      hasRecommendation: !!r.recommendation
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
