'use server';

import { getImpactRepoData } from "@/lib/github/client";
import { analyzeImpact } from "@/lib/llm/impact-client";
import { createSessionClient } from "@/lib/appwrite";

export async function runImpactAnalysis(repoUrl: string, targetFile: string) {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        // 1. Parse URL for GitHub API
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            throw new Error("Invalid GitHub URL format.");
        }
        const [, owner, repo] = match;

        // 2. Fetch user's GitHub Token from preferences
        let userToken: string | undefined;
        try {
            const prefs = await account.getPrefs();
            userToken = prefs.github_token;
        } catch (e) {
            console.warn("Failed to fetch user prefs for GitHub token", e);
        }

        // 3. Fetch Data from GitHub focused on this file
        const repoData = await getImpactRepoData(owner, repo.replace(/\.git$/, ''), targetFile, userToken);

        if (!repoData.targetFileContent) {
            throw new Error(`File '${targetFile}' not found or is empty in the repository.`);
        }

        // 4. Run LLM Analysis
        const analysisResult = await analyzeImpact(repoData);

        return { success: true, data: analysisResult };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Impact Analysis failed for ${targetFile}:`, err);
        return { success: false, error: errorMessage };
    }
}
