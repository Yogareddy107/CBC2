import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, type GenerateObjectResult, type LanguageModel } from 'ai';

import { z } from 'zod';

// ---------------------------------------------------------
// PROVIDER CONFIGURATION
// ---------------------------------------------------------

/**
 * OpenRouter Client (Using Free-Forever Models as Fallback)
 */
const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
    baseURL: "https://openrouter.ai/api/v1",
});

/**
 * Unified Model Picker
 * Prioritizes Direct Gemini API (Massive Free Tier), 
 * falls back to OpenRouter Free models.
 */
export const getUnifiedModel = () => {
    const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (hasGeminiKey) {
        return google('gemini-1.5-flash');
    }

    // Fallback to OpenRouter Free Models
    return openrouter('google/gemini-2.0-flash-exp:free');
};

// ---------------------------------------------------------
// STANDARDIZED WRAPPERS
// ---------------------------------------------------------

/**
 * generateAIObject
 * Unified wrapper for generating structured JSON objects.
 */
export async function generateAIObject<T>(params: {
    schema: z.ZodType<T>;
    system: string;
    prompt: string;
    maxTokens?: number;
}): Promise<GenerateObjectResult<T>> {
    return generateObject({
        model: getUnifiedModel(),
        schema: params.schema,
        system: params.system,
        prompt: params.prompt,
        maxTokens: params.maxTokens || 4096,
    });
}

