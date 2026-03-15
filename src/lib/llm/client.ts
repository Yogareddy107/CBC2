import OpenAI from 'openai';
import { z } from "zod";

// ------------------------------------------------------------------
// FINAL SCHEMA: Decision-Grade Codebase Context (11 Sections)
// ------------------------------------------------------------------


// Helpers for robust validation
// ------------------------------------------------------------------
// FINAL SCHEMA: Strict 6-Section Report Format
// ------------------------------------------------------------------

const AnalysisSchema = z.object({
    // 1. TL;DR
    tldr: z.object({
        architecture: z.string().describe("One line description of architecture"),
        biggestRisk: z.object({
            file: z.string(),
            reason: z.string().describe("One line why")
        }),
        startHere: z.string().describe("Exact file path to begin reading")
    }),

    // 2. Engineering Maturity Index
    maturity: z.object({
        rating: z.enum(['Prototype', 'Structured Early-Stage', 'Growing', 'Production-Grade']),
        reason: z.string().describe("One sentence justifying the rating based on folder structure, test coverage, documentation, and code patterns")
    }),

    // 3. 15-Minute Onboarding Path
    onboarding: z.object({
        first15Mins: z.array(z.object({
            file: z.string(),
            reason: z.string()
        })).max(2).min(1),
        next30Mins: z.array(z.object({
            file: z.string(),
            reason: z.string()
        })).max(2).min(1),
        dataFlow: z.string().describe("[Entry] -> [Core Logic] -> [State/DB] -> [Response]"),
        highRiskFiles: z.array(z.object({
            file: z.string(),
            reason: z.string()
        })).max(2)
    }),

    // 4. Change Blast Radius
    blastRadius: z.object({
        highImpact: z.array(z.object({
            file: z.string(),
            impactsModules: z.number(),
            reason: z.string().describe("One line why")
        })).max(3),
        safeToModify: z.array(z.object({
            file: z.string(),
            reason: z.string().describe("isolated, low coupling")
        })).max(3)
    }),

    // 5. Risk & Debt Summary
    riskAndDebt: z.object({
        couplingRisk: z.object({ level: z.enum(['Low', 'Med', 'High']), reason: z.string() }),
        maintainability: z.object({ score: z.number().min(1).max(10), reason: z.string().describe("file count, avg length, circ deps") }),
        testCoverage: z.object({ level: z.enum(['None', 'Low', 'High']), reason: z.string() }),
        onboardingTime: z.object({ duration: z.string().describe("X days"), reason: z.string() }),
        refactorSafety: z.object({ level: z.enum(['Low', 'Med', 'High']), reason: z.string() }),
        top3DebtIssues: z.array(z.object({
            file: z.string(),
            issue: z.string()
        })).max(3)
    }),

    // 6. Final Recommendation
    recommendation: z.object({
        goodFor: z.array(z.string()).min(1),
        notReadyFor: z.array(z.string()).min(1),
        first3Actions: z.array(z.object({
            action: z.string(),
            file: z.string()
        })).max(3)
    })
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

// ------------------------------------------------------------------
// MOCK DATA: Gold Standard (Decision-Grade)
// ------------------------------------------------------------------

export const MOCK_ANALYSIS: AnalysisResult = {
    tldr: {
        architecture: "Next.js 14 Web App with Server Actions and Appwrite Auth",
        biggestRisk: {
            file: "src/app/analyze/actions.ts",
            reason: "Contains core orchestration logic without automated test coverage"
        },
        startHere: "src/app/page.tsx"
    },
    maturity: {
        rating: "Structured Early-Stage",
        reason: "Clear separation of components and library logic, but lacks test coverage and comprehensive documentation."
    },
    onboarding: {
        first15Mins: [
            { file: "src/app/page.tsx", reason: "Landing page entry point" },
            { file: "src/app/analyze/actions.ts", reason: "Server action orchestration for analysis" }
        ],
        next30Mins: [
            { file: "src/lib/llm/client.ts", reason: "AI schema definitions and open router interactions" },
            { file: "src/components/AnalysisReport.tsx", reason: "Report rendering logic" }
        ],
        dataFlow: "User Input -> src/app/analyze/actions.ts -> src/lib/llm/client.ts -> Turso DB -> UI Response",
        highRiskFiles: [
            { file: "src/lib/llm/client.ts", reason: "Schema changes break downstream UI parsing" },
            { file: "src/lib/appwrite.ts", reason: "Authentication middleware could lock out users" }
        ]
    },
    blastRadius: {
        highImpact: [
            { file: "src/lib/llm/client.ts", impactsModules: 5, reason: "Defines the core data contract for the entire application" },
            { file: "src/app/analyze/actions.ts", impactsModules: 3, reason: "Main entry point for all background processing" }
        ],
        safeToModify: [
            { file: "src/components/ui/*", reason: "Isolated shadcn components" },
            { file: "src/app/(marketing)/*", reason: "Static landing pages" }
        ]
    },
    riskAndDebt: {
        couplingRisk: { level: "Med", reason: "Auth checks are scattered across multiple Server Actions rather than centralized" },
        maintainability: { score: 7, reason: "140 files, average 120 lines, no major circular dependencies, but no tests" },
        testCoverage: { level: "None", reason: "0 tests found in repository" },
        onboardingTime: { duration: "1.5 days", reason: "Familiar Next.js structure but missing architecture docs" },
        refactorSafety: { level: "Low", reason: "Zero test coverage means all refactors require manual regression testing" },
        top3DebtIssues: [
            { file: "src/app/analyze/actions.ts", issue: "Synchronous LLM calls risk Vercel timeouts" },
            { file: "src/lib/db/schema.ts", issue: "Missing relational constraints for cascading deletes" },
            { file: "src/components/AnalysisReport.tsx", issue: "600+ line God Component needs splitting" }
        ]
    },
    recommendation: {
        goodFor: ["Internal tooling", "Hackathon projects", "Rapid prototyping"],
        notReadyFor: ["Mission-critical workflows", "High concurrency without a queue system"],
        first3Actions: [
            { action: "Add background worker for LLM processing", file: "src/app/analyze/actions.ts" },
            { action: "Add unit tests for schema parsing", file: "src/lib/llm/client.ts" },
            { action: "Split UI rendering into smaller components", file: "src/components/AnalysisReport.tsx" }
        ]
    }
};

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "https://check-before-commit.vercel.app",
        "X-Title": "CheckBeforeCommit",
    }
});

