// src/modules/roadmap/roadmap.service.js
// Business logic for personalized learning roadmaps derived from completed interview reports.
// Enforces single-call Gemini generation, atomic database persistence, and idempotent retrieval.

const prisma = require('../../config/db');
const AppError = require('../../utils/AppError');
const { chat } = require('../../ai/aiProvider');
const {
  buildRoadmapGenerationPrompt,
  parseRoadmapAIJson,
  validateRoadmapAIResponse,
} = require('../../ai/prompts/roadmapGeneration');

/**
 * Helper to compute progress metrics for a roadmap.
 *
 * @param {Array<object>} topics
 * @returns {{ totalTopics: number, completedTopics: number, inProgressTopics: number, progressPercentage: number }}
 */
const computeRoadmapMetrics = (topics = []) => {
  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.status === 'done').length;
  const inProgressTopics = topics.filter((t) => t.status === 'in_progress').length;
  const progressPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return {
    totalTopics,
    completedTopics,
    inProgressTopics,
    progressPercentage,
  };
};

// In-flight deduplication map: reportId -> Promise<{ roadmap, generated }>
const inflightRoadmaps = new Map();

/**
 * Generate a personalized learning roadmap from an existing, completed interview report.
 *
 * Requirements:
 * 1. Verifies report exists and belongs to the authenticated user.
 * 2. Checks if a roadmap already exists for the report (idempotency).
 * 3. In-flight deduplication: reuses running generation Promise if called concurrently.
 * 4. Calls Gemini once with report context, validated with Zod.
 * 5. Atomically creates LearningRoadmap + RoadmapTopic + TopicResource in a single nested create.
 *
 * @param {string} reportId - Source Report ID
 * @param {string} userId - Authenticated User ID
 * @returns {Promise<{ roadmap: object, generated: boolean }>}
 */
const generateRoadmapFromReport = async (reportId, userId) => {
  if (!reportId) {
    throw new AppError('reportId is required.', 400);
  }

  // If a roadmap generation request is already in-flight for this report, attach to it
  if (inflightRoadmaps.has(reportId)) {
    return await inflightRoadmaps.get(reportId);
  }

  const generationPromise = (async () => {
    // 1. Fetch source report with session context
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        session: {
          select: {
            id: true,
            roleTarget: true,
            status: true,
            type: true,
            difficulty: true,
          },
        },
      },
    });

    if (!report) {
      throw new AppError('Interview report not found.', 404);
    }

    // 2. Ownership verification
    if (report.userId !== userId) {
      throw new AppError('You do not have permission to access this report.', 403);
    }

    // 3. Idempotency Check: if roadmap already exists for this report + user, return it
    const existingRoadmap = await prisma.learningRoadmap.findFirst({
      where: {
        sourceReportId: reportId,
        userId,
      },
      include: {
        topics: {
          include: { resources: true },
          orderBy: { orderIndex: 'asc' },
        },
        sourceReport: {
          select: {
            id: true,
            overallScore: true,
            summary: true,
            generatedAt: true,
          },
        },
      },
    });

    if (existingRoadmap) {
      const metrics = computeRoadmapMetrics(existingRoadmap.topics);
      return {
        roadmap: {
          ...existingRoadmap,
          metrics,
        },
        generated: false,
      };
    }

    // 4. Build prompt and call Gemini for roadmap synthesis
    const roleTarget = report.session?.roleTarget || 'Software Engineer';
    const messages = buildRoadmapGenerationPrompt({
      targetRole: roleTarget,
      overallScore: report.overallScore,
      strengths: report.strengths || [],
      weaknesses: report.weaknesses || [],
      topicScores: report.topicScores || [],
      recommendation: report.recommendation || '',
    });

    let rawAiResponse;
    try {
      rawAiResponse = await chat(messages, {
        responseFormat: { type: 'json_object' },
        maxTokens: 1200,
      });
    } catch (err) {
      console.error('Error contacting Gemini AI for roadmap generation:', err.message);
      throw new AppError('Failed to generate learning roadmap from AI. Please try again.', 502);
    }

    // 5. Validate Gemini output against Zod schema
    const parsedJson = parseRoadmapAIJson(rawAiResponse);
    const validatedData = validateRoadmapAIResponse(parsedJson);

    // 6. Optimized single-roundtrip nested create for Roadmap, Topics, and Resources
    const fullRoadmap = await prisma.learningRoadmap.create({
      data: {
        userId,
        roleTarget,
        sourceReportId: reportId,
        topics: {
          create: validatedData.topics.map((topicData, i) => ({
            title: topicData.title,
            description: topicData.description,
            priority: topicData.priority,
            orderIndex: i,
            status: 'not_started',
            resources: {
              create: topicData.resources.map((res) => ({
                title: res.title,
                url: res.url,
                type: res.type,
                estimatedTime: res.estimatedTime,
              })),
            },
          })),
        },
      },
      include: {
        topics: {
          include: { resources: true },
          orderBy: { orderIndex: 'asc' },
        },
        sourceReport: {
          select: {
            id: true,
            overallScore: true,
            summary: true,
            generatedAt: true,
          },
        },
      },
    });

    const metrics = computeRoadmapMetrics(fullRoadmap.topics);

    return {
      roadmap: {
        ...fullRoadmap,
        metrics,
      },
      generated: true,
    };
  })();

  inflightRoadmaps.set(reportId, generationPromise);
  try {
    return await generationPromise;
  } finally {
    inflightRoadmaps.delete(reportId);
  }
};

