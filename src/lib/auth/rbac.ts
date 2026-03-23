import { db } from "@/lib/db";
import { team_members, teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createSessionClient } from "@/lib/appwrite";

export type Role = "admin" | "architect" | "member";

const ROLE_HIERARCHY: Record<Role, number> = {
    "admin": 3,
    "architect": 2,
    "member": 1,
};

/**
 * getUserRole
 * Fetches the user's role in a specific team.
 */
export async function getUserRole(teamId: string, userId: string): Promise<Role | null> {
    // 1. Check if user is the direct owner of the team
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (team?.owner_id === userId) return "admin";

    // 2. Check team_members table
    const [membership] = await db.select()
        .from(team_members)
        .where(and(eq(team_members.team_id, teamId), eq(team_members.user_id, userId)))
        .limit(1);

    return (membership?.role as Role) || null;
}

/**
 * checkPermission
 * Ensures the user has at least the required role level.
 */
export async function checkPermission(teamId: string, requiredRole: Role) {
    const { account } = await createSessionClient();
    const user = await account.get();
    
    const role = await getUserRole(teamId, user.$id);
    if (!role) throw new Error("Not a member of this team.");

    if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
        throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
    }

    return { user, role };
}

/**
 * Convenient shorthands
 */
export const requireMember = (teamId: string) => checkPermission(teamId, "member");
export const requireArchitect = (teamId: string) => checkPermission(teamId, "architect");
export const requireAdmin = (teamId: string) => checkPermission(teamId, "admin");
