// src/config/env.js
// Validates required environment variables at startup using Zod
// App will refuse to start if any required var is missing.

const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  OPENAI_API_KEY: z.string().default(''),  // optional — legacy fallback
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n');
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  console.error('\nCheck your .env file and try again.\n');
  process.exit(1);
}

module.exports = parsed.data;
