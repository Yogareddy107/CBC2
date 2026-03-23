'use client';

import { useState } from 'react';
import { Search, Activity, AlertTriangle, ShieldCheck, Zap, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { predictImpact } from '@/app/analyze/actions';

interface ImpactResult {
    file: string;
    reach: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
}

export function ImpactExplorer({ analysisId }: { analysisId: string }) {
    const [filePath, setFilePath] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImpactResult | null>(null);

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!filePath || loading) return;

        setLoading(true);
        try {
            const res = await predictImpact(analysisId, filePath);
            setResult(res as ImpactResult);
        } catch (err) {
            console.error("Impact prediction failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-border/40 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">Impact Explorer</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Predict blast radius before you commit</p>
                    </div>
                </div>

                <form onSubmit={handlePredict} className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                        <Input 
                            placeholder="Enter file path (e.g., src/lib/auth.ts)"
                            value={filePath}
                            onChange={(e) => setFilePath(e.target.value)}
                            className="pl-11 h-12 bg-secondary/20 border-border/10 rounded-2xl focus-visible:ring-primary/20 text-sm font-medium"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={loading || !filePath}
                        className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Prediction"}
                    </Button>
                </form>

                {result ? (
                    <div className={cn(
                        "animate-in fade-in slide-in-from-top-4 duration-500 p-8 rounded-[2rem] border-2",
                        result.risk === 'HIGH' ? "bg-red-50 border-red-100" : result.risk === 'MEDIUM' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                    )}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                        result.risk === 'HIGH' ? "bg-red-500 text-white border-red-400" : result.risk === 'MEDIUM' ? "bg-amber-500 text-white border-amber-400" : "bg-emerald-500 text-white border-emerald-400"
                                    )}>
                                        {result.risk} Risk Change
                                    </span>
                                    <span className="text-[10px] font-mono text-muted-foreground break-all">{result.file}</span>
                                </div>
                                <h4 className="text-2xl font-black text-[#1A1A1A] tracking-tighter">
                                    {result.reach === 1 ? "Isolated Change" : `Mechanical Reach: ${result.reach} Modules`}
                                </h4>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {result.risk === 'HIGH' ? (
                                    <AlertTriangle className="w-12 h-12 text-red-500" />
                                ) : result.risk === 'MEDIUM' ? (
                                    <Zap className="w-12 h-12 text-amber-500" />
                                ) : (
                                    <ShieldCheck className="w-12 h-12 text-emerald-500" />
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white/60 p-6 rounded-3xl border border-white/50 backdrop-blur-sm">
                                <h5 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-4">Blast Radius Logic</h5>
                                <p className="text-sm text-foreground font-medium leading-relaxed italic">
                                    "{result.message}"
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <h5 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">Safety Checklist</h5>
                                <div className="space-y-2">
                                    {[
                                        { label: "Predict Impact", status: true },
                                        { label: "Existing Test Coverage", status: result.risk !== 'HIGH' },
                                        { label: "Refactor Safety", status: result.risk === 'LOW' },
                                    ].map((check, i) => (
                                        <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/40 rounded-xl border border-white/20">
                                            <span className="text-xs font-bold text-slate-600">{check.label}</span>
                                            {check.status ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                        <Zap className="w-10 h-10 text-slate-200 mb-4" />
                        <p className="text-sm font-bold text-slate-400">Enter a file path to analyze its relationships.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
