'use server';

import { simulateArchitecturalChange, SimulationAction } from "@/lib/analysis/simulation-engine";
import { analyses, teams, governance_rules } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getRepoData } from "@/lib/github/client";
import { analyzeRepo } from "@/lib/llm/client";
import { createSessionClient } from "@/lib/appwrite";
import { getVCSProvider, detectProvider } from "@/lib/vcs";
import { calculateBlastRadius, buildDependencyGraph } from "@/lib/analysis/dependency-graph";
import { detectEntryPoints } from "@/lib/analysis/analysis-engine";
import { revalidatePath } from "next/cache";
import { sendHighRiskAlert, sendGovernanceNotice } from "@/lib/notifications/slack-client";
import { requireArchitect, requireMember } from "@/lib/auth/rbac";
import { generateRemediation } from "@/lib/llm/remediation-client";
import { rateLimit } from "@/lib/rate-limit";
import { generateAIObject } from "@/lib/llm/unified-client";
import { getVCSToken } from "@/lib/vcs/token";
import { z } from "zod";


/**
 * simulateRefactor
 * Executes a "What-If" simulation on a dependency graph.
 */
export async function simulateRefactor(analysisId: string, action: SimulationAction) {
    try {
        const [analysis] = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
        if (!analysis) throw new Error("Analysis not found");

        const result = analysis.result as any;
        const simulationResult = simulateArchitecturalChange(
            result.dependencySummary?.graph || {},
            result.tldr?.files || [],
            result.architectureMapping || {},
            action
        );

        return { success: true, result: simulationResult };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * generateGovernanceRule
 * Uses LLM to translate natural language into structured glob patterns.
 */
export async function generateGovernanceRule(description: string) {
    const prompt = `
    Summarize the following architectural rule into a JSON structure for our governance engine.
    Rule: "${description}"

    Return ONLY JSON in this format:
    {
        "name": "Short Descriptive Name",
        "definition": {
            "type": "dependency",
            "from": "glob/pattern/**",
            "to": "glob/pattern/**",
            "prohibited": true
        }
    }
    `;

    try {
        const { object } = await generateAIObject({
            schema: z.object({
                name: z.string(),
                definition: z.object({
                    type: z.enum(["dependency"]),
                    from: z.string(),
                    to: z.string(),
                    prohibited: z.boolean()
                }),
                description: z.string().optional()
            }),
            system: "You are an Architectural Governance Engine. Return valid JSON.",
            prompt,
            maxTokens: 1024
        });

        return { success: true, rule: object };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}


/**
 * saveGovernanceRule
 * Persists a generated rule to the database.
 */
export async function saveGovernanceRule(teamId: string, rule: any) {
    try {
        const { user } = await requireArchitect(teamId);

        await db.insert(governance_rules).values({
            id: crypto.randomUUID(),
            team_id: teamId,
            created_by: user.$id,
            name: rule.name,
            description: rule.description || "",
            definition: rule.definition,
            enforced: true,
            created_at: new Date().toISOString()
        });
        
        revalidatePath(`/team/${teamId}`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * deleteGovernanceRule
 * Removes a rule from the team's policy.
 */
export async function deleteGovernanceRule(teamId: string, ruleId: string) {
    try {
        await requireArchitect(teamId);
        
        await db.delete(governance_rules)
            .where(eq(governance_rules.id, ruleId));
        
        revalidatePath(`/team/${teamId}`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * createAnalysis
 * Initializes a new analysis record in the database.
 */
export async function createAnalysis(repoUrl: string, teamId?: string, baseUrl?: string, subPath?: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
        if (!user) throw new Error("Unauthorized");

        // Rate Limiting: 5 analyses per minute
        const limiter = rateLimit(user.$id, 5);
        if (!limiter.success) {
            return { 
                success: false, 
                error: `Too many requests. Please wait ${Math.ceil((limiter.reset - Date.now()) / 1000)}s.` 
            };
        }
    } catch {
        throw new Error("Authentication required to create an analysis record.");
    }

    let slug = crypto.randomUUID().substring(0, 8);
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
        const repoName = match[2].replace(/\.git$/, '');
        slug = `${repoName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${slug}`;
    }

    const [data] = await db.insert(analyses).values({
        id: crypto.randomUUID(),
        user_id: user.$id,
        repo_url: repoUrl,
        sub_path: subPath || null,
        base_url: baseUrl || null,
        slug: slug,
        team_id: teamId || null,
        status: 'pending'
    }).returning({ id: analyses.id, slug: analyses.slug });

    if (!data) throw new Error("Failed to initialize analysis record");
    return { id: data.id, slug: data.slug };
}

/**
 * runAnalysis
 * Performs the actual GitHub fetch and LLM analysis.
 */
export async function runAnalysis(analysisId: string, repoUrl: string) {
    const { account } = await createSessionClient();
    let user;
    try {
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        await db.update(analyses).set({ status: 'running' }).where(and(eq(analyses.id, analysisId), eq(analyses.user_id, user.$id)));

        const [analysisRecord] = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
        const baseUrl = analysisRecord?.base_url || undefined;
        const subPath = analysisRecord?.sub_path || undefined;
        const provider = getVCSProvider(repoUrl, baseUrl);
        
        let match = repoUrl.match(/(?:github\.com|gitlab\.com|bitbucket\.org)\/([^\/]+)\/([^\/]+)/);
        if (!match && baseUrl) {
            const parts = repoUrl.replace(/\/$/, '').split('/');
            if (parts.length >= 2) {
                match = [repoUrl, parts[parts.length - 2], parts[parts.length - 1]] as any;
            }
        }

        if (!match) throw new Error("Invalid Repository URL format.");
        const [, owner, repo] = match;
        const sanitizedRepo = repo.replace(/\.git$/, '');

        const userToken = await getVCSToken(repoUrl, account);

        const rawRepoData = await provider.getRepoData(owner, sanitizedRepo, userToken);
        if (subPath) {
            const normalizedSubPath = subPath.endsWith('/') ? subPath : `${subPath}/`;
            rawRepoData.tree = rawRepoData.tree.filter(p => p.startsWith(normalizedSubPath));
        }
        
        const repoData = {
            ...rawRepoData,
            description: rawRepoData.description || "",
            language: rawRepoData.language || "Unknown"
        };

        const analysisResult = await analyzeRepo(repoData, analysisRecord?.team_id || undefined);
        const summary = analysisResult.tldr?.architecture || repoData?.description?.slice(0, 180) || "Analysis completed.";

        const [updated] = await db.update(analyses)
            .set({
                status: 'completed',
                result: analysisResult,
                summary: summary,
                updated_at: new Date().toISOString()
            })
            .where(and(eq(analyses.id, analysisId), eq(analyses.user_id, user.$id)))
            .returning();

        if (updated?.team_id) {
            const [team] = await db.select().from(teams).where(eq(teams.id, updated.team_id)).limit(1);
            const riskLevel = analysisResult.riskAndDebt?.couplingRisk?.level || 'High';
            
            if (team?.slack_webhook && (riskLevel === 'High' || riskLevel === 'Med')) {
                await sendHighRiskAlert(team.slack_webhook, {
                    repoName: updated.repo_url.split('/').pop() || updated.repo_url,
                    riskLevel: riskLevel,
                    summary: analysisResult.tldr?.biggestRisk?.reason || 'Critical issues detected.',
                    reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/team/${updated.team_id}/report/${analysisId}`
                });
            }

            // 🏛️ Governance Slack Alert
            if (team?.slack_webhook && analysisResult.governance?.violations && analysisResult.governance.violations.length > 0) {
                const uniqueRules = Array.from(new Set(analysisResult.governance.violations.map((v: any) => v.ruleName)));
                await sendGovernanceNotice(team.slack_webhook, {
                    repoName: updated.repo_url.split('/').pop() || updated.repo_url,
                    violationCount: analysisResult.governance.violations.length,
                    rulesViolated: uniqueRules as string[],
                    reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/team/${updated.team_id}/report/${analysisId}`
                });
            }
        }

        revalidatePath(`/report/${analysisId}`);
        return { success: true, data: updated?.result };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        await db.update(analyses).set({ status: 'failed', error_message: errorMessage, updated_at: new Date().toISOString() }).where(and(eq(analyses.id, analysisId), eq(analyses.user_id, user.$id)));
        return { success: false, error: errorMessage };
    }
}

/**
 * createLocalAnalysis
 */
export async function createLocalAnalysis(folderName: string, files: { path: string, content: string }[], teamId?: string) {
    const { account } = await createSessionClient();
    let user;
    try {
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    const slug = `${folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomUUID().substring(0, 8)}`;
    const [analysis] = await db.insert(analyses).values({
        id: crypto.randomUUID(),
        user_id: user.$id,
        repo_url: `local://${folderName}`,
        slug: slug,
        team_id: teamId || null,
        status: 'running'
    }).returning({ id: analyses.id });

    if (!analysis) throw new Error("Failed to create analysis record");

    try {
        const tree = files.map(f => f.path);
        const fileContents: Record<string, string> = {};
        files.forEach(f => fileContents[f.path] = f.content);
        const readme = files.find(f => f.path.toLowerCase().includes('readme'))?.content || "";

        const repoData = {
            owner: user.name || "Local",
            name: folderName,
            description: "Local project upload.",
            tree,
            fileContents,
            readme,
            language: "Various"
        };

        const analysisResult = await analyzeRepo(repoData, teamId);
        await db.update(analyses).set({ status: 'completed', result: analysisResult, summary: analysisResult.tldr?.architecture || "Local analysis completed.", updated_at: new Date().toISOString() }).where(eq(analyses.id, analysis.id));

        return { success: true, id: analysis.id };
    } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        await db.update(analyses).set({ status: 'failed', error_message: error, updated_at: new Date().toISOString() }).where(eq(analyses.id, analysis.id));
        return { success: false, error };
    }
}

/**
 * deleteAnalysis
 */
export async function deleteAnalysis(analysisId: string) {
    const { account } = await createSessionClient();
    const user = await account.get();
    await db.delete(analyses).where(and(eq(analyses.id, analysisId), eq(analyses.user_id, user.$id)));
    return { success: true };
}

/**
 * reAnalyze
 */
export async function reAnalyze(slug: string) {
    try {
        const [analysis] = await db.select().from(analyses).where(eq(analyses.slug, slug)).limit(1);
        if (!analysis) throw new Error("Analysis not found");
        if (analysis.status === 'running') return { success: false, error: "Analysis is already running." };

        await db.update(analyses).set({ status: 'pending', result: null, error_message: null, updated_at: new Date().toISOString() }).where(eq(analyses.slug, slug));
        revalidatePath(`/report/${analysis.id}`);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * predictImpact
 */
export async function predictImpact(analysisId: string, filePath: string) {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
    if (!analysis || !analysis.result) throw new Error("Analysis not found");

    const result = analysis.result as any;
    const impactfulFiles = result.impactfulFiles || [];
    const match = impactfulFiles.find((f: any) => f.file === filePath);
    
    if (match) {
        return {
            file: filePath,
            reach: match.reach,
            risk: match.reach > 10 ? 'HIGH' : match.reach > 3 ? 'MEDIUM' : 'LOW',
            message: `Changing this file affects ${match.reach} other modules.`
        };
    }

    return { file: filePath, reach: 1, risk: 'LOW', message: "This file appears to have isolated impact." };
}

/**
 * generateRemediationPR
 * Orchestrates AI-driven code fixes and proposes them via PR.
 */
export async function generateRemediationPR(analysisId: string, issueType: 'violation' | 'debt', index: number) {
    const { account } = await createSessionClient();
    let user;
    try {
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        const [analysis] = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
        if (!analysis || !analysis.result) throw new Error("Analysis not found");

        const result = analysis.result as any;
        const repoUrl = analysis.repo_url;
        const provider = getVCSProvider(repoUrl, analysis.base_url || undefined);

        let issue = "";
        let filePath = "";

        if (issueType === 'violation') {
            const v = result.governance?.violations?.[index];
            if (!v) throw new Error("Violation not found");
            issue = v.message;
            filePath = v.fromFile;
        } else {
            const d = result.riskAndDebt?.top3DebtIssues?.[index];
            if (!d) throw new Error("Debt item not found");
            issue = d.issue;
            filePath = d.file;
        }

        const match = repoUrl.match(/(?:github\.com|gitlab\.com|bitbucket\.org)\/([^\/]+)\/([^\/]+)/);
        if (!match) throw new Error("Invalid Repository URL for remediation.");
        const [, owner, repo] = match;
        const sanitizedRepo = repo.replace(/\.git$/, '');

        const userToken = await getVCSToken(repoUrl, account);

        // 2. Fetch File Content
        const content = await provider.getFileContent(owner, sanitizedRepo, filePath, userToken);
        if (!content) throw new Error(`Could not fetch content for ${filePath}. Remediator needs existing code to refactor.`);

        // 3. Generate Remediation
        const remediation = await generateRemediation({
            issue,
            context: `Deep architectural analysis of ${repoUrl}`,
            fileContent: content,
            filePath
        });

        // 4. Branch & Commit Loop
        const branchName = `cb-fix-${Date.now().toString().slice(-6)}`;
        const baseBranch = result.maturity?.defaultBranch || 'main';

        await provider.createBranch(owner, sanitizedRepo, baseBranch, branchName, userToken);

        for (const file of remediation.filesToUpdate) {
            await provider.updateFile(owner, sanitizedRepo, branchName, file.path, file.content, `[Codebase Clarity] Architect Fix: ${remediation.prTitle}`, userToken);
        }

        // 5. Open PR
        const pr = await provider.createPullRequest(
            owner, 
            sanitizedRepo, 
            remediation.prTitle, 
            remediation.prBody, 
            branchName, 
            baseBranch, 
            userToken
        );

        return { success: true, prUrl: pr.html_url || pr.web_url };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
