import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export const ImpactSchema = z.object({
    summary: z.string().describe("A concise 1-2 sentence description of what this specific file does in the system."),
    riskLevel: z.enum(["low", "medium", "high", "critical"]).describe("The risk associated with modifying this file."),
    blastRadius: z.object({
        dependentFiles: z.array(z.object({
            file: z.string().describe("File path of the dependent file"),
            reason: z.string().describe("Why this file is affected by changes to the target file")
        })).max(5).describe("List up to 5 files that directly depend on or interact strongly with this file."),
    }),
    coUpdateSuggestions: z.array(z.object({
        file: z.string().describe("File path that likely needs updating"),
        reason: z.string().describe("Why this file should be updated alongside the target file (e.g., tests, config, exports)")
    })).describe("Files that logically should be updated at the same time (e.g., test files, interface definitions)."),
    warning: z.string().nullable().describe("Any severe warnings about modifying this file, or null if standard.")
});

export type ImpactResult = z.infer<typeof ImpactSchema>;

const SYSTEM_PROMPT = `
You are an elite senior principal engineer performing a Change Impact Analysis on a specific file within a GitHub repository.

Your task is to analyze the provided target file content and the broader repository context (directory tree, package.json dependencies, and file relationships) to determine the "blast radius" of making changes to this file.

Focus extremely heavily on identifying implicit dependencies, tight coupling, and files that represent logically paired updates (like testing files, configuration registries, or dependent services).

OUTPUT REQUIREMENTS:
- You must strictly output JSON matching the required schema.
- Be highly specific and technical in your reasoning. Avoid generic advice like "check for errors". Instead say "Modifying the auth payload requires updating the JWT validator in src/middleware".
- Only mention actual files that exist or are strongly implied to exist based on standard project structures and the provided tree.
`;

export async function analyzeImpact(repoData: any): Promise<ImpactResult> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured.");
    }

    const promptContext = `
REPOSITORY CONTEXT:
Repository: ${repoData.name}

TARGET FILE TO ANALYZE:
File Path: ${repoData.targetFilePath}

--- TARGET FILE CONTENT START ---
${repoData.targetFileContent ? repoData.targetFileContent : "(Empty or non-text file)"}
--- TARGET FILE CONTENT END ---

PROJECT TREE SAMPLE (For finding dependents):
${repoData.tree.join('\n')}

PACKAGE.JSON DEPENDENCIES:
${repoData.packageJson ? repoData.packageJson.slice(0, 1000) : "Not available"}

Analyze the impact of modifying this specific target file.
`;

    try {
        console.log(`Starting LLM impact analysis for ${repoData.targetFilePath}...`);
        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: ImpactSchema,
            system: SYSTEM_PROMPT,
            prompt: promptContext,
        });
        
        console.log(`Impact Analysis completed for ${repoData.targetFilePath}.`);
        return object;
    } catch (error) {
        console.error("LLM Impact Analysis failed:", error);
        throw new Error("Failed to generate impact analysis. Please try again.");
    }
}
