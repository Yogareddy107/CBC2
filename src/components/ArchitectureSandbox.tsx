'use client';

import { useState } from 'react';
import { 
    FlaskConical, 
    RefreshCcw, 
    Trash2, 
    Split, 
    Shield, 
    ChevronRight, 
    ArrowRight,
    Loader2,
    CheckCircle2,
    Info,
    LayoutDashboard,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { simulateRefactor } from '@/app/analyze/actions';
import type { SimulationResult, SimulationActionType } from '@/lib/analysis/simulation-engine';

interface ArchitectureSandboxProps {
    analysisId: string;
    impactfulFiles: { file: string; reach: number }[];
}

export function ArchitectureSandbox({ analysisId, impactfulFiles }: ArchitectureSandboxProps) {
    const [selectedFile, setSelectedFile] = useState<string>(impactfulFiles[0]?.file || '');
    const [actionType, setActionType] = useState<SimulationActionType>('DECOMPOSE');
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [parts, setParts] = useState(3);

    const handleSimulate = async () => {
        setIsSimulating(true);
        const res = await simulateRefactor(analysisId, {
            type: actionType,
            targetFile: selectedFile,
            params: { parts }
        });
        
        if (res.success && res.result) {
            setResult(res.result);
        }
        setIsSimulating(false);
    };

    const reset = () => {
        setResult(null);
        setSelectedFile(impactfulFiles[0]?.file || '');
    };

    return (
        <section className="mb-12">
            <div className="flex items-center gap-2 mb-6 px-2">
                <FlaskConical className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">Architecture Labs <span className="text-slate-400 font-medium lowercase tracking-normal">(What-if Sandbox)</span></h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-xl flex flex-col md:flex-row min-h-[500px]">
                
                {/* Control Panel */}
                <div className="md:w-80 bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Test Subject</label>
                        <select 
                            value={selectedFile}
                            onChange={(e) => setSelectedFile(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all truncate"
                        >
                            {impactfulFiles.map(f => (
                                <option key={f.file} value={f.file}>{f.file.split('/').pop()}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-100/50 p-3 rounded-xl">
                            <Info className="w-3 h-3 shrink-0" />
                            <span>This file is a "Hub" influencing {impactfulFiles.find(f => f.file === selectedFile)?.reach} other modules.</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Refactor Strategy</label>
                        <div className="grid gap-2">
                            {[
                                { id: 'DECOMPOSE', icon: Split, label: 'Decompose Hub' },
                                { id: 'ISOLATE', icon: Shield, label: 'Isolate (Interface)' },
                                { id: 'DELETE', icon: Trash2, label: 'Delete Module' },
                            ].map(action => (
                                <button
                                    key={action.id}
                                    onClick={() => setActionType(action.id as SimulationActionType)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all border",
                                        actionType === action.id 
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1" 
                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                    )}
                                >
                                    <action.icon className="w-4 h-4" />
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {actionType === 'DECOMPOSE' && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Splits: {parts}</label>
                            <input 
                                type="range" 
                                min="2" 
                                max="6" 
                                value={parts}
                                onChange={(e) => setParts(parseInt(e.target.value))}
                                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    )}

                    <div className="pt-4 mt-auto">
                        <Button 
                            onClick={handleSimulate}
                            disabled={isSimulating}
                            className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200"
                        >
                            {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Lab Simulation"}
                        </Button>
                    </div>
                </div>

                {/* Simulation Workspace */}
                <div className="flex-1 p-10 bg-gradient-to-br from-white to-slate-50/50 flex flex-col">
                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 grayscale group">
                            <FlaskConical className="w-16 h-16 mb-4 group-hover:rotate-12 transition-transform duration-500" />
                            <h3 className="text-xl font-black">Waiting for Mutation...</h3>
                            <p className="text-sm font-medium mt-2 max-w-xs leading-relaxed">
                                Select a module and a strategy to see how it changes your architectural health.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
                            
                            {/* Comparison Header */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 italic">Projected ROI</div>
                                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                        Architectural Health: <span className="text-indigo-600">+{result.scoreDelta} pts</span>
                                    </h2>
                                </div>
                                <button 
                                    onClick={reset}
                                    className="p-3 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                                    title="Reset Lab"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Impact Gauges */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative">
                                    <LayoutDashboard className="absolute w-32 h-32 -bottom-8 -right-8 opacity-10" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Final Score</div>
                                    <div className="text-5xl font-black leading-none">{result.simulatedScore}%</div>
                                    <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase">
                                        <ArrowRight className="w-3 h-3" />
                                        Up from {result.originalScore}%
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2rem] bg-emerald-500 text-white shadow-2xl shadow-emerald-100 overflow-hidden relative">
                                    <Shield className="absolute w-32 h-32 -bottom-8 -right-8 opacity-10" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Risk Reduction</div>
                                    <div className="text-5xl font-black leading-none">-{Math.round((1 - result.newBlastRadius / (impactfulFiles.find(f => f.file === selectedFile)?.reach || 1)) * 100)}%</div>
                                    <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase">
                                        <ArrowRight className="w-3 h-3" />
                                        Reduced Blast Radius
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2rem] bg-amber-400 text-amber-950 shadow-2xl shadow-amber-100 overflow-hidden relative">
                                    <Zap className="absolute w-32 h-32 -bottom-8 -right-8 opacity-10" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Refactor ROI</div>
                                    <div className="text-5xl font-black leading-none">High</div>
                                    <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase">
                                        <ArrowRight className="w-3 h-3" />
                                        Strategic Priority
                                    </div>
                                </div>
                            </div>

                            {/* Summary & Hotspots */}
                            <div className="grid md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Simulation Summary</div>
                                    <p className="text-base font-medium text-slate-700 leading-relaxed italic border-l-4 border-indigo-200 pl-6">
                                        "{result.summary}"
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Hotspots</div>
                                    <div className="space-y-2">
                                        {result.impactedHotspots.slice(0, 3).map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <span className="text-[11px] font-bold font-mono text-slate-500 truncate">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="bg-slate-900 rounded-3xl p-8 flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-white">Save as Modernization Path?</div>
                                        <div className="text-xs text-slate-400">Convert this simulation into a tactical refactor playbook for your team.</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
