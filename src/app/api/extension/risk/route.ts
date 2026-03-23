import { db } from "@/lib/db";
import { api_keys, analyses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { predictImpact } from "@/app/analyze/actions";

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

        // 1. Verify API Key
        const keyHash = createHash('sha256').update(apiKey).digest('hex');
        const [keyRecord] = await db.select().from(api_keys).where(eq(api_keys.key_hash, keyHash)).limit(1);
        
        if (!keyRecord) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });

        // Update last_used
        await db.update(api_keys).set({ last_used: new Date().toISOString() }).where(eq(api_keys.id, keyRecord.id));

        const { repoUrl, filePath } = await req.json();
        if (!repoUrl || !filePath) return NextResponse.json({ error: "repoUrl and filePath required" }, { status: 400 });

        // 2. Find the latest successful analysis for this repo
        const [analysis] = await db.select()
            .from(analyses)
            .where(and(eq(analyses.repo_url, repoUrl), eq(analyses.status, 'completed')))
            .orderBy(analyses.updated_at)
            .limit(1);

        if (!analysis || !analysis.result) {
            return NextResponse.json({ 
                error: "No completed analysis found for this repository. Please run an analysis on the web dashboard first." 
            }, { status: 404 });
        }

        // 3. Get Risk Prediction
        const riskData = await predictImpact(analysis.id, filePath);

        return NextResponse.json({
            ...riskData,
            analysisId: analysis.id,
            updatedAt: analysis.updated_at
        });
    } catch (error) {
        console.error("Extension Risk API failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