/**
 * Fetch a roadmap by either its Roadmap ID or its source Report ID.
 * Verifies user ownership and returns complete topics, resources, and progress metrics.
 *
 * @param {string} identifier - Roadmap ID or source Report ID
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<object>}
 */
const getRoadmapById = async (identifier, userId) => {
  if (!identifier) {
    throw new AppError('Roadmap identifier is required.', 400);
  }

  // Resolution order: first match id = identifier, fallback to sourceReportId = identifier
  let roadmap = await prisma.learningRoadmap.findFirst({
    where: {
      id: identifier,
    },
    include: {
      topics: {
        include: { resources: true },
        orderBy: { orderIndex: 'asc' },
      },
      sourceReport: {
        select: {
          id: true,
          overallScore: true,
          summary: true,
          generatedAt: true,
          session: {
            select: {
              id: true,
              roleTarget: true,
              type: true,
              difficulty: true,
            },
          },
        },
      },
    },
  });

  // If not found by roadmap id, look up by sourceReportId
  if (!roadmap) {
    roadmap = await prisma.learningRoadmap.findFirst({
      where: {
        sourceReportId: identifier,
      },
      include: {
        topics: {
          include: { resources: true },
          orderBy: { orderIndex: 'asc' },
        },
        sourceReport: {
          select: {
            id: true,
            overallScore: true,
            summary: true,
            generatedAt: true,
            session: {
              select: {
                id: true,
                roleTarget: true,
                type: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });
  }

  if (!roadmap) {
    throw new AppError('Learning roadmap not found.', 404);
  }

  // Ownership verification
  if (roadmap.userId !== userId) {
    throw new AppError('You do not have permission to view this roadmap.', 403);
  }

  const metrics = computeRoadmapMetrics(roadmap.topics);

  return {
    ...roadmap,
    metrics,
  };
};

/**
 * Fetch all learning roadmaps for the authenticated user with completion summaries.
 *
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<Array<object>>}
 */
const getUserRoadmaps = async (userId) => {
  const roadmaps = await prisma.learningRoadmap.findMany({
    where: { userId },
    include: {
      topics: {
        select: {
          id: true,
          status: true,
          priority: true,
        },
      },
      sourceReport: {
        select: {
          id: true,
          overallScore: true,
          generatedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return roadmaps.map((r) => {
    const metrics = computeRoadmapMetrics(r.topics);
    return {
      id: r.id,
      roleTarget: r.roleTarget,
      sourceReportId: r.sourceReportId,
      createdAt: r.createdAt,
      overallScore: r.sourceReport?.overallScore || null,
      metrics,
    };
  });
};

/**
 * Update the completion status of a roadmap topic.
 * Verifies that the topic belongs to a roadmap owned by the authenticated user.
 *
 * @param {string} topicId - Roadmap Topic ID
 * @param {string} status - "not_started" | "in_progress" | "done"
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<{ topic: object, roadmapMetrics: object }>}
 */
const updateTopicStatus = async (topicId, status, userId) => {
  const validStatuses = ['not_started', 'in_progress', 'done'];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`,
      400
    );
  }

  // 1. Fetch topic with parent roadmap for ownership verification
  const topic = await prisma.roadmapTopic.findUnique({
    where: { id: topicId },
    include: {
      roadmap: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!topic) {
    throw new AppError('Roadmap topic not found.', 404);
  }

  if (topic.roadmap.userId !== userId) {
    throw new AppError('You do not have permission to modify this topic.', 403);
  }

  // 2. Update the topic status
  const updatedTopic = await prisma.roadmapTopic.update({
    where: { id: topicId },
    data: { status },
    include: {
      resources: true,
    },
  });

  // 3. Fetch all topics in this roadmap to recompute roadmap-level progress metrics
  const allRoadmapTopics = await prisma.roadmapTopic.findMany({
    where: { roadmapId: topic.roadmap.id },
    select: { id: true, status: true },
  });

  const roadmapMetrics = computeRoadmapMetrics(allRoadmapTopics);

  return {
    topic: updatedTopic,
    roadmapMetrics,
  };
};

module.exports = {
  generateRoadmapFromReport,
  getRoadmapById,
  getUserRoadmaps,
  updateTopicStatus,
  computeRoadmapMetrics,
};
