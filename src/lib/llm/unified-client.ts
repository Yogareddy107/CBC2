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
 * getGeminiModel
 * Returns the Gemini 1.5 Flash model with the most compatible name.
 */
const getGeminiModel = () => google('gemini-1.5-flash-latest');

/**
 * getFallbackModel
 * Returns the OpenRouter free fallback model.
 */
const getFallbackModel = () => openrouter('google/gemini-2.0-flash-exp:free');

// ---------------------------------------------------------
// STANDARDIZED WRAPPERS
// ---------------------------------------------------------

/**
 * generateAIObject
 * Unified wrapper for generating structured JSON objects.
 * Implements a robust manual fallback: Gemini (Direct) -> OpenRouter (Free Fallback).
 */
export async function generateAIObject<T>(params: {
    schema: z.ZodType<T>;
    system: string;
    prompt: string;
    maxTokens?: number;
}): Promise<GenerateObjectResult<T>> {
    const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // 1. Try Gemini Direct (Primary)
    if (hasGeminiKey) {
        try {
            console.log(`[Unified-AI] Attempting AI generation with Gemini 1.5 Flash...`);
            return await generateObject({
                model: getGeminiModel(),
                schema: params.schema,
                system: params.system,
                prompt: params.prompt,
                maxTokens: params.maxTokens || 4096,
            });
        } catch (error: any) {
            console.warn(`[Unified-AI] Gemini failed: ${error.message}. Falling back to OpenRouter...`);
            // Fall through to OpenRouter fallback
        }
    }

    // 2. Try OpenRouter (Secondary / Fallback)
    console.log(`[Unified-AI] Using OpenRouter Free Fallback...`);
    return await generateObject({
        model: getFallbackModel(),
        schema: params.schema,
        system: params.system,
        prompt: params.prompt,
        maxTokens: params.maxTokens || 4096,
    });
}
