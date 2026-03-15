'use server';

import { getImpactRepoData } from "@/lib/github/client";
import { analyzeImpact } from "@/lib/llm/impact-client";
import { createSessionClient } from "@/lib/appwrite";

export async function runImpactAnalysis(repoUrl: string, targetFile: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized: Please log in to run impact analysis.");
    }

    try {
        // Parse URL for GitHub API
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            throw new Error("Invalid GitHub URL format.");
        }
        const [, owner, repo] = match;

        // Fetch Data from GitHub focused on this file
        const repoData = await getImpactRepoData(owner, repo.replace(/\.git$/, ''), targetFile);

        if (!repoData.targetFileContent) {
            throw new Error(`File '${targetFile}' not found or is empty in the repository.`);
        }

        // Run LLM Analysis
        const analysisResult = await analyzeImpact(repoData);

        return { success: true, data: analysisResult };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Impact Analysis failed for ${targetFile}:`, err);
        return { success: false, error: errorMessage };
    }
}
