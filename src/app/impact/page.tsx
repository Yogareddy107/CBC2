'use client';

import { useState } from 'react';
import { runImpactAnalysis } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Activity, GitBranch, AlertTriangle, CheckCircle2, Search, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImpactResult } from '@/lib/llm/impact-client';
import { Badge } from '@/components/ui/badge';

export default function ImpactAnalyzerPage() {
    const [url, setUrl] = useState('');
    const [filePath, setFilePath] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImpactResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !filePath) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await runImpactAnalysis(url, filePath);
            if (res.success && res.data) {
                setResult(res.data);
            } else {
                setError(res.error || "Failed to analyze impact.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-transparent text-foreground font-sans">
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <Activity className="w-3.5 h-3.5" /> Change Impact Analyzer
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                        What breaks if you change this file?
                    </h1>
                    <p className="text-muted-foreground text-base max-w-xl mx-auto">
                        Paste a repository and a specific file path to map out its blast radius, dependencies, and co-update requirements.
                    </p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">GitHub URL</label>
                            <Input
                                placeholder="https://github.com/owner/repo"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="h-12 border-border/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">File Path</label>
                            <Input
                                placeholder="src/lib/auth.ts"
                                value={filePath}
                                onChange={(e) => setFilePath(e.target.value)}
                                className="h-12 border-border/50 font-mono text-sm"
                                required
                            />
                        </div>
                    </div>
                    <Button 
                        type="submit" 
                        disabled={loading || !url || !filePath}
                        className="w-full h-12 bg-[#1A1A1A] hover:bg-primary font-bold transition-all shadow-md mt-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4" /> Analyze Impact
                            </div>
                        )}
                    </Button>
                </form>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Card */}
                        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden border border-slate-800">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
                            
                            <div className="relative z-10 space-y-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" /> Analysis Complete
                                    </h2>
                                    <Badge variant="outline" className={cn(
                                        "uppercase font-black text-xs px-2.5 py-0.5 border",
                                        result.riskLevel === 'low' && "bg-green-500/10 text-green-400 border-green-500/20",
                                        result.riskLevel === 'medium' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                        (result.riskLevel === 'high' || result.riskLevel === 'critical') && "bg-red-500/10 text-red-400 border-red-500/20",
                                    )}>
                                        {result.riskLevel} Risk
                                    </Badge>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                                    {result.summary}
                                </p>
                            </div>
                        </div>

                        {result.warning && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500 rounded-r-xl">
                                <h3 className="text-sm font-bold text-red-700 uppercase flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4" /> Warning
                                </h3>
                                <p className="text-sm text-red-600/80">{result.warning}</p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Dependent Files */}
                            <div className="bg-card border border-border shadow-sm rounded-xl p-5">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                                    <GitBranch className="w-4 h-4 text-purple-500" /> Blast Radius Dependents
                                </h3>
                                {result.blastRadius.dependentFiles.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No obvious dependents detected.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {result.blastRadius.dependentFiles.map((item, i) => (
                                            <li key={i} className="flex gap-3">
                                                <ArrowRight className="w-4 h-4 mt-1 text-purple-400 shrink-0" />
                                                <div>
                                                    <span className="text-sm border border-border bg-secondary/50 px-1.5 py-0.5 rounded font-mono font-bold text-foreground break-all inline-block mb-1">{item.file}</span>
                                                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Co-Updates */}
                            <div className="bg-card border border-border shadow-sm rounded-xl p-5">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suggested Co-Updates
                                </h3>
                                {result.coUpdateSuggestions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No obvious co-updates detected.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {result.coUpdateSuggestions.map((item, i) => (
                                            <li key={i} className="flex gap-3">
                                                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                <div>
                                                    <span className="text-sm border border-emerald-500/20 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold break-all inline-block mb-1">{item.file}</span>
                                                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
