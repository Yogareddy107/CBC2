'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Users, Layout, Clock, ExternalLink, 
    CheckCircle2, AlertCircle, BookOpen, 
    TrendingUp, Plus, Loader2, Settings, LayoutDashboard, User
} from 'lucide-react';
import { getTeamAnalyses, getTeamChecklist, toggleChecklistItem, getUserTeams } from '../actions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function TeamDashboardPage() {
    const params = useParams();
    const teamId = params.teamId as string;

    const [analyses, setAnalyses] = useState<any[]>([]);
    const [teamInfo, setTeamInfo] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (teamId) {
            loadDashboardData();
        }
    }, [teamId]);

    const loadDashboardData = async () => {
        setLoading(true);
        const [analysisRes, teamsRes] = await Promise.all([
            getTeamAnalyses(teamId),
            getUserTeams()
        ]);

        if (analysisRes.success) setAnalyses(analysisRes.analyses || []);
        if (teamsRes.success) {
            const currentTeam = teamsRes.teams?.find((t: any) => t.teamId === teamId);
            setTeamInfo(currentTeam);
        }
        
        // Mocking member count for now until S4 is built
        setMembers([{}, {}, {}]); 
        
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF7D29]" />
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen">
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                
                {/* Team Header */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-slate-200">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-slate-900/20">
                                {teamInfo?.teamName?.[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-slate-900">{teamInfo?.teamName}</h1>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                                        <Users className="w-4 h-4" /> {members.length} Members
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#FF7D29]">
                                         {analyses.length} Analyses
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-200 bg-white" asChild>
                            <Link href={`/team/${teamId}/settings`}>
                                <Settings className="w-4 h-4 mr-2" /> Team Settings
                            </Link>
                        </Button>
                        <Button className="rounded-2xl h-12 px-8 font-bold bg-[#FF7D29] text-white hover:bg-[#E66D1E] shadow-xl shadow-[#FF7D29]/20" asChild>
                            <Link href="/">
                                <Plus className="w-5 h-5 mr-2" /> Analyze New Repo
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-12">
                    
                    {/* Shared Library */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                                <Layout className="w-6 h-6 text-slate-400" /> Shared Reports
                            </h2>
                        </div>

                        {analyses.length === 0 ? (
                            <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-[3rem] space-y-4">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                                    <BookOpen className="w-8 h-8 text-slate-200" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-900 font-bold text-xl">No shared reports yet</p>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Analyze a repository to start building your team's knowledge base.</p>
                                </div>
                                <Button className="rounded-xl bg-slate-900">Get Started</Button>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {analyses.map((a) => {
                                    const repoName = a.repo_url.split('/').pop() || a.repo_url;
                                    const result = a.result as any;
                                    // Simulated risk and counts for now until aggregated properly
                                    const risk = result?.securityOverview?.riskLevel || 'Low';
                                    const maturity = result?.modernityMetrics?.score || '85%';
                                    
                                    return (
                                        <Link 
                                            key={a.id} 
                                            href={`/team/${teamId}/report/${a.id}`}
                                            className="group block p-8 bg-white border border-slate-200 rounded-[2.5rem] hover:border-[#FF7D29]/30 hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#FF7D29]/5 group-hover:text-[#FF7D29] transition-all">
                                                        <LayoutDashboard className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 group-hover:translate-x-1 transition-transform">{repoName}</h3>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                                            Analyzed {new Date(a.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={cn(
                                                    "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                                                    risk === 'High' ? "bg-red-500 text-white" : risk === 'Medium' ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                                                )}>
                                                    {risk} Risk
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Maturity</p>
                                                    <p className="text-base font-black text-slate-900">{maturity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reviews</p>
                                                    <p className="text-base font-black text-slate-900">4/12 Files</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Comments</p>
                                                    <p className="text-base font-black text-slate-900">8 Threads</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Team Activity / Stats */}
                    <div className="space-y-8">
                        {/* Quick Stats */}
                        <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl shadow-slate-900/20 space-y-10">
                            <h3 className="text-lg font-bold flex items-center gap-3 text-[#FF7D29]">
                                <TrendingUp className="w-6 h-6" /> Team Velocity
                            </h3>
                            
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Total Analyses</p>
                                    <div className="flex items-end gap-3 text-5xl font-black tracking-tighter">
                                        {analyses.length}
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-xs h-6 mb-1.5">+12%</Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Avg Maturity</p>
                                        <p className="text-xl font-bold">82%</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Files Reviewed</p>
                                        <p className="text-xl font-bold">142</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Members Peek */}
                        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Team Members</h3>
                                <Link href={`/team/${teamId}/members`} className="text-xs font-bold text-[#FF7D29] hover:underline">View All</Link>
                            </div>
                            <div className="flex -space-x-3 overflow-hidden">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center text-slate-400 font-bold shadow-sm">
                                        <User className="w-5 h-5" />
                                    </div>
                                ))}
                                <div className="w-12 h-12 rounded-2xl border-4 border-white bg-[#FF7D29] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                    +5
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full rounded-2xl h-12 font-bold text-slate-600 hover:bg-slate-50" asChild>
                                <Link href={`/team/${teamId}/members`}>Manage Invites</Link>
                            </Button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
