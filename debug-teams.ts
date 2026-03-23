import { db } from "./src/lib/db";
import { teams, team_members } from "./src/lib/db/schema";

async function debugTeams() {
    console.log("--- Teams ---");
    const allTeams = await db.select().from(teams);
    console.log(JSON.stringify(allTeams, null, 2));

    console.log("--- Memberships ---");
    const allMembers = await db.select().from(team_members);
    console.log(JSON.stringify(allMembers, null, 2));
}

debugTeams().catch(console.error);
