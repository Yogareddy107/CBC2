import { analyzePR } from "@/lib/llm/pr-client";
import { getVCSProvider } from "@/lib/vcs/factory";
import { buildDependencyGraph, calculateBlastRadius } from "@/lib/analysis/dependency-graph";
import { db } from "@/lib/db";
import { analyses, governance_rules } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { checkGovernanceRules } from "@/lib/analysis/governance";

export async function analyzeGitHubPR(owner: string, repo: string, prNumber: string, urlOverride?: string) {
    const vcsUrl = urlOverride || `https://github.com/${owner}/${repo}`;
    const provider = getVCSProvider(vcsUrl);

    // 1. Fetch PR Data
    const prData = await provider.getPRData(owner, repo, prNumber);
    if (!prData) throw new Error("PR not found");

    // 2. Fetch Stateful Architectural Context & Team ID
    let deterministicImpact: any[] = [];
    let existingAnalysis: any = null;
    let systemContext = "";
    let teamId: string | null = null;

    try {
        const [lastAnalysis] = await db.select()
            .from(analyses)
            .where(and(
                eq(analyses.repo_url, vcsUrl),
                eq(analyses.status, 'completed')
            ))
            .orderBy(desc(analyses.created_at))
            .limit(1);

        if (lastAnalysis && lastAnalysis.result) {
            existingAnalysis = lastAnalysis.result;
            teamId = lastAnalysis.team_id;
            const healthReport = (existingAnalysis as any).healthReport;
            const hotspots = healthReport?.hotspots || [];
            const graph = (existingAnalysis as any).dependencyGraph || {};
            
            systemContext = `
LAST FULL ANALYSIS SUMMARY:
- Overall Health Score: ${healthReport?.score || 'N/A'}
- Detected Hotspots: ${hotspots.length}
- Maturity Rating: ${(existingAnalysis as any).maturity?.rating || 'Unknown'}

KNOWN REPOSITORY HOTSPOTS (FILES TO WATCH):
${hotspots.map((h: any) => `- ${h.file}: ${h.reason}`).join('\n')}
`;

            deterministicImpact = prData.diffContext.map((fileMatch: any) => {
                const radius = calculateBlastRadius(graph, fileMatch.filename);
                const reach = radius.reach;
                return {
                    file: fileMatch.filename,
                    reach,
                    risk: reach > 10 ? 'CRITICAL' : reach > 5 ? 'HIGH' : reach > 2 ? 'MEDIUM' : 'LOW',
                    affectedModules: radius.affectedNodes
                };
            });
        } else {
            // Fallback to basic graph
            const fullRepo = await provider.getRepoData(owner, repo);
            const graph = buildDependencyGraph(fullRepo.tree, {});
            deterministicImpact = prData.diffContext.map((fileMatch: any) => {
                const radius = calculateBlastRadius(graph, fileMatch.filename);
                const reach = radius.reach;
                return {
                    file: fileMatch.filename,
                    reach,
                    risk: reach > 10 ? 'CRITICAL' : reach > 5 ? 'HIGH' : reach > 2 ? 'MEDIUM' : 'LOW',
                    affectedModules: radius.affectedNodes
                };
            });
        }
    } catch (e) {
        console.warn("PR Analysis: Context retrieval failed", e);
    }

    // 2.5 🏛️ Check Governance Rules
    let governanceViolations: any[] = [];
    if (teamId) {
        try {
            const rules = await db.select()
                .from(governance_rules)
                .where(and(
                    eq(governance_rules.team_id, teamId),
                    eq(governance_rules.enforced, true)
                ));
            
            if (rules.length > 0) {
                // We use the full graph if available, or build one
                const fullRepo = await provider.getRepoData(owner, repo);
                const graph = buildDependencyGraph(fullRepo.tree, {});
                governanceViolations = checkGovernanceRules(graph, rules as any);
                
                // Filter violations to only those touching files in this PR
                const changedFiles = new Set(prData.diffContext.map((f: any) => f.filename));
                governanceViolations = governanceViolations.filter(v => 
                    changedFiles.has(v.fromFile) || changedFiles.has(v.toFile)
                );
            }
        } catch (err) {
            console.error("PR Governance check failed:", err);
        }
    }

    // 3. Run LLM Analysis
    const analysisResult = await analyzePR({ 
        ...prData, 
        deterministicImpact,
        systemContext,
        governanceAlerts: governanceViolations.map(v => ({
            ruleName: v.ruleName,
            violation: v.message,
            severity: v.severity,
            advice: `Architectural violation: ${v.fromFile} depends on ${v.toFile} which is prohibited by ${v.ruleName}.`
        }))
    });

    return {
        analysis: analysisResult,
        meta: prData,
        deterministicImpact,
        isStateful: !!existingAnalysis
    };
}
