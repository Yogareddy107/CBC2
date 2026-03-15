import { db } from '@/lib/db';
import { analyses as analysesTable, subscriptions as subscriptionsTable } from '@/lib/db/schema';
import { createSessionClient, createAdminClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import {
    Card,
    CardHeader,
    CardContent
} from "@/components/ui/card";
import Link from 'next/link';
import { AdminTables } from '@/components/admin/AdminTables';
import { count, eq, gt, sql, sum } from 'drizzle-orm';

import { ALLOWED_ADMIN_EMAILS } from '@/lib/admin';

export default async function AdminDashboard() {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch (e) {
        redirect('/login');
    }

    // 1. Access Control
    if (!user.email || !ALLOWED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
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
    // Drizzle column is string; convert date to ISO string for comparison
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

    // Total Subscription Money (sum of amounts where status is 'active')
    let totalRevenue = 0;
    let paidSubscribers = 0;
    
    try {
        const [totalRevenueResult] = await db.select({ value: sum(subscriptionsTable.amount) })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.status, 'active'));
        // sum can return string depending on driver; coerce to number
        totalRevenue = Number(totalRevenueResult?.value) || 0;

        // Paid Subscribers Count (count of subscriptions where status is 'active')
        const [paidSubscribersResult] = await db.select({ value: count() })
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.status, 'active'));
        paidSubscribers = paidSubscribersResult?.value || 0;
    } catch (error) {
        // Table may not exist yet, set defaults
        totalRevenue = 0;
        paidSubscribers = 0;
    }

    // 3. Fetch User Table Data and create user email map
    // In Appwrite, we fetch from users.list()
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
        userEmail: userEmailMap.get(a.user_id) || a.user_id, // Look up email from user_id, fallback to user_id if not found
        // created_at is stored as text/ISO string in DB; convert to standardized format
        createdAt: a.created_at ? new Date(a.created_at).toISOString() : '',
        status: a.status
    }));

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-10">
                <header className="flex justify-between items-center border-b pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground text-sm">Internal engineering control panel</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium hover:underline">
                            Back to App
                        </Link>
                    </div>
                </header>

                {/* SECTION A — Overview Metrics */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard title="Total Users" value={totalUsers} />
                    <MetricCard title="Paid Subscribers" value={paidSubscribers} />
                    <MetricCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} />
                    <MetricCard title="Total Analyses" value={totalAnalyses} />
                    <MetricCard title="Last 7 Days" value={analysesLast7Days} />
                    <MetricCard title="Analyses Today" value={analysesToday} />
                    <MetricCard title="Success Rate" value={`${successRate}%`} />
                </section>

                {/* Tables Section (Section B & C) */}
                <AdminTables users={userData} analyses={formattedAnalyses as any} />
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

