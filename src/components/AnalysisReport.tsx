'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import type { AnalysisResult } from '@/lib/llm/client';
import {
    Activity, ShieldCheck, Zap, Layout, GitBranch,
    Play, AlertTriangle, CheckCircle2, XCircle, Shield,
    Thermometer, Component, ArrowRight, BookOpen, Globe, Construction,
    MessageSquare, CheckSquare, CheckCircle, FolderOpen, Loader2,
    Lock, Gauge, Trash2, Cpu, Ship, Info, ShieldAlert, Share2, Terminal, Key, Copy, Sparkles
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateRemediationPR } from '@/app/analyze/actions';
import { CommentSystem } from './CommentSystem';
import { updateFileReview } from '@/app/team/actions';
import { predictImpact } from '@/app/analyze/actions';
import { ImpactExplorer } from './ImpactExplorer';
import { Progress } from './ui/progress';
import { PreCommitGuide } from './PreCommitGuide';
import { IDEGuide } from './IDEGuide';
import { ModernizationRoadmap } from './ModernizationRoadmap';
import { MaturityBenchmark } from './MaturityBenchmark';
import { ArchitectureSandbox } from './ArchitectureSandbox';

// --- Shared Elements ---
function ReviewToggle({ 
    analysisId, 
    teamId, 
    filePath, 
    reviews = [] 
}: { 
    analysisId: string, 
    teamId?: string, 
    filePath: string, 
    reviews?: any[] 
}) {
    const review = reviews.find(r => r.file_path === filePath);
    const [isReviewed, setIsReviewed] = useState(!!review);
    const [reviewer, setReviewer] = useState<any>(review);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (review) {
            setIsReviewed(true);
            setReviewer(review);
        }
    }, [review]);

    if (!teamId) return null;

    const handleToggle = async () => {
        setLoading(true);
        const res = await updateFileReview({
            analysisId,
            teamId,
            filePath,
            status: 'reviewed'
        });
        if (res.success) {
            setIsReviewed(true);
            // We don't have the full reviewer object here immediately unless we fetch it 
            // but for now we can show "Just now" or Similar. 
            // In a real app, we'd probably re-fetch or use a shared state.
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2">
            {isReviewed && reviewer && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 border border-green-100 shadow-sm animate-in fade-in slide-in-from-right-2">
                    <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                        {reviewer.reviewerAvatar || 'U'}
                    </div>
                    <span className="text-[10px] font-black text-green-700 truncate max-w-[80px]">
                        {reviewer.reviewerName}
                    </span>
                </div>
            )}
            <button 
                onClick={handleToggle}
                disabled={isReviewed || loading}
                className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    isReviewed 
                        ? "text-green-600 hidden" // Hide button if reviewed and we show the badge above
                        : "bg-slate-100 text-slate-500 hover:bg-[#FF7D29] hover:text-white border border-slate-200"
                )}
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckSquare className="w-3 h-3" />}
                Mark Reviewed
            </button>
        </div>
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
const TLDRSection = memo(function TLDRSection({ data, repoUrl }: { data: AnalysisResult['tldr'], repoUrl: string }) {
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
});

// --- 2. Engineering Maturity Index ---
const MaturityScale = memo(function MaturityScale({ data, onComment, analysisId, teamId }: { data: AnalysisResult['maturity'], onComment: () => void, analysisId?: string, teamId?: string }) {
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
});

// --- 3. 15-Minute Onboarding Path ---
const OnboardingPath = memo(function OnboardingPath({ data, onComment, analysisId, teamId, reviews = [] }: { data: AnalysisResult['onboarding'], onComment: () => void, analysisId?: string, teamId?: string, reviews?: any[] }) {
    return (
        <section className="group">
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
                                    <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} reviews={reviews} />
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
                                    <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} reviews={reviews} />
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
                                <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} reviews={reviews} />
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
});

