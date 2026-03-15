import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export const PRAnalysisSchema = z.object({
    humanReadableSummary: z.string().describe("A concise 2-3 sentence summary of what this PR is actually trying to accomplish in plain English, ignoring the code jargon."),
    riskAssessment: z.object({
        level: z.enum(["Low", "Medium", "High", "Critical"]).describe("The risk level of merging this PR."),
        reason: z.string().describe("Why this risk level was assigned based on the files touched (e.g. touches core auth paths, db migrations, or just UI).")
    }),
    moduleImpact: z.array(z.object({
        name: z.string().describe("The logical name of the module or feature area being affected"),
        impact: z.string().describe("What the change means for this specific area")
    })).describe("List of distinct logical modules impacted by this PR and how."),
    filesNeedingCarefulReview: z.array(z.object({
        file: z.string().describe("The file path"),
        reason: z.string().describe("Why the reviewer should look very closely at this specific file's changes.")
    })).describe("The top files where bugs are most likely to hide in this PR."),
    nitpicksAndSuggestions: z.array(z.string()).describe("A list of general observations, missed edge cases, or suggested refinements.")
});

export type PRAnalysisResult = z.infer<typeof PRAnalysisSchema>;

const SYSTEM_PROMPT = `
You are a Staff Software Engineer performing a rigorous Pull Request review.

Your goal is to quickly summarize what the PR does, assess its overall risk to the system based on the files modified, and highlight the highest-risk files that need careful manual review. 

Do NOT just read the title and body. Verify the developer's intent matches the actual diff patches provided.

OUTPUT REQUIREMENTS:
- You must strictly output JSON matching the provided exact schema.
- Be highly precise. Do not output vague statements like "This modifies the codebase". Be specific: "This alters the PaymentProcessor validation logic".
- Use the provided diffs to find edge cases or files that need deep attention.
- If there are standard files modified like \`package-lock.json\`, ignore them in your careful review unless something is extremely weird. Focus on core logic.
`;

export async function analyzePR(prData: any): Promise<PRAnalysisResult> {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured.");
    }

    const promptContext = `
PULL REQUEST: ${prData.repoFullName}#${prData.prNumber}
Title: ${prData.title}
Author: ${prData.author}
State: ${prData.state}
Total Lines Changed: +${prData.additions} -${prData.deletions}

--- PR DESCRIPTION ---
${prData.body ? prData.body.slice(0, 2000) : "No description provided."}
---

--- FILES CHANGED SUMMARY ---
${prData.summary.join('\n').slice(0, 3000)}
---

--- DETAILED DIFFS (Top ${prData.diffContext.length} files) ---
${JSON.stringify(prData.diffContext).slice(0, 30000)}
---

Analyze this pull request and provide your assessment.
`;

    try {
        console.log(`Starting LLM PR Review for ${prData.repoFullName}#${prData.prNumber}...`);
        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: PRAnalysisSchema,
            system: SYSTEM_PROMPT,
            prompt: promptContext,
        });
        
        console.log(`PR Review completed for ${prData.repoFullName}#${prData.prNumber}.`);
        return object;
    } catch (error) {
        console.error("LLM PR Review failed:", error);
        throw new Error("Failed to generate PR review. Please try again.");
    }
}
