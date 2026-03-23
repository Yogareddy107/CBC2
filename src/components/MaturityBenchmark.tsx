'use client';

import { 
    Trophy, 
    TrendingUp, 
    Users, 
    Award, 
    BarChart3,
    ArrowUpRight,
    Sparkles,
    Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AnalysisResult } from '@/lib/llm/client';

interface MaturityBenchmarkProps {
    data: NonNullable<AnalysisResult['benchmarking']>;
    language: string;
}

export function MaturityBenchmark({ data, language }: MaturityBenchmarkProps) {
    const gradeColors = {
        'A+': 'from-amber-400 via-yellow-300 to-amber-500 text-amber-950 shadow-amber-500/50',
        'A': 'from-blue-400 via-indigo-400 to-blue-500 text-white shadow-blue-500/50',
        'B+': 'from-emerald-400 via-teal-400 to-emerald-500 text-emerald-950 shadow-emerald-500/50',
        'B': 'from-emerald-300 via-emerald-400 to-emerald-500 text-emerald-950 shadow-emerald-400/40',
        'C': 'from-slate-300 via-slate-400 to-slate-500 text-slate-950 shadow-slate-400/30',
        'D': 'from-orange-300 via-orange-400 to-orange-500 text-orange-950 shadow-orange-400/30',
        'F': 'from-rose-400 via-red-400 to-rose-500 text-white shadow-rose-500/50',
    };

    return (
        <div className="relative group mb-12">
            {/* Glow Effect */}
            <div className={cn(
                "absolute inset-0 blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000 rounded-[3rem] bg-gradient-to-br",
                gradeColors[data.grade]
            )} />

            <div className="relative bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="grid md:grid-cols-12 items-stretch">
                    
                    {/* Grade Section - High Prestige */}
                    <div className={cn(
                        "md:col-span-4 bg-gradient-to-br p-10 flex flex-col items-center justify-center text-center relative overflow-hidden",
                        gradeColors[data.grade]
                    )}>
                        {/* Decorative Background Icon */}
                        <Award className="absolute w-64 h-64 -bottom-10 -right-10 opacity-10 rotate-12" />
                        
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">Marketplace Grade</h3>
                            <div className="text-9xl font-black tracking-tighter drop-shadow-2xl">
                                {data.grade}
                            </div>
                            {data.eliteStatus && (
                                <div className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-black/10 backdrop-blur-md rounded-full border border-black/5">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Architectural Elite</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats & Insights Section */}
                    <div className="md:col-span-8 p-10 flex flex-col justify-center space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Engineering Maturity Index</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                This repository is in the <span className="text-primary">Top {100 - data.percentile}%</span> of {language} projects.
                            </h2>
                            <p className="text-slate-500 font-medium text-base leading-relaxed max-w-xl italic">
                                "{data.competitiveInsight}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Users className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Global Ranking</span>
                                </div>
                                <div className="text-xl font-black text-slate-900">{data.percentile}th</div>
                                <div className="text-[10px] text-slate-400 font-bold">Percentile</div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <BarChart3 className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Stack Average</span>
                                </div>
                                <div className="text-xl font-black text-slate-900">{data.stackAverage}%</div>
                                <div className="text-[10px] text-slate-400 font-bold">Engineering Health</div>
                            </div>

                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col">
                                <div className="flex items-center gap-2 text-primary mb-2">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Market Value</span>
                                </div>
                                <div className="text-xl font-black text-primary">+{Math.max(0, data.percentile - 50)}%</div>
                                <div className="text-[10px] text-primary/60 font-bold">Above Benchmark</div>
                            </div>
                        </div>

                        {/* Social Share Trigger (Visual Only for now) */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium italic">Shared by elite architecture teams</span>
                            </div>
                            <Badge variant="outline" className="h-8 px-4 rounded-xl border-primary/20 text-primary flex items-center gap-2 hover:bg-primary/5 cursor-pointer transition-colors group/share">
                                Certify Grade <ArrowUpRight className="w-3 h-3 group-hover/share:translate-x-0.5 group-hover/share:-translate-y-0.5 transition-transform" />
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
