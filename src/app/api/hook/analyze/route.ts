import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/appwrite";
import { getImpactRepoData } from "@/lib/github/client";
import { analyzeImpact } from "@/lib/llm/impact-client";
import { buildDependencyGraph } from "@/lib/analysis/dependency-graph";
import { calculateHealth } from "@/lib/analysis/health-report";
import { mapArchitecture } from "@/lib/analysis/analysis-engine";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { apiKey, repoUrl, files } = body;

        if (!apiKey || !repoUrl || !files || !Array.isArray(files)) {
            return NextResponse.json({ error: "Missing required fields (apiKey, repoUrl, files)" }, { status: 400 });
        }

        // 1. Verify API Key
        const user = await verifyApiKey(apiKey);
        if (!user) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        const githubToken = user.github_token;
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return NextResponse.json({ error: "Only GitHub URLs are supported for repo-level hooks currently" }, { status: 400 });
        const [, owner, repoName] = match;

        // 2. Perform Quick Analysis
        console.log(`[API Hook] Analyzing ${files.length} files for ${repoUrl}`);
        
        // We'll analyze the FIRST file deeply and give it a Blast Radius,
        // but we'll calculate an OVERALL Safety Score for the repo if possible.
        // For pre-commit, we mostly care about the files BEING CHANGED.
        
        const results = [];
        let maxRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
        const totalBlastRadius: string[] = [];

        for (const file of files) {
            try {
                const repoData = await getImpactRepoData(owner, repoName, file.path, githubToken);
                repoData.targetFileContent = file.content;
                
                const impact = await analyzeImpact(repoData);
                
                // Track max risk
                const riskOrder = { low: 0, medium: 1, high: 2, critical: 3 };
                if (riskOrder[impact.riskLevel] > riskOrder[maxRisk]) {
                    maxRisk = impact.riskLevel;
                }

                totalBlastRadius.push(...impact.blastRadius.dependentFiles.map(d => d.file));

                results.push({
                    path: file.path,
                    impact
                });
            } catch (err) {
                console.error(`[API Hook] Failed to analyze ${file.path}:`, err);
            }
        }

        // 3. Calculate Overall Safety Signal
        // We can't do a full graph rebuild for every hook call (too slow),
        // so we use the impact summaries to create a "Commit Safety" signal.
        
        const overallSafety = maxRisk === 'critical' ? 20 : (maxRisk === 'high' ? 45 : (maxRisk === 'medium' ? 75 : 95));

        return NextResponse.json({
            success: true,
            user: { name: user.name },
            summary: {
                filesAnalyzed: files.length,
                maxRisk,
                safetyScore: overallSafety,
                totalBlastRadius: Array.from(new Set(totalBlastRadius)),
            },
            details: results
        });

    } catch (error: any) {
        console.error("[API Hook] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
