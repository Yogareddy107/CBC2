'use client';

import { useState } from 'react';
import { runPRAnalysis } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GitPullRequest, Search, Loader2, AlertTriangle, CheckCircle2, FileSignature, GitMerge, FileWarning, ShieldCheck, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRAnalysisResult } from '@/lib/llm/pr-client';
import { Badge } from '@/components/ui/badge';

export default function PRReviewPage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ 
        analysis: PRAnalysisResult, 
        meta: any, 
        deterministicImpact: any[], 
        isStateful: boolean 
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await runPRAnalysis(url);
            if (res.success && res.data) {
                setResult({ 
                    analysis: res.data as PRAnalysisResult, 
                    meta: (res.data as any).meta,
                    deterministicImpact: (res.data as any).deterministicImpact || [],
                    isStateful: !!(res.data as any).isStateful
                });
            } else {
                setError(res.error || "Failed to analyze PR.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-50/20">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
            
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* Header */}
                <div className="text-center space-y-8">
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-sm shadow-sm ring-1 ring-primary/5">
                            <GitPullRequest className="w-3.5 h-3.5" />
                            Intelligent PR Audit
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
                        Review PRs <span className="text-primary italic">10x Faster</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        Paste a GitHub Pull Request URL to get an instant risk assessment and find hidden bugs before they merge.
                    </p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl mx-auto relative">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">GitHub PR URL</label>
                        <Input
                            placeholder="https://github.com/owner/repo/pull/123"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="h-14 border-border/50 text-base shadow-inner"
                            required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={loading || !url}
                        className="w-full h-14 bg-[#1A1A1A] hover:bg-primary text-white font-bold transition-all shadow-md mt-4 text-base rounded-xl"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5" /> Analyze PR
                            </div>
                        )}
                    </Button>
                </form>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium flex items-start gap-3 max-w-2xl mx-auto">
                        <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Meta PR Header */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-secondary/10 rounded-xl border border-border/40">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <GitMerge className="w-5 h-5 text-primary" /> {result.meta.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    PR #{result.meta.prNumber} by <span className="font-bold">{result.meta.author}</span> in {result.meta.repoFullName}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {result.isStateful && (
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 uppercase font-black tracking-widest text-[10px]">
                                        Deep Sync Active
                                    </Badge>
                                )}
                                <Badge variant="outline" className={cn(
                                    "uppercase font-black",
                                    result.meta.state === 'open' ? "bg-green-50 text-green-700 border-green-200" : "bg-purple-50 text-purple-700 border-purple-200"
                                )}>
                                    {result.meta.state}
                                </Badge>
                                <div className="text-sm font-bold font-mono text-muted-foreground flex gap-2">
                                    <span className="text-green-600">+{result.meta.additions}</span>
                                    <span className="text-red-500">-{result.meta.deletions}</span>
                                </div>
                            </div>
                        </div>

                        {/* Hotspot Alerts (Stateful Feature) */}
                        {result.analysis.hotspotAlerts && result.analysis.hotspotAlerts.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-600">Hotspot Alerts (Persistent Knowledge)</h3>
                                </div>
                                <div className="grid gap-3">
                                    {result.analysis.hotspotAlerts.map((alert, i) => (
                                        <div key={i} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono font-bold text-amber-900">{alert.file}</span>
                                                    <Badge variant="outline" className="text-[9px] bg-amber-100/50 text-amber-700 border-none uppercase font-black">{alert.riskType}</Badge>
                                                </div>
                                                <p className="text-sm text-amber-800/80 font-medium leading-relaxed">{alert.advice}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Governance Alerts (Architecture-as-Code) */}
                        {result.analysis.governanceAlerts && result.analysis.governanceAlerts.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Shield className="w-4 h-4 text-primary" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">Architectural Governance Violations</h3>
                                </div>
                                <div className="grid gap-3">
                                    {result.analysis.governanceAlerts.map((alert, i) => (
                                        <div key={i} className="bg-white border-2 border-red-100 rounded-xl p-6 flex items-start gap-5 shadow-sm hover:border-red-200 transition-colors">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                alert.severity === 'Error' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                            )}>
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-slate-900 leading-tight">{alert.ruleName}</span>
                                                    <Badge className={cn(
                                                        "text-[9px] font-black uppercase px-2 py-0.5 border-none",
                                                        alert.severity === 'Error' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                                                    )}>
                                                        {alert.severity}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium">{alert.violation}</p>
                                                <div className="pt-2">
                                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <p className="text-[11px] font-bold text-slate-800 flex items-center gap-2 italic">
                                                            <span className="text-primary NOT-ITALIC font-black">💡 Advice:</span> {alert.advice}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary & Risk Card */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 p-6 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden border border-slate-800">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
                                <div className="relative z-10 space-y-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2 text-primary/90 uppercase tracking-wider text-sm mb-4">
                                        <FileSignature className="w-5 h-5" /> What this PR actually does
                                    </h2>
                                    <p className="text-slate-200 text-base leading-relaxed">
                                        {result.analysis.humanReadableSummary}
                                    </p>
                                </div>
                            </div>

                            <div className={cn(
                                "flex flex-col justify-center items-center text-center p-6 rounded-2xl border shadow-sm",
                                result.analysis.riskAssessment.level === 'Low' && "bg-green-50 border-green-200",
                                result.analysis.riskAssessment.level === 'Medium' && "bg-amber-50 border-amber-200",
                                (result.analysis.riskAssessment.level === 'High' || result.analysis.riskAssessment.level === 'Critical') && "bg-red-50 border-red-200",
                            )}>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Risk Level</h3>
                                <div className={cn(
                                    "text-3xl font-black uppercase mb-4",
                                    result.analysis.riskAssessment.level === 'Low' && "text-green-600",
                                    result.analysis.riskAssessment.level === 'Medium' && "text-amber-600",
                                    (result.analysis.riskAssessment.level === 'High' || result.analysis.riskAssessment.level === 'Critical') && "text-red-600",
                                )}>
                                    {result.analysis.riskAssessment.level}
                                </div>
                                <p className="text-xs text-foreground/80 font-medium">
                                    {result.analysis.riskAssessment.reason}
                                </p>
                            </div>
                        </div>

                        {/* Deterministic Blast Radius (Phase 2) */}
                        {result.deterministicImpact && result.deterministicImpact.length > 0 && (
                            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary italic flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4" /> Deterministic Blast Radius
                                        </h3>
                                        <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10 text-[9px] uppercase font-black tracking-widest px-2 py-0.5">Verified Logic</Badge>
                                    </div>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {result.deterministicImpact.map((imp: any, i: number) => (
                                            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group/item hover:bg-white/10 transition-all">
                                                <div className="min-w-0 pr-2">
                                                    <div className="text-[10px] font-mono text-slate-400 truncate mb-1">{imp.file}</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                                                            imp.risk === 'CRITICAL' ? "bg-red-500 text-white" : 
                                                            imp.risk === 'HIGH' ? "bg-orange-500 text-white" :
                                                            imp.risk === 'MEDIUM' ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-300"
                                                        )}>
                                                            {imp.risk}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400">Reach: {imp.reach}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center h-10 w-10 bg-black/40 rounded-lg group-hover/item:scale-110 transition-transform shadow-inner shadow-black/20">
                                                    <div className={cn(
                                                        "text-lg font-black",
                                                        imp.reach > 10 ? "text-red-400" : imp.reach > 0 ? "text-emerald-400" : "text-slate-500"
                                                    )}>{imp.reach}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* High Risk Files */}
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-red-50 border-b border-red-100 p-4 flex items-center gap-2">
                                <FileWarning className="w-5 h-5 text-red-600" />
                                <h3 className="font-bold text-red-700 uppercase tracking-wide text-sm">Review these files carefully</h3>
                            </div>
                            <div className="p-2 space-y-2">
                                {result.analysis.filesNeedingCarefulReview.length === 0 ? (
                                    <p className="p-4 text-sm text-muted-foreground italic">No specific high-risk files identified in the diff.</p>
                                ) : (
                                    result.analysis.filesNeedingCarefulReview.map((item, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 hover:bg-secondary/20 rounded-lg transition-colors">
                                            <div className="sm:w-1/3">
                                                <span className="font-mono text-xs font-bold bg-secondary/80 px-2 py-1 rounded inline-block break-all text-secondary-foreground">{item.file}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground sm:w-2/3">{item.reason}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Module Impact */}
                            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Affected Modules</h3>
                                <ul className="space-y-4">
                                    {result.analysis.moduleImpact.map((item, i) => (
                                        <li key={i} className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-primary">{item.name}</span>
                                            <p className="text-sm text-muted-foreground">{item.impact}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Nitpicks */}
                            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Nitpicks & Observations</h3>
                                <ul className="space-y-3">
                                    {result.analysis.nitpicksAndSuggestions.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <span className="text-primary mt-0.5">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
