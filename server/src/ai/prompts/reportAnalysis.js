// src/ai/prompts/reportAnalysis.js
// Prompt builder and Zod validator for synthesizing overall interview performance reports via Google Gemini.

const { z } = require('zod');

/**
 * Build the system and user prompt for comprehensive interview performance reporting.
 *
 * @param {object} params
 * @param {string} params.targetRole - Job role (e.g. "Full Stack Developer")
 * @param {string} params.interviewType - "technical" | "behavioral" | "hr"
 * @param {string} params.difficulty - "easy" | "medium" | "hard"
 * @param {number} params.overallScore - Deterministically computed average score (0.0 - 10.0)
 * @param {Array<object>} params.questionEvaluations - Array of questions with answers and feedback
 * @param {string|null} [params.resumeText] - Optional resume context
 * @returns {Array<{role: string, content: string}>} Array of chat messages for Gemini
 */
const buildReportAnalysisPrompt = ({
  targetRole,
  interviewType,
  difficulty,
  overallScore,
  questionEvaluations,
  resumeText = null,
}) => {
  const systemPrompt = `You are a distinguished hiring bar-raiser, engineering executive, and talent assessor.
Your task is to conduct an executive-level performance synthesis and skill-gap diagnosis for a completed mock interview.

CRITICAL INSTRUCTIONS:
1. Do NOT calculate or alter the overall numerical score. The deterministic overall score of ${overallScore}/10 has already been verified and locked by the system.
2. Conduct a holistic analysis across all submitted answers and evaluations.
3. Identify macro patterns: Where did the candidate excel? Where did their technical depth falter under pressure?
4. Pinpoint specific skill gaps: Which production-grade architectures, algorithms, trade-offs, or communication principles were missing?
5. Formulate actionable recommendations: Provide concrete, high-priority learning objectives the candidate must master to clear senior hiring bars.

Output Format Requirement:
You must respond with valid JSON and ONLY valid JSON matching this schema:
{
  "summary": "Comprehensive 3-5 sentence executive summary assessing candidate readiness, domain mastery, and interview delivery against the target role.",
  "strengths": [
    "First specific technical or behavioral strength demonstrated with evidence.",
    "Second specific technical or behavioral strength demonstrated with evidence.",
    "Third specific technical or behavioral strength demonstrated with evidence."
  ],
  "weaknesses": [
    "First specific technical gap, anti-pattern, or missed trade-off observed.",
    "Second specific technical gap, anti-pattern, or missed trade-off observed.",
    "Third specific technical gap, anti-pattern, or missed trade-off observed."
  ],
  "recommendation": "In-depth skill-gap analysis and strategic study roadmap recommendations outlining exact topics, system design principles, and targeted exercises needed to reach top-tier readiness."
}

Guidelines:
- Return raw JSON only. Do NOT include markdown code blocks, backticks, or preamble.
- "summary" must be substantive, balanced, and at least 30 characters.
- "strengths" must contain 2 to 6 concrete, evidence-backed points.
- "weaknesses" must contain 2 to 6 constructive, clear gap points.
- "recommendation" must be rich, actionable, and at least 30 characters, serving as a blueprint for their personalized learning roadmap.`;

  // Format question-by-question evaluations for LLM reasoning
  const evaluationsText = questionEvaluations
    .map((q, idx) => {
      const qNum = idx + 1;
      const topic = q.topic || 'General';
      const questionText = q.questionText || '';
      const answerText = q.answer?.answerText || 'No answer submitted';
      const score = q.answer?.feedback?.score != null ? `${q.answer.feedback.score}/10` : 'N/A';
      const correctness = q.answer?.feedback?.correctness || 'N/A';
      const communication = q.answer?.feedback?.communication || 'N/A';
      const improvements = Array.isArray(q.answer?.feedback?.improvements)
        ? q.answer.feedback.improvements.join('; ')
        : 'N/A';

      return `--- QUESTION ${qNum}: [${topic}] (Score: ${score}) ---
Question: ${questionText}
Candidate Answer: ${answerText}
Evaluator Correctness & Depth: ${correctness}
Evaluator Communication: ${communication}
Suggested Improvements: ${improvements}`;
    })
    .join('\n\n');

  let userContent = `Candidate Interview Details:
- Target Role: ${targetRole}
- Interview Type: ${interviewType}
- Target Difficulty: ${difficulty}
- Deterministic Overall Score: ${overallScore} / 10
- Total Questions Evaluated: ${questionEvaluations.length}

Complete Interview Transcript & Question-Level Evaluations:
${evaluationsText}`;

  if (resumeText && resumeText.trim().length > 0) {
    const sanitizedResume = resumeText.trim().slice(0, 2500);
    userContent += `\n\nCandidate Background / Resume Context (for calibration):\n"""\n${sanitizedResume}\n"""`;
  }

  userContent += `\n\nPlease generate the executive report synthesis matching the required JSON schema.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
};

const reportAnalysisSchema = z.object({
  summary: z
    .string({ required_error: 'summary is required.' })
    .min(30, 'Executive summary must be at least 30 characters.'),

  strengths: z
    .array(z.string().min(5, 'Each strength must be at least 5 characters.'))
    .min(2, 'At least 2 strengths are required.')
    .max(6, 'Maximum 6 strengths allowed.'),

  weaknesses: z
    .array(z.string().min(5, 'Each weakness must be at least 5 characters.'))
    .min(2, 'At least 2 weaknesses are required.')
    .max(6, 'Maximum 6 weaknesses allowed.'),

  recommendation: z
    .string({ required_error: 'recommendation is required.' })
    .min(30, 'Skill gap and roadmap recommendation must be at least 30 characters.'),
});

/**
 * Safely parse JSON from LLM response (handling markdown code blocks if present).
 *
 * @param {string} raw
 * @returns {object}
 */
const parseReportAIJson = (raw) => {
  if (!raw || typeof raw !== 'string') {
    throw new Error('AI returned an empty response.');
  }

  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  return JSON.parse(cleaned);
};

/**
 * Validate parsed AI report analysis against the Zod schema.
 *
 * @param {any} data
 * @returns {{summary: string, strengths: string[], weaknesses: string[], recommendation: string}}
 */
const validateReportAnalysis = (data) => {
  const result = reportAnalysisSchema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`AI generated invalid report analysis structure: ${errorDetails}`);
  }
  return result.data;
};

module.exports = {
  buildReportAnalysisPrompt,
  parseReportAIJson,
  validateReportAnalysis,
  reportAnalysisSchema,
};
