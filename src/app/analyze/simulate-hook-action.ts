'use server';

import { getImpactRepoData } from "@/lib/github/client";
import { analyzeImpact } from "@/lib/llm/impact-client";
import { createSessionClient } from "@/lib/appwrite";

/**
 * Simulates a Git pre-commit hook.
 * Takes a file path and the proposed content change.
 */
export async function simulatePreCommitHook(repoUrl: string, filePath: string, proposedContent: string) {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        const prefs = await account.getPrefs();
        const userToken = prefs.github_token;

        // 1. Parse URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) throw new Error("Invalid GitHub URL");
        const [, owner, repo] = match;

        // 2. Fetch context for the specific file
        // Note: We use the proposed content as the "target content" for analysis
        const repoDataForImpact = await getImpactRepoData(owner, repo, filePath, userToken);
        repoDataForImpact.targetFileContent = proposedContent; // Use the simulated change

        // 3. Run Impact Analysis
        const impact = await analyzeImpact(repoDataForImpact);

        // 4. Determine Approval Status
        let approved = true;
        let message = "Analysis complete. Low risk detected.";

        if (impact.riskLevel === 'high' || impact.riskLevel === 'critical') {
            approved = false;
            message = `Warning: ${impact.riskLevel.toUpperCase()} risk change detected in ${filePath}.`;
        }

        // Check for missing test coverage hints in impact analysis
        const needsTests = impact.coUpdateSuggestions.some(s => s.file.toLowerCase().includes('test') || s.reason.toLowerCase().includes('test'));
        if (!needsTests && !filePath.includes('test')) {
             // Heuristic: if no test file is suggested for update but it's a high risk file
             if (impact.riskLevel === 'high') {
                 message += " Missing test coverage for this module is a concern.";
             }
        }

        return {
            success: true,
            approved,
            message,
            impact: {
                summary: impact.summary,
                riskLevel: impact.riskLevel,
                blastRadius: impact.blastRadius.dependentFiles.map(d => d.file),
                warning: impact.warning
            }
        };

    } catch (error: any) {
        console.error("[Pre-commit Hook Simulator] Error:", error);
        return { success: false, error: error.message };
    }
}
