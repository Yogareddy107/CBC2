import { Suspense } from 'react';
import { db } from '@/lib/db';
import { analyses as analysesTable } from '@/lib/db/schema';
import { createSessionClient } from '@/lib/appwrite';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Github, ExternalLink, Clock, Sparkles, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NewAnalysisForm } from '@/components/dashboard/NewAnalysisForm';
import { desc, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
    let user: { $id: string, email: string } | null = null;
    try {
        const { account } = await createSessionClient();
        const appwriteUser = await account.get();
        user = {
            $id: appwriteUser.$id,
            email: appwriteUser.email,
        };
    } catch (e) {
        const cookieStore = await cookies();
        const cookieNames = Array.from(cookieStore.getAll()).map(c => c.name);
        const hasSession = cookieNames.some(name =>
            name.includes('appwrite') || name.includes('session')
        );

        if (hasSession) {
            redirect('/auth/session-recovery');
        }
        redirect('/login');
    }

    const analyses = await db.select()
        .from(analysesTable)
        .where(eq(analysesTable.user_id, user.$id))
        .orderBy(desc(analysesTable.created_at))
        .limit(5);

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-20 animate-in fade-in duration-700">
            {/* Hero Section */}
            <header className="relative flex flex-col items-center justify-center pt-16 pb-8 text-center space-y-10">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-[#1A1A1A]">
                        What shall we <span className="text-[#FF7D29]">analyze</span> today?
                    </h1>
                    <p className="text-[#1A1A1A]/40 text-sm font-medium max-w-lg mx-auto leading-relaxed">
                        Unlock deep architectural insights and system clarity from any public GitHub repository.
                    </p>
                </div>

                <div className="w-full">
                    <Suspense fallback={<div className="h-14 max-w-2xl mx-auto animate-pulse bg-[#F9F9F8] rounded-[24px]" />}>
                        <NewAnalysisForm />
                    </Suspense>
                </div>

                {/* Suggested Actions Tiles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mx-auto">
                    {[
                        { icon: Activity, label: "Security Audit", desc: "Scan for vulnerabilities", color: "text-rose-500" },
                        { icon: Sparkles, label: "Structural Map", desc: "Visualize architecture", color: "text-amber-500" },
                        { icon: Github, label: "React Patterns", desc: "Analyze React core", color: "text-blue-500" },
                        { icon: Activity, label: "Data Flow", desc: "Trace logic paths", color: "text-emerald-500" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className="flex flex-col items-start gap-4 p-5 rounded-[20px] bg-white border border-[#E5E5E4] hover:border-[#FF7D29]/30 hover:bg-[#FFFDF6] transition-all group text-left shadow-sm hover:shadow-md"
                        >
                            <div className={cn("w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-colors", item.color)}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-[#1A1A1A]">{item.label}</h3>
                                <p className="text-[10px] text-[#1A1A1A]/40 font-medium mt-0.5">{item.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </header>

            {/* Recent Activity Section */}
            <section className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-bold tracking-tight text-[#1A1A1A]">
                        Recent Activity
                    </h2>
                    <Link
                        href="/dashboard/history"
                        className="text-[11px] font-bold text-[#1A1A1A]/40 hover:text-[#FF7D29] transition-colors"
                    >
                        View All
                    </Link>
                </div>

                {!analyses || analyses.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-[#E5E5E4] rounded-[24px] bg-[#F9F9F8]/50 flex flex-col items-center justify-center space-y-4">
                        <Github className="w-8 h-8 text-[#1A1A1A]/10" />
                        <p className="text-xs font-bold text-[#1A1A1A]/30 uppercase tracking-widest">No Recent Searches</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {analyses.map((analysis) => {
                            const repoName = analysis.repo_url.split('/').pop() || analysis.repo_url;
                            const date = analysis.created_at ? new Date(analysis.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            }) : 'N/A';

                            return (
                                <Link
                                    key={analysis.id}
                                    href={`/analysis/${analysis.slug}`}
                                    className="group flex items-center justify-between p-4 rounded-[18px] bg-white border border-[#E5E5E4] hover:border-[#FF7D29]/20 hover:shadow-lg hover:shadow-[#FF7D29]/5 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#F9F9F8] flex items-center justify-center border border-[#E5E5E4] text-[#1A1A1A]/40 group-hover:text-[#FF7D29] group-hover:bg-[#FFFDF6] transition-all">
                                            <Github className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#FF7D29] transition-colors">
                                                {repoName}
                                            </h3>
                                            <p className="text-[11px] text-[#1A1A1A]/40 font-bold uppercase tracking-tighter">
                                                {date} • {analysis.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-gray-50 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <ExternalLink className="w-3.5 h-3.5 text-[#FF7D29]" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
