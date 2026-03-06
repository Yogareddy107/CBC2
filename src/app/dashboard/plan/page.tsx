import { CreditCard, Rocket, Check, X, Zap, Shield, Crown, Sparkles, Activity, ArrowRight } from 'lucide-react';
import { analyses as analysesTable, subscriptions as subscriptionsTable } from '@/lib/db/schema';
import { count, eq, sql, and } from 'drizzle-orm';
import { createSessionClient } from '@/lib/appwrite';
import { db } from '@/lib/db';
import PlanActions from '@/components/PlanActions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default async function PlanPage() {
    let user;
    try {
        const { account } = await createSessionClient();
        user = await account.get();
    } catch (e) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                    <X className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold">Authentication Required</h2>
                <p className="text-muted-foreground">You must be signed in to view your plan. Please <a href="/login" className="text-primary underline font-bold">log in</a>.</p>
            </div>
        );
    }

    let currentSub = null;
    let currentPlanName = 'Free Usage';
    let analysesThisMonth = 0;
    let tokensUsed = 0;

    try {
        const subs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.user_id, user.$id)).orderBy(sql`${subscriptionsTable.created_at} DESC`).limit(1);
        currentSub = subs[0] || null;
        currentPlanName = currentSub ? 'Pro' : 'Free Usage';
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

        const [charSumResult] = await db.select({ value: sql<number>`SUM(${analysesTable.result_length})` })
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

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Hero Header */}
            <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFFDF6] via-white to-amber-50/40 border border-amber-100/20 p-8 md:p-16 text-center space-y-6 shadow-sm">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Crown className="w-80 h-80 -rotate-12" />
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                        <CreditCard className="w-3.5 h-3.5" />
                        Billing & Subscriptions
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#1A1A1A]">
                        Your <span className="text-primary italic">Plan</span> Overview
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed font-medium">
                        Manage your subscription and monitor your usage limits in one place.
                    </p>
                </div>
            </header>

            {/* Usage Dashboard Card */}
            <div className="relative group overflow-hidden bg-white border border-border/40 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-primary/5 transition-all hover:border-primary/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-border/10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Subscription Level</p>
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-black text-[#1A1A1A]">{currentPlanName}</h2>
                            <Badge variant={currentSub ? "default" : "outline"} className="px-3 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                {currentSub ? 'Active Member' : 'Standard User'}
                            </Badge>
                        </div>
                        {currentSub && currentSub.created_at && (
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 pt-1">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Premium since {new Date(currentSub.created_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <a href="/dashboard/plan/manage" className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 group/btn">
                        <CreditCard className="w-4 h-4" />
                        Manage Billing
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                    </a>
                </div>

                <div className="relative z-10 grid gap-6 md:grid-cols-2 pt-8">
                    <div className="p-6 rounded-2xl bg-[#F8F8F8] border border-border/5 space-y-4 transition-all hover:bg-white hover:shadow-inner">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Analysis Quota</p>
                            <Zap className="w-4 h-4 text-primary opacity-30" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-lg text-[#1A1A1A]">{analysesThisMonth} <span className="text-muted-foreground font-medium text-sm">/ 10 repo analyses</span></p>
                            <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((analysesThisMonth / 10) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#F8F8F8] border border-border/5 space-y-4 transition-all hover:bg-white hover:shadow-inner">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Token Consumption</p>
                            <Activity className="w-4 h-4 text-primary opacity-30" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-lg text-[#1A1A1A]">{tokensUsed.toLocaleString()} <span className="text-muted-foreground font-medium text-sm">/ 10,000 monthly quota</span></p>
                            <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary/40 transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(tokensUsed / 10000 * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <section className="pt-12 space-y-12">
                <div className="text-center space-y-3">
                    <h3 className="text-2xl font-black tracking-tight">Select your engineering tier</h3>
                    <p className="text-muted-foreground font-medium">Fuel your codebase intelligence with a plan that fits your velocity.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Free Card */}
                    <PricingCard
                        title="Free"
                        subtitle="For exploration & side projects"
                        price="0"
                        period="forever"
                        buttonLabel={currentSub ? "Current Plan" : "Stay on Free"}
                        buttonDisabled={!!currentSub}
                        features={[
                            { included: true, text: "4 deep repo analyses (lifetime)" },
                            { included: true, text: "Architecture mapping & entry points" },
                            { included: true, text: "Basic structural overview" },
                            { included: false, text: "Full analysis history" },
                            { included: false, text: "Priority processing" },
                        ]}
                    />

                    {/* Pro Card (Recommended) */}
                    <PricingCard
                        title="Pro Monthly"
                        subtitle="For daily engineering insights"
                        price="10"
                        period="month"
                        isRecommended
                        buttonContent={
                            <PlanActions
                                userId={user.$id}
                                currentSub={currentSub ? { plan: 'pro', status: currentSub.status || 'active' } : null}
                                planId="pro_monthly"
                                label="Upgrade to Pro"
                            />
                        }
                        features={[
                            { included: true, text: "Unlimited analyses (fair use)" },
                            { included: true, text: "Large repository support" },
                            { included: true, text: "Detailed architecture breakdown" },
                            { included: true, text: "Risk & complexity signals" },
                            { included: true, text: "Full analysis history" },
                            { included: true, text: "Priority processing" },
                        ]}
                    />

                    {/* Enterprise/Yearly Card */}
                    <PricingCard
                        title="Pro Yearly"
                        subtitle="The professional standard"
                        price="79"
                        period="year"
                        badge="Save 34%"
                        buttonContent={
                            <PlanActions
                                userId={user.$id}
                                currentSub={currentSub ? { plan: 'pro', status: currentSub.status || 'active' } : null}
                                planId="pro_yearly"
                                label="Go Yearly"
                            />
                        }
                        features={[
                            { included: true, text: "Everything in Pro Monthly" },
                            { included: true, text: "Early access to new features" },
                            { included: true, text: "Advanced repo insights" },
                            { included: true, text: "Historical trend tracking" },
                            { included: true, text: "Priority support line" },
                        ]}
                    />
                </div>
            </section>
        </div>
    );
}

function PricingCard({
    title,
    subtitle,
    price,
    period,
    features,
    isRecommended,
    buttonLabel,
    buttonDisabled,
    buttonContent,
    badge
}: any) {
    return (
        <div className={cn(
            "relative group flex flex-col p-8 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl",
            isRecommended
                ? "bg-[#1A1A1A] text-white ring-4 ring-primary/20 scale-105 z-20 shadow-xl shadow-primary/20"
                : "bg-white border border-border/40 text-[#1A1A1A] hover:border-primary/20"
        )}>
            {badge && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    {badge}
                </div>
            )}

            {isRecommended && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-white text-[#1A1A1A] text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Recommended
                </div>
            )}

            <div className="space-y-4 mb-8">
                <div className="space-y-1">
                    <h4 className={cn("text-xl font-black tracking-tight", isRecommended ? "text-white" : "text-[#1A1A1A]")}>{title}</h4>
                    <p className={cn("text-xs font-medium opacity-60", isRecommended ? "text-white" : "text-muted-foreground")}>{subtitle}</p>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">${price}</span>
                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest">/ {period}</span>
                </div>
            </div>

            <div className="flex-1 space-y-5 mb-10">
                <p className={cn("text-[9px] font-black uppercase tracking-widest opacity-40", isRecommended ? "text-white" : "text-primary/80")}>Key Features</p>
                <ul className="space-y-4">
                    {features.map((feature: any, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                            {feature.included ? (
                                <div className={cn("mt-0.5 p-0.5 rounded-full", isRecommended ? "bg-primary" : "bg-primary/10")}>
                                    <Check className={cn("w-3 h-3 font-black", isRecommended ? "text-white" : "text-primary")} strokeWidth={4} />
                                </div>
                            ) : (
                                <X className="mt-0.5 w-4 h-4 opacity-20" />
                            )}
                            <span className={cn(
                                "text-xs font-medium leading-tight",
                                !feature.included && "opacity-30",
                                isRecommended ? "text-white/90" : "text-[#1A1A1A]/80"
                            )}>
                                {feature.text}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {buttonContent || (
                <button
                    className={cn(
                        "w-full h-14 rounded-2xl font-bold transition-all duration-300 active:scale-95 shadow-lg",
                        isRecommended
                            ? "bg-primary text-white hover:bg-white hover:text-[#1A1A1A]"
                            : "bg-[#1A1A1A] text-white hover:bg-primary",
                        buttonDisabled && "opacity-40 cursor-not-allowed scale-100"
                    )}
                    disabled={buttonDisabled}
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );
}


