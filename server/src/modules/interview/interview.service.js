// src/modules/interview/interview.service.js
// Business logic for interview sessions.
// Handles Prisma DB operations, ownership validation, and session queries.

const prisma = require('../../config/db');
const AppError = require('../../utils/AppError');
const env = require('../../config/env');
const { chat } = require('../../ai/aiProvider');
const {
  buildQuestionGenerationPrompt,
  parseAIJson,
  validateGeneratedQuestions,
} = require('../../ai/prompts/questionGeneration');
const {
  buildAnswerEvaluationPrompt,
  validateAIEvaluation,
} = require('../../ai/prompts/answerEvaluation');

/**
 * Create a new InterviewSession.
 * - If resumeId is provided, verifies that it belongs to the authenticated user.
 * - Creates session with status 'pending' (per schema default).
 * - Does not generate AI questions (Day 3 scope).
 * - Returns the created session along with questionCount.
 */
const createSession = async ({ userId, resumeId, targetRole, interviewType, difficulty, questionCount }) => {
  const t0 = Date.now();
  // If resumeId is supplied, ensure it exists and belongs to the authenticated user
  if (resumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { id: true, userId: true },
    });

    if (!resume) {
      throw new AppError('Resume not found.', 404);
    }

    if (resume.userId !== userId) {
      throw new AppError('You do not have permission to use this resume.', 403);
    }
  }

  const session = await prisma.interviewSession.create({
    data: {
      userId,
      resumeId: resumeId || null,
      type: interviewType,
      roleTarget: targetRole,
      difficulty,
      // status defaults to 'pending'
    },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
  });

  const duration = Date.now() - t0;
  console.log(`[Timing:SessionCreation] Created session ${session.id} in ${duration}ms`);

  return {
    ...session,
    questionCount: questionCount || 5,
    timings: { totalMs: duration },
  };
};

/**
 * Get all interview sessions belonging to the authenticated user.
 */
