'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Users, Layout, Clock, ExternalLink, 
    CheckCircle2, AlertCircle, BookOpen, 
    TrendingUp, Plus, Loader2 
} from 'lucide-react';
import { getTeamAnalyses, getTeamChecklist, toggleChecklistItem } from '../actions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function TeamSharedLibraryPage() {
    const params = useParams();
    const teamId = params.teamId as string;

    const [analyses, setAnalyses] = useState<any[]>([]);
    const [checklist, setChecklist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (teamId) {
            loadTeamData();
        }
    }, [teamId]);

    const loadTeamData = async () => {
        setLoading(true);
        const [analysisRes, checklistRes] = await Promise.all([
            getTeamAnalyses(teamId),
            getTeamChecklist(teamId)
        ]);

        if (analysisRes.success) setAnalyses(analysisRes.analyses || []);
        if (checklistRes.success) setChecklist(checklistRes.items || []);
        setLoading(false);
    };

    const handleToggleChecklist = async (itemId: string, currentStatus: boolean) => {
        const res = await toggleChecklistItem(itemId, !currentStatus);
        if (res.success) {
            setChecklist(prev => prev.map(item => 
                item.id === itemId ? { ...item, completed: !currentStatus } : item
            ));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-transparent text-foreground font-sans">
            <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
                
                {/* Team Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border/40">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Team Shared Library</h1>
                                <p className="text-muted-foreground font-medium">Collaborative workspace for architectural audits</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl font-bold border-border/60">
                            Team Settings
                        </Button>
                        <Button className="rounded-xl font-bold bg-[#1A1A1A] text-white hover:bg-black">
                            Analyze for Team
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-10">
                    
                    {/* Main Shared Library */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Layout className="w-5 h-5 text-primary" />
                                Shared Reports
                            </h2>
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                                {analyses.length} Total
                            </Badge>
                        </div>

                        {analyses.length === 0 ? (
                            <div className="py-20 text-center bg-white border border-dashed border-border rounded-[2.5rem] shadow-sm">
                                <p className="text-muted-foreground font-medium">No reports shared with the team yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {analyses.map((a) => (
                                    <Link 
                                        key={a.id} 
                                        href={`/analysis/${a.slug}`}
                                        className="group block p-6 bg-white border border-border/40 rounded-[2rem] hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-primary transition-colors">
                                                    {a.repo_url.split('/').pop()}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-tight">
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(a.updated_at).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {a.status}</span>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                <ExternalLink className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Checklist & Stats */}
                    <div className="space-y-8">
                        
                        {/* Onboarding Checklist */}
                        <div className="bg-white border border-border/40 rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Onboarding
                            </h3>
                            <div className="space-y-4">
                                {checklist.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No checklist items defined.</p>
                                ) : (
                                    checklist.map((item) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => handleToggleChecklist(item.id, item.completed)}
                                            className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                item.completed ? "bg-green-500 border-green-500 text-white" : "border-border group-hover:border-primary"
                                            )}>
                                                {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className={cn(
                                                "text-sm font-medium transition-colors",
                                                item.completed ? "text-muted-foreground line-through" : "text-[#1A1A1A] group-hover:text-primary"
                                            )}>
                                                {item.title}
                                            </span>
                                        </div>
                                    ))
                                )}
                                <Button variant="ghost" size="sm" className="w-full mt-4 text-xs font-bold text-muted-foreground hover:text-primary">
                                    <Plus className="w-3 h-3 mr-1" /> Add Task
                                </Button>
                            </div>
                        </div>

                        {/* Team Analytics */}
                        <div className="bg-[#1A1A1A] text-white rounded-[2.5rem] p-8 shadow-xl">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                                <TrendingUp className="w-5 h-5" />
                                Velocity
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Weekly Reports</p>
                                    <p className="text-2xl font-black">{analyses.length}</p>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-[10px] text-slate-500 italic">
                                        "Top analyzed: {analyses[0]?.repo_url.split('/').pop() || 'N/A'}"
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
