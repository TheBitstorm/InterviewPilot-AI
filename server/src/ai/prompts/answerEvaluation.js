// src/ai/prompts/answerEvaluation.js
// Prompt builder and Zod validator for evaluating candidate interview answers via Google Gemini.

const { z } = require('zod');

/**
 * Build the system and user prompt for candidate answer evaluation.
 *
 * @param {object} params
 * @param {string} params.targetRole - Job role (e.g. "Full Stack Developer")
 * @param {string} params.interviewType - "technical" | "behavioral" | "hr"
 * @param {string} params.difficulty - "easy" | "medium" | "hard"
 * @param {string} params.questionTopic - Question topic/concept
 * @param {string} params.questionText - The interview question asked
 * @param {string} params.candidateAnswer - The candidate's submitted answer text
 * @param {string|null} [params.resumeText] - Optional parsed resume text for background context
 * @returns {Array<{role: string, content: string}>} Array of chat completion messages
 */
const buildAnswerEvaluationPrompt = ({
  targetRole,
  interviewType,
  difficulty,
  questionTopic,
  questionText,
  candidateAnswer,
  resumeText = null,
}) => {
  const systemPrompt = `You are a principal hiring bar-raiser evaluating a candidate's answer for a ${targetRole} role (${interviewType} interview, ${difficulty} difficulty).

Evaluation dimensions (keep feedback concise, direct, and high-signal):
1. Technical Correctness & Depth: Accuracy of concepts, strengths observed, missing edge cases/trade-offs, and a concise 2-sentence model answer benchmark.
2. Communication & Clarity: Structure, articulation, conciseness, and delivery (1-2 sentences).
3. Actionable Improvements: Exactly 2 to 3 concrete, high-impact suggestions.
4. Calibrated Score (0.0 to 10.0, 1 decimal place): Calibrated against ${difficulty} difficulty for a ${targetRole}.

Output format requirement:
Respond ONLY with valid JSON matching this exact schema:
{
  "score": 8.5,
  "correctness": "Accurate technical analysis covering strengths, omitted concepts, and a concise model answer benchmark.",
  "communication": "Assessment of delivery, clarity, structure, and professional communication.",
  "improvements": [
    "First concrete, actionable improvement.",
    "Second concrete, actionable improvement."
  ]
}

Return raw valid JSON only. Do not wrap in markdown or add extra commentary.`;

  let userContent = `Question Topic: ${questionTopic}
Question Asked:
"""
${questionText}
"""

Candidate Answer:
"""
${candidateAnswer}
"""`;

  if (resumeText && resumeText.trim().length > 0) {
    // Compact resume context to relevant ~1000 characters for background calibration
    const sanitizedResume = resumeText.replace(/\s+/g, ' ').trim().slice(0, 1000);
    userContent += `\n\nCandidate Background:\n"""\n${sanitizedResume}\n"""`;
  }

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
};

const evaluationResponseSchema = z.object({
  score: z
    .number({ invalid_type_error: 'score must be a number.' })
    .min(0, 'Score cannot be less than 0.')
    .max(10, 'Score cannot exceed 10.')
    .transform((val) => Math.round(val * 10) / 10),
  correctness: z
    .string()
    .min(10, 'Correctness evaluation must be at least 10 characters.'),
  communication: z
    .string()
    .min(10, 'Communication evaluation must be at least 10 characters.'),
  improvements: z
    .array(z.string().min(3, 'Each improvement item must be at least 3 characters.'))
    .min(1, 'At least one improvement suggestion is required.')
    .max(8, 'Improvements cannot exceed 8 items.'),
});

/**
 * Safely parse JSON from LLM response (handling markdown code blocks if present).
 *
 * @param {string} raw
 * @returns {object}
 */
const parseAIJson = (raw) => {
  if (!raw || typeof raw !== 'string') {
    throw new Error('AI returned an empty response.');
  }

  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  } else {
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
      cleaned = fenceMatch[1].trim();
    } else {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
      }
    }
  }

  return JSON.parse(cleaned);
};

/**
 * Validate parsed AI evaluation against the Zod schema.
 *
 * @param {any} data
 * @returns {{score: number, correctness: string, communication: string, improvements: string[]}}
 */
const validateAIEvaluation = (data) => {
  const result = evaluationResponseSchema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`AI generated invalid evaluation structure: ${errorDetails}`);
  }
  return result.data;
};

module.exports = {
  buildAnswerEvaluationPrompt,
  parseAIJson,
  validateAIEvaluation,
  validateEvaluationFeedback: validateAIEvaluation,
};
