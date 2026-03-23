'use client';

import { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    AlertCircle, 
    Users, 
    Zap, 
    ShieldCheck, 
    Target,
    Layers,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HealthTimeline } from './HealthTimeline';
import { GuardrailSettings } from '../dashboard/GuardrailSettings';
import type { RepoTimeline } from '@/lib/analysis/analytics';

interface TeamDashboardProps {
    metrics: any;
    ownership: any[];
    timelines: RepoTimeline[];
}

export function TeamDashboard({ metrics, ownership, timelines }: TeamDashboardProps) {
    if (!metrics || metrics.trends.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <BarChart3 className="w-12 h-12 text-slate-300" />
                <h3 className="text-xl font-bold">No Analytics Data Yet</h3>
                <p className="text-muted-foreground max-w-sm">Complete at least one analysis to see team-level metrics and trends.</p>
            </div>
        );
    }

    const lastTrend = metrics.trends[metrics.trends.length - 1];
    const prevTrend = metrics.trends[metrics.trends.length - 2];
    const trendDiff = prevTrend ? lastTrend.avgScore - prevTrend.avgScore : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/40 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                             <ShieldCheck className="w-5 h-5 text-emerald-600" />
                             {trendDiff !== 0 && (
                                <Badge variant={trendDiff > 0 ? "default" : "destructive"} className="text-[10px] h-5">
                                    {trendDiff > 0 ? '+' : ''}{trendDiff}%
                                </Badge>
                             )}
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{metrics.averageSafetyScore}%</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Avg Safety Score</p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 shadow-sm bg-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                             <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{metrics.totalHotspots}</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Critical Hotspots</p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 shadow-sm bg-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                             <Layers className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{ownership.length}</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Active Domains</p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 shadow-sm bg-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                             <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-2xl font-bold tracking-tight">{metrics.riskDistribution.critical + metrics.riskDistribution.high}</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">High Risk Modules</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Health Trends */}
                <Card className="md:col-span-2 border-border/40 shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Architecture Health Trends</CardTitle>
                        </div>
                        <CardDescription>Average Refactor Safety Score over time across all repositories.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-end gap-1 px-6 pb-6 pt-10">
                        {metrics.trends.map((t: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-help">
                                <div 
                                    className="w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/30 relative"
                                    style={{ height: `${t.avgScore}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded">
                                        {t.avgScore}%
                                    </div>
                                </div>
                                <span className="text-[9px] text-muted-foreground font-mono -rotate-45 mt-2 origin-top-left">
                                    {t.date.split('-').slice(1).join('/')}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Risk Distribution */}
                <Card className="border-border/40 shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Risk Footprint</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {[
                            { label: 'Critical', count: metrics.riskDistribution.critical, color: 'bg-red-500' },
                            { label: 'High', count: metrics.riskDistribution.high, color: 'bg-orange-500' },
                            { label: 'Medium', count: metrics.riskDistribution.medium, color: 'bg-amber-500' },
                            { label: 'Low', count: metrics.riskDistribution.low, color: 'bg-emerald-500' },
                        ].map((item) => {
                            const total = Object.values(metrics.riskDistribution).reduce((a: any, b: any) => a + b, 0) as number;
                            const percentage = Math.round((item.count / total) * 100);
                            return (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                        <span className="text-muted-foreground/70">{item.label}</span>
                                        <span>{percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Health Timeline Section */}
                <div className="md:col-span-3 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">Codebase Health Timeline</h3>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/10">Stateful Monitoring</Badge>
                    </div>
                    <HealthTimeline timelines={timelines} />
                </div>

                {/* Module Ownership / Domain Complexity */}
                <Card className="md:col-span-3 border-border/40 shadow-md bg-white overflow-hidden">
                    <CardHeader className="border-b border-border/10 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Functional Ownership Map</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-[10px]">By Top-level Domain</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/10">
                            {ownership.map((domain, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                                            domain.riskLevel === 'High' ? 'bg-red-50 text-red-600' : 
                                            domain.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            {domain.domain.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold tracking-tight">{domain.domain}</p>
                                            <p className="text-[11px] text-muted-foreground">Complexity Intensity: {domain.avgComplexity}/20</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className={`text-[11px] font-bold uppercase tracking-wider ${
                                                domain.riskLevel === 'High' ? 'text-red-600' : 
                                                domain.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                                            }`}>
                                                {domain.riskLevel} Risk
                                            </p>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                                                 <span className="text-[10px] text-muted-foreground font-medium">Drill down</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Guardrail Settings - New Automation Section */}
            <div className="pt-4">
                <GuardrailSettings />
            </div>

            {/* Bus Factor & Structural Warnings */}
            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-start gap-4">
                <Zap className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">Platform Insights</h4>
                    <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">
                        Your architectural debt is concentrated in the <span className="font-bold">"{ownership[0]?.domain || 'root'}"</span> domain. 
                        Files in this area have {ownership[0]?.avgComplexity > 10 ? 'critically' : 'moderately'} high coupling. 
                        Consider refactoring these modules to reduce the "Bus Factor" risk across the team.
                    </p>
                </div>
            </div>
        </div>
    );
}
