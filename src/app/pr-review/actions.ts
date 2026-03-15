'use server';

import { getPRData } from "@/lib/github/pr-client";
import { analyzePR } from "@/lib/llm/pr-client";
import { createSessionClient } from "@/lib/appwrite";

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

        // Fetch Data from GitHub
        const prData = await getPRData(owner, repo, prNumber);

        if (!prData) {
            throw new Error(`Pull Request not found or inaccessible.`);
        }

        // Run LLM Analysis
        const analysisResult = await analyzePR(prData);

        return { success: true, data: { ...analysisResult, meta: prData } };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`PR Analysis failed for ${prUrl}:`, err);
        return { success: false, error: errorMessage };
    }
}