const getUserSessions = async (userId) => {
  return prisma.interviewSession.findMany({
    where: { userId },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
      report: {
        select: {
          id: true,
          overallScore: true,
          summary: true,
          generatedAt: true,
        },
      },
      _count: {
        select: { questions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get a single interview session by ID.
 * Ensures the session belongs to the authenticated user to prevent unauthorized access.
 */
const getSessionById = async (sessionId, userId) => {
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
      questions: {
        select: {
          id: true,
          questionText: true,
          topic: true,
          difficulty: true,
          orderIndex: true,
          answer: {
            select: {
              id: true,
              questionId: true,
              sessionId: true,
              answerText: true,
              timeTaken: true,
              submittedAt: true,
              feedback: {
                select: {
                  id: true,
                  answerId: true,
                  score: true,
                  correctness: true,
                  communication: true,
                  improvements: true,
                  modelUsed: true,
                  generatedAt: true,
                },
              },
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

  if (session.userId !== userId) {
    throw new AppError('You do not have permission to access this interview session.', 403);
  }

  return {
    ...session,
    questionCount: session.questions?.length || 5,
  };
};

// In-flight generation tracking to ensure only one generation job runs per session at any time
const inFlightSessionGenerations = new Map();

/**
 * Generate (or retrieve if already generated) interview questions for a session.
 * - Enforces session ownership.
 * - Idempotent: If questions already exist for this session, does not call Gemini; returns existing questions.
 * - Concurrency-safe: Single generation job per session via inFlightSessionGenerations.
 * - Uses parsed resume text if attached to personalize questions.
 * - Validates AI JSON response structure using Zod before saving.
 * - Persists questions in SessionQuestion and transitions session status from 'pending' to 'active'.
 *
 * @param {string} sessionId - ID of the interview session
 * @param {string} userId - Authenticated user ID
 * @param {number} [requestedCount] - Optional question count override
 * @param {string} [requestedLength] - Optional question length ("short" | "medium" | "long")
 */
const generateSessionQuestions = async (sessionId, userId, requestedCount, requestedLength = 'medium') => {
  if (inFlightSessionGenerations.has(sessionId)) {
    console.log(`[Generation] Duplicate generation request detected for session ${sessionId}; awaiting existing job`);
    return await inFlightSessionGenerations.get(sessionId);
  }

  const jobPromise = (async () => {
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
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!session) {
      throw new AppError('Interview session not found.', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('You do not have permission to access this interview session.', 403);
    }

    // Idempotency: If questions already exist, do not call Gemini again.
    if (session.questions && session.questions.length > 0) {
      let currentSession = session;
      if (session.status === 'pending') {
        currentSession = await prisma.interviewSession.update({
          where: { id: sessionId },
          data: { status: 'active' },
          include: {
            resume: { select: { id: true, fileName: true } },
          },
        });
      }

      return {
        session: {
          id: currentSession.id,
          roleTarget: currentSession.roleTarget,
          type: currentSession.type,
          difficulty: currentSession.difficulty,
          status: currentSession.status,
          createdAt: currentSession.createdAt,
          resume: currentSession.resume,
        },
        questions: session.questions,
        generated: false,
      };
    }

    const tTotal = Date.now();
    const questionCount = Number(requestedCount) || 5;
    const questionLength = ['short', 'medium', 'long'].includes(requestedLength)
      ? requestedLength
      : 'medium';

    // Build the Gemini prompt with all session parameters & resume context
    const messages = buildQuestionGenerationPrompt({
      targetRole: session.roleTarget,
      interviewType: session.type,
      difficulty: session.difficulty,
      questionCount,
      questionLength,
      resumeText: session.resume?.parsedText || null,
    });

  const maxTokens = Math.min(1500, Math.max(500, questionCount * 140));
  const aiStart = Date.now();
  let rawAiResponse;
  try {
    rawAiResponse = await chat(messages, {
      responseFormat: { type: 'json_object' },
      maxTokens,
    });
  } catch (err) {
    console.error('Error contacting Gemini AI provider:', err.message);
    throw new AppError('Failed to generate interview questions from AI. Please try again.', 502);
  }
  const aiDuration = Date.now() - aiStart;
  console.log(`[Timing:QuestionGeneration:AI] Gemini API call completed in ${aiDuration}ms`);

  const dbStart = Date.now();
  // Parse and validate the response
  let parsedJson;
  let validatedQuestions;
  try {
    parsedJson = parseAIJson(rawAiResponse);
    validatedQuestions = validateGeneratedQuestions(parsedJson);
  } catch (err) {
    console.error('Validation error on AI generated questions:', err.message);
    throw new AppError(`AI generated an invalid question format: ${err.message}`, 502);
  }

  // Map to SessionQuestion models
  const questionsToCreate = validatedQuestions.slice(0, questionCount).map((q, index) => ({
    sessionId,
    questionText: q.questionText.trim(),
    topic: q.topic.trim(),
    difficulty: q.difficulty || session.difficulty,
    orderIndex: index + 1,
  }));

  // Atomically persist questions and update session status to ACTIVE in a single round-trip
  const result = await prisma.$transaction(async (tx) => {
    const persistedQuestions = await tx.sessionQuestion.createManyAndReturn({
      data: questionsToCreate,
    });

    const updatedSession = await tx.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'active' },
      include: {
        resume: { select: { id: true, fileName: true } },
      },
    });

    return {
      session: {
        id: updatedSession.id,
        roleTarget: updatedSession.roleTarget,
        type: updatedSession.type,
        difficulty: updatedSession.difficulty,
        status: updatedSession.status,
        createdAt: updatedSession.createdAt,
        resume: updatedSession.resume,
      },
      questions: persistedQuestions.sort((a, b) => a.orderIndex - b.orderIndex),
      generated: true,
    };
  }, { maxWait: 15000, timeout: 20000 });

  const dbDuration = Date.now() - dbStart;
  const totalDuration = Date.now() - tTotal;
  console.log(`[Timing:QuestionGeneration:DB] Question validation and DB persistence completed in ${dbDuration}ms`);
  console.log(`[Timing:QuestionGeneration:Total] Total question generation took ${totalDuration}ms`);

    return {
      ...result,
      timings: {
        aiMs: aiDuration,
        dbMs: dbDuration,
        totalMs: totalDuration,
      },
    };
  })();

  inFlightSessionGenerations.set(sessionId, jobPromise);
  try {
    return await jobPromise;
  } finally {
    inFlightSessionGenerations.delete(sessionId);
  }
};

// In-flight deduplication map: `${sessionId}:${questionId}` -> Promise
const inflightEvaluations = new Map();

/**
 * Submit candidate answer for a specific question, evaluate via Gemini, and persist feedback.
 *
 * @param {string} sessionId - ID of the interview session
 * @param {string} userId - Authenticated user ID (ownership verification)
 * @param {object} params
 * @param {string} params.questionId - ID of the question being answered
 * @param {string} params.answerText - Candidate response text
 * @param {number} [params.timeTaken] - Time taken in seconds
 */
const submitAndEvaluateAnswer = async (sessionId, userId, bodyOrQuestionId, maybeAnswerText, maybeTimeTaken) => {
  let questionId, answerText, timeTaken;
  if (typeof bodyOrQuestionId === 'object' && bodyOrQuestionId !== null) {
    questionId = bodyOrQuestionId.questionId;
    answerText = bodyOrQuestionId.answerText;
    timeTaken = bodyOrQuestionId.timeTaken;
  } else {
    questionId = bodyOrQuestionId;
    answerText = maybeAnswerText;
    timeTaken = maybeTimeTaken;
  }

  const inflightKey = `${sessionId}:${questionId}`;
  if (inflightEvaluations.has(inflightKey)) {
    return await inflightEvaluations.get(inflightKey);
  }

  const evaluationPromise = (async () => {
  // 1. Verify session exists, belongs to user, and is active
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      resume: { select: { parsedText: true } },
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

  if (session.userId !== userId) {
    throw new AppError('You do not have permission to access this interview session.', 403);
  }

  if (session.status === 'pending') {
    throw new AppError('Interview session is not active yet. Questions must be generated first.', 400);
  }

  // 2. Verify target question belongs to this session
  const targetQuestion = session.questions.find((q) => q.id === questionId);
  if (!targetQuestion) {
    throw new AppError('Question not found in this interview session.', 404);
  }

  // 3. Idempotency: If question already has both UserAnswer and AIFeedback, return it without calling Gemini again
  if (targetQuestion.answer && targetQuestion.answer.feedback) {
    const answeredCount = session.questions.filter((q) => q.answer && q.answer.feedback).length;
    const totalQuestions = session.questions.length;
    const allCompleted = answeredCount >= totalQuestions;

    return {
      answer: {
        id: targetQuestion.answer.id,
        questionId: targetQuestion.answer.questionId,
        sessionId: targetQuestion.answer.sessionId,
        answerText: targetQuestion.answer.answerText,
        timeTaken: targetQuestion.answer.timeTaken,
        submittedAt: targetQuestion.answer.submittedAt,
      },
      feedback: targetQuestion.answer.feedback,
      generated: false,
      isNewSubmission: false,
      answeredCount,
      totalQuestions,
      allCompleted,
    };
  }

  const tTotal = Date.now();

  // 4. Build prompt and invoke Gemini for evaluation
  const messages = buildAnswerEvaluationPrompt({
    targetRole: session.roleTarget,
    interviewType: session.type,
    difficulty: targetQuestion.difficulty || session.difficulty,
    questionTopic: targetQuestion.topic,
    questionText: targetQuestion.questionText,
    candidateAnswer: answerText.trim(),
    resumeText: session.resume?.parsedText || null,
  });

  const aiStart = Date.now();
  let rawAiResponse;
  try {
    rawAiResponse = await chat(messages, {
      responseFormat: { type: 'json_object' },
      maxTokens: 500,
    });
  } catch (err) {
    console.error('Error contacting Gemini AI for evaluation:', err.message);
    throw new AppError('Failed to evaluate answer via AI. Please try again.', 502);
  }
  const aiDuration = Date.now() - aiStart;
  console.log(`[Timing:AnswerEvaluation:AI] Gemini evaluation API call completed in ${aiDuration}ms`);

  const dbStart = Date.now();
  let validatedFeedback;
  try {
    const parsedJson = parseAIJson(rawAiResponse);
    validatedFeedback = validateAIEvaluation(parsedJson);
  } catch (err) {
    console.error('Validation error on AI answer evaluation:', err.message);
    throw new AppError(`AI generated an invalid evaluation format: ${err.message}`, 502);
  }

  const modelUsed = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  // Compute completion counts from in-memory session data without an extra COUNT query
  const answeredCountSoFar = session.questions.filter((q) => q.answer && q.answer.feedback).length;
  const isAlreadyAnswered = Boolean(targetQuestion.answer?.feedback);
  const totalSessionAnswers = isAlreadyAnswered ? answeredCountSoFar : answeredCountSoFar + 1;
  const totalQuestions = session.questions.length;
  const allCompleted = totalSessionAnswers >= totalQuestions;

  // 5. Atomic transaction: create/upsert UserAnswer, create AIFeedback, and optionally complete session
  const result = await prisma.$transaction(async (tx) => {
    // Upsert or create UserAnswer
    let persistedAnswer;
    if (targetQuestion.answer) {
      persistedAnswer = await tx.userAnswer.update({
        where: { id: targetQuestion.answer.id },
        data: {
          answerText: answerText.trim(),
          timeTaken: Number(timeTaken) || 0,
          submittedAt: new Date(),
        },
      });
    } else {
      persistedAnswer = await tx.userAnswer.create({
        data: {
          questionId,
          sessionId,
          answerText: answerText.trim(),
          timeTaken: Number(timeTaken) || 0,
        },
      });
    }

    // Create or update AIFeedback
    const persistedFeedback = await tx.aIFeedback.upsert({
      where: { answerId: persistedAnswer.id },
      create: {
        answerId: persistedAnswer.id,
        score: validatedFeedback.score,
        correctness: validatedFeedback.correctness,
        communication: validatedFeedback.communication,
        improvements: validatedFeedback.improvements,
        modelUsed,
      },
      update: {
        score: validatedFeedback.score,
        correctness: validatedFeedback.correctness,
        communication: validatedFeedback.communication,
        improvements: validatedFeedback.improvements,
        modelUsed,
        generatedAt: new Date(),
      },
    });

    // If all questions are answered, mark completedAt on InterviewSession
    if (allCompleted && !session.completedAt) {
      await tx.interviewSession.update({
        where: { id: sessionId },
        data: {
          completedAt: new Date(),
        },
      });
    }

    return {
      answer: persistedAnswer,
      feedback: persistedFeedback,
      generated: true,
      isNewSubmission: true,
      answeredCount: totalSessionAnswers,
      totalQuestions,
      allCompleted,
    };
  }, { maxWait: 15000, timeout: 20000 });

  const dbDuration = Date.now() - dbStart;
  const totalDuration = Date.now() - tTotal;
  console.log(`[Timing:AnswerEvaluation:DB] Evaluation DB persistence completed in ${dbDuration}ms`);
  console.log(`[Timing:AnswerEvaluation:Total] Total answer evaluation took ${totalDuration}ms`);

    return {
      ...result,
      timings: {
        aiMs: aiDuration,
        dbMs: dbDuration,
        totalMs: totalDuration,
      },
    };
  })();

  inflightEvaluations.set(inflightKey, evaluationPromise);
  try {
    return await evaluationPromise;
  } finally {
    inflightEvaluations.delete(inflightKey);
  }
};

module.exports = {
  createSession,
  getUserSessions,
  getSessionById,
  generateSessionQuestions,
  generateQuestions: generateSessionQuestions,
  submitAndEvaluateAnswer,
  submitAnswer: submitAndEvaluateAnswer,
};

