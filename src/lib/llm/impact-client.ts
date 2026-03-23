import { generateAIObject } from './unified-client';

import { z } from 'zod';
import { extractDependencies, resolveDependency } from '../analysis/dependency-graph';

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

Your task is to analyze the provided target file content and the broader repository context to determine the "blast radius" of making changes to this file.

DETERMINISTIC DATA:
You will be provided with EXPLICIT dependents found via static analysis of imports. 
Use this as your foundation and then infer logical/implicit impacts (like side effects, shared state, or downstream UI changes).

OUTPUT REQUIREMENTS:
- You must strictly output JSON matching the required schema.
- Be highly specific and technical in your reasoning.
`;

export async function analyzeImpact(repoData: any): Promise<ImpactResult> {
    // 1. Deterministic Dependency Analysis for the Target File
    const myDeps = repoData.targetFileContent ? extractDependencies(repoData.targetFilePath, repoData.targetFileContent) : [];
    const resolvedDeps = myDeps.map(d => resolveDependency(repoData.targetFilePath, d, repoData.tree)).filter(Boolean);

    const promptContext = `
REPOSITORY CONTEXT:
Repository: ${repoData.name}

TARGET FILE TO ANALYZE:
File Path: ${repoData.targetFilePath}

STATIC ANALYSIS DATA:
- Files that ${repoData.targetFilePath} DEPENDS ON: ${JSON.stringify(resolvedDeps)}
Note: Changes to the target file might break these dependencies if interfaces change.

--- TARGET FILE CONTENT START ---
${repoData.targetFileContent ? repoData.targetFileContent : "(Empty or non-text file)"}
--- TARGET FILE CONTENT END ---

PROJECT TREE SAMPLE:
${repoData.tree.slice(0, 100).join('\n')}

PACKAGE.JSON DEPENDENCIES:
${repoData.packageJson ? repoData.packageJson.slice(0, 500) : "Not available"}

Analyze the impact of modifying this specific target file.
`;

    try {
        console.log(`[Impact Client] Starting LLM impact analysis for ${repoData.targetFilePath}...`);
        const { object } = await generateAIObject({

            schema: ImpactSchema,
            system: SYSTEM_PROMPT,
            prompt: promptContext,
            maxTokens: 4096
        });
        
        console.log(`[Impact Client] Analysis completed for ${repoData.targetFilePath}.`);
        return object;
    } catch (error) {
        console.error("[Impact Client] LLM Analysis failed:", error);
        throw new Error("Failed to generate impact analysis.");
    }
}

