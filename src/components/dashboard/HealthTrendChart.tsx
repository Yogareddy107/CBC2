'use client';

import React from 'react';
import { TrendingUp, ShieldCheck, Activity } from 'lucide-react';

interface TrendPoint {
    date: string;
    score: number;
    adherence: number;
    repo?: string;
}

interface HealthTrendChartProps {
    data: TrendPoint[];
}

export function HealthTrendChart({ data }: HealthTrendChartProps) {
    if (!data || data.length < 2) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-[3rem] p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-slate-900 font-bold">Trend data pending</p>
                    <p className="text-slate-400 text-xs">Run at least 2 analyses to see your architectural trajectory.</p>
                </div>
            </div>
        );
    }

    const width = 800;
    const height = 200;
    const padding = 40;

    const maxScore = 100;
    const pointsCount = data.length;

    const getX = (index: number) => padding + (index * (width - 2 * padding) / (pointsCount - 1));
    const getY = (value: number) => height - padding - (value * (height - 2 * padding) / maxScore);

    const scorePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.score)}`).join(' ');
    const adherencePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.adherence)}`).join(' ');

    return (
        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-[#FF7D29]" /> Technical Health Trending
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Architectural Adherence vs. Code Maturity</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF7D29]" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Health Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Governance</span>
                    </div>
                </div>
            </div>

            <div className="relative pt-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map(v => (
                        <g key={v}>
                            <line 
                                x1={padding} 
                                y1={getY(v)} 
                                x2={width - padding} 
                                y2={getY(v)} 
                                className="stroke-slate-100" 
                                strokeWidth="1" 
                                strokeDasharray="4 4" 
                            />
                            <text x="0" y={getY(v) + 4} className="text-[10px] font-bold fill-slate-300 uppercase tracking-tighter">{v}%</text>
                        </g>
                    ))}

                    {/* Adherence Line (Governance) */}
                    <path 
                        d={adherencePath} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        className="text-slate-900" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />

                    {/* Health Line */}
                    <path 
                        d={scorePath} 
                        fill="none" 
                        stroke="#FF7D29" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="drop-shadow-[0_4px_8px_rgba(255,125,41,0.2)]"
                    />

                    {/* Data Points */}
                    {data.map((d, i) => (
                        <g key={i}>
                            <circle cx={getX(i)} cy={getY(d.score)} r="4" fill="white" stroke="#FF7D29" strokeWidth="2" />
                            <text x={getX(i)} y={height - 10} textAnchor="middle" className="text-[9px] font-black fill-slate-400 uppercase tracking-widest">
                                {d.date}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
                 <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex items-center gap-4">
                    <Activity className="w-6 h-6 text-[#FF7D29]" />
                    <div>
                        <p className="text-[10px] font-black text-[#FF7D29] uppercase tracking-widest">Latest Health</p>
                        <p className="text-2xl font-black text-slate-900">{data[data.length-1].score}%</p>
                    </div>
                 </div>
                 <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-slate-900" />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Adherence</p>
                        <p className="text-2xl font-black text-slate-900">{data[data.length-1].adherence}%</p>
                    </div>
                 </div>
            </div>
        </div>
    );
}
