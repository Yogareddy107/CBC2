import OpenAI from 'openai';
import { generateAIObject } from "./unified-client";


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
    security: z.object({
        score: z.number().min(0).max(10),
        criticalIssues: z.array(z.object({ file: z.string(), line: z.number(), issue: z.string() })),
        warnings: z.array(z.object({ file: z.string(), line: z.number().optional(), issue: z.string() })),
        passedChecks: z.array(z.string())
    }),
    performance: z.object({
        risk: z.enum(['Low', 'Med', 'High']),
        bottlenecks: z.array(z.object({ file: z.string(), reason: z.string() })).max(3),
        quickWin: z.string()
    }),
    cleanup: z.object({
        potential: z.enum(['Low', 'Med', 'High']),
        unusedFiles: z.array(z.object({ file: z.string(), confidence: z.enum(['Low', 'Med', 'High']) })),
        unusedDeps: z.array(z.string()),
        impactOfCleanup: z.string()
    }),
    apiContract: z.object({
        totalEndpoints: z.number(),
        documented: z.string().describe("X/X"),
        topEndpoints: z.array(z.object({
            path: z.string(),
            method: z.string(),
            authRequired: z.boolean(),
            validationPresent: z.boolean(),
            performanceRisk: z.string(),
            blastRadius: z.string()
        })).max(5)
    }).optional(),
    cicd: z.object({
        readiness: z.enum(['Not Ready', 'Partial', 'Ready']),
        checklist: z.array(z.object({ id: z.string(), label: z.string(), status: z.enum(['Pass', 'Warn', 'Fail']) })),
        topRisk: z.string()
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

// OpenAI instance removed in favor of unified-client


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

    const prompt = `
Generate an Elite Architectural Report for ${repoData.name}. 
Deterministically verified metrics: Score ${health.score}, Blast Radius ${health.riskIndicators.refactorSafety}%.

STRICT PROFESSIONAL RULES:
- STIRCTLY NO FAKE DATA. If a section has no issues, say "Baseline verified; no gaps detected."
- USE REAL FILE PATHS. Always reference existing files from the tree.
- THICK TECHNICAL INSIGHTS. Use engineering terminology (e.g., "O(n) complexity in hot path", "Inconsistent singleton pattern").
- PROFESSIONAL TONE. Write like a Principal Architect auditing a mission-critical system.

SECTION ORDER:
1. EXECUTIVE SUMMARY: Purpose, Critical Risk (file+why), Entry Point.
2. ENGINEERING MATURITY: Rating (Prototype to Production-Grade), precisely 3 evidence signals.
3. ENGINEERING HEALTH SCORE: Overall /100, Complexity, Documentation, Test Coverage, Modularity.
4. ONBOARDING PATH: Core Data Flow (A->B->C), First 15 min files, Next 30 min files.
5. BLAST RADIUS: 3 highest impact files with reach % and logical dependencies.
6. RISK & DEBT: 3 technical debt items (file+type+impact).
7. SECURITY: Critical issues (file+line+issue) AND Security Posture checks.
8. PERFORMANCE: Bottlenecks (file+reason) AND precisely 1 "Quick Win."
9. CLEANUP: Top 3 unused files (confidence %) and unused dependencies.
10. API CONTRACT: Core endpoints (path+method+auth+radius).
11. CI/CD READINESS: Readiness (Ready/Warning), checklist, and Top Pipeline Risk.
12. FINAL VERDICT: Good for (use cases), NOT ready for (limitations), First 3 engineering steps.
`;

    const { object } = await generateAIObject({
        schema: AnalysisSchema,
        system: "You are a Principal Software Architect at an ELITE technology firm. You provide stone-cold, no-fluff, architecture-grade repository audits. Return strictly valid JSON.",
        prompt,
        maxTokens: 8192
    });


    const parsed = object as any;

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
        },
        security: parsed.security || { score: 5, criticalIssues: [], warnings: [], passedChecks: [] },
        performance: parsed.performance || { risk: "Low", bottlenecks: [], quickWin: "N/A" },
        cleanup: parsed.cleanup || { potential: "Low", unusedFiles: [], unusedDeps: [], impactOfCleanup: "N/A" },
        cicd: parsed.cicd || { readiness: "Partial", checklist: [], topRisk: "N/A" }
    });

}

export const MOCK_ANALYSIS: AnalysisResult = {
    tldr: { architecture: "Next.js App Router", biggestRisk: { file: "src/main.ts", reason: "Monolith" }, startHere: "src/app/page.tsx" },
    maturity: { rating: "Production-Grade", reason: "Well structured" },
    onboarding: { 
        first15Mins: [{ file: "src/lib/llm/client.ts", reason: "Defines the core analysis schema and prompt logic." }], 
        next30Mins: [{ file: "src/components/AnalysisReport.tsx", reason: "Visual orchestration of all audit signals." }], 
        dataFlow: "API -> UnifiedClient -> DB -> UI", 
        highRiskFiles: [] 
    },
    blastRadius: { highImpact: [{ file: "src/lib/llm/unified-client.ts", impactsModules: 85, reason: "Central hub for all AI interactions." }], safeToModify: [] },
    riskAndDebt: {
        couplingRisk: { level: "Low", reason: "Modular" },
        maintainability: { score: 9, reason: "Excellent separation of concerns (SOC)." },
        testCoverage: { level: "Low", reason: "Core logic covered; UI coverage pending." },
        onboardingTime: { duration: "30 mins", reason: "Extremely modular structure." },
        refactorSafety: { score: 95, level: "High", reason: "Strict type boundaries enforced." },
        top3DebtIssues: [
            { file: "src/lib/actions/notifications.ts", issue: "Notification delivery may fail silently if DB connection is saturated." }
        ]
    },
    recommendation: { 
        goodFor: ["Enterprise-grade repo auditing", "Security-first teams"], 
        notReadyFor: ["Legacy COBOL/Fortran systems"], 
        first3Actions: [
            { action: "Increase unit test coverage for fallback logic.", file: "src/lib/llm/unified-client.ts" },
            { action: "Implement automated UI regression tests.", file: "src/components/AnalysisReport.tsx" },
            { action: "Refactor AnalysisReport.tsx into smaller sub-components.", file: "src/components/AnalysisReport.tsx" }
        ] 
    },
    security: { 
        score: 95, 
        criticalIssues: [], 
        warnings: [
            { file: "src/lib/llm/unified-client.ts", line: 42, issue: "Potential sensitive data logging during fallback." }
        ], 
        passedChecks: ["Auth Unification", "Data Encryption", "CSRF Protection"] 
    },
    performance: { 
        risk: "Low", 
        bottlenecks: [
            { file: "HistoryTable.tsx", reason: "Unoptimized mapping over large result sets." }
        ], 
        quickWin: "Implement virtualization for the history dataset." 
    },
    cleanup: { 
        potential: "High", 
        unusedFiles: [
            { file: "src/lib/llm/old-gemini.ts", confidence: "High" }
        ], 
        unusedDeps: ["@supabase/supabase-js"], 
        impactOfCleanup: "Removing Supabase will shave 120KB off the bundle." 
    },
    cicd: { 
        readiness: "Ready", 
        checklist: [
            { id: "va", label: "Vercel Automated Deploy", status: "Pass" },
            { id: "ts", label: "TypeScript Build Check", status: "Pass" }
        ], 
        topRisk: "None" 
    },
    apiContract: {
        totalEndpoints: 1,
        documented: "1/1",
        topEndpoints: [
            { path: "/api/analyze", method: "POST", authRequired: true, blastRadius: "High", performanceRisk: "Low", validationPresent: true }
        ]
    }
};
