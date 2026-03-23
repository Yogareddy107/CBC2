import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { api_keys, analyses } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createHash, randomUUID } from "node:crypto";
import { buildDependencyGraph, calculateBlastRadius } from "@/lib/analysis/dependency-graph";

function hashKey(key: string) {
    return createHash('sha256').update(key).digest('hex');
}

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
        return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    // 1. Authenticate API Key
    const keyHash = hashKey(apiKey);
    const [keyRecord] = await db.select().from(api_keys).where(eq(api_keys.key_hash, keyHash)).limit(1);

    if (!keyRecord) {
        return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { repoUrl, files } = body;

        if (!repoUrl || !files || !Array.isArray(files)) {
            return NextResponse.json({ error: "Invalid body. Expected repoUrl and files array." }, { status: 400 });
        }

        // 2. Find latest analysis for this repo and user
        const [analysis] = await db.select()
            .from(analyses)
            .where(and(eq(analyses.repo_url, repoUrl), eq(analyses.user_id, keyRecord.user_id)))
            .orderBy(desc(analyses.created_at))
            .limit(1);

        if (!analysis || !analysis.result) {
            return NextResponse.json({ error: "No completed analysis found for this repository. Please run an analysis in the CBC dashboard first." }, { status: 404 });
        }

        // 3. Reconstruct graph from stored tree
        const result = analysis.result as any;
        const tree = result.tree || []; // Fallback to empty if not found
        
        // We use the dependency graph logic
        // For a public API, we might want to store the graph, but for now we rebuild from tree
        const graph = buildDependencyGraph(tree, {});
        
        const impacts = files.map(file => {
            const radius = calculateBlastRadius(graph, file);
            return {
                file,
                reach: radius.reach,
                risk: radius.reach > 10 ? 'CRITICAL' : radius.reach > 5 ? 'HIGH' : radius.reach > 2 ? 'MEDIUM' : 'LOW',
                affectedModules: radius.affectedNodes.slice(0, 10) // Limit output
            };
        });

        // Update last_used
        await db.update(api_keys).set({ last_used: new Date().toISOString() }).where(eq(api_keys.id, keyRecord.id));

        return NextResponse.json({
            success: true,
            repoUrl,
            impacts
        });

    } catch (err) {
        console.error("API Predict Impact error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