function detectProbableEntryPoints(tree: string[] = []): string {
    try {
        if (!Array.isArray(tree)) {
            return "\nDETECTION HINTS: Repository tree data is not available for entry point analysis.\n";
        }

        const paths = tree.filter(Boolean);
        const hints: string[] = [];

        // Framework detection
        if (paths.some(p => p?.includes('app/page.tsx') || p?.includes('app/layout.tsx'))) {
            hints.push("- This looks like a Next.js (App Router) project. Entry points are likely app/page.tsx and app/layout.tsx.");
        } else if (paths.some(p => p?.includes('pages/_app.tsx') || p?.includes('pages/index.tsx'))) {
            hints.push("- This looks like a Next.js (Pages Router) project. Entry points are likely pages/_app.tsx and pages/index.tsx.");
        } else if (paths.some(p => p?.toLowerCase()?.includes('server.ts') || p?.toLowerCase()?.includes('app.ts'))) {
            hints.push("- This looks like an Express/Node.js server. Entry points are likely server.ts or app.ts.");
        } else if (paths.some(p => p === 'src/index.tsx' || p === 'src/App.tsx')) {
            hints.push("- This looks like a React SPA. Entry points are likely src/index.tsx or src/App.tsx.");
        }

        // Core Domain Detection (Heuristic)
        const domainFiles = paths.filter(p =>
            p?.includes('service') ||
            p?.includes('model') ||
            p?.includes('action') ||
            p?.includes('logic') ||
            p?.includes('domain')
        ).slice(0, 3);

        if (domainFiles.length > 0) {
            hints.push(`- Potential core logic files found: ${domainFiles.join(', ')}`);
        }

        return hints.length > 0 ? `\nDETECTION HINTS (Probable Entry Points):\n${hints.join('\n')}\n` : "";
    } catch (error) {
        console.error("Entry point detection failed:", error);
        return "\nDETECTION HINTS: Could not confidently detect execution flow due to unexpected data structure.\n";
    }
}

