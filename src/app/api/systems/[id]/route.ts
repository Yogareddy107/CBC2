import { createSessionClient } from "@/lib/appwrite";
import { db } from "@/lib/db";
import { systems, system_analyses, analyses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

// Get details of a specific system
export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;
        const { account } = await createSessionClient();
        const user = await account.get();

        const [system] = await db.select()
            .from(systems)
            .where(and(eq(systems.id, id), eq(systems.user_id, user.$id)))
            .limit(1);

        if (!system) {
            return NextResponse.json({ error: "System not found" }, { status: 404 });
        }

        // Fetch linked analyses
        const linkedAnalyses = await db.select({
            id: analyses.id,
            repo_url: analyses.repo_url,
            status: analyses.status,
            summary: analyses.summary,
            updated_at: analyses.updated_at
        })
        .from(system_analyses)
        .innerJoin(analyses, eq(system_analyses.analysis_id, analyses.id))
        .where(eq(system_analyses.system_id, id));

        return NextResponse.json({ ...system, analyses: linkedAnalyses });
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// Update system (add/remove analyses)
export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;
        const { account } = await createSessionClient();
        const user = await account.get();

        const { name, description, analysisIdsToAdd, analysisIdsToRemove } = await req.json();

        // 1. Verify ownership
        const [system] = await db.select().from(systems)
            .where(and(eq(systems.id, id), eq(systems.user_id, user.$id)))
            .limit(1);
        if (!system) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // 2. Update basic info
        if (name || description) {
            await db.update(systems)
                .set({ 
                    name: name || system.name, 
                    description: description !== undefined ? description : system.description,
                    updated_at: new Date().toISOString()
                })
                .where(eq(systems.id, id));
        }

        // 3. Add analyses
        if (analysisIdsToAdd && Array.isArray(analysisIdsToAdd)) {
            for (const analysisId of analysisIdsToAdd) {
                // Check if already exists to avoid duplicates
                const [existing] = await db.select().from(system_analyses)
                    .where(and(eq(system_analyses.system_id, id), eq(system_analyses.analysis_id, analysisId)))
                    .limit(1);
                
                if (!existing) {
                    await db.insert(system_analyses).values({
                        id: crypto.randomUUID(),
                        system_id: id,
                        analysis_id: analysisId
                    });
                }
            }
        }

        // 4. Remove analyses
        if (analysisIdsToRemove && Array.isArray(analysisIdsToRemove)) {
            for (const analysisId of analysisIdsToRemove) {
                await db.delete(system_analyses)
                    .where(and(eq(system_analyses.system_id, id), eq(system_analyses.analysis_id, analysisId)));
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// Delete system
export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const id = params.id;
        const { account } = await createSessionClient();
        const user = await account.get();

        await db.delete(systems)
            .where(and(eq(systems.id, id), eq(systems.user_id, user.$id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
