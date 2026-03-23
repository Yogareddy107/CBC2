import OpenAI from 'openai';
import { z } from "zod";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export const RemediationSchema = z.object({
    explanation: z.string(),
    filesToUpdate: z.array(z.object({
        path: z.string(),
        content: z.string(),
        reason: z.string()
    })),
    prTitle: z.string(),
    prBody: z.string()
});

export type RemediationResult = z.infer<typeof RemediationSchema>;

export async function generateRemediation(params: {
    issue: string;
    context: string;
    fileContent: string;
    filePath: string;
}) {
    const prompt = `
You are a Staff Software Architect.
TASK: Generate a code fix for the following architectural issue.

ISSUE: ${params.issue}
CONTEXT: ${params.context}
FILE TO FIX: ${params.filePath}

CURRENT CONTENT OF ${params.filePath}:
\`\`\`
${params.fileContent}
\`\`\`

GOAL: Refactor the code to resolve the issue while maintaining existing functionality. 
If the issue is a GOVERNANCE VIOLATION (e.g. prohibited dependency), decouple the components.

Return ONLY JSON matching the schema:
{
    "explanation": "Why this fix works",
    "filesToUpdate": [{ "path": "string", "content": "string", "reason": "string" }],
    "prTitle": "Architectural Refactor: [Brief Title]",
    "prBody": "This PR addresses the following issue: ..."
}
`;

    const response = await openai.chat.completions.create({
        model: "openai/gpt-4o",
        messages: [{ role: "system", content: "You are a Principal Architect. Return valid JSON." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });

    return RemediationSchema.parse(JSON.parse(response.choices[0].message.content || "{}"));
}
