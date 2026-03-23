'use server';

import { db } from "@/lib/db";
import { teams, team_members, analyses, comments, file_reviews, team_checklists } from "@/lib/db/schema";
import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { eq, and, desc, sql, count } from "drizzle-orm";

/**
 * 1. Create a Team
 */
export async function createTeam(name: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Generate a 12-char unique invite code
        const inviteCode = crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();

        const [newTeam] = await db.insert(teams).values({
            id: crypto.randomUUID(),
            name: name,
            invite_code: inviteCode,
            owner_id: user.$id,
            plan: 'free'
        }).returning();

        if (!newTeam) throw new Error("Failed to create team.");

        // Add creator as admin member
        await db.insert(team_members).values({
            id: crypto.randomUUID(),
            team_id: newTeam.id,
            user_id: user.$id,
            role: "admin"
        });

        return { success: true, team: newTeam };
    } catch (err: any) {
        console.error("Team creation error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 1.5 Join a Team via Invite Code
 */
export async function joinTeam(inviteCode: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Find team by invite code
        const [team] = await db.select().from(teams)
            .where(eq(teams.invite_code, inviteCode.toUpperCase()))
            .limit(1);

        if (!team) throw new Error("Invalid invite code.");

        // Check if already a member
        const [existingMember] = await db.select().from(team_members)
            .where(and(eq(team_members.team_id, team.id), eq(team_members.user_id, user.$id)))
            .limit(1);

        if (existingMember) {
            return { success: true, teamId: team.id, message: "Already a member." };
        }

        // Check limits for free plan (e.g. 10 members max as per prompt core concept)
        const members = await db.select().from(team_members).where(eq(team_members.team_id, team.id));
        if (team.plan === 'free' && members.length >= 2) {
            // The prompt says "When free team hits 2 member limit → Show banner"
            // We should probably allow them to join but show the banner in UI, 
            // OR enforce it here if it's a hard limit. 
            // The prompt says "Never hard block — always show upgrade path first".
            // So we allow joining but the UI will handle the upsell features.
        }

        await db.insert(team_members).values({
            id: crypto.randomUUID(),
            team_id: team.id,
            user_id: user.$id,
            role: "member"
        });

        return { success: true, teamId: team.id };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 2. Get User's Teams
 */
export async function getUserTeams() {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Find all teams where user is a member
        const memberships = await db.select({
            teamId: team_members.team_id,
            role: team_members.role,
            teamName: teams.name,
            ownerId: teams.owner_id,
            inviteCode: teams.invite_code,
            createdAt: teams.created_at
        })
        .from(team_members)
        .innerJoin(teams, eq(team_members.team_id, teams.id))
        .where(eq(team_members.user_id, user.$id))
        .orderBy(desc(teams.created_at));
        
        console.log(`[getUserTeams] Found ${memberships.length} teams for user ${user.$id}:`, JSON.stringify(memberships, null, 2));

        return { success: true, teams: memberships };
    } catch (err: any) {
        console.error("[getUserTeams] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 3. Invite Member (Dummy implementation for now. In real app, sends email with join link)
 */
export async function inviteMember(teamId: string, email: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Verify user is admin of this team
        const [membership] = await db.select().from(team_members)
            .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, user.$id), eq(team_members.role, 'admin')))
            .limit(1);

        if (!membership) {
            throw new Error("Only team admins can invite members.");
        }

        // Logic here would typically:
        // 1. Create an invite token in the DB
        // 2. Send email via Resend/SendGrid
        // For now, we will just return success to simulate the flow
        
        return { success: true, message: `Invite sent to ${email} (Simulated)` };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
/**
 * 4. Get Team's Shared Library (Analyses)
 */
export async function getTeamAnalyses(teamId: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Verify user is member of this team
        const [membership] = await db.select().from(team_members)
            .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, user.$id)))
            .limit(1);

        if (!membership) throw new Error("Access denied to this team.");

        const teamAnalyses = await db.select()
            .from(analyses)
            .where(eq(analyses.team_id, teamId))
            .orderBy(desc(analyses.updated_at));

        return { success: true, analyses: teamAnalyses };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 5. Get Team Checklist
 */
export async function getTeamChecklist(teamId: string) {
    try {
        const items = await db.select().from(team_checklists)
            .where(eq(team_checklists.team_id, teamId))
            .orderBy(desc(team_checklists.created_at));
        return { success: true, items };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 6. Toggle Checklist Item
 */
export async function toggleChecklistItem(itemId: string, completed: boolean) {
    try {
        await db.update(team_checklists)
            .set({ completed })
            .where(eq(team_checklists.id, itemId));
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 7. Add Comment to Analysis Section
 */
export async function addComment(analysisId: string, sectionId: string, content: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        const [newComment] = await db.insert(comments).values({
            id: crypto.randomUUID(),
            analysis_id: analysisId,
            user_id: user.$id,
            section_id: sectionId,
            content: content
        }).returning();

        return { success: true, comment: newComment };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 8. Get Comments for Analysis
 */
export async function getComments(analysisId: string) {
    try {
        const results = await db.select().from(comments)
            .where(eq(comments.analysis_id, analysisId))
            .orderBy(desc(comments.created_at));
        return { success: true, comments: results };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 9. Update File Review Status
 */
export async function updateFileReview(params: {
    analysisId: string;
    teamId: string;
    filePath: string;
    status: 'pending' | 'reviewed' | 'flagged';
    note?: string;
}) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Check if review already exists for this file/analysis/team
        const [existing] = await db.select().from(file_reviews)
            .where(and(
                eq(file_reviews.analysis_id, params.analysisId),
                eq(file_reviews.team_id, params.teamId),
                eq(file_reviews.file_path, params.filePath)
            ))
            .limit(1);

        if (existing) {
            await db.update(file_reviews)
                .set({ 
                    status: params.status, 
                    note: params.note,
                    reviewer_id: user.$id,
                    created_at: new Date().toISOString() 
                })
                .where(eq(file_reviews.id, existing.id));
            
            return { success: true, action: 'updated' };
        }

        await db.insert(file_reviews).values({
            id: crypto.randomUUID(),
            analysis_id: params.analysisId,
            team_id: params.teamId,
            file_path: params.filePath,
            reviewer_id: user.$id,
            status: params.status,
            note: params.note
        });

        return { success: true, action: 'created' };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 10. Get File Reviews
 */
export async function getFileReviews(analysisId: string, teamId: string) {
    try {
        const reviews = await db.select().from(file_reviews)
            .where(and(eq(file_reviews.analysis_id, analysisId), eq(file_reviews.team_id, teamId)));

        if (reviews.length === 0) return { success: true, reviews: [] };

        // Fetch user info from Appwrite Admin
        const admin = await createAdminClient();
        const users = admin.users;

        const reviewsWithInfo = await Promise.all(reviews.map(async (r) => {
            try {
                const user = await users.get(r.reviewer_id);
                return {
                    ...r,
                    reviewerName: user.name || 'Unknown',
                    reviewerEmail: user.email,
                    reviewerAvatar: user.name ? user.name[0].toUpperCase() : 'U'
                };
            } catch {
                return { ...r, reviewerName: 'Unknown User', reviewerEmail: 'N/A', reviewerAvatar: '?' };
            }
        }));

        return { success: true, reviews: reviewsWithInfo };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}


/**
 * 11. Get Team Members with user details
 */
export async function getTeamMembers(teamId: string) {
    try {
        const memberships = await db.select()
            .from(team_members)
            .where(eq(team_members.team_id, teamId));

        if (memberships.length === 0) return { success: true, members: [] };

        // Fetch user info from Appwrite Admin
        const admin = await createAdminClient();
        const users = admin.users;
        
        const membersWithInfo = await Promise.all(memberships.map(async (m) => {
            try {
                const user = await users.get(m.user_id);
                return {
                    ...m,
                    name: user.name || 'Unknown',
                    email: user.email,
                    avatar: user.name ? user.name[0].toUpperCase() : 'U'
                };
            } catch {
                return { ...m, name: 'Inactive User', email: 'N/A', avatar: '?' };
            }
        }));

        return { success: true, members: membersWithInfo };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 12. Get Team Stats (Real)
 */
export async function getTeamStats(teamId: string) {
    try {
        const [aCount] = await db.select({ value: count() }).from(analyses).where(eq(analyses.team_id, teamId));
        const [rCount] = await db.select({ value: count() }).from(file_reviews).where(eq(file_reviews.team_id, teamId));
        
        // Calculate Avg Maturity
        const teamAnalyses = await db.select({ result: analyses.result }).from(analyses).where(eq(analyses.team_id, teamId));
        let totalMaturity = 0;
        let validMaturityCount = 0;

        teamAnalyses.forEach(a => {
            const res = a.result as any;
            if (res?.healthBreakdown?.score) {
                const score = res.healthBreakdown.score;
                if (typeof score === 'number') {
                    totalMaturity += score;
                    validMaturityCount++;
                }
            } else if (res?.modernityMetrics?.score) {
                // Fallback for legacy analyses
                const scoreStr = res.modernityMetrics.score;
                const score = parseInt(String(scoreStr).replace('%', ''));
                if (!isNaN(score)) {
                    totalMaturity += score;
                    validMaturityCount++;
                }
            }
        });

        const avgMaturity = validMaturityCount > 0 ? Math.round(totalMaturity / validMaturityCount) : 0;

        // Get recent high-risk alerts
        const highRiskAnalyses = teamAnalyses
            .filter(a => {
                const res = a.result as any;
                return res?.securityOverview?.riskLevel === 'High' || res?.securityOverview?.riskLevel === 'Critical';
            })
            .length;

        return {
            success: true,
            stats: {
                totalAnalyses: Number(aCount.value) || 0,
                filesReviewed: Number(rCount.value) || 0,
                avgMaturity: `${avgMaturity}%`,
                highRiskAlerts: highRiskAnalyses
            }
        };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 13. Update Team Settings (Slack Webhook, etc.)
 */
export async function updateTeamSettings(teamId: string, data: { slackWebhook?: string }) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Verify admin
        const [membership] = await db.select().from(team_members)
            .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, user.$id), eq(team_members.role, 'admin')))
            .limit(1);

        if (!membership) throw new Error("Only team admins can update settings.");

        await db.update(teams)
            .set({ 
                slack_webhook: data.slackWebhook 
            })
            .where(eq(teams.id, teamId));

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 14. Get Team Settings
 */
export async function getTeamSettings(teamId: string) {
    try {
        const [team] = await db.select({
            slackWebhook: teams.slack_webhook,
            plan: teams.plan,
            name: teams.name,
            invite_code: teams.invite_code,
        }).from(teams).where(eq(teams.id, teamId)).limit(1);

        return { success: true, settings: team };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 17. Get Team Health Trends
 */
export async function getTeamHealthTrends(teamId: string) {
    try {
        const history = await db.select({
            id: analyses.id,
            repo_url: analyses.repo_url,
            result: analyses.result,
            created_at: analyses.created_at
        })
        .from(analyses)
        .where(eq(analyses.team_id, teamId))
        .orderBy(analyses.created_at);

        // Group by Date and calculate averages
        const trends = history.map(h => {
            const res = h.result as any;
            return {
                date: new Date(h.created_at!).toLocaleDateString(),
                score: res?.healthBreakdown?.score || 0,
                adherence: res?.governance?.adherenceScore || 100,
                repo: h.repo_url.split('/').pop()
            };
        });

        return { success: true, trends };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 15. Update Member Role
 */
export async function updateMemberRole(teamId: string, userId: string, newRole: "admin" | "architect" | "member") {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Verify current user is admin
        const [membership] = await db.select().from(team_members)
            .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, user.$id), eq(team_members.role, 'admin')))
            .limit(1);

        if (!membership) throw new Error("Only team admins can manage roles.");

        await db.update(team_members)
            .set({ role: newRole })
            .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, userId)));

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * 16. Remove Member from Team
 */
export async function removeMember(teamId: string, userId: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Verify current user is admin
        const [membership] = await db.select().from(team_members)
            .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, user.$id), eq(team_members.role, 'admin')))
            .limit(1);

        if (!membership) throw new Error("Only team admins can remove members.");

        // Prevent self-removal if last admin
        const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
        if (team?.owner_id === userId) {
            throw new Error("The team owner cannot be removed.");
        }

        await db.delete(team_members)
            .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, userId)));

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
/**
 * 18. Update Team Name
 */
export async function updateTeam(teamId: string, name: string) {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch {
        throw new Error("Unauthorized");
    }

    try {
        // Verify current user is admin
        const [membership] = await db.select().from(team_members)
            .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, user.$id), eq(team_members.role, 'admin')))
            .limit(1);

        if (!membership) throw new Error("Only team admins can update team settings.");

        await db.update(teams)
            .set({ name })
            .where(eq(teams.id, teamId));

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
