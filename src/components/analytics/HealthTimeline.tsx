'use client';

import { useState } from 'react';
import { 
    TrendingUp, TrendingDown, Minus, AlertTriangle, 
    Activity, Clock, ChevronDown, ChevronUp,
    ArrowUpRight, ArrowDownRight, Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RepoTimeline } from '@/lib/analysis/analytics';

interface HealthTimelineProps {
    timelines: RepoTimeline[];
}

function TrendIcon({ trend }: { trend: string }) {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
}

function MiniChart({ dataPoints }: { dataPoints: { healthScore: number }[] }) {
    if (dataPoints.length < 2) return null;
    
    const max = Math.max(...dataPoints.map(d => d.healthScore), 100);
    const min = Math.min(...dataPoints.map(d => d.healthScore), 0);
    const range = max - min || 1;
    const height = 60;
    const width = 200;
    const stepX = width / (dataPoints.length - 1);

    const points = dataPoints.map((d, i) => ({
        x: i * stepX,
        y: height - ((d.healthScore - min) / range) * height
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = pathD + ` L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

    const last = dataPoints[dataPoints.length - 1].healthScore;
    const gradientColor = last > 60 ? 'emerald' : last > 40 ? 'amber' : 'red';

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-[200px] h-[60px]" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`gradient-${gradientColor}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gradientColor === 'emerald' ? '#10b981' : gradientColor === 'amber' ? '#f59e0b' : '#ef4444'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={gradientColor === 'emerald' ? '#10b981' : gradientColor === 'amber' ? '#f59e0b' : '#ef4444'} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#gradient-${gradientColor})`} />
            <path d={pathD} fill="none" stroke={gradientColor === 'emerald' ? '#10b981' : gradientColor === 'amber' ? '#f59e0b' : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={gradientColor === 'emerald' ? '#10b981' : gradientColor === 'amber' ? '#f59e0b' : '#ef4444'} strokeWidth="2" />
            ))}
        </svg>
    );
}

function RepoTimelineCard({ timeline }: { timeline: RepoTimeline }) {
    const [expanded, setExpanded] = useState(false);
    const latest = timeline.dataPoints[timeline.dataPoints.length - 1];
    const first = timeline.dataPoints[0];

    const healthColor = timeline.currentHealth > 60 ? 'emerald' : timeline.currentHealth > 40 ? 'amber' : 'red';

    return (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300">
            <div 
                className="p-6 cursor-pointer flex items-center justify-between gap-6"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0",
                        healthColor === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                        healthColor === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    )}>
                        {timeline.currentHealth}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 truncate">{timeline.repoName}</span>
                            <Badge variant="outline" className={cn(
                                "text-[9px] h-4 px-2 font-black uppercase tracking-widest border-none",
                                timeline.trend === 'improving' ? 'bg-emerald-50 text-emerald-600' :
                                timeline.trend === 'declining' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                            )}>
                                <TrendIcon trend={timeline.trend} />
                                <span className="ml-1">{timeline.trend}</span>
                            </Badge>
                            {timeline.driftWarning && (
                                <Badge variant="outline" className="text-[9px] h-4 px-2 font-bold bg-amber-50 text-amber-600 border-none gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Drift
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
                            <span>{timeline.dataPoints.length} analyses</span>
                            <span>•</span>
                            <span>{latest?.maturity || 'Unknown'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                    <MiniChart dataPoints={timeline.dataPoints} />
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {timeline.driftWarning && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">Architecture Drift Detected</div>
                                <p className="text-sm text-amber-800 font-medium">{timeline.driftWarning}</p>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200/60">
                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Health</th>
                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Maturity</th>
                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Safety</th>
                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Tests</th>
                                    <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Coupling</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[...timeline.dataPoints].reverse().map((dp, i) => (
                                    <tr key={i} className="hover:bg-white transition-colors">
                                        <td className="py-3 px-3 text-xs font-mono text-slate-500">
                                            {new Date(dp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={cn(
                                                "text-sm font-black",
                                                dp.healthScore > 60 ? 'text-emerald-600' : dp.healthScore > 40 ? 'text-amber-600' : 'text-red-600'
                                            )}>
                                                {dp.healthScore}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-xs font-bold text-slate-600">{dp.maturity}</td>
                                        <td className="py-3 px-3 text-xs font-bold text-slate-600">{dp.refactorSafety}%</td>
                                        <td className="py-3 px-3">
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-bold",
                                                dp.testCoverage === 'High' ? 'text-emerald-600 bg-emerald-50' :
                                                dp.testCoverage === 'Low' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
                                            )}>{dp.testCoverage}</Badge>
                                        </td>
                                        <td className="py-3 px-3">
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-bold",
                                                dp.coupling === 'Low' ? 'text-emerald-600 bg-emerald-50' :
                                                dp.coupling === 'Med' ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
                                            )}>{dp.coupling}</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export function HealthTimeline({ timelines }: HealthTimelineProps) {
    if (!timelines || timelines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Activity className="w-10 h-10 text-slate-300" />
                <div>
                    <h3 className="text-base font-bold text-slate-900">No Timeline Data Yet</h3>
                    <p className="text-xs text-slate-500 mt-1">Re-analyze repositories over time to track health trends.</p>
                </div>
            </div>
        );
    }

    const declining = timelines.filter(t => t.trend === 'declining').length;
    const drifting = timelines.filter(t => t.driftWarning).length;

    return (
        <div className="space-y-6">
            {/* Summary Alert */}
            {(declining > 0 || drifting > 0) && (
                <div className="p-5 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-100/50 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-red-900 uppercase tracking-wider">Attention Required</h4>
                        <p className="text-sm text-red-800/80 mt-1 font-medium">
                            {declining > 0 && <>{declining} {declining === 1 ? 'repo is' : 'repos are'} declining in health. </>}
                            {drifting > 0 && <>{drifting} {drifting === 1 ? 'repo has' : 'repos have'} architecture drift warnings.</>}
                        </p>
                    </div>
                </div>
            )}

            {/* Repo Cards */}
            <div className="grid gap-4">
                {timelines.map((timeline) => (
                    <RepoTimelineCard key={timeline.repoUrl} timeline={timeline} />
                ))}
            </div>
        </div>
    );
}
