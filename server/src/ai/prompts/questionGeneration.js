// src/ai/prompts/questionGeneration.js
// Prompt builder for generating structured interview questions via Google Gemini.

/**
 * Build the system and user prompt for question generation.
 *
 * @param {object} params
 * @param {string} params.targetRole - Target job role (e.g. "Full Stack Developer")
 * @param {string} params.interviewType - "technical" | "behavioral" | "hr"
 * @param {string} params.difficulty - "easy" | "medium" | "hard"
 * @param {number} params.questionCount - Number of questions to generate
 * @param {string|null} [params.resumeText] - Optional parsed resume text for context
 * @returns {Array<{role: string, content: string}>} Array of chat completion messages
 */
const buildQuestionGenerationPrompt = ({
  targetRole,
  interviewType,
  difficulty,
  questionCount = 5,
  resumeText = null,
}) => {
  const typeGuidance = {
    technical: 'Focus on technology choices, architecture, problem-solving, algorithms, edge-cases, and practical coding concepts.',
    behavioral: 'Focus on scenario-based questions evaluating collaboration, leadership, problem resolution, adaptability, and STAR methodology.',
    hr: 'Focus on workplace alignment, career motivations, communication, and professional scenarios.',
  }[interviewType] || 'Focus on relevant job competencies and practical scenarios.';

  const difficultyGuidance = {
    easy: 'Core fundamentals, clear definitions, and straightforward concepts.',
    medium: 'Real-world production scenarios, architecture choices, trade-offs, and practical debugging.',
    hard: 'Complex edge cases, distributed scaling, nuanced system trade-offs, and high-stakes technical decisions.',
  }[difficulty] || 'Standard industry level.';

  const systemPrompt = `You are an expert technical interviewer and hiring manager.
Format: ${interviewType} interview (${typeGuidance})
Difficulty: ${difficulty} (${difficultyGuidance})

Output Format Requirement:
Respond ONLY with valid JSON matching this exact schema:
{
  "questions": [
    {
      "questionText": "Detailed question string",
      "topic": "Core topic name",
      "difficulty": "${difficulty}"
    }
  ]
}

Guidelines:
1. Provide exactly ${questionCount} questions.
2. Keep questions technically sound, clear, relevant to the target role, and non-duplicative.
3. If candidate resume context is provided, personalize questions to reference their listed technologies or past project areas.
4. Return raw valid JSON only. Do not wrap in markdown or include extra commentary.`;

  let userContent = `Generate ${questionCount} ${difficulty} ${interviewType} questions for a ${targetRole}.`;

  if (resumeText && resumeText.trim().length > 0) {
    // Compact resume text to the most relevant ~1800 characters to optimize prompt prefill speed
    const sanitizedResume = resumeText.replace(/\s+/g, ' ').trim().slice(0, 1800);
    userContent += `\n\nCandidate Resume Context (use to personalize questions):\n"""\n${sanitizedResume}\n"""`;
  }

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
};

const { z } = require('zod');

const questionItemSchema = z.object({
  questionText: z.string().min(5, 'Question text must be at least 5 characters.'),
  topic: z
    .any()
    .transform((val) => (typeof val === 'string' && val.trim().length > 0 ? val.trim() : 'General')),
  difficulty: z
    .any()
    .transform((val) => {
      const lower = String(val || '').toLowerCase().trim();
      if (lower === 'easy' || lower === 'medium' || lower === 'hard') return lower;
      return 'medium';
    }),
});

const generatedQuestionsResponseSchema = z.object({
  questions: z.array(questionItemSchema).min(1, 'At least one question is required.'),
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

  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) {
    return { questions: parsed };
  }
  return parsed;
};

/**
 * Validate parsed AI question response against the Zod schema.
 *
 * @param {any} data
 * @returns {Array<{questionText: string, topic: string, difficulty: 'easy'|'medium'|'hard'}>}
 */
const validateGeneratedQuestions = (data) => {
  const result = generatedQuestionsResponseSchema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`AI generated invalid question structure: ${errorDetails}`);
  }
  return result.data.questions;
};

module.exports = {
  buildQuestionGenerationPrompt,
  parseAIJson,
  validateGeneratedQuestions,
};
