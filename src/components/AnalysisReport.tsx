'use client';

import { useState, useEffect } from 'react';
import type { AnalysisResult } from '@/lib/llm/client';
import {
    Activity, ShieldCheck, Zap, Layout, GitBranch,
    Play, AlertTriangle, CheckCircle2, XCircle,
    Thermometer, Component, ArrowRight, BookOpen, Globe, Construction,
    MessageSquare, CheckSquare, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CommentSystem } from './CommentSystem';
import { markFileAsReviewed } from '@/app/team/actions';

// --- Shared Elements ---
function ReviewToggle({ 
    analysisId, 
    teamId, 
    filePath, 
    isReviewed: initialReviewed 
}: { 
    analysisId: string, 
    teamId?: string, 
    filePath: string, 
    isReviewed?: boolean 
}) {
    const [reviewed, setReviewed] = useState(initialReviewed);
    const [loading, setLoading] = useState(false);

    if (!teamId) return null;

    const handleToggle = async () => {
        setLoading(true);
        const res = await markFileAsReviewed(analysisId, teamId, filePath);
        if (res.success) setReviewed(true);
        setLoading(false);
    };

    return (
        <button 
            onClick={handleToggle}
            disabled={reviewed || loading}
            className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                reviewed 
                    ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 border border-transparent"
            )}
        >
            {reviewed ? <CheckCircle className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
            {reviewed ? 'Reviewed' : 'Mark Reviewed'}
        </button>
    );
}
function SectionHeader({ 
    title, 
    icon: Icon, 
    className,
    onCommentClick,
    commentCount = 0
}: { 
    title: string, 
    icon?: React.ElementType, 
    className?: string,
    onCommentClick?: () => void,
    commentCount?: number
}) {
    return (
        <div className={cn("flex items-center justify-between mb-8 mt-16 pb-4 border-b border-border/20", className)}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                    {Icon && <Icon className="w-5 h-5" />}
                </div>
                <h2 className="text-2xl font-black tracking-tighter text-[#1A1A1A]">{title}</h2>
            </div>
            {onCommentClick && (
                <button 
                    onClick={onCommentClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/50 hover:bg-primary hover:text-white transition-all group shadow-sm hover:shadow-lg hover:shadow-primary/20"
                >
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">{commentCount > 0 ? commentCount : 'Discuss'}</span>
                </button>
            )}
        </div>
    );
}

function Card({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" | "danger" | "success" | "warning" }) {
    const variants = {
        default: "bg-card border-border shadow-sm",
        outline: "bg-transparent border-dashed border-border/60 hover:border-border",
        danger: "bg-red-500/5 border-red-500/20",
        success: "bg-green-500/5 border-green-500/20",
        warning: "bg-amber-500/5 border-amber-500/20",
    };

    return (
        <div className={cn("rounded-xl border p-5 transition-all relative overflow-hidden", variants[variant], className)}>
            {children}
        </div>
    );
}

// --- 1. TL;DR ---
function TLDRSection({ data, repoUrl }: { data: AnalysisResult['tldr'], repoUrl: string }) {
    // Parse owner/repo from URL
    let owner = "Unknown";
    let repoName = "Repository";
    try {
        const url = new URL(repoUrl);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) { owner = parts[0]; repoName = parts[1]; }
    } catch {
        if (repoUrl.includes('/')) {
            const parts = repoUrl.split('/');
            if (parts.length >= 2) { owner = parts[parts.length - 2]; repoName = parts[parts.length - 1]; }
        }
    }

    return (
        <div className="mb-10 relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] border border-white/10 p-10 shadow-2xl text-white">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-50" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none opacity-30" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                            Executive Summary
                        </div>
                        <div className="h-px w-12 bg-white/10" />
                        <span className="text-xs font-mono text-slate-400">{owner}/{repoName}</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                        Project Analysis
                    </h1>

                    <div className="pt-2">
                        <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl italic border-l-2 border-primary/40 pl-6 py-2">
                            "{data.architecture}"
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-80">
                    <div className="group p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-primary/40 transition-all hover:translate-y-[-2px]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400/80">Critical Risk</span>
                        </div>
                        <p className="text-sm font-bold text-white mb-1 truncate">{data.biggestRisk.file}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{data.biggestRisk.reason}</p>
                    </div>

                    <div className="group p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-green-400/40 transition-all hover:translate-y-[-2px]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-400/80">Entry Point</span>
                        </div>
                        <p className="text-sm font-bold text-white mb-1 truncate">{data.startHere}</p>
                        <p className="text-[11px] text-slate-400">Recommended starting module for audit.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 2. Engineering Maturity Index ---
function MaturityScale({ data, onComment, analysisId, teamId }: { data: AnalysisResult['maturity'], onComment: () => void, analysisId?: string, teamId?: string }) {
    const stages = ['Prototype', 'Structured early-stage', 'Growing', 'Production-Grade'];
    const currentIndex = stages.indexOf(data.rating);

    return (
        <section className="group">
            <SectionHeader title="Engineering Maturity Index" icon={Activity} onCommentClick={onComment} />
            <div className="p-10 bg-white border border-border/40 rounded-[2.5rem] shadow-sm overflow-hidden relative group-hover:shadow-xl transition-all duration-500">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative">
                        <div className="flex justify-between items-end mb-8">
                            <h3 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                                {data.rating}
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                Level {currentIndex + 1} of 4
                            </span>
                        </div>
                        
                        <div className="space-y-6">
                            {stages.map((s, i) => {
                                const active = i <= currentIndex;
                                const isCurrent = i === currentIndex;
                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                            <span className={active ? "text-primary" : "text-muted-foreground/40"}>{s}</span>
                                            {isCurrent && <span className="text-primary flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Current</span>}
                                        </div>
                                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "h-full transition-all duration-1000 ease-out",
                                                    active ? "bg-primary" : "bg-transparent",
                                                    isCurrent ? "animate-pulse" : ""
                                                )} 
                                                style={{ width: active ? '100%' : '0%', transitionDelay: `${i * 150}ms` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="relative h-full flex flex-col justify-center">
                        <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-2xl pointer-events-none" />
                        <div className="relative p-8 bg-black/5 backdrop-blur-sm border border-black/5 rounded-[2rem]">
                            <div className="flex items-center gap-2 mb-4 text-primary">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contextual Analysis</span>
                            </div>
                            <p className="text-base font-medium text-[#1A1A1A] leading-relaxed italic">
                                "{data.reason}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// --- 3. 15-Minute Onboarding Path ---
function OnboardingPath({ data, onComment, analysisId, teamId }: { data: AnalysisResult['onboarding'], onComment: () => void, analysisId?: string, teamId?: string }) {
    return (
        <section>
            <SectionHeader title="🚀 15-Minute Onboarding Path" icon={Globe} onCommentClick={onComment} />

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white border border-border/40 rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all border-t-4 border-t-blue-500">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Play className="w-5 h-5 fill-current" />
                            </div>
                            <h3 className="text-lg font-black text-[#1A1A1A]">First 15 Mins</h3>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 font-black">QUICK START</Badge>
                    </div>
                    
                    <ul className="space-y-6">
                        {data.first15Mins.map((item, i) => (
                            <li key={i} className="group/item">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <span className="text-sm font-bold font-mono bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 break-all">
                                        {item.file}
                                    </span>
                                    <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} />
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed pl-1 transition-colors group-hover/item:text-foreground">
                                    {item.reason}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white border border-border/40 rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all border-t-4 border-t-purple-500">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-[#1A1A1A]">Next 30 Mins</h3>
                        </div>
                        <Badge className="bg-purple-50 text-purple-600 border-none px-3 py-1 font-black">DEEP DIVE</Badge>
                    </div>
                    
                    <ul className="space-y-6">
                        {data.next30Mins.map((item, i) => (
                            <li key={i} className="group/item">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <span className="text-sm font-bold font-mono bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-100 break-all">
                                        {item.file}
                                    </span>
                                    <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} />
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed pl-1 transition-colors group-hover/item:text-foreground">
                                    {item.reason}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 mb-8 overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                    <div className="shrink-0 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                        <Zap className="w-5 h-5 text-primary fill-current" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-white">CORE DATA FLOW</span>
                    </div>
                    
                    <div className="flex items-center flex-wrap gap-3">
                        {data.dataFlow.split('->').map((step, idx, arr) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/5 text-sm font-bold text-slate-200">
                                    {step.trim()}
                                </div>
                                {idx < arr.length - 1 && <ArrowRight className="w-4 h-4 text-primary opacity-50" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-red-50/50 border border-red-200 rounded-[2.5rem] p-8 shadow-inner overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-red-900">High Risk Files</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Audit required</span>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-4">
                    {data.highRiskFiles.map((item, i) => (
                        <div key={i} className="group bg-white p-5 rounded-3xl border border-red-200 hover:border-red-500 transition-all hover:bg-red-50/30">
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <span className="text-sm font-bold font-mono text-red-700 truncate">{item.file}</span>
                                <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} />
                            </div>
                            <p className="text-[11px] text-red-900/60 leading-relaxed italic border-l-2 border-red-200 pl-3">
                                "{item.reason}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- 4. Change Blast Radius ---
function BlastRadius({ data, onComment, analysisId, teamId }: { data: AnalysisResult['blastRadius'], onComment: () => void, analysisId?: string, teamId?: string }) {
    return (
        <section className="group">
            <SectionHeader title="⚡ Change Blast Radius" icon={GitBranch} onCommentClick={onComment} />
            
            <div className="grid md:grid-cols-2 gap-10">
                <div className="relative p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 fill-current" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">System Fragility</h3>
                        </div>
                        <Badge className="bg-red-500 text-white border-none px-4 py-1.5 font-bold shadow-lg shadow-red-500/20">HIGH IMPACT</Badge>
                    </div>

                    <div className="space-y-6">
                        {data.highImpact.map((item, i) => (
                            <div key={i} className="group/item relative p-6 bg-white border border-red-100 rounded-[2rem] hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold font-mono text-red-700 leading-none mb-1 break-all">{item.file}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-red-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500" style={{ width: `${Math.min(100, item.impactsModules * 15)}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-red-500/80 uppercase tracking-tighter">Impacts {item.impactsModules} Modules</span>
                                        </div>
                                    </div>
                                    <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} />
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-red-500/20 pl-4 py-1 group-hover/item:text-slate-800 transition-colors">
                                    "{item.reason}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative p-10 bg-emerald-50/30 border border-emerald-200/50 rounded-[2.5rem] shadow-sm overflow-hidden group-hover:bg-emerald-50 transition-colors duration-500">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-emerald-900 tracking-tight">Safe Zones</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Low Diffusion</span>
                    </div>

                    <div className="grid gap-4">
                        {data.safeToModify.map((item, i) => (
                            <div key={i} className="p-6 bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-[2rem] hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-black font-mono text-emerald-700 truncate">{item.file}</span>
                                    <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} />
                                </div>
                                <p className="text-xs text-emerald-900/60 leading-relaxed font-medium">
                                    {item.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// --- 5. Risk & Debt Summary ---
function RiskAndDebt({ data, onComment, analysisId, teamId }: { data: AnalysisResult['riskAndDebt'], onComment: () => void, analysisId?: string, teamId?: string }) {
    
    // Status color helper for the table
    const getBadgeColor = (val: string | number) => {
        const vStr = String(val).toLowerCase();
        if (["low", "high"].includes(vStr) && val === data.testCoverage.level) {
            return vStr === "high" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100";
        }
        if (["high", "none"].includes(vStr)) return "bg-red-50 text-red-700 border-red-100";
        if (["med", "medium", "average"].includes(vStr)) return "bg-amber-50 text-amber-700 border-amber-100";
        if (["low", "good", "excellent"].includes(vStr)) return "bg-emerald-50 text-emerald-700 border-emerald-100";
        if (typeof val === 'number') {
            if (val >= 8) return "bg-emerald-50 text-emerald-700 border-emerald-100";
            if (val >= 5) return "bg-amber-50 text-amber-700 border-amber-100";
            return "bg-red-50 text-red-700 border-red-100";
        }
        return "bg-slate-50 text-slate-700 border-slate-100";
    };

    return (
        <section className="group">
            <SectionHeader title="⚠️ Risk & Debt Summary" icon={Thermometer} onCommentClick={onComment} />

            <div className="bg-white border border-border/40 rounded-[2.5rem] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/40 bg-slate-50/50">
                                <th className="py-5 px-8 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Health Signal</th>
                                <th className="py-5 px-8 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Rating</th>
                                <th className="py-5 px-8 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Engineering Evidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {[
                                { label: "Coupling Risk", val: data.couplingRisk.level, reason: data.couplingRisk.reason },
                                { label: "Maintainability", val: `${data.maintainability.score}/10`, raw: data.maintainability.score, reason: data.maintainability.reason },
                                { label: "Test Coverage", val: data.testCoverage.level, reason: data.testCoverage.reason },
                                { label: "Onboarding", val: data.onboardingTime.duration, reason: data.onboardingTime.reason, special: true },
                                { label: "Refactor Safety", val: data.refactorSafety.level, reason: data.refactorSafety.reason }
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-5 px-8 text-sm font-bold text-[#1A1A1A]">{row.label}</td>
                                    <td className="py-5 px-8">
                                        <Badge className={cn("px-3 py-1 font-black text-[10px] uppercase shadow-sm border", getBadgeColor(row.raw || row.val))}>
                                            {row.val}
                                        </Badge>
                                    </td>
                                    <td className="py-5 px-8 text-sm text-muted-foreground leading-relaxed">{row.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="relative p-10 bg-amber-50/20 border border-amber-200/40 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Construction className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-amber-900 tracking-tight">Technical Debt Backlog</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Top 3 Priorities</span>
                </div>
                
                <div className="space-y-4">
                    {data.top3DebtIssues.map((item, i) => (
                        <div key={i} className="group bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-amber-200/50 hover:bg-white transition-all shadow-sm hover:shadow-md">
                            <div className="flex items-center justify-between gap-6 mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-[10px]">{i + 1}</span>
                                    <span className="text-sm font-black font-mono text-amber-800 break-all">{item.file}</span>
                                </div>
                                <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} />
                            </div>
                            <p className="text-sm text-amber-900/70 font-medium leading-relaxed">
                                {item.issue}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- 6. Final Recommendation ---
function FinalRecommendation({ data }: { data: AnalysisResult['recommendation'] }) {
    return (
        <div className="relative overflow-hidden rounded-[3rem] bg-[#0F172A] p-12 shadow-2xl text-white mt-16 border border-white/10">
            {/* Verdict Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 shadow-glow border border-emerald-500/20">
                        <CheckCircle2 className="w-8 h-8 fill-current" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter mb-4 italic">The Final Verdict</h2>
                    <div className="h-1 w-24 bg-primary/40 rounded-full" />
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400/80">Ideal Use Cases</h3>
                        </div>
                        <ul className="grid gap-4">
                            {data.goodFor.map((tag, i) => (
                                <li key={i} className="group flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/40 group-hover:scale-125 transition-transform" />
                                    <span className="text-base font-medium text-slate-200">{tag}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-400/80">Current Limitations</h3>
                        </div>
                        <ul className="grid gap-4">
                            {data.notReadyFor.map((tag, i) => (
                                <li key={i} className="group flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-red-500/40 group-hover:scale-125 transition-transform" />
                                    <span className="text-base font-medium text-slate-200">{tag}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <Zap className="w-32 h-32 text-primary/5 -mr-8 -mt-8" />
                    </div>
                    
                    <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-10 flex items-center gap-3">
                        <Activity className="w-5 h-5" /> Recommended Immediate Actions
                    </h3>
                    
                    <div className="grid gap-6">
                        {data.first3Actions.map((item, i) => (
                            <div key={i} className="flex items-start gap-6 group">
                                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary font-black text-sm shrink-0 mt-1 border border-primary/20">
                                    {i + 1}
                                </span>
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">{item.action}</p>
                                    <div className="inline-flex items-center px-3 py-1 bg-black/40 rounded-lg border border-white/10 text-[11px] font-mono text-slate-400">
                                        {item.file}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
// --- Main Layout ---
export function AnalysisReport({ 
    data: incomingData, 
    repoUrl,
    analysisId,
    teamId
}: { 
    data: any, 
    repoUrl: string,
    analysisId?: string,
    teamId?: string
}) {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Robust data parsing
    let data: AnalysisResult;
    try {
        data = typeof incomingData === 'string' ? JSON.parse(incomingData) : incomingData;
    } catch (e) {
        console.error("Failed to parse analysis data:", e);
        return <div className="p-8 text-center text-red-500 border border-red-200 rounded-xl bg-red-50 dark:bg-red-950/20 mt-8">Corrupted report data. Try re-analyzing.</div>;
    }

    if (!data || !data.tldr) return <div className="p-8 text-center text-red-500 border border-red-200 rounded-xl bg-red-50 dark:bg-red-950/20 mt-8">Invalid or missing report data structure. Try re-analyzing.</div>;

    const toggleComments = (sectionId: string) => {
        if (activeSection === sectionId) setActiveSection(null);
        else setActiveSection(sectionId);
    };

    return (
        <div className="w-full max-w-[1000px] mx-auto pb-32 font-sans selection:bg-primary/20 relative">
            <TLDRSection data={data.tldr} repoUrl={repoUrl} />
            <div className="grid gap-12 mt-8">
                <MaturityScale 
                    data={data.maturity} 
                    onComment={() => toggleComments('maturity')} 
                    analysisId={analysisId}
                    teamId={teamId}
                />
                <OnboardingPath 
                    data={data.onboarding} 
                    onComment={() => toggleComments('onboarding')}
                    analysisId={analysisId}
                    teamId={teamId}
                />
                <BlastRadius 
                    data={data.blastRadius} 
                    onComment={() => toggleComments('blast')}
                    analysisId={analysisId}
                    teamId={teamId}
                />
                <RiskAndDebt 
                    data={data.riskAndDebt} 
                    onComment={() => toggleComments('risk')}
                    analysisId={analysisId}
                    teamId={teamId}
                />
            </div>
            <FinalRecommendation data={data.recommendation} />

            {analysisId && (
                <CommentSystem 
                    analysisId={analysisId}
                    sectionId={activeSection || ''}
                    isOpen={!!activeSection}
                    onClose={() => setActiveSection(null)}
                />
            )}
        </div>
    );
}
