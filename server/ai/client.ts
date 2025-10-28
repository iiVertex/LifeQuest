import OpenAI from 'openai';

/**
 * AI Client Configuration
 * 
 * Supports DeepSeek, OpenAI, or any OpenAI-compatible API
 * Configure via environment variables:
 * - AI_API_KEY (required)
 * - AI_BASE_URL (optional, defaults to DeepSeek)
 * - AI_MODEL (optional, defaults to deepseek-chat)
 */

const AI_API_KEY = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.deepseek.com';
const AI_MODEL = process.env.AI_MODEL || 'deepseek-chat';

if (!AI_API_KEY) {
  console.warn('⚠️  AI_API_KEY not found. AI features will be limited.');
}

/**
 * Initialize OpenAI-compatible client (works with DeepSeek, OpenAI, etc.)
 */
export const aiClient = AI_API_KEY
  ? new OpenAI({
      apiKey: AI_API_KEY,
      baseURL: AI_BASE_URL,
    })
  : null;

/**
 * Get the configured AI model name
 */
export function getAIModel(): string {
  return AI_MODEL;
}

/**
 * Check if AI is available
 */
export function isAIAvailable(): boolean {
  return aiClient !== null;
}

/**
 * Generate AI completion with system prompt
 */
export async function generateAIResponse(
  systemPrompt: string,
  userPrompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string | null> {
  if (!aiClient) {
    console.warn('AI client not initialized. Returning fallback response.');
    return null;
  }

  try {
    const completion = await aiClient.chat.completions.create({
      model: getAIModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 500,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('AI generation error:', error);
    return null;
  }
}

/**
 * Generate structured JSON response from AI
 */
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<T | null> {
  if (!aiClient) {
    console.warn('AI client not initialized. Returning null.');
    return null;
  }

  try {
    const completion = await aiClient.chat.completions.create({
      model: getAIModel(),
      messages: [
        { 
          role: 'system', 
          content: systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations.' 
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as T;
  } catch (error) {
    console.error('Structured AI generation error:', error);
    return null;
  }
}
