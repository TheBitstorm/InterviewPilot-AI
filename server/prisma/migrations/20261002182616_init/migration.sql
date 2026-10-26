-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'admin');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('technical', 'behavioral', 'hr');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('pending', 'active', 'completed');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('not_started', 'in_progress', 'done');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('article', 'video', 'problem');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'student',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "parsedText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "type" "InterviewType" NOT NULL,
    "roleTarget" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'pending',
    "totalDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_questions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "session_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_feedback" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "correctness" TEXT NOT NULL,
    "communication" TEXT NOT NULL,
    "improvements" TEXT[],
    "modelUsed" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "topicScores" JSONB NOT NULL,
    "recommendation" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_roadmaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleTarget" TEXT NOT NULL,
    "sourceReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_topics" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TopicStatus" NOT NULL DEFAULT 'not_started',
    "priority" "Priority" NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "roadmap_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_resources" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "estimatedTime" TEXT NOT NULL,

    CONSTRAINT "topic_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_answers_questionId_key" ON "user_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_feedback_answerId_key" ON "ai_feedback"("answerId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_sessionId_key" ON "reports"("sessionId");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "session_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "user_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_roadmaps" ADD CONSTRAINT "learning_roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_roadmaps" ADD CONSTRAINT "learning_roadmaps_sourceReportId_fkey" FOREIGN KEY ("sourceReportId") REFERENCES "reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_topics" ADD CONSTRAINT "roadmap_topics_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "learning_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_resources" ADD CONSTRAINT "topic_resources_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "roadmap_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