export async function analyzeRepo(repoData: {
    name: string;
    owner: string;
    description: string;
    language: string;
    tree: string[];
    readme?: string;
    packageJson?: string;
    architecture?: string;
    contributing?: string;
}) {
    const model = "openai/gpt-4o-mini"; // High performance / low cost for structured output
    const detectionHints = detectProbableEntryPoints(repoData?.tree);

    const prompt = `
You are a Principal Software Architect performing a "Decision-Grade" technical audit.

${detectionHints}
Codebase Context:
- Repository Name: ${repoData?.name}
- Owner: ${repoData?.owner}
- Primary Language: ${repoData?.language}
- File Structure: ${JSON.stringify(repoData?.tree || [], null, 2)}
- Description: ${repoData?.description || "No description provided."}

REAL REPOSITORY DATA (Crucial for Accuracy):
- README CONTENT: ${repoData.readme || "Not found"}
- PACKAGE.JSON: ${repoData.packageJson || "Not found"}
- ARCHITECTURE DOCS: ${repoData.architecture || "Not found"}
- CONTRIBUTING DOCS: ${repoData.contributing || "Not found"}

GOAL:
When user pastes a GitHub URL, generate a report with EXACTLY 
this strict structure — nothing more, nothing less.
Total report must be readable in under 3 minutes.

CALCULATION RULES:
Maintainability (1-10):
- Start at 10
- -1 for every 50 files without tests
- -1 for circular dependencies detected
- -1 for missing README or outdated docs
- -1 for files over 500 lines
- -1 for no environment config example

Onboarding Time:
- Base: 0.5 days
- +0.5 days per 100 files
- +1 day if no README
- +1 day if no tests
- -0.5 days if has architecture docs
- -0.5 days if has inline comments

STRICT REPORT RULES:
- Never list same file in both START HERE and HIGH RISK
- Every score must show HOW it was calculated (e.g., "-1 missing tests")
- No duplicate sections — each insight appears once only
- No vague advice like "adopt with caution" without specifics
- No generic statements — every line must reference actual files
- Maximum 600 words per report

Return a JSON object matching this EXACT structure:

{
  "tldr": {
    "architecture": "one line description",
    "biggestRisk": {
      "file": "specific file",
      "reason": "one line why"
    },
    "startHere": "exact file path to begin reading"
  },
  "maturity": {
    "rating": "Prototype", // ONLY: "Prototype" | "Structured Early-Stage" | "Growing" | "Production-Grade"
    "reason": "one sentence justifying the rating based on folder structure, test coverage, documentation, and code patterns"
  },
  "onboarding": {
    "first15Mins": [
      { "file": "path", "reason": "what to understand" }
    ],
    "next30Mins": [
      { "file": "path", "reason": "what to understand" }
    ],
    "dataFlow": "[Entry] -> [Core Logic] -> [State/DB] -> [Response]",
    "highRiskFiles": [
      { "file": "path", "reason": "why risky (do not repeat startHere files)" }
    ]
  },
  "blastRadius": {
    "highImpact": [
      { "file": "path", "impactsModules": 5, "reason": "one line why" }
    ],
    "safeToModify": [
      { "file": "path", "reason": "isolated, low coupling" }
    ]
  },
  "riskAndDebt": {
    "couplingRisk": { "level": "Low", "reason": "why" }, // ONLY "Low" | "Med" | "High"
    "maintainability": { "score": 8, "reason": "how calculated (file count, avg length)" }, // integer 1-10
    "testCoverage": { "level": "Low", "reason": "why" }, // ONLY "None" | "Low" | "High"
    "onboardingTime": { "duration": "1.5 days", "reason": "calculation" },
    "refactorSafety": { "level": "Low", "reason": "why" }, // ONLY "Low" | "Med" | "High"
    "top3DebtIssues": [
      { "file": "path", "issue": "specific issue" }
    ]
  },
  "recommendation": {
    "goodFor": ["use case 1", "use case 2"],
    "notReadyFor": ["use case 1", "use case 2"],
    "first3Actions": [
      { "action": "action description", "file": "specific file" }
    ]
  }
}
`;

    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: `You are a Principal Software Architect. You provide dense, evidence-based technical audits.

CRITICAL OUTPUT RULES:
1. You MUST return ONLY valid JSON - no markdown, no code fences.
2. Follow enum and numeric constraints strictly.`
            },

            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from LLM");

    const parsed = JSON.parse(content);
    return AnalysisSchema.parse(parsed);
}
