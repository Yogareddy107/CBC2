'use server';

import { getRepoData } from "@/lib/github/client";
import { analyzeRepo } from "@/lib/llm/client";
import { db } from "@/lib/db";
import { analyses } from "@/lib/db/schema";
import { createSessionClient } from "@/lib/appwrite";
import { eq, and } from "drizzle-orm";

/**
 * 1. createAnalysis
 * Initializes a new analysis record in the database.
 */
export async function createAnalysis(repoUrl: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Authentication required to create an analysis record.");
    }

    // Initialize the record with 'pending' status
    const [data] = await db.insert(analyses).values({
        id: crypto.randomUUID(),
        user_id: user.$id,
        repo_url: repoUrl,
        status: 'pending'
    }).returning({ id: analyses.id });

    if (!data) {
        throw new Error("Failed to initialize analysis record");
    }

    return { id: data.id };
}

/**
 * 2. runAnalysis
 * Performs the actual GitHub fetch and LLM analysis.
 */
export async function runAnalysis(analysisId: string, repoUrl: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // 1. Mark as 'running'
        await db.update(analyses)
            .set({ status: 'running' })
            .where(and(eq(analyses.id, analysisId), eq(analyses.user_id, user.$id)));

        // 2. Parse URL for GitHub API
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            throw new Error("Invalid GitHub URL format.");
        }
        const [, owner, repo] = match;

        // 3. Fetch Data from GitHub
        const repoData = await getRepoData(owner, repo);

        // 4. Run LLM Analysis
        const analysisResult = await analyzeRepo(repoData);

        // 5. Finalize as 'completed'
        const summary =
            analysisResult?.onboarding?.coreDomainSummary ||
            repoData?.description?.slice(0, 180) ||
            "Summary not available";

        const [updated] = await db.update(analyses)
            .set({
                status: 'completed',
                result: analysisResult,
                result_length: JSON.stringify(analysisResult).length,
                summary: summary,
                updated_at: new Date().toISOString()
            })
            .where(and(eq(analyses.id, analysisId), eq(analyses.user_id, user.$id)))
            .returning();

        if (!updated) throw new Error("Analysis record not found for update");

        return { success: true, data: updated.result };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Analysis ${analysisId} failed:`, err);

        // 6. Record failure in the same record
        await db.update(analyses)
            .set({
                status: 'failed',
                error_message: errorMessage,
                updated_at: new Date().toISOString()
            })
            .where(and(eq(analyses.id, analysisId), eq(analyses.user_id, user.$id)));

        return { success: false, error: errorMessage };
    }
}

/**
 * 3. deleteAnalysis
 * Deletes an analysis record.
 */
export async function deleteAnalysis(analysisId: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Authentication required to delete an analysis.");
    }

    await db.delete(analyses)
        .where(and(eq(analyses.id, analysisId), eq(analyses.user_id, user.$id)));

    return { success: true };
}
