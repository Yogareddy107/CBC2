import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, type GenerateObjectResult } from 'ai';
import { z } from 'zod';

// ---------------------------------------------------------
// PROVIDER CONFIGURATION
// ---------------------------------------------------------

/**
 * OpenRouter Client with proper Headers
 * Required for reliable routing and paid model access.
 */
const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
        "HTTP-Referer": "https://checkbeforecommit.com",
        "X-Title": "CheckBeforeCommit",
    }
});

/**
 * AI Model Registry (Prioritizing Paid/Reliable Models)
 * GPT-4o-mini is ultra-cheap and extremely reliable with credits.
 */
const MODELS = {
    PRIMARY_PAID: 'openai/gpt-4o-mini', 
    GEMINI_DIRECT: 'gemini-1.5-flash',
    OR_AUTO: 'openrouter/auto',
    OR_LLAMA_FREE: 'meta-llama/llama-3.1-8b-instruct:free'
};

// ---------------------------------------------------------
// STANDARDIZED WRAPPERS
// ---------------------------------------------------------

/**
 * generateAIObject
 * High-reliability wrapper for structured JSON generation.
 * Flow: GPT-4o-mini (Primary) -> Gemini Direct -> OR Auto -> OR Llama
 */
export async function generateAIObject<T>(params: {
    schema: z.ZodType<T>;
    system: string;
    prompt: string;
    maxTokens?: number;
}): Promise<GenerateObjectResult<T>> {
    const errors: string[] = [];

    // --- PHASE 1: GPT-4o-mini (Paid/Primary) ---
    try {
        console.log(`[Unified-AI] Layer 1: Attempting GPT-4o-mini (Primary)...`);
        return await generateObject({
            model: openrouter(MODELS.PRIMARY_PAID),
            schema: params.schema,
            system: params.system,
            prompt: params.prompt,
            maxTokens: params.maxTokens || 4096,
        });
    } catch (error: any) {
        errors.push(`GPT-4o-mini: ${error.message}`);
    }

    // --- PHASE 2: Gemini Direct (Backup) ---
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        try {
            console.log(`[Unified-AI] Layer 2: Attempting Gemini Direct (${MODELS.GEMINI_DIRECT})...`);
            return await generateObject({
                model: google(MODELS.GEMINI_DIRECT),
                schema: params.schema,
                system: params.system,
                prompt: params.prompt,
                maxTokens: params.maxTokens || 4096,
            });
        } catch (error: any) {
            errors.push(`Gemini Direct: ${error.message}`);
        }
    }

    // --- PHASE 3: OpenRouter Auto ---
    try {
        console.log(`[Unified-AI] Layer 3: Attempting OpenRouter Auto...`);
        return await generateObject({
            model: openrouter(MODELS.OR_AUTO),
            schema: params.schema,
            system: params.system,
            prompt: params.prompt,
            maxTokens: params.maxTokens || 4096,
        });
    } catch (error: any) {
        errors.push(`OpenRouter Auto: ${error.message}`);
    }

    // --- PHASE 4: Final Failure ---
    const finalError = `Analysis Failed: ${errors.join(' | ')}`;
    console.error(`[Unified-AI] CRITICAL: ${finalError}`);
    throw new Error(finalError);
}
