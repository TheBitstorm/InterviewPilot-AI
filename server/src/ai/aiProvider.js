// src/ai/aiProvider.js
// AI Provider abstraction layer.
// All modules call aiProvider.chat() — never the OpenAI SDK directly.
// To swap LLM providers, only this file needs to change.

const { OpenAI } = require('openai');
const env = require('../config/env');

// OpenAI client configured to talk to Google Gemini's OpenAI-compatible endpoint
const openai = new OpenAI({
  apiKey: env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  timeout: 45000,
  maxRetries: 0,
});

// Verified active, fast Gemini models for immediate failover if one hits quota or status 503/404
const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
];

/**
 * Send a chat completion request to the Gemini LLM with automatic fast failover.
 *
 * @param {Array<{role: string, content: string}>} messages - Chat history / messages
 * @param {object} options - Optional overrides
 * @param {string} options.model - Model name (default: gemini-3.5-flash)
 * @param {number} options.temperature - 0.0 – 1.0 (default: 0.7)
 * @param {number} options.maxTokens - Max response tokens (default: 2000)
 * @param {object} options.responseFormat - Optional response_format object e.g. { type: 'json_object' }
 * @returns {Promise<string>} The AI's text response
 */
const chat = async (messages, options = {}) => {
  const {
    model = env.GEMINI_MODEL || 'gemini-3.5-flash',
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat,
  } = options;

  // Build candidate models chain: requested model first, followed by fallbacks without duplicates
  const candidateModels = [
    model,
    ...FALLBACK_MODELS.filter((m) => m !== model),
  ];

  let lastError = null;

  for (const currentModel of candidateModels) {
    const startTime = Date.now();
    try {
      const requestPayload = {
        model: currentModel,
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      if (responseFormat) {
        requestPayload.response_format = responseFormat;
      }

      const response = await openai.chat.completions.create(requestPayload);
      const text = response.choices?.[0]?.message?.content;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error(`Empty response content returned by ${currentModel}`);
      }

      const durationMs = Date.now() - startTime;
      console.log(`[aiProvider] Generated response via ${currentModel} in ${durationMs}ms`);
      return text.trim();
    } catch (err) {
      lastError = err;
      const status = err.status || err.statusCode;
      const isAuthError = status === 401 || status === 403;
      const isRetryable = !isAuthError;

      console.warn(
        `[aiProvider] Model "${currentModel}" failed (${status || err.code || err.message}). ${
          isRetryable ? 'Attempting fast fallback to next model...' : 'Non-retryable authorization error.'
        }`
      );

      if (!isRetryable) {
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to respond.');
};

module.exports = { chat, openai };
