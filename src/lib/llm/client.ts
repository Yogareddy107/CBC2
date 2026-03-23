import OpenAI from 'openai';
import { z } from "zod";
import { 
    detectEntryPoints, 
    mapArchitecture, 
    generateArchitectureFlow 
} from "../analysis/analysis-engine";
import { 
    buildDependencyGraph, 
    detectDeadCode, 
    detectClusters,
    DependencyCluster
} from "../analysis/dependency-graph";
import { calculateHealth, generateOnboarding } from "../analysis/health-report";
import { calculateMarketGrade, TechStack } from "../analysis/benchmarks";
import { checkGovernanceRules, GovernanceRule, GovernanceViolation } from "../analysis/governance";

// ------------------------------------------------------------------
// FINAL SCHEMA: Decision-Grade Codebase Context (14 Sections)
// ------------------------------------------------------------------

export const AnalysisSchema = z.object({
    tldr: z.object({
        architecture: z.string().describe("One line description of architecture"),
        biggestRisk: z.object({
            file: z.string(),
            reason: z.string().describe("One line why")
        }),
        startHere: z.string().describe("Exact file path to begin reading")
    }),
    maturity: z.object({
        rating: z.enum(['Prototype', 'Structured Early-Stage', 'Growing', 'Production-Grade']),
        reason: z.string().describe("One sentence justifying the rating")
    }),
    onboarding: z.object({
        first15Mins: z.array(z.object({ file: z.string(), reason: z.string() })).max(2).min(1),
        next30Mins: z.array(z.object({ file: z.string(), reason: z.string() })).max(2).min(1),
        dataFlow: z.string().describe("[Entry] -> [Core Logic] -> [State/DB] -> [Response]"),
        highRiskFiles: z.array(z.object({ file: z.string(), reason: z.string() })).max(2)
    }),
    blastRadius: z.object({
        highImpact: z.array(z.object({ file: z.string(), impactsModules: z.number(), reason: z.string() })).max(3),
        safeToModify: z.array(z.object({ file: z.string(), reason: z.string() })).max(3)
    }),
    riskAndDebt: z.object({
        couplingRisk: z.object({ level: z.enum(['Low', 'Med', 'High']), reason: z.string() }),
        maintainability: z.object({ score: z.number().min(1).max(10), reason: z.string() }),
        testCoverage: z.object({ level: z.enum(['None', 'Low', 'High']), reason: z.string() }),
        onboardingTime: z.object({ duration: z.string(), reason: z.string() }),
        refactorSafety: z.object({ score: z.number(), level: z.enum(['Low', 'Med', 'High']), reason: z.string() }),
        top3DebtIssues: z.array(z.object({ file: z.string(), issue: z.string() })).max(3)
    }),
    recommendation: z.object({
        goodFor: z.array(z.string()).min(1),
        notReadyFor: z.array(z.string()).min(1),
        first3Actions: z.array(z.object({ action: z.string(), file: z.string() })).max(3)
    }),
    impactfulFiles: z.array(z.object({ file: z.string(), reach: z.number() })).optional(),
    modulePurposes: z.array(z.object({ directory: z.string(), purpose: z.string() })).optional(),
    dependencySummary: z.object({
        totalFiles: z.number(),
        topHubs: z.array(z.object({ file: z.string(), dependents: z.number() })).max(3),
        tightlyCoupledClusters: z.array(z.object({ name: z.string(), files: z.array(z.string()), description: z.string() })).max(3)
    }).optional(),
    healthBreakdown: z.object({
        score: z.number().min(0).max(100),
        metrics: z.object({
            complexity: z.number().min(0).max(100),
            documentation: z.number().min(0).max(100),
            testCoverage: z.number().min(0).max(100),
            modularity: z.number().min(0).max(100)
        }),
        criticalGaps: z.array(z.string()).max(3)
    }).optional(),
    infrastructure: z.object({
        detected: z.array(z.string()),
        summary: z.string(),
        cloudProvider: z.string().optional(),
    }).optional(),
    modernizationRoadmap: z.object({
        targets: z.array(z.object({
            file: z.string(),
            title: z.string(),
            currentComplexity: z.number(),
            targetArchitecture: z.string(),
            steps: z.array(z.string()),
            effort: z.enum(['Low', 'Med', 'High']),
            predictedImpact: z.string()
        })).max(3),
        totalPredictedHealthGain: z.number()
    }).optional(),
    benchmarking: z.object({
        grade: z.enum(['A+', 'A', 'B+', 'B', 'C', 'D', 'F']),
        percentile: z.number(),
        stackAverage: z.number(),
        eliteStatus: z.boolean(),
        competitiveInsight: z.string()
    }).optional(),
    governance: z.object({
        violations: z.array(z.object({
            ruleId: z.string(),
            ruleName: z.string(),
            fromFile: z.string(),
            toFile: z.string(),
            severity: z.enum(['Error', 'Warning']),
            message: z.string()
        })),
        totalRulesChecked: z.number(),
        adherenceScore: z.number()
    }).optional()
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "https://check-before-commit.vercel.app",
        "X-Title": "CheckBeforeCommit",
    }
});

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
}, teamId?: string) {
    const entryPoints = detectEntryPoints(repoData.tree);
    const archMapping = mapArchitecture(repoData.tree);
    const archFlow = generateArchitectureFlow(archMapping);
    
    const fileContents: Record<string, string> = {};
    if (repoData.readme) fileContents['README.md'] = repoData.readme;
    if (repoData.packageJson) fileContents['package.json'] = repoData.packageJson;

    const depGraph = buildDependencyGraph(repoData.tree, fileContents);
    const deadFiles = detectDeadCode(depGraph, entryPoints.map(e => e.file));
    const clusters = detectClusters(depGraph);
    const health = calculateHealth(repoData.tree, archMapping, depGraph, deadFiles);
    const onboardingInfo = generateOnboarding(repoData.tree, entryPoints, depGraph);

    // 🏛️ GOVERNANCE CHECK
    let governanceViolations: GovernanceViolation[] = [];
    let rulesCount = 0;
    if (teamId) {
        const { db } = await import("@/lib/db");
        const { governance_rules } = await import("@/lib/db/schema");
        const { eq, and } = await import("drizzle-orm");
        
        const rules = await db.select()
            .from(governance_rules)
            .where(and(
                eq(governance_rules.team_id, teamId),
                eq(governance_rules.enforced, true)
            ));
        
        governanceViolations = checkGovernanceRules(depGraph, rules as any);
        rulesCount = rules.length;
    }
    
    const dependencySummary = {
        totalFiles: repoData.tree.length,
        topHubs: Object.values(depGraph)
            .sort((a, b) => b.dependents.length - a.dependents.length)
            .slice(0, 3)
            .map(h => ({ file: h.file, dependents: h.dependents.length })),
        tightlyCoupledClusters: clusters.slice(0, 3).map((c: DependencyCluster) => ({
            name: c.id,
            files: c.files.slice(0, 5),
            description: `A ${c.type} module with high internal coupling.`
        }))
    };

    const model = "openai/gpt-4o-mini";
    const prompt = `Perform a technical audit of ${repoData.name}. Return ONLY JSON matching the consolidated schema including sections for tldr, maturity, onboarding, blastRadius, riskAndDebt, recommendation, healthBreakdown, and modernizationRoadmap. Deterministic data: Health Score ${health.score}, Blast Radius ${health.riskIndicators.refactorSafety}%.`;

    const response = await openai.chat.completions.create({
        model,
        messages: [{ role: "system", content: "You are a Principal Software Architect. Return valid JSON." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    const stackMapping: Record<string, TechStack> = { 'nextjs': 'Next.js', 'react': 'React', 'python': 'Python', 'rust': 'Rust', 'typescript': 'TypeScript' };
    const stack = stackMapping[repoData.language.toLowerCase()] || 'Generic';
    const benchmarkResults = calculateMarketGrade(stack as TechStack, {
        complexity: parsed.healthBreakdown?.metrics?.complexity || 50,
        documentation: parsed.healthBreakdown?.metrics?.documentation || 50,
        modularity: parsed.healthBreakdown?.metrics?.modularity || 50,
        testCoverage: parsed.healthBreakdown?.metrics?.testCoverage || 0
    });

    return AnalysisSchema.parse({
        ...parsed,
        impactfulFiles: health.impactfulFiles,
        dependencySummary,
        benchmarking: benchmarkResults,
        governance: {
            violations: governanceViolations,
            totalRulesChecked: rulesCount,
            adherenceScore: rulesCount > 0 ? Math.max(0, 100 - (governanceViolations.length * 10)) : 100
        },
        healthBreakdown: parsed.healthBreakdown || {
            score: health.score,
            metrics: { complexity: 70, documentation: 80, testCoverage: 0, modularity: 50 },
            criticalGaps: []
        },
        infrastructure: {
            detected: archMapping.infrastructure,
            summary: parsed.infrastructure?.summary || "Standard patterns detected.",
            cloudProvider: parsed.infrastructure?.cloudProvider || "Generic"
        }
    });
}

export const MOCK_ANALYSIS: AnalysisResult = {
    tldr: { architecture: "Next.js App Router", biggestRisk: { file: "src/main.ts", reason: "Monolith" }, startHere: "src/app/page.tsx" },
    maturity: { rating: "Production-Grade", reason: "Well structured" },
    onboarding: { 
        first15Mins: [{ file: "README.md", reason: "Overview" }], 
        next30Mins: [{ file: "src/app/page.tsx", reason: "Home page" }], 
        dataFlow: "[UI] -> [API]", 
        highRiskFiles: [] 
    },
    blastRadius: { highImpact: [], safeToModify: [] },
    riskAndDebt: {
        couplingRisk: { level: "Low", reason: "Modular" },
        maintainability: { score: 8, reason: "Clean code" },
        testCoverage: { level: "High", reason: "Good coverage" },
        onboardingTime: { duration: "1 day", reason: "Clear docs" },
        refactorSafety: { score: 90, level: "High", reason: "Strict types" },
        top3DebtIssues: []
    },
    recommendation: { goodFor: ["Web apps"], notReadyFor: ["Mobile"], first3Actions: [] }
};
