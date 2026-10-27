// src/ai/prompts/roadmapGeneration.js
// Prompt builder and Zod validator for synthesizing personalized learning roadmaps via Google Gemini.

const { z } = require('zod');
const AppError = require('../../utils/AppError');

/**
 * Build the system and user prompt for generating a personalized learning roadmap
 * based on a candidate's completed interview performance report.
 *
 * @param {object} params
 * @param {string} params.targetRole - Job role (e.g. "Full Stack Developer")
 * @param {number} params.overallScore - Candidate's overall score (0.0 - 10.0)
 * @param {Array<string>} params.strengths - Diagnosed strengths from the interview report
 * @param {Array<string>} params.weaknesses - Diagnosed weaknesses and skill gaps
 * @param {Array<object>} params.topicScores - Detailed topic-by-topic evaluation scores
 * @param {string} params.recommendation - Bar-raiser strategic study recommendations
 * @returns {Array<{role: string, content: string}>} Array of chat messages for Gemini
 */
const buildRoadmapGenerationPrompt = ({
  targetRole,
  overallScore,
  strengths = [],
  weaknesses = [],
  topicScores = [],
  recommendation = '',
}) => {
  const systemPrompt = `You are a Principal Software Architect, Staff Engineer, and Technical Curriculum Designer.
Your task is to generate a highly targeted, personalized learning roadmap for an engineering candidate based on their completed mock interview report.

CRITICAL INSTRUCTIONS:
1. Target Role: Focus squarely on the competencies required for "${targetRole}".
2. Baseline Calibration: The candidate earned an overall score of ${overallScore}/10.
   - Do NOT produce generic, entry-level tutorials if the candidate already demonstrates competence in that area.
   - Prioritize topics where the candidate showed clear skill gaps, faltered under technical depth, or missed critical trade-offs.
3. Focus on Diagnosed Weaknesses: The roadmap must directly address the candidate's diagnosed weaknesses and lower-scoring topics.
4. Topics Structure:
   - Generate between 3 and 4 structured roadmap topics (high-impact, focused curriculum).
   - Assign priority ("high", "medium", "low") appropriately. High priority topics should address the most critical skill gaps or topics with the lowest scores.
   - Assign exactly 2 high-quality, practical learning resources per topic.
   - Resource types must strictly be one of: "article", "video", or "problem".
   - Include realistic estimated completion times (e.g., "45 mins", "1 hour", "2 hours").
   - Resource URLs must be real, valid web references (e.g. official documentation, MDN, well-known guides, system design primers, LeetCode / NeetCode, or standard tutorial repositories).

OUTPUT FORMAT REQUIREMENT:
You must respond with valid JSON and ONLY valid JSON matching this schema:
{
  "topics": [
    {
      "title": "Title of the topic (e.g., PostgreSQL Connection Pool Optimization & PgBouncer)",
      "description": "Substantive 2-sentence description explaining the key architectural concepts, trade-offs, and practical skills the candidate must master.",
      "priority": "high",
      "resources": [
        {
          "title": "Resource title (e.g., PostgreSQL Connection Pooling Documentation)",
          "url": "https://www.postgresql.org/docs/current/runtime-config-connection.html",
          "type": "article",
          "estimatedTime": "45 mins"
        },
        {
          "title": "Practice: High-Throughput Connection Saturation Benchmark",
          "url": "https://github.com/donnemartin/system-design-primer",
          "type": "problem",
          "estimatedTime": "1.5 hours"
        }
      ]
    }
  ]
}

Guidelines:
- Return raw JSON only. Do NOT include markdown formatting, backticks (\`\`\`json), or conversational preamble.
- "title" must be concise and descriptive (at least 5 characters).
- "description" must be actionable and detailed (at least 30 characters).
- "priority" must strictly be one of: "high", "medium", "low".
- "resources" array must contain 2 items.
- "resources[].type" must strictly be one of: "article", "video", "problem".`;

  // Format topic scores summary
  const topicsSummary = Array.isArray(topicScores)
    ? topicScores
        .map((t, idx) => {
          const name = t.topic || `Topic ${idx + 1}`;
          const score = t.score != null ? `${t.score}/10` : 'N/A';
          const diff = t.difficulty || 'medium';
          return `- ${name}: Score ${score} (${diff})`;
        })
        .join('\n')
    : 'No topic breakdown available.';

  const strengthsText = Array.isArray(strengths) && strengths.length > 0
    ? strengths.map((s) => `- ${s}`).join('\n')
    : 'None recorded.';

  const weaknessesText = Array.isArray(weaknesses) && weaknesses.length > 0
    ? weaknesses.map((w) => `- ${w}`).join('\n')
    : 'None recorded.';

  const userContent = `Candidate Interview Performance Report:
Target Role: ${targetRole}
Overall Score: ${overallScore} / 10

Demonstrated Strengths:
${strengthsText}

Diagnosed Weaknesses & Technical Skill Gaps:
${weaknessesText}

Topic Evaluation Breakdown:
${topicsSummary}

Interviewer Strategic Recommendation:
${recommendation || 'Focus on system design trade-offs, concurrency, and production scaling.'}

Please synthesize a personalized learning roadmap with 3 to 6 targeted topics and resources matching the JSON schema.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
};

// ─── Zod Schema Definition ───────────────────────────────────────────────────

const topicResourceSchema = z.object({
  title: z
    .string({ required_error: 'Resource title is required.' })
    .min(5, 'Resource title must be at least 5 characters.'),
  url: z
    .string({ required_error: 'Resource URL is required.' })
    .url('Resource URL must be a valid URL.'),
  type: z.enum(['article', 'video', 'problem'], {
    errorMap: () => ({ message: 'Resource type must be "article", "video", or "problem".' }),
  }),
  estimatedTime: z
    .string({ required_error: 'Estimated time is required.' })
    .min(2, 'Estimated time must be at least 2 characters.'),
});

const roadmapTopicSchema = z.object({
  title: z
    .string({ required_error: 'Topic title is required.' })
    .min(5, 'Topic title must be at least 5 characters.'),
  description: z
    .string({ required_error: 'Topic description is required.' })
    .min(30, 'Topic description must be at least 30 characters.'),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be "high", "medium", or "low".' }),
  }),
  resources: z
    .array(topicResourceSchema)
    .min(2, 'Each topic must have at least 2 resources.')
    .max(4, 'Each topic can have at most 4 resources.'),
});

const roadmapResponseSchema = z.object({
  topics: z
    .array(roadmapTopicSchema)
    .min(3, 'Roadmap must contain at least 3 topics.')
    .max(6, 'Roadmap must contain at most 6 topics.'),
});

/**
 * Safely parse JSON from LLM response (handling markdown code blocks if present).
 *
 * @param {string} raw
 * @returns {object}
 */
const parseRoadmapAIJson = (raw) => {
  if (!raw || typeof raw !== 'string') {
    throw new AppError('AI returned an empty roadmap response.', 502);
  }

  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new AppError(`Failed to parse AI roadmap output as JSON: ${err.message}`, 502);
  }
};

/**
 * Validate parsed AI roadmap response against the Zod schema.
 *
 * @param {any} data
 * @returns {{ topics: Array<object> }}
 */
const validateRoadmapAIResponse = (data) => {
  const result = roadmapResponseSchema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new AppError(`AI generated invalid roadmap structure: ${errorDetails}`, 502);
  }
  return result.data;
};

module.exports = {
  buildRoadmapGenerationPrompt,
  parseRoadmapAIJson,
  validateRoadmapAIResponse,
  roadmapResponseSchema,
  roadmapTopicSchema,
  topicResourceSchema,
};
