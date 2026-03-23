import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import { getTeamMetrics, getOwnershipSummary, getHealthTimeline } from '@/lib/analysis/analytics';
import { TeamDashboard } from '@/components/analytics/TeamDashboard';
import { BarChart3, Info } from 'lucide-react';

export default async function AnalyticsPage() {
    let user: { $id: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = { $id: appwriteUser.$id };
    } catch (e) {
        redirect('/login');
    }

    const metrics = await getTeamMetrics(user.$id);
    const ownership = await getOwnershipSummary(user.$id);
    const timelines = await getHealthTimeline(user.$id);

    return (
        <div className="px-6 py-10 space-y-10 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Engineering Intelligence</h1>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-lg">
                        Cross-repository health trends, architectural risk distribution, and functional ownership mapping for your team.
                    </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <Info className="w-4 h-4 text-slate-400" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data based on last 20 analyses</p>
                </div>
            </header>

            <TeamDashboard metrics={metrics} ownership={ownership} timelines={timelines} />
        </div>
    );
}