// --- 4. Change Blast Radius ---
const BlastRadius = memo(function BlastRadius({ data, onComment, analysisId, teamId, impactfulFiles, reviews = [] }: { data: AnalysisResult['blastRadius'], onComment: () => void, analysisId?: string, teamId?: string, impactfulFiles?: AnalysisResult['impactfulFiles'], reviews?: any[] }) {
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
                                    <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} reviews={reviews} />
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-red-500/20 pl-4 py-1 group-hover/item:text-slate-800 transition-colors">
                                    "{item.reason}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-10">
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
                                        <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} reviews={reviews} />
                                    </div>
                                    <p className="text-xs text-emerald-900/60 leading-relaxed font-medium">
                                        {item.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {impactfulFiles && impactfulFiles.length > 0 && (
                        <div className="relative p-10 bg-blue-50/30 border border-blue-200/50 rounded-[2.5rem] shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Component className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-black text-blue-900 tracking-tight">Top Mechanical Hubs</h3>
                            </div>
                            <div className="space-y-3">
                                {impactfulFiles.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-blue-100">
                                        <span className="text-xs font-bold font-mono text-blue-800 truncate max-w-[70%]">{item.file}</span>
                                        <Badge className="bg-blue-100 text-blue-700 border-none px-2 py-0.5 text-[9px]">Reach: {item.reach}</Badge>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-[10px] text-blue-900/50 leading-tight"> Reach indicates how many files depend on this module directly or indirectly. </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
});

// --- 5. Risk & Debt Summary ---
const RiskAndDebt = memo(function RiskAndDebt({ data, onComment, analysisId, teamId, reviews = [], onAutoFix, fixingId }: { data: AnalysisResult['riskAndDebt'], onComment: () => void, analysisId?: string, teamId?: string, reviews?: any[], onAutoFix: (type: 'violation' | 'debt', index: number) => void, fixingId: string | null }) {
    
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
                                { label: "Refactor Safety", val: `${data.refactorSafety.score}%`, raw: data.refactorSafety.score, reason: data.refactorSafety.reason }
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
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-[#FF7D29] hover:bg-orange-50 rounded-lg flex items-center gap-1"
                                                onClick={() => onAutoFix('debt', i)}
                                                disabled={fixingId === `debt-${i}`}
                                            >
                                                {fixingId === `debt-${i}` ? <Loader2 className="w-2 h-2 animate-spin" /> : <Sparkles className="w-2 h-2" />}
                                                Auto-Fix
                                            </Button>
                                            <ReviewToggle analysisId={analysisId || ''} teamId={teamId} filePath={item.file} reviews={reviews} />
                                        </div>
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
});
// --- 5b. Governance Enforcement ---
const GovernanceSection = memo(function GovernanceSection({ governance, onComment, onAutoFix, fixingId }: { governance?: AnalysisResult['governance'], onComment: () => void, onAutoFix: (type: 'violation' | 'debt', index: number) => void, fixingId: string | null }) {
    if (!governance || governance.totalRulesChecked === 0) return null;

    const getSeverityColor = (sev: string) => sev === 'Error' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20';

    return (
        <section className="group">
            <SectionHeader title="🛡️ Architectural Governance" icon={Shield} onCommentClick={onComment} />
            <div className="bg-white border border-border/40 rounded-[2.5rem] p-10 shadow-sm overflow-hidden mb-8">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-8 border-slate-50 flex items-center justify-center relative">
                            <span className={cn("text-3xl font-black", governance.adherenceScore >= 90 ? "text-emerald-600" : governance.adherenceScore >= 70 ? "text-amber-600" : "text-red-600")}>
                                {governance.adherenceScore}%
                            </span>
                        </div>
                        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Adherence Score</p>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">Rules Tracked</span>
                            <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-black">{governance.totalRulesChecked}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">Open Violations</span>
                            <Badge variant="outline" className={cn("font-black", governance.violations.length > 0 ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600")}>
                                {governance.violations.length}
                            </Badge>
                        </div>
                    </div>
                </div>

                {governance.violations.length > 0 ? (
                    <div className="mt-10 space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Active Violations</h4>
                        {governance.violations.map((v, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white border border-slate-100 rounded-3xl hover:border-red-200 transition-all shadow-sm">
                                <AlertTriangle className={cn("w-5 h-5 mt-1 shrink-0", v.severity === 'Error' ? 'text-red-500' : 'text-amber-500')} />
                                    <div className="flex items-center justify-between w-full">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn("text-[8px] font-black uppercase px-2 py-0", getSeverityColor(v.severity))}>{v.severity}</Badge>
                                                <span className="text-sm font-black text-slate-800">{v.ruleName}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">{v.message}</p>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#FF7D29] transition-all"
                                            onClick={() => onAutoFix('violation', i)}
                                            disabled={fixingId === `violation-${i}`}
                                        >
                                            {fixingId === `violation-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            Magic Fix
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-lg">{v.fromFile}</code>
                                        <ArrowRight className="w-3 h-3 text-slate-300" />
                                        <code className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-lg">{v.toFile}</code>
                                    </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 p-10 text-center bg-emerald-50/50 border border-emerald-100 rounded-3xl">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-emerald-900">Architecture is Clean</h4>
                        <p className="text-sm text-emerald-700/70">No governance violations detected against active policies.</p>
                    </div>
                )}
            </div>
        </section>
    );
});

// --- 6. Final Recommendation ---
const FinalRecommendation = memo(function FinalRecommendation({ data }: { data: AnalysisResult['recommendation'] }) {
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
});

// --- 7. Module Purpose Detection ---
const ModuleInsights = memo(function ModuleInsights({ data }: { data: AnalysisResult['modulePurposes'] }) {
    if (!data || data.length === 0) return null;

    return (
        <section className="group">
            <SectionHeader title="📂 Module Purpose Detection" icon={FolderOpen} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item, i) => (
                    <div key={i} className="group/item p-6 bg-white border border-border/40 rounded-[2rem] hover:shadow-lg transition-all border-b-4 border-b-primary/20 hover:border-b-primary/60">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                                <Activity className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black font-mono text-slate-800 truncate">{item.directory}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium group-hover/item:text-foreground transition-colors">
                            {item.purpose}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
});

// --- 8. Dependency Graph Summary ---
const DependencyGraphSection = memo(function DependencyGraphSection({ data }: { data: AnalysisResult['dependencySummary'] }) {
    if (!data) return null;

    return (
        <section className="group">
            <SectionHeader title="🕸️ Dependency Graph Engine" icon={GitBranch} />
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border border-border/40 rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-lg font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Top Hub Modules
                    </h3>
                    <div className="space-y-4">
                        {data.topHubs.map((hub, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-bold font-mono text-slate-700 truncate max-w-[70%]">{hub.file}</span>
                                <Badge className="bg-primary/10 text-primary border-none px-2 py-0.5 text-[9px]">
                                    {hub.dependents} Dependents
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2 relative z-10">
                        <Activity className="w-4 h-4 text-primary" />
                        Tightly Coupled Clusters
                    </h3>
                    <div className="space-y-4 relative z-10">
                        {data.tightlyCoupledClusters.map((cluster, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-black text-primary">{cluster.name}</span>
                                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{cluster.files.length} Files</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight">
                                    {cluster.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
});

// --- 9. Health Breakdown ---
const HealthBreakdownSection = memo(function HealthBreakdownSection({ data }: { data: AnalysisResult['healthBreakdown'] }) {
    if (!data) return null;

    const metrics = [
        { label: "Complexity", value: data.metrics.complexity, color: "bg-blue-500" },
        { label: "Documentation", value: data.metrics.documentation, color: "bg-emerald-500" },
        { label: "Test Coverage", value: data.metrics.testCoverage, color: "bg-purple-500" },
        { label: "Modularity", value: data.metrics.modularity, color: "bg-orange-500" },
    ];

    return (
        <section className="group">
            <SectionHeader title="📊 Engineering Health Report" icon={Activity} />
            <div className="bg-white border border-border/40 rounded-[2.5rem] p-10 shadow-sm">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col items-center justify-center relative">
                        <div className="w-40 h-40 rounded-full border-[12px] border-slate-50 flex items-center justify-center relative">
                             <div className="text-center">
                                <span className="text-5xl font-black tracking-tighter text-slate-900">{data.score}</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Health Score</p>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {metrics.map((m, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>{m.label}</span>
                                    <span className="text-slate-900">{m.value}%</span>
                                </div>
                                <Progress value={m.value} className="h-1.5 bg-slate-100" indicatorClassName={m.color} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 p-8 bg-red-50/50 border border-red-100 rounded-[2rem]">
                    <h4 className="text-xs font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Critical Gaps to Close
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.criticalGaps.map((gap, i) => (
                            <Badge key={i} variant="outline" className="bg-white border-red-200 text-red-600 font-bold px-3 py-1 text-[11px] rounded-xl">
                                {gap}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
});

// --- 10. Pre-commit Risk Simulation ---
const PreCommitSimulation = memo(function PreCommitSimulation({ analysisId }: { analysisId: string }) {
    const [simulatedChange, setSimulatedChange] = useState('');
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'approved' | 'warning'>('idle');
    const [message, setMessage] = useState('');

    const handleSimulate = async () => {
        if (!simulatedChange) return;
        setStatus('analyzing');
        
        // Simulate analysis delay
        await new Promise(r => setTimeout(r, 1500));
        
        const res = await predictImpact(analysisId, simulatedChange);
        if (res.risk === 'HIGH') {
            setStatus('warning');
            setMessage(`PRE-COMMIT REJECTED: High-risk change detected in ${simulatedChange}. Affected modules: ${res.reach}.`);
        } else {
            setStatus('approved');
            setMessage(`PRE-COMMIT APPROVED: Change in ${simulatedChange} has low blast radius. No critical safety issues detected.`);
        }
    };

    return (
        <section className="group">
            <SectionHeader title="🛡️ Pre-commit Guard (Simulation)" icon={ShieldCheck} />
            <div className="bg-[#0F172A] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-pulse" />
                
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight">VCS Safety Hook</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Simulate a git pre-commit hook to see how CBC prevents breaking changes in real-time.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Input 
                                placeholder="Feature-X branch change..."
                                value={simulatedChange}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSimulatedChange(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12"
                            />
                            <Button 
                                onClick={handleSimulate}
                                disabled={status === 'analyzing' || !simulatedChange}
                                className="bg-primary hover:bg-primary/80 text-white font-black px-8 rounded-xl h-12"
                            >
                                {status === 'analyzing' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simulate Change"}
                            </Button>
                        </div>

                        {status !== 'idle' && status !== 'analyzing' && (
                            <div className={cn(
                                "p-6 rounded-2xl border transition-all animate-in zoom-in-95 duration-300",
                                status === 'approved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                            )}>
                                <div className="flex items-center gap-3 mb-2">
                                    {status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    <span className="text-sm font-black uppercase tracking-widest">{status === 'approved' ? 'Success' : 'Safety Warning'}</span>
                                </div>
                                <p className="text-sm font-medium leading-relaxed">{message}</p>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 w-48 h-48 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-700">
                         <div className={cn(
                             "w-24 h-24 rounded-full blur-2xl absolute opacity-20 transition-all duration-500",
                             status === 'approved' ? "bg-emerald-500 opacity-40" : status === 'warning' ? "bg-red-500 opacity-40" : "bg-primary"
                         )} />
                         <ShieldCheck className={cn(
                             "w-16 h-16 relative z-10 transition-colors duration-500",
                             status === 'approved' ? "text-emerald-500" : status === 'warning' ? "text-red-500" : "text-white/20"
                         )} />
                    </div>
                </div>
            </div>
        </section>
    );
});

// --- 11. Onboarding Reading Tree ---
const ReadingTree = memo(function ReadingTree({ data }: { data: AnalysisResult['onboarding'] }) {
    return (
        <section className="group">
            <SectionHeader title="🌳 Onboarding Reading Tree" icon={BookOpen} />
            <div className="p-10 bg-white border border-border/40 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col gap-6">
                        {data.first15Mins.map((item, i) => (
                            <div key={i} className="flex gap-6 items-start relative">
                                {i < data.first15Mins.length - 1 && (
                                    <div className="absolute left-[19px] top-10 w-0.5 h-16 bg-slate-100" />
                                )}
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg relative z-20">
                                    {i + 1}
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex-1 hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <span className="text-sm font-black font-mono text-slate-800 break-all">{item.file}</span>
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[8px] uppercase">Phase 1</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.reason}</p>
                                </div>
                            </div>
                        ))}
                        
                        <div className="flex justify-center py-4">
                            <div className="h-10 w-0.5 bg-slate-100 border-dashed border-l" />
                        </div>

                        {data.next30Mins.map((item, i) => (
                            <div key={i} className="flex gap-6 items-start relative opacity-80">
                                <div className="w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                                    {data.first15Mins.length + i + 1}
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 flex-1 hover:border-slate-300 transition-all border-dashed">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <span className="text-sm font-bold font-mono text-slate-600 break-all">{item.file}</span>
                                        <Badge variant="outline" className="bg-slate-100 text-slate-400 border-none text-[8px] uppercase">Phase 2</Badge>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed italic">{item.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900"><path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/></svg>
                </div>
            </div>
        </section>
    );
});

// --- 12. Cloud Infrastructure ---
const InfrastructureSection = memo(function InfrastructureSection({ data }: { data: AnalysisResult['infrastructure'] }) {
    if (!data || !data.detected || data.detected.length === 0) return null;

    return (
        <section className="group">
            <SectionHeader title="☁️ Cloud Infrastructure Intelligence" icon={Layout} />
            <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50/30 border border-sky-200/50 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-300/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                <div className="relative z-10 grid md:grid-cols-3 gap-8 mb-8">
                    <div className="p-6 bg-white/70 backdrop-blur-sm border border-sky-100 rounded-3xl text-center">
                        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">Cloud Provider</div>
                        <div className="text-lg font-black text-slate-900">{data.cloudProvider || 'Multi-cloud'}</div>
                    </div>
                    <div className="p-6 bg-white/70 backdrop-blur-sm border border-sky-100 rounded-3xl text-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <Construction className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">IaC Files</div>
                        <div className="text-lg font-black text-slate-900">{data.detected.length} detected</div>
                    </div>
                    <div className="md:col-span-1 p-6 bg-white/70 backdrop-blur-sm border border-sky-100 rounded-3xl text-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">IaC Maturity</div>
                        <div className="text-lg font-black text-slate-900">{data.detected.length > 5 ? 'High' : data.detected.length > 2 ? 'Moderate' : 'Basic'}</div>
                    </div>
                </div>

                <div className="relative z-10 p-6 bg-white/50 backdrop-blur-sm border border-sky-100 rounded-3xl mb-6">
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic border-l-2 border-sky-300 pl-4">
                        "{data.summary}"
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-4 pl-2">Detected Infrastructure Files</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {data.detected.slice(0, 12).map((file, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-white/60 rounded-xl border border-sky-100 hover:border-sky-300 transition-all">
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                <span className="text-[11px] font-bold font-mono text-slate-600 truncate">{file}</span>
                            </div>
                        ))}
                        {data.detected.length > 12 && (
                            <div className="flex items-center justify-center p-3 bg-sky-50 rounded-xl border border-sky-100">
                                <span className="text-[10px] font-black text-sky-500">+{data.detected.length - 12} more files</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
});

export interface AnalysisReportProps {
    data: any;
    repoUrl: string;
    analysisId?: string;
    teamId?: string;
    reviews?: any[];
}

// --- New Sections ---

const CleanupSection = memo(function CleanupSection({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-900 border border-white/10 rounded-[2rem] text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <Trash2 className="w-5 h-5 text-amber-400" />
                        <h3 className="text-xl font-black">Unused Files</h3>
                    </div>
                    {data.unusedFiles && data.unusedFiles.length > 0 ? (
                        <div className="space-y-3">
                            {data.unusedFiles.map((f: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[11px] font-mono font-bold opacity-80">{f.file}</span>
                                    <Badge className="bg-amber-500/10 text-amber-400 border-none text-[9px] font-black">Confidence: {f.confidence}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-white/5 rounded-2xl border border-white/5">
                            <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Optimized: No Garbage Files</p>
                        </div>
                    )}
                </div>
                <div className="p-8 bg-white border border-border/40 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-6 text-slate-800">
                        <Cpu className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-black">Dependencies</h3>
                    </div>
                    {data.unusedDeps && data.unusedDeps.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {data.unusedDeps.map((dep: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 px-3 py-1 font-bold">
                                    {dep}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 font-bold mb-6">All dependencies are actively imported.</p>
                    )}
                    <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <p className="text-xs font-black text-emerald-700 uppercase mb-1">IMPACT OF CLEANUP</p>
                        <p className="text-sm font-bold text-emerald-900">{data.impactOfCleanup || 'No immediate cleanup actions required.'}</p>
                    </div>
                </div>
             </div>
        </div>
    );
});

const CICDSection = memo(function CICDSection({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-10 bg-white border border-border/40 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <Ship className="w-6 h-6 text-primary" />
                        <h3 className="text-2xl font-black text-slate-900">CI/CD Readiness</h3>
                    </div>
                    <Badge className={cn(
                        "px-4 py-1.5 font-black text-xs uppercase shadow-lg",
                        data.readiness === 'Ready' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    )}>
                        {data.readiness}
                    </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {data.checklist.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                {item.status === 'Pass' ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="p-8 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Construction className="w-24 h-24" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Top Pipeline Risk</h4>
                        <p className="text-lg font-bold leading-relaxed">{data.topRisk}</p>
                    </div>
                </div>
             </div>
        </div>
    );
});

const SecuritySection = memo(function SecuritySection({ data }: { data: any }) {
    if (!data) return null;
    const hasIssues = data.criticalIssues?.length > 0 || data.warnings?.length > 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-900 border border-white/10 rounded-[2rem] text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="w-5 h-5 text-red-400" />
                        <h3 className="text-xl font-black">Critical Issues</h3>
                    </div>
                    {data.criticalIssues && data.criticalIssues.length > 0 ? (
                        <div className="space-y-4">
                            {data.criticalIssues.map((issue: any, i: number) => (
                                <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-xs font-mono text-red-400 mb-1">{issue.file}:L{issue.line}</p>
                                    <p className="text-sm font-bold">{issue.issue}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                            <p className="text-emerald-400 font-black text-sm uppercase">Secure: 0 Critical Risks</p>
                            <p className="text-[10px] text-emerald-400/60 mt-1">AI verified codebase for common exploits.</p>
                        </div>
                    )}
                </div>
                <div className="p-8 bg-white border border-border/40 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-6 font-black text-slate-800">
                        <ShieldSection icon={Shield} title="Security Posture" />
                    </div>
                    <div className="space-y-3">
                        {data.passedChecks && data.passedChecks.length > 0 ? (
                            data.passedChecks.map((check: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-black text-emerald-800">{check}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-[10px] font-black uppercase text-slate-400">Baseline Security Verified</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

const PerformanceSection = memo(function PerformanceSection({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-10 bg-white border border-border/40 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <Gauge className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-black text-slate-900">Performance Bottlenecks</h3>
                </div>
                {data.bottlenecks && data.bottlenecks.length > 0 ? (
                    <div className="grid gap-4">
                        {data.bottlenecks.map((b: any, i: number) => (
                            <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                                <p className="text-sm font-black font-mono text-primary mb-1">{b.file}</p>
                                <p className="text-sm text-slate-600 font-bold">{b.reason}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center bg-slate-50 rounded-[2rem] border border-slate-100">
                        <Zap className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                        <p className="text-sm font-black text-slate-900 uppercase">High Performance: 0 Bottlenecks</p>
                        <p className="text-xs text-slate-500 mt-2">No significant blocking operations or memory leaks detected.</p>
                    </div>
                )}
                {data.quickWin && (
                    <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-3xl">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">QUICK WIN</h4>
                        <p className="text-base font-bold text-slate-900 italic">"{data.quickWin}"</p>
                    </div>
                )}
             </div>
        </div>
    );
});

const LocalGuardSection = memo(function LocalGuardSection({ analysisId }: { analysisId: string }) {
    const script = `#!/bin/bash
# CheckBeforeCommit (CBC) Pre-commit Guard
# Install: Save this as .git/hooks/pre-commit and chmod +x .git/hooks/pre-commit

echo "🔍 CBC: Analyzing staged changes..."

# 1. Get staged files
STAGED_FILES=$(git diff --cached --name-only)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# 2. Collect file contents (limited to first 5 files for speed)
JSON_FILES="["
COUNT=0
for FILE in $STAGED_FILES; do
  if [ $COUNT -ge 5 ]; then break; fi
  if [ -f "$FILE" ]; then
    CONTENT=$(cat "$FILE" | sed 's/\\\\/\\\\\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\\n/\\\\n/g')
    JSON_FILES="$JSON_FILES{\\"path\\":\\"$FILE\\",\\"content\\":\\"$CONTENT\\"},"
    COUNT=$((COUNT+1))
  fi
done
JSON_FILES="\${JSON_FILES%,}]"

# 3. Call CBC API
REPO_URL=$(git config --get remote.origin.url)
API_KEY="cbc_14ebd2a976003db762cef41a50bfb9a3332405b73860cab2"

RESPONSE=$(curl -s -X POST "https://cbc2-five.vercel.app/api/hook/analyze" \\
  -H "Content-Type: application/json" \\
  -d "{\\"apiKey\\":\\"\$API_KEY\\",\\"repoUrl\\":\\"\$REPO_URL\\",\\"files\\":\$JSON_FILES}")

# 4. Parse Results
SUCCESS=$(echo \$RESPONSE | grep -o '"success":true')
if [ -z "\$SUCCESS" ]; then
  echo "❌ CBC: Analysis failed or unauthorized."
  echo "\$RESPONSE"
  exit 0 # Don't block if API is down
fi

SAFETY_SCORE=$(echo \$RESPONSE | grep -o '"safetyScore":[0-9]*' | grep -o '[0-9]*')
MAX_RISK=$(echo \$RESPONSE | grep -o '"maxRisk":"[^"]*"' | cut -d'"' -f4)

echo "----------------------------------------"
echo "✅ CBC Analysis Complete"
echo "🛡️  Safety Score: \$SAFETY_SCORE%"
echo "⚠️  Max Risk: \${MAX_RISK^^}"
echo "----------------------------------------"

if [ "\$MAX_RISK" == "critical" ]; then
  echo "🛑 CRITICAL RISK DETECTED. Commit blocked."
  exit 1
fi

exit 0`;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 bg-white border border-border/40 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">Local Repository Guard</h3>
                        <p className="text-sm text-slate-500 font-bold">Authenticate and deploy real-time security guards to your local Git workflow.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="p-6 bg-slate-900 rounded-3xl text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Active Key</p>
                            <div className="flex items-center justify-between">
                                <code className="text-sm font-mono font-bold tracking-widest">cbc_14eb••••••••••••••••••••••••</code>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => navigator.clipboard.writeText("cbc_14ebd2a976003db762cef41a50bfb9a3332405b73860cab2")}
                                    className="text-white hover:bg-white/10"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Deployment Instructions</h4>
                            <div className="space-y-4">
                                {[
                                    { step: "01", title: "Navigate to local root", cmd: "cd your-project-path" },
                                    { step: "02", title: "Save script as hook", cmd: ".git/hooks/pre-commit" },
                                    { step: "03", title: "Grant permissions", cmd: "chmod +x .git/hooks/pre-commit" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <span className="text-lg font-black text-primary opacity-30">{item.step}</span>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{item.title}</p>
                                            <code className="text-[10px] text-slate-500 font-mono">{item.cmd}</code>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-amber-700 mb-1">Encryption Warning</h4>
                                <p className="text-xs text-amber-800 font-bold leading-relaxed">
                                    Your Security Key is used to verify repository ownership. Never commit this script containing the key to public repositories.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <div className="relative p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                            <div className="flex items-center justify-between mb-4">
                                <ShieldSection icon={Terminal} title="Security Protocol" />
                                <Badge className="bg-slate-200 text-slate-600 border-none font-black text-[9px]">pre-commit-guard.sh</Badge>
                            </div>
                            <div className="bg-slate-900 rounded-2xl p-6 h-[400px] overflow-y-auto scrollbar-hide relative">
                                <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed">
                                    {script}
                                </pre>
                                <div className="absolute top-4 right-4">
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="bg-white/5 border-white/10 text-white hover:bg-white/20 font-black h-8 px-3"
                                        onClick={() => navigator.clipboard.writeText(script)}
                                    >
                                        <Copy className="w-3.5 h-3.5 mr-2" />
                                        Copy Script
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const IDEIntegrationSection = memo(function IDEIntegrationSection() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 bg-white border border-border/40 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                    <Layout className="w-6 h-6 text-primary" />
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">IDE Integration</h3>
                        <p className="text-sm text-slate-500 font-bold">Extension & API Access for your development environment.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem]">
                        <h4 className="text-lg font-black text-slate-900 mb-2">IDE Extension Keys</h4>
                        <p className="text-sm text-slate-500 font-bold mb-8">Generate keys to use the CheckBeforeCommit VS Code extension.</p>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key Name (e.g. VS Code - MacBook)</label>
                                <div className="flex gap-2">
                                    <Input placeholder="Personal VS Code" className="rounded-xl border-slate-200 h-11" />
                                    <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 rounded-xl h-11">Generate Key</Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-slate-200">
                            <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Active Keys</h5>
                            <div className="flex flex-col items-center justify-center py-10 grayscale opacity-40">
                                <Key className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-sm font-bold text-slate-400">No active keys found.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Layout className="w-48 h-48" />
                        </div>
                        <h4 className="text-xl font-black mb-6">VS Code Marketplace</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-bold mb-8">
                            Get real-time feedback while you code. CBC Extension highlights security and performance risks directly in your editor.
                        </p>
                        <Button className="w-full bg-primary hover:bg-primary/80 text-white font-black h-12 rounded-2xl">
                            Install from Marketplace
                        </Button>
                        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-4">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Zap className="w-4 h-4 text-emerald-400" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-300 italic">"This extension saved me from pushing a serious memory leak in Feature-Y segment."</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// Helper for labels
function ShieldSection({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
        </div>
    )
}

const APIContractSection = memo(function APIContractSection({ data }: { data: any }) {
    if (!data) return null;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-10 bg-white border border-border/40 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-primary" />
                        <h3 className="text-2xl font-black text-slate-900">API Architecture Map</h3>
                    </div>
                    <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 font-black text-[10px] uppercase">
                        {data.documented || '0'} Documented
                    </Badge>
                </div>
                
                {data.topEndpoints && data.topEndpoints.length > 0 ? (
                    <div className="space-y-4">
                        {data.topEndpoints.map((ep: any, i: number) => (
                            <div key={i} className="group p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white transition-all hover:shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                            ep.method === 'GET' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                                        )}>
                                            {ep.method}
                                        </span>
                                        <span className="text-sm font-black font-mono text-slate-800">{ep.path}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {ep.authRequired && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                                        <Badge variant="outline" className="text-[8px] border-slate-200 font-bold">Radius: {ep.blastRadius}</Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/50 rounded-xl text-[10px] font-black text-slate-500">
                                        PERFORMANCE: <span className="text-slate-800 font-black ml-1">{ep.performanceRisk}</span>
                                    </div>
                                    <div className="p-3 bg-white/50 rounded-xl text-[10px] font-black text-slate-500">
                                        VALIDATION: <span className="text-slate-800 font-black ml-1">{ep.validationPresent ? 'Present' : 'Missing'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-slate-100">
                        <Globe className="w-8 h-8 text-slate-300 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-black text-slate-400 uppercase">No API Endpoints Detected</p>
                        <p className="text-xs text-slate-400 mt-2">This repository may be a library or background service.</p>
                    </div>
                )}
             </div>
        </div>
    );
});


// --- Main Layout ---
export function AnalysisReport({ 
    data: incomingData, 
    repoUrl,
    analysisId,
    teamId,
    reviews = []
}: AnalysisReportProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [fixingId, setFixingId] = useState<string | null>(null);

    const handleAutoFix = useCallback(async (type: 'violation' | 'debt', index: number) => {
        const id = `${type}-${index}`;
        setFixingId(id);
        const res = await generateRemediationPR(analysisId || "", type, index);
        if (res.success && res.prUrl) {
            window.open(res.prUrl, '_blank');
        } else {
            alert(res.error || "Failed to generate fix");
        }
        setFixingId(null);
    }, [analysisId]);

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
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Layout },
        { id: 'onboarding', label: 'Onboarding', icon: BookOpen },
        { id: 'blast', label: 'Blast Radius', icon: Zap },
        { id: 'risk', label: 'Risk & Debt', icon: ShieldAlert },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'performance', label: 'Performance', icon: Gauge },
        { id: 'cleanup', label: 'Cleanup', icon: Trash2 },
        { id: 'api', label: 'API Map', icon: Globe },
        { id: 'local-guard', label: 'Local Guard', icon: ShieldCheck },
        { id: 'ide', label: 'IDE Integration', icon: Key },
        { id: 'cicd', label: 'CI/CD', icon: Ship },
        { id: 'verdict', label: 'Verdict', icon: CheckCircle2 },
    ];

    return (
        <div className="w-full max-w-[1000px] mx-auto pb-32 font-sans selection:bg-primary/20 relative">
            <TLDRSection data={data.tldr} repoUrl={repoUrl} />

            {/* Premium Metric Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "HEALTH SCORE", value: `${data.healthBreakdown?.score || 0}/100`, sub: "Moderate", color: "text-primary" },
                    { label: "MAINTAINABILITY", value: `${data.riskAndDebt.maintainability.score}/10`, sub: "-3 missing tests", color: "text-amber-500" },
                    { label: "ONBOARDING", value: data.riskAndDebt.onboardingTime.duration, sub: "+1 no README", color: "text-blue-500" },
                    { label: "TEST COVERAGE", value: data.riskAndDebt.testCoverage.level, sub: "6 test files found", color: "text-red-500" }
                ].map((m, i) => (
                    <div key={i} className="p-6 bg-[#1A1A1A] border border-white/5 rounded-3xl shadow-xl">
                        <div className="text-[10px] font-black text-slate-400 tracking-widest mb-2">{m.label}</div>
                        <div className={cn("text-2xl font-black tracking-tighter mb-1", m.color)}>{m.value}</div>
                        <div className="text-[10px] font-bold text-slate-500">{m.sub}</div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-8 border-b border-slate-100">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all",
                                    active 
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                                        : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5", active ? "text-primary" : "text-slate-300")} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 hover:bg-slate-50 gap-2"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            // You could add a toast here
                        }}
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share Report
                    </Button>
                </div>
            </div>

            {/* Tabbed Content */}
            <div className="mt-8 min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {data.benchmarking && (
                            <MaturityBenchmark 
                                data={data.benchmarking} 
                                language={data.tldr.architecture.includes('Python') ? 'Python' : 'Next.js'} 
                            />
                        )}
                        <MaturityScale 
                            data={data.maturity} 
                            onComment={() => toggleComments('maturity')} 
                            analysisId={analysisId}
                            teamId={teamId}
                        />
                         <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl">
                            <div className="shrink-0 flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 mb-6 w-fit">
                                <Zap className="w-5 h-5 text-primary fill-current" />
                                <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Core Data Flow</span>
                            </div>
                            <div className="flex items-center flex-wrap gap-3">
                                {data.onboarding.dataFlow.split('->').map((step, idx, arr) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/5 text-sm font-mono font-bold text-slate-200">
                                            {step.trim()}
                                        </div>
                                        {idx < arr.length - 1 && <ArrowRight className="w-4 h-4 text-primary opacity-50" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <HealthBreakdownSection data={data.healthBreakdown} />
                        <InfrastructureSection data={data.infrastructure} />
                    </div>
                )}

                {activeTab === 'onboarding' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <OnboardingPath 
                            data={data.onboarding} 
                            onComment={() => toggleComments('onboarding')}
                            analysisId={analysisId}
                            teamId={teamId}
                            reviews={reviews}
                        />
                        <ReadingTree data={data.onboarding} />
                    </div>
                )}

                {activeTab === 'blast' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <BlastRadius 
                            data={data.blastRadius} 
                            onComment={() => toggleComments('blast')}
                            analysisId={analysisId}
                            teamId={teamId}
                            impactfulFiles={data.impactfulFiles}
                            reviews={reviews}
                        />
                    </div>
                )}

                {activeTab === 'risk' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <RiskAndDebt 
                            data={data.riskAndDebt} 
                            onComment={() => toggleComments('risk')}
                            analysisId={analysisId}
                            teamId={teamId}
                            reviews={reviews}
                            onAutoFix={handleAutoFix}
                            fixingId={fixingId}
                        />
                        <GovernanceSection 
                            governance={data.governance} 
                            onComment={() => toggleComments('governance')}
                            onAutoFix={handleAutoFix}
                            fixingId={fixingId}
                        />
                    </div>
                )}

                {activeTab === 'security' && <SecuritySection data={data.security} />}
                {activeTab === 'performance' && <PerformanceSection data={data.performance} />}
                {activeTab === 'cleanup' && <CleanupSection data={data.cleanup} />}
                {activeTab === 'cicd' && <CICDSection data={data.cicd} />}
                {activeTab === 'api' && <APIContractSection data={data.apiContract} />}
                {activeTab === 'local-guard' && <LocalGuardSection analysisId={analysisId || ''} />}
                {activeTab === 'ide' && <IDEIntegrationSection />}

                {activeTab === 'verdict' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <FinalRecommendation data={data.recommendation} />
                    </div>
                )}
            </div>

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


