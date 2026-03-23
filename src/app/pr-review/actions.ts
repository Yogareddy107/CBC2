'use server';

import { analyzeGitHubPR } from "@/lib/analysis/pr-analyzer";
import { createSessionClient } from "@/lib/appwrite";
import { db } from "@/lib/db";
import { analyses, teams } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { sendGovernanceNotice } from "@/lib/notifications/slack-client";

export async function runPRAnalysis(prUrl: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized: Please log in to run PR analysis.");
    }

    try {
        // Parse URL for GitHub API (e.g. https://github.com/owner/repo/pull/123)
        const match = prUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
        if (!match) {
            throw new Error("Invalid GitHub Pull Request URL format. Expected: https://github.com/owner/repo/pull/123");
        }
        const [, owner, repoWithOptGit, prNumber] = match;
        const repo = repoWithOptGit.replace(/\.git$/, '');

        const { analysis, meta, deterministicImpact, isStateful } = await analyzeGitHubPR(owner, repo, prNumber);

        // 🏛️ Slack Governance Alert for PR
        try {
            const repoUrl = `https://github.com/${owner}/${repo}`;
            const [lastAnalysis] = await db.select()
                .from(analyses)
                .where(and(eq(analyses.repo_url, repoUrl), eq(analyses.status, 'completed')))
                .orderBy(desc(analyses.created_at))
                .limit(1);
            
            if (lastAnalysis?.team_id) {
                const [team] = await db.select().from(teams).where(eq(teams.id, lastAnalysis.team_id)).limit(1);
                const governanceAlerts = (analysis as any).governanceAlerts || [];

                if (team?.slack_webhook && governanceAlerts.length > 0) {
                    const uniqueRules = Array.from(new Set(governanceAlerts.map((a: any) => a.ruleName)));
                    await sendGovernanceNotice(team.slack_webhook, {
                        repoName: `${owner}/${repo} (PR #${prNumber})`,
                        violationCount: governanceAlerts.length,
                        rulesViolated: uniqueRules as string[],
                        reportUrl: prUrl // Link directly to the PR for context
                    });
                }
            }
        } catch (slackErr) {
            console.warn("PR Slack notification failed:", slackErr);
        }

        return { 
            success: true, 
            data: { 
                ...analysis, 
                meta,
                deterministicImpact,
                isStateful
            } 
        };

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`PR Analysis failed for ${prUrl}:`, err);
        return { success: false, error: errorMessage };
    }
}
