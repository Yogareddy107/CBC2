'use client';

import { useState } from 'react';
import { 
    Map, 
    ChevronRight, 
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    Zap, 
    Target,
    Boxes,
    GitBranch,
    Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AnalysisResult } from '@/lib/llm/client';

interface ModernizationRoadmapProps {
    roadmap: NonNullable<AnalysisResult['modernizationRoadmap']>;
    currentScore: number;
}

export function ModernizationRoadmap({ roadmap, currentScore }: ModernizationRoadmapProps) {
    const [activeTarget, setActiveTarget] = useState(0);

    const targetScore = currentScore + roadmap.totalPredictedHealthGain;

    return (
        <div className="space-y-8">
            {/* Roadmap Header & Progress Projection */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/20 rounded-xl text-primary border border-primary/20">
                                <Map className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-primary italic">Strategy Layer</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight leading-tight">Your Modernization <br />Roadmap</h2>
                        <p className="text-slate-400 font-medium max-w-md leading-relaxed">
                            We've identified {roadmap.targets.length} strategic projects to decouple your core logic and improve maintainability by {roadmap.totalPredictedHealthGain}%.
                        </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center gap-4">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Circular Progress Mask */}
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-white/5"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    strokeDasharray={552}
                                    strokeDashoffset={552 - (552 * targetScore) / 100}
                                    className="text-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black">{targetScore}%</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Health</span>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase font-black text-[10px] px-3">
                            +{roadmap.totalPredictedHealthGain}% Projected Gain
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Tactical Targets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2 italic">Refactor Projects</h3>
                    {roadmap.targets.map((target, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTarget(i)}
                            className={cn(
                                "w-full text-left p-5 rounded-2xl border transition-all relative group",
                                activeTarget === i 
                                    ? "bg-white border-primary shadow-lg ring-4 ring-primary/5" 
                                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className={cn(
                                    "text-[9px] uppercase font-black px-1.5 py-0 border-none",
                                    target.effort === 'Low' ? "bg-emerald-100 text-emerald-700" :
                                    target.effort === 'Med' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                                )}>
                                    {target.effort} Effort
                                </Badge>
                                <ChevronRight className={cn("w-4 h-4 transition-transform", activeTarget === i ? "text-primary translate-x-1" : "text-slate-300")} />
                            </div>
                            <h4 className="font-bold text-slate-900 leading-tight mb-1">{target.title}</h4>
                            <p className="text-[10px] font-mono text-slate-500 truncate">{target.file}</p>
                        </button>
                    ))}
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm min-h-[400px] flex flex-col">
                        <div className="flex items-start justify-between gap-6 mb-8">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Boxes className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Technical Playbook</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{roadmap.targets[activeTarget].title}</h3>
                                <p className="text-sm text-slate-500 font-medium">Target: <span className="text-slate-900">{roadmap.targets[activeTarget].targetArchitecture}</span></p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-rose-500">{roadmap.targets[activeTarget].currentComplexity}%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Current Debt</div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                                        <Lightbulb className="w-3 h-3" /> Strategic Insight
                                    </h5>
                                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                                        {roadmap.targets[activeTarget].predictedImpact}
                                    </p>
                                </div>
                                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
                                        <Target className="w-3 h-3" /> Core File
                                    </h5>
                                    <p className="text-[11px] font-mono font-bold text-emerald-900 break-all">
                                        {roadmap.targets[activeTarget].file}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Step-by-Step Implementation</h5>
                                <div className="space-y-3">
                                    {roadmap.targets[activeTarget].steps.map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl group/step hover:border-primary/20 transition-all">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 group-hover/step:bg-primary/10 group-hover/step:text-primary transition-colors">
                                                {idx + 1}
                                            </div>
                                            <p className="text-sm font-medium text-slate-700 group-hover/step:text-slate-900 transition-colors">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Est. {roadmap.targets[activeTarget].effort === 'Low' ? '1-2 Days' : roadmap.targets[activeTarget].effort === 'Med' ? '3-5 Days' : '1-2 Weeks'}</span>
                            </div>
                            <Button className="rounded-xl h-10 px-6 font-bold flex items-center gap-2">
                                Create Refactor Branch <GitBranch className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
