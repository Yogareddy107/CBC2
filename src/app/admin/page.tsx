import { db } from '@/lib/db';
import { 
    analyses as analysesTable, 
    subscriptions as subscriptionsTable,
    teams as teamsTable,
    comments as commentsTable,
    governance_rules as governanceRulesTable,
    team_members as teamMembersTable,
    file_reviews as fileReviewsTable
} from '@/lib/db/schema';
import { createSessionClient, createAdminClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import {
    Card,
    CardHeader,
    CardContent
} from "@/components/ui/card";
import Link from 'next/link';
import { AdminTables } from '@/components/admin/AdminTables';
import { count, eq, gt, sql, sum, desc } from 'drizzle-orm';
import { NotificationBell } from '@/components/NotificationBell';
import { BroadcastBox } from '@/components/BroadcastBox';

import { isAdminEmail } from '@/lib/admin';

export default async function AdminDashboard() {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch (e) {
        redirect('/login');
    }

    // 1. Access Control
    if (!isAdminEmail(user.email)) {
        redirect('/dashboard');
    }

    const { users } = await createAdminClient();

    // 2. Fetch Metrics using Drizzle and Appwrite
    // Total Users - from Appwrite
    const totalUsersResponse = await users.list();
    const totalUsers = totalUsersResponse.total;

    // Total Analyses
    const [totalAnalysesResult] = await db.select({ value: count() }).from(analysesTable);
    const totalAnalyses = totalAnalysesResult.value;

    // Success Rate
    const [successfulAnalysesResult] = await db.select({ value: count() })
        .from(analysesTable)
        .where(eq(analysesTable.status, 'completed'));
    const successfulAnalyses = successfulAnalysesResult.value;

    const successRate = totalAnalyses > 0
        ? ((successfulAnalyses || 0) / totalAnalyses * 100).toFixed(1)
        : 0;

    // Analyses last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [analysesLast7DaysResult] = await db.select({ value: count() })
        .from(analysesTable)
        .where(gt(analysesTable.created_at, sevenDaysAgo.toISOString()));
    const analysesLast7Days = analysesLast7DaysResult.value;

    // Analyses today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [analysesTodayResult] = await db.select({ value: count() })
        .from(analysesTable)
        .where(gt(analysesTable.created_at, todayStart.toISOString()));
    const analysesToday = analysesTodayResult.value;

    // Total Subscription Money
    let totalRevenue = 0;
    let paidSubscribers = 0;
    
    try {
        const [totalRevenueResult] = await db.select({ value: sum(subscriptionsTable.amount) })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.status, 'active'));
        totalRevenue = Number(totalRevenueResult?.value) || 0;

        const [paidSubscribersResult] = await db.select({ value: count() })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.status, 'active'));
        paidSubscribers = paidSubscribersResult?.value || 0;
    } catch (error) {
        totalRevenue = 0;
        paidSubscribers = 0;
    }

    // --- 1.0 Feature Metrics ---
    let totalGovernanceRules = 0;
    let totalTeamMembers = 0;
    let totalArchitects = 0;
    let totalFileReviews = 0;
    let githubAnalyses = 0;
    let gitlabAnalyses = 0;

    try {
        const [govResult] = await db.select({ value: count() }).from(governanceRulesTable);
        totalGovernanceRules = govResult?.value || 0;
    } catch { totalGovernanceRules = 0; }

    try {
        const [membersResult] = await db.select({ value: count() }).from(teamMembersTable);
        totalTeamMembers = membersResult?.value || 0;

        const [architectsResult] = await db.select({ value: count() })
            .from(teamMembersTable)
            .where(eq(teamMembersTable.role, 'architect'));
        totalArchitects = architectsResult?.value || 0;
    } catch { totalTeamMembers = 0; totalArchitects = 0; }

    try {
        const [reviewsResult] = await db.select({ value: count() }).from(fileReviewsTable);
        totalFileReviews = reviewsResult?.value || 0;
    } catch { totalFileReviews = 0; }

    // VCS Provider Distribution
    try {
        const allAnalyses = await db.select({ repoUrl: analysesTable.repo_url }).from(analysesTable);
        allAnalyses.forEach(a => {
            if (a.repoUrl?.includes('gitlab')) gitlabAnalyses++;
            else githubAnalyses++;
        });
    } catch { githubAnalyses = 0; gitlabAnalyses = 0; }

    // 3. Fetch User Table Data and create user email map
    const userEmailMap = new Map<string, string>();
    totalUsersResponse.users.forEach(u => {
        userEmailMap.set(u.$id, u.email);
    });

    // 3a. Fetch total analyses per user
    const analysesPerUser = await db.select({
        user_id: analysesTable.user_id,
        count: count(),
    })
        .from(analysesTable)
        .groupBy(analysesTable.user_id);

    const analysesCountMap = new Map<string, number>();
    analysesPerUser.forEach((row) => {
        analysesCountMap.set(row.user_id, Number(row.count) || 0);
    });

    const userData = totalUsersResponse.users.map(u => ({
        id: u.$id,
        email: u.email,
        fullName: u.name || 'N/A',
        signupDate: u.$createdAt,
        totalAnalyses: analysesCountMap.get(u.$id) || 0,
        lastActive: u.accessedAt || 'N/A',
        plan: 'Free'
    }));

    // 4. Fetch Recent Analyses
    const recentAnalyses = await db.select()
        .from(analysesTable)
        .orderBy(sql`${analysesTable.created_at} DESC`)
        .limit(20);

    const formattedAnalyses = recentAnalyses.map(a => ({
        id: a.id,
        repoUrl: a.repo_url,
        userEmail: userEmailMap.get(a.user_id) || a.user_id,
        createdAt: a.created_at ? new Date(a.created_at).toISOString() : '',
        status: a.status
    }));

    // 5. Fetch Total Teams and Comments
    const [totalTeamsResult] = await db.select({ value: count() }).from(teamsTable);
    const totalTeams = Number(totalTeamsResult.value) || 0;

    const [totalCommentsResult] = await db.select({ value: count() }).from(commentsTable);
    const totalComments = Number(totalCommentsResult.value) || 0;

    // 6. Fetch Top Repositories
    const rawTopRepos = await db.select({
        repoUrl: analysesTable.repo_url,
        count: count()
    })
    .from(analysesTable)
    .groupBy(analysesTable.repo_url)
    .orderBy(desc(count()))
    .limit(5);

    const topRepos = rawTopRepos.map(r => ({
        repoUrl: r.repoUrl || 'Unknown',
        count: Number(r.count) || 0
    }));

    // 7. Fetch Recent Teams
    const recentTeamsRaw = await db.select()
        .from(teamsTable)
        .orderBy(desc(teamsTable.created_at))
        .limit(10);

    const formattedTeams = recentTeamsRaw.map(t => ({
        id: t.id,
        name: t.name,
        inviteCode: t.invite_code,
        ownerEmail: userEmailMap.get(t.owner_id) || 'Unknown',
        createdAt: t.created_at ? new Date(t.created_at).toISOString() : '',
        plan: t.plan
    }));

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-10">
                <header className="flex justify-between items-center border-b pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground text-sm">Internal engineering control panel — <span className="font-semibold text-[#FF7D29]">v1.0</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Link href="/dashboard" className="text-sm font-medium hover:underline">
                            Back to App
                        </Link>
                    </div>
                </header>

                {/* SECTION A — Core Overview Metrics */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Core Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="Total Users" value={totalUsers} />
                        <MetricCard title="Paid Subscribers" value={paidSubscribers} />
                        <MetricCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} />
                        <MetricCard title="Active Teams" value={totalTeams} />
                        <MetricCard title="Total Analyses" value={totalAnalyses} />
                        <MetricCard title="Success Rate" value={`${successRate}%`} />
                        <MetricCard title="Last 7 Days" value={analysesLast7Days} />
                        <MetricCard title="Analyses Today" value={analysesToday} />
                    </div>
                </section>

                {/* SECTION A2 — 1.0 Feature Metrics */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#FF7D29] mb-4">1.0 Feature Intelligence</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard title="Governance Rules" value={totalGovernanceRules} label="Active rules across all teams" />
                        <FeatureCard title="RBAC Members" value={totalTeamMembers} label={`${totalArchitects} architect${totalArchitects !== 1 ? 's' : ''} assigned`} />
                        <FeatureCard title="File Reviews" value={totalFileReviews} label="Team sign-offs completed" />
                        <FeatureCard title="Collaboration" value={totalComments} label="Discussion threads" />
                    </div>
                </section>

                {/* SECTION A3 — VCS Provider Distribution */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">VCS Provider Distribution</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <VcsCard provider="GitHub" count={githubAnalyses} total={totalAnalyses} color="#24292e" />
                        <VcsCard provider="GitLab" count={gitlabAnalyses} total={totalAnalyses} color="#FC6D26" />
                        <VcsCard provider="Other/Self-Hosted" count={Math.max(0, totalAnalyses - githubAnalyses - gitlabAnalyses)} total={totalAnalyses} color="#6B7280" />
                    </div>
                </section>

                {/* Tables Section (Section B, C & D) */}
                <AdminTables 
                    users={userData} 
                    analyses={formattedAnalyses as any} 
                    teams={formattedTeams as any}
                    topRepos={topRepos as any}
                />

                {/* Admin Broadcast Area */}
                <div className="pt-12 border-t border-border/10">
                    <BroadcastBox userEmail={user.email} />
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value }: { title: string, value: string | number }) {
    return (
        <Card className="rounded-xl border-gray-200 shadow-none bg-card/50">
            <CardHeader className="pb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{value}</p>
            </CardContent>
        </Card>
    )
}

function FeatureCard({ title, value, label }: { title: string, value: string | number, label: string }) {
    return (
        <Card className="rounded-xl border-[#FF7D29]/10 shadow-none bg-[#FF7D29]/[0.02]">
            <CardHeader className="pb-2">
                <p className="text-xs font-black text-[#FF7D29] uppercase tracking-wider">{title}</p>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">{label}</p>
            </CardContent>
        </Card>
    )
}

function VcsCard({ provider, count: providerCount, total, color }: { provider: string, count: number, total: number, color: string }) {
    const pct = total > 0 ? ((providerCount / total) * 100).toFixed(1) : '0.0';
    return (
        <Card className="rounded-xl border-gray-200 shadow-none bg-card/50 overflow-hidden">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <p className="text-sm font-bold">{provider}</p>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">{pct}%</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{providerCount} of {total} analyses</p>
            </CardContent>
        </Card>
    )
}
