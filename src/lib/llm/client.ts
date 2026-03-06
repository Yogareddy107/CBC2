import OpenAI from 'openai';
import { z } from "zod";

// ------------------------------------------------------------------
// FINAL SCHEMA: Decision-Grade Codebase Context (11 Sections)
// ------------------------------------------------------------------


// Helpers for robust validation
function createLooseEnumSchema<T extends string>(values: readonly T[], fallback: T) {
    return z.preprocess((val) => {
        if (typeof val === 'string') {
            const match = values.find(v => v.toLowerCase() === val.toLowerCase());
            if (match) return match;
        }
        return fallback;
    }, z.enum(values as [T, ...T[]]));
}

const flexibleStringSchema = z.union([
    z.string(),
    z.array(z.string()).transform(arr => arr.join(". ")),
    z.number().transform(n => String(n)),
    z.null().transform(() => "Not specified"),
    z.undefined().transform(() => "Not specified"),
]);

const scoreSchema = z.preprocess((val) => {
    const n = Number(val);
    if (isNaN(n)) return 5;
    if (n > 10) return Math.round(n / 10); // Handle 0-100 scale
    return Math.max(1, Math.min(10, Math.round(n))); // Clamp 1-10
}, z.number().min(1).max(10));

const AnalysisSchema = z.object({
    // 1. Repo Snapshot (Orientation)
    repoSnapshot: z.object({
        description: flexibleStringSchema,
        primaryStack: flexibleStringSchema,
        architectureType: createLooseEnumSchema(['Feature-based', 'Layered', 'Monolithic', 'Microservices', 'Hybrid', 'Unstructured'], 'Unstructured'),
        codebaseSize: createLooseEnumSchema(['Small', 'Medium', 'Large', 'Massive'], 'Medium'),
        activitySignal: createLooseEnumSchema(['Actively Maintained', 'Low Activity', 'Stagnant', 'Deprecated'], 'Low Activity'),
    }),

    // 2. Executive Technical Verdict (High-Leverage)
    executiveVerdict: z.object({
        maturityStage: createLooseEnumSchema(['Prototype', 'Structured Early-Stage', 'Growing', 'Production-Grade'], 'Prototype'),
        maintainabilityScore: scoreSchema,
        maintenanceContext: flexibleStringSchema,
        modularityStrength: createLooseEnumSchema(['Weak', 'Moderate', 'Strong'], 'Moderate'),
        couplingRisk: createLooseEnumSchema(['Low', 'Medium', 'High'], 'Medium'),
        couplingContext: flexibleStringSchema,
        refactorSafety: createLooseEnumSchema(['Low', 'Moderate', 'High'], 'Low'),
        refactorContext: flexibleStringSchema,
        productionReadiness: createLooseEnumSchema(['Experimental', 'Early-stage', 'Stable', 'Production-Hardened'], 'Experimental'),
        adoptionRecommendation: createLooseEnumSchema(['Safe to adopt', 'Adopt with caution', 'Refactor before adopting', 'Not recommended for production'], 'Adopt with caution'),
    }),

    // 3. Architectural Health Analysis
    architecturalHealth: z.object({
        architectureIdentity: flexibleStringSchema,
        pattern: flexibleStringSchema,
        boundaryStrength: flexibleStringSchema,
        cohesion: flexibleStringSchema,
        consistency: flexibleStringSchema,
    }),

    // 4. Dependency & Coupling Map
    dependencyAnalysis: z.object({
        centralNodes: z.array(z.string()).default([]),
        topConsumers: z.array(z.string()).default([]),
        circularRisk: flexibleStringSchema,
    }),

    // 5. Change Blast Radius & Refactor Risk
    blastRadius: z.object({
        highBlastRadiusAreas: z.array(z.string()).default([]),
        safeZones: z.array(z.string()).default([]),
        refactorConfidence: flexibleStringSchema,
    }),

    // 6. Maintainability & Technical Debt Signals
    maintainability: z.object({
        centralization: flexibleStringSchema,
        abstractionQuality: flexibleStringSchema,
        dependencySprawl: flexibleStringSchema,
        technicalDebtIndicators: z.array(z.string()).default([]),
    }),

    // 7. Execution Flow & System Boundaries
    executionFlow: z.object({
        entryPoint: flexibleStringSchema,
        corePath: flexibleStringSchema,
        sideEffectZones: flexibleStringSchema,
        stateMutationPattern: flexibleStringSchema,
        apiBoundary: flexibleStringSchema,
    }),

    // 8. Test & Safety Profile
    testingProfile: z.object({
        unitCoverage: flexibleStringSchema,
        integrationDepth: flexibleStringSchema,
        e2ePresence: flexibleStringSchema,
        mockingStrategy: flexibleStringSchema,
        refactorSafetyRating: createLooseEnumSchema(['Low', 'Moderate', 'High'], 'Low'),
    }),

    // 9. Operational & Scalability Signals
    scalability: z.object({
        deploymentMaturity: flexibleStringSchema,
        configHygiene: flexibleStringSchema,
        scalingBottlenecks: flexibleStringSchema,
        caching: flexibleStringSchema,
    }),

    // 10. Onboarding Friction Index + 15-Minute Onboarding Path
    onboarding: z.object({
        // Original friction metrics
        setupComplexity: createLooseEnumSchema(['Low', 'Moderate', 'High'], 'High'),
        documentationClarity: createLooseEnumSchema(['Poor', 'Average', 'Excellent'], 'Poor'),
        estimatedOnboardingTime: flexibleStringSchema,

        // NEW: 15-Minute Onboarding Path
        coreDomainSummary: flexibleStringSchema,
        startHere: z.array(z.string()).default([]),
        thenRead: z.array(z.string()).default([]),
        dataFlowSummary: flexibleStringSchema,
        highRiskFiles: z.array(z.string()).default([]),
        firstDayAdvice: flexibleStringSchema,

        // Legacy fields (keeping for backward compatibility)
        keyFilesToRead: z.array(z.string()).default([]),
        areasToAvoid: z.array(z.string()).default([]),
    }),

    // 11. Strategic Improvement Priorities
    improvements: z.array(z.object({
        title: flexibleStringSchema,
        description: flexibleStringSchema,
        priority: createLooseEnumSchema(['High', 'Medium', 'Low'], 'Medium'),
    })).default([]),

    // 12. Final Technical Recommendation
    finalRecommendation: z.object({
        goodFor: z.array(z.string()).default([]),
        riskyFor: z.array(z.string()).default([]),
        recommendedApproach: flexibleStringSchema,
    }),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

// ------------------------------------------------------------------
// MOCK DATA: Gold Standard (Decision-Grade)
// ------------------------------------------------------------------

export const MOCK_ANALYSIS: AnalysisResult = {
    repoSnapshot: {
        description: "A Next.js 14 application orchestrating GitHub analysis via LLMs using Server Actions. It uses Appwrite for auth and Turso (LibSQL) for the database, with OpenAI for intelligence.",
        primaryStack: "TypeScript, Next.js 14, Appwrite, Turso, Tailwind CSS",
        architectureType: "Feature-based",
        codebaseSize: "Medium",
        activitySignal: "Actively Maintained",
    },
    executiveVerdict: {
        maturityStage: "Structured Early-Stage",
        maintainabilityScore: 8,
        maintenanceContext: "High consistency in separation of concerns (UI vs Logic), but lacks automated testing safety net.",
        modularityStrength: "Moderate",
        couplingRisk: "Medium",
        couplingContext: "Auth logic is scattered across middleware and components; UI is loosely coupled.",
        refactorSafety: "Moderate",
        refactorContext: "Refactor risk moderate due to weak test coverage around orchestration logic.",
        productionReadiness: "Early-stage",
        adoptionRecommendation: "Adopt with caution",
    },
    architecturalHealth: {
        architectureIdentity: "Feature-based modular frontend with centralized server orchestration in Server Actions.",
        pattern: "Feature-based modules in `src/app` with shared logic in `src/lib`. Clear separation.",
        boundaryStrength: "Strong. UI components are isolated from data fetching logic (Server Actions).",
        cohesion: "High. `src/lib/llm` encapsulates all AI logic; `src/components` handles only presentation.",
        consistency: "Uniform file naming and folder structure. Strict usage of functional components.",
    },
    dependencyAnalysis: {
        centralNodes: ["src/lib/llm/client.ts", "src/lib/utils.ts", "src/lib/appwrite.ts"],
        topConsumers: ["src/app/analyze/actions.ts", "src/components/AnalysisReport.tsx"],
        circularRisk: "Low. No cycle detection needed for current scale.",
    },
    blastRadius: {
        highBlastRadiusAreas: [
            "src/lib/llm/client.ts (Schema definitions affect global data flow)",
            "src/app/analyze/actions.ts (Core orchestration logic)",
        ],
        safeZones: [
            "src/components/ui/* (Isolated Shadcn UI components)",
            "src/app/(marketing)/* (Static landing pages)",
        ],
        refactorConfidence: "Moderate. Strong type safety via Zod, but lack of automated tests means manual verification is required.",
    },
    maintainability: {
        centralization: "API logic centralized in Server Actions, avoiding client-side spaghetti.",
        abstractionQuality: "High. LLM interaction abstracts away provider complexity.",
        dependencySprawl: "Low. Core dependencies are standard (Next, React, Lucide, Zod).",
        technicalDebtIndicators: [
            "No background job queue for long-running analyses (Vercel timeout risk)",
            "Hardcoded error messages in some UI components",
        ],
    },
    executionFlow: {
        entryPoint: "`src/app/page.tsx` (Home) -> `src/app/analyze/actions.ts` (Action)",
        corePath: "User submits Repo -> Server Action fetches GitHub data -> LLM analyzes -> Result streamed/saved.",
        sideEffectZones: "Supabase Database writes occur only on successful analysis completion.",
        stateMutationPattern: "URL-driven state for shareability; minimal client-side global state.",
        apiBoundary: "Strict definition in `src/lib/llm/client.ts`. Zod schemas enforce contract.",
    },
    testingProfile: {
        unitCoverage: "Low (0%). No Jest/Vitest setup detected.",
        integrationDepth: "None. Testing relies on manual 'Click Testing'.",
        e2ePresence: "None.",
        mockingStrategy: "Manual mocking of generic data in `client.ts` for dev mode.",
        refactorSafetyRating: "Low",
    },
    scalability: {
        deploymentMaturity: "Vercel-optimized. Easy to deploy.",
        configHygiene: "Good. Environment variables strictly typed and separated.",
        scalingBottlenecks: "Serverless function timeouts (60s limit) for large repos.",
        caching: "Aggressive Next.js caching on static assets; no API response caching detected.",
    },
    onboarding: {
        setupComplexity: "Low",
        documentationClarity: "Average",
        estimatedOnboardingTime: "1 day",

        // 15-Minute Onboarding Path
        coreDomainSummary: "This project revolves around GitHub Repository Analysis via LLM. Core domain logic is concentrated in src/app/analyze/actions.ts. Most UI components are thin wrappers around analysis results.",
        startHere: [
            "src/app/page.tsx (Landing page entry point)",
            "src/app/analyze/actions.ts (Server Action orchestration)",
        ],
        thenRead: [
            "src/lib/llm/client.ts (LLM integration and schema definitions)",
            "src/lib/github/client.ts (GitHub API data fetching)",
            "src/components/AnalysisReport.tsx (Report rendering logic)",
        ],
        dataFlowSummary: "User submits repo → Server Action fetches GitHub tree → LLM analyzes structure → Zod validates schema → Result rendered or saved to Supabase",
        highRiskFiles: [
            "src/lib/llm/client.ts (Schema changes affect entire data flow)",
            "src/app/analyze/actions.ts (Core orchestration - high blast radius)",
        ],
        firstDayAdvice: "Start by reading the Server Action to understand the orchestration flow. Avoid touching LLM schema definitions until you understand validation patterns. Expect 4-6 hours to grasp the core analysis loop.",

        // Legacy fields
        keyFilesToRead: [
            "src/app/analyze/actions.ts (The Brain)",
            "src/lib/llm/client.ts (The Data Contract)",
            "src/components/AnalysisReport.tsx (The View)",
        ],
        areasToAvoid: [
            "src/lib/supabase/middleware.ts (Fragile auth logic)",
        ],
    },
    improvements: [
        {
            title: "Implement Background Queues",
            description: "Move analysis to Inngest or similar to bypass Vercel 60s timeout.",
            priority: "High",
        },
        {
            title: "Add Unit Tests for Parsers",
            description: "Add Vitest to test Zod schema validation against various LLM outputs.",
            priority: "Medium",
        },
        {
            title: "Centralize Error Handling",
            description: "Create a global error boundary and toaster system for API failures.",
            priority: "Low",
        },
    ],
    finalRecommendation: {
        goodFor: ["Internal tooling", "Developer productivity apps", "Hackathons"],
        riskyFor: ["Mission-critical enterprise workflows without better error handling"],
        recommendedApproach: "Adopt as a reference implementation for LLM orchestration. Refactor into an async worker pattern for production use.",
    },
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
Provide a brutal, honest, technically dense assessment of engineering quality, risks, and health.
Use the REAL REPOSITORY DATA above to back every claim. Do not hallucinate dependencies or architectural patterns that aren't mentioned in the README or package.json.
PRIMARY GOAL:
Your #1 job is to help a new engineer UNDERSTAND this codebase in 15 minutes.
NOT just evaluate it — ORIENT them.

CRITICAL RULES:
1. ONBOARDING-FIRST: Every judgment you make should answer "Where do I start?", "What runs first?", "What's safe to touch?"
2. NO PLATITUDES: Say "Strict TypeScript in API layers reduces runtime regression risk" not "TypeScript adds type safety"
3. SPECIFIC EVIDENCE: Back every claim with file paths or patterns from the file list
4. CHANGE-CENTRIC: Focus on "Change Blast Radius" and "Refactor Risk"
5. DECISION-FIRST: Lead to clear "Adopt", "Refactor", or "Avoid" decision
6. TONE: Professional, concise, unsentimental

STRICT OUTPUT REQUIREMENTS:

⚠️ CRITICAL VALIDATION RULES:
- maintainabilityScore: MUST be integer 1-10 (do NOT use 0-100 scale, do NOT exceed 10)
- sideEffectZones: MUST be a single string describing zones (NOT an array)
- All enum fields: MUST match EXACT case-sensitive values listed below
- Return ONLY raw JSON (no \`\`\`json markdown fencing)

Return a JSON object matching this EXACT structure:

{
  "repoSnapshot": {
    "description": "A technical briefing of the repository (5-7 meaningful lines). Explain: what the system does, core domain focus, architectural style, where most logic resides, and overall structural maturity. Avoid generic AI phrases or marketing copy. Lead with architectural facts.",
    "primaryStack": "comma-separated string",
    "architectureType": "Feature-based", // ONLY: "Feature-based" | "Layered" | "Monolithic" | "Microservices" | "Hybrid" | "Unstructured"
    "codebaseSize": "Medium", // ONLY: "Small" | "Medium" | "Large" | "Massive"
    "activitySignal": "Actively Maintained" // ONLY: "Actively Maintained" | "Low Activity" | "Stagnant" | "Deprecated"
  },
  "executiveVerdict": {
    "maturityStage": "Structured Early-Stage", // ONLY: "Prototype" | "Structured Early-Stage" | "Growing" | "Production-Grade"
    "maintainabilityScore": 7, // ⚠️ INTEGER 1-10 ONLY (NOT 0-100, NOT >10)
    "maintenanceContext": "descriptive string",
    "modularityStrength": "Moderate", // ONLY: "Weak" | "Moderate" | "Strong"
    "couplingRisk": "Medium", // ONLY: "Low" | "Medium" | "High"
    "couplingContext": "descriptive string",
    "refactorSafety": "Moderate", // ONLY: "Low" | "Moderate" | "High"
    "refactorContext": "descriptive string",
    "productionReadiness": "Early-stage", // ONLY: "Experimental" | "Early-stage" | "Stable" | "Production-Hardened"
    "adoptionRecommendation": "Adopt with caution" // ONLY: "Safe to adopt" | "Adopt with caution" | "Refactor before adopting" | "Not recommended for production"
  },
  "architecturalHealth": {
    "architectureIdentity": "string",
    "pattern": "string",
    "boundaryStrength": "string",
    "cohesion": "string",
    "consistency": "string"
  },
  "dependencyAnalysis": {
    "centralNodes": ["array of strings"],
    "topConsumers": ["array of strings"],
    "circularRisk": "string"
  },
  "blastRadius": {
    "highBlastRadiusAreas": ["array of strings"],
    "safeZones": ["array of strings"],
    "refactorConfidence": "string"
  },
  "maintainability": {
    "centralization": "string",
    "abstractionQuality": "string",
    "dependencySprawl": "string",
    "technicalDebtIndicators": ["array of strings"]
  },
  "executionFlow": {
    "entryPoint": "string",
    "corePath": "string",
    "sideEffectZones": "Database writes in auth module, API calls in analysis layer", // ⚠️ MUST BE STRING NOT ARRAY
    "stateMutationPattern": "string",
    "apiBoundary": "string"
  },
  "testingProfile": {
    "unitCoverage": "string",
    "integrationDepth": "string",
    "e2ePresence": "string",
    "mockingStrategy": "string",
    "refactorSafetyRating": "Low" // ONLY: "Low" | "Moderate" | "High"
  },
  "scalability": {
    "deploymentMaturity": "string",
    "configHygiene": "string",
    "scalingBottlenecks": "string",
    "caching": "string"
  },
  "onboarding": {
    "setupComplexity": "Low", // ONLY: "Low" | "Moderate" | "High"
    "documentationClarity": "Poor", // ONLY: "Poor" | "Average" | "Excellent"
    "estimatedOnboardingTime": "string",
    
    // 🚀 15-MINUTE ONBOARDING PATH (NEW - CRITICAL FOR CLARITY)
    "coreDomainSummary": "In 1-2 sentences: What does this project DO? What is the core business domain? Example: 'This project revolves around Room Management. Core domain logic is concentrated in services/roomService.ts.'",
    "startHere": [
      "Entry point file (e.g., app/page.tsx or server/index.ts)",
      "Main orchestration file (e.g., where requests are handled)"
    ],
    "thenRead": [
      "Core business logic file #1 (e.g., services/orderService.ts)",
      "Domain model file #1 (e.g., models/order.ts)",
      "Key utility/helper file (e.g., lib/validation.ts)"
    ],
    "dataFlowSummary": "Single line describing request → response path. Example: 'HTTP Request → API Route → Service Layer → Database → Response'",
    "highRiskFiles": [
      "File with high coupling or blast radius (e.g., services/paymentService.ts - affects 8 modules)",
      "Complex configuration file to avoid initially"
    ],
    "firstDayAdvice": "Practical guidance for a new engineer joining. Example: 'Read the service layer files first to understand business logic. Avoid the payment module initially (high coupling). Expect 2-3 days to understand service boundaries.'",
    
    // Legacy fields (keep for backward compatibility)
    "keyFilesToRead": ["array of strings"],
    "areasToAvoid": ["array of strings"]
  },
  "improvements": [
    {
      "title": "string",
      "description": "string",
      "priority": "High" // ONLY: "High" | "Medium" | "Low"
    }
  ],
  "finalRecommendation": {
    "goodFor": ["array of strings"],
    "riskyFor": ["array of strings"],
    "recommendedApproach": "string"
  }
}

⚠️ FINAL VALIDATION BEFORE RETURNING:
1. Check maintainabilityScore is 1-10 integer
2. Check ALL enum values match EXACTLY
3. Check sideEffectZones is string, not array
4. Remove any markdown code fences
5. Ensure valid JSON syntax
`;

    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: `You are a Principal Software Architect. You provide dense, evidence-based technical audits.

CRITICAL OUTPUT RULES:
1. You MUST return ONLY valid JSON - no markdown, no code fences, no explanations.
2. ALL numeric scores MUST be integers between 1 and 10 inclusive.
3. ALL enum fields MUST use EXACT case-sensitive strings as defined.
4. ALL string fields MUST return a single string - NEVER an array.
5. If uncertain, use fallback values rather than invalid data.

NUMERIC CONSTRAINTS:
- maintainabilityScore: integer from 1-10 (NOT 0-100, NOT >10)

EXACT ENUM VALUES (case-sensitive):
- architectureType: "Feature-based" | "Layered" | "Monolithic" | "Microservices" | "Hybrid" | "Unstructured"
- codebaseSize: "Small" | "Medium" | "Large" | "Massive"
- activitySignal: "Actively Maintained" | "Low Activity" | "Stagnant" | "Deprecated"
- maturityStage: "Prototype" | "Structured Early-Stage" | "Growing" | "Production-Grade"
- modularityStrength: "Weak" | "Moderate" | "Strong"
- couplingRisk: "Low" | "Medium" | "High"
- refactorSafety: "Low" | "Moderate" | "High"
- productionReadiness: "Experimental" | "Early-stage" | "Stable" | "Production-Hardened"
- adoptionRecommendation: "Safe to adopt" | "Adopt with caution" | "Refactor before adopting" | "Not recommended for production"
- refactorSafetyRating: "Low" | "Moderate" | "High"
- setupComplexity: "Low" | "Moderate" | "High"
- documentationClarity: "Poor" | "Average" | "Excellent"
- priority: "High" | "Medium" | "Low"

STRING FIELDS (NEVER arrays):
- sideEffectZones: return a SINGLE descriptive string, not an array
- All other non-array fields: return strings, not arrays or numbers

VALIDATION CHECKLIST before returning:
✓ All scores are 1-10 integers
✓ All enums match exactly (case-sensitive)
✓ sideEffectZones is a string, not array
✓ No markdown formatting
✓ Valid JSON structure`
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
