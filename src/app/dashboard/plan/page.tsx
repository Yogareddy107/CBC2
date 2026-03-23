import { CreditCard, Rocket, Check, X, Zap, BarChart3, ShieldCheck, ChevronRight } from 'lucide-react';
import { analyses as analysesTable, subscriptions as subscriptionsTable } from '@/lib/db/schema';
import { count, eq, sql, and } from 'drizzle-orm';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import PlanActions from '@/components/PlanActions';
import Link from 'next/link';
import { PricingGrid } from '@/components/PricingGrid';

export default async function PlanPage() {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch (e) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
                    <X className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Authentication Required</h1>
                    <p className="text-muted-foreground">You must be signed in to view your billing and subscription plan.</p>
                </div>
                <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 font-bold text-white hover:bg-primary/90 transition-all">
                    Sign In to Continue
                </Link>
            </div>
        );
    }

    let currentSub = null;
    let currentPlanName = 'Free Tier';
    let analysesThisMonth = 0;
    let tokensUsed = 0;

    try {
        const subs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.user_id, user.$id)).orderBy(sql`${subscriptionsTable.created_at} DESC`).limit(1);
        currentSub = subs[0] || null;
        if (currentSub) {
            currentPlanName = currentSub.plan === 'pro_monthly' || currentSub.plan === 'pro_yearly' ? 'Professional' : 
                             currentSub.plan === 'team' ? 'Team' : 'Explorer';
        } else {
            currentPlanName = 'Explorer';
        }
    } catch (e) {
        console.error('Error fetching subscriptions:', e);
    }

    try {
        const [analysisCountResult] = await db.select({ value: count() })
            .from(analysesTable)
            .where(and(
                eq(analysesTable.user_id, user.$id),
                sql`date(${analysesTable.created_at}) >= date('now','start of month')`
            ));
        analysesThisMonth = analysisCountResult?.value || 0;

        const [charSumResult] = await db.select({ value: sql<number>`SUM(LENGTH(${analysesTable.result}))` })
            .from(analysesTable)
            .where(and(
                eq(analysesTable.user_id, user.$id),
                sql`date(${analysesTable.created_at}) >= date('now','start of month')`
            ));
        const totalChars = charSumResult?.value || 0;
        tokensUsed = Math.floor(totalChars / 4);
    } catch (e) {
        console.error('Error fetching analysis stats:', e);
    }

    const quotaLimit = currentSub ? 100 : 10;
    const quotaPercentage = Math.min((analysesThisMonth / quotaLimit) * 100, 100);

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-16">
            {/* Header with Background Accent */}
            <header className="relative space-y-6 max-w-3xl">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Rocket className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Subscription & Usage</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Scale your engineering intelligence. Manage your plan, monitor analysis quotas, and explore enterprise-grade architectural features.
                    </p>
                </div>
            </header>

            {/* Current Plan & Usage Stats */}
            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                {/* Plan Summary Card */}
                <div className="rounded-[40px] border border-border/20 bg-white p-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Active Membership</p>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-bold text-[#1A1A1A]">{currentPlanName}</h2>
                                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">Active</span>
                                </div>
                                {currentSub && (
                                    <p className="text-xs text-muted-foreground font-medium">Billed {currentSub.plan === 'pro' ? 'monthly' : 'free'} since {currentSub.created_at ? new Date(currentSub.created_at).toLocaleDateString() : 'N/A'}</p>
                                )}
                            </div>
                            <Link 
                                href="/dashboard/plan/manage" 
                                className="h-12 px-6 flex items-center gap-2 border border-border/20 rounded-2xl text-sm font-bold text-[#1A1A1A] hover:bg-secondary/50 transition-all shadow-sm active:scale-95"
                            >
                                <CreditCard className="w-4 h-4" />
                                Manage Billing
                            </Link>
                        </div>

                        {/* Usage Visuals */}
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                        Analyses Quota
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{analysesThisMonth} / {quotaLimit}</span>
                                </div>
                                <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden p-1">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000" 
                                        style={{ width: `${quotaPercentage}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic font-medium">Resets on the 1st of every month.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                                        <Zap className="w-4 h-4 text-primary" />
                                        Intelligence Tokens
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{tokensUsed.toLocaleString()} used</span>
                                </div>
                                <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden p-1">
                                    <div 
                                        className="h-full bg-primary/40 rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.min((tokensUsed / 50000) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic font-medium">Monthly fair-use allocation.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Switch Sidebar Area (Optional placeholder or extra info) */}
                <div className="flex flex-col gap-6">
                    <div className="p-8 rounded-[32px] bg-[#1A1A1A] text-white space-y-6">
                         <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                         </div>
                         <div className="space-y-2">
                             <h3 className="text-lg font-bold">Pro-Level Signals</h3>
                             <p className="text-xs text-white/50 leading-relaxed">Upgrade to unlock detailed dependency risk scoring and contributor velocity history.</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Tier Comparison & Selection */}
            <section className="space-y-12">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Engineered for Growth</h2>
                    <p className="text-muted-foreground">Select the tier that matches your engineering velocity.</p>
                </div>

                <PricingGrid 
                    userId={user.$id}
                    currentPlanName={currentPlanName}
                />
            </section>
        </div>
    );
}
