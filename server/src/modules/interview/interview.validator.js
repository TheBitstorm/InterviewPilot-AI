// src/modules/interview/interview.validator.js
// Zod schemas for interview request validation.

const { z } = require('zod');

const createInterviewSchema = z.object({
  resumeId: z
    .string()
    .transform((val) => (val && val.trim() ? val.trim() : null))
    .optional()
    .nullable(),

  targetRole: z
    .string({ required_error: 'targetRole is required.' })
    .min(2, 'Target role must be at least 2 characters.')
    .max(100, 'Target role must be 100 characters or fewer.')
    .trim(),

  interviewType: z.enum(['technical', 'behavioral', 'hr'], {
    errorMap: () => ({ message: 'interviewType must be one of: technical, behavioral, hr.' }),
  }),

  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'difficulty must be one of: easy, medium, hard.' }),
  }),

  questionCount: z
    .number({ invalid_type_error: 'questionCount must be a number.' })
    .int('questionCount must be an integer.')
    .min(1, 'questionCount must be at least 1.')
    .max(20, 'questionCount cannot exceed 20.'),

  questionLength: z.enum(['short', 'medium', 'long']).optional().default('medium'),
});

const submitAnswerSchema = z.object({
  questionId: z
    .string({ required_error: 'questionId is required.' })
    .min(1, 'questionId cannot be empty.')
    .trim(),

  answerText: z
    .string({ required_error: 'answerText is required.' })
    .trim()
    .min(10, 'Your answer must be at least 10 characters long.')
    .max(10000, 'Your answer cannot exceed 10,000 characters.'),

  timeTaken: z
    .number({ invalid_type_error: 'timeTaken must be a number.' })
    .int('timeTaken must be an integer.')
    .min(0, 'timeTaken cannot be negative.')
    .default(0),
});

module.exports = {
  createInterviewSchema,
  submitAnswerSchema,
};

