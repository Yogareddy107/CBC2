'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Users, Layout, Clock, ExternalLink, 
    CheckCircle2, AlertCircle, BookOpen, 
    TrendingUp, Plus, Loader2, Settings, LayoutDashboard, User, Bell, ShieldCheck
} from 'lucide-react';
import { getTeamAnalyses, getTeamChecklist, toggleChecklistItem, getUserTeams, getTeamMembers, getTeamStats, getTeamHealthTrends } from '../actions';
import { HealthTrendChart } from '@/components/dashboard/HealthTrendChart';
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
    const [stats, setStats] = useState<any>({ totalAnalyses: 0, filesReviewed: 0, avgMaturity: '0%', highRiskAlerts: 0 });
    const [trends, setTrends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (teamId) {
            loadDashboardData();
        }
    }, [teamId]);

    const loadDashboardData = async () => {
        setLoading(true);
        const [analysisRes, teamsRes, membersRes, statsRes, trendsRes] = await Promise.all([
            getTeamAnalyses(teamId),
            getUserTeams(),
            getTeamMembers(teamId),
            getTeamStats(teamId),
            getTeamHealthTrends(teamId)
        ]);

        if (analysisRes.success) setAnalyses(analysisRes.analyses || []);
        if (teamsRes.success) {
            const currentTeam = teamsRes.teams?.find((t: any) => t.teamId === teamId);
            setTeamInfo(currentTeam);
        }
        
        if (membersRes.success) setMembers(membersRes.members || []);
        if (statsRes.success) setStats(statsRes.stats);
        if (trendsRes.success) setTrends(trendsRes.trends || []);
        
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
                <header className="text-center space-y-10">
                    <div className="space-y-4">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-slate-900/20 mx-auto transition-transform hover:scale-110">
                            {teamInfo?.teamName?.[0].toUpperCase()}
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-tight">
                                Welcome to <span className="text-[#FF7D29] italic">{teamInfo?.teamName}.</span>
                            </h1>
                            <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-300" /> {members.length} Members
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4 text-slate-300" /> {stats.totalAnalyses} Analyses
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="flex items-center gap-2 text-emerald-600/80">
                                    <ShieldCheck className="w-4 h-4" /> Secure Analysis
                                </span>
                                {teamInfo?.role === 'admin' && (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        <span className="flex items-center gap-2 py-1 px-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Workspace Admin
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm" asChild>
                            <Link href={`/team/${teamId}/settings/notifications`}>
                                <Bell className="w-4 h-4 mr-2 text-slate-400" /> Sync Intelligence
                            </Link>
                        </Button>
                        <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm" asChild>
                            <Link href={`/team/${teamId}/settings`}>
                                <Settings className="w-4 h-4 mr-2 text-slate-400" /> Settings
                            </Link>
                        </Button>
                        <Button className="rounded-2xl h-12 px-8 font-bold bg-[#FF7D29] text-white hover:bg-[#E66D1E] shadow-xl shadow-[#FF7D29]/20 transition-all active:scale-95" onClick={() => window.location.href = `/?teamId=${teamId}`}>
                            <Plus className="w-5 h-5 mr-2" /> Analyze New Repo
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-12">
                    
                    {/* Shared Library */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Health Trend Chart */}
                            <div className="animate-in fade-in slide-in-from-top-4 duration-700 space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Architectural Health Tracking</h3>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-bold">1.0 Real-time</Badge>
                                </div>
                                <HealthTrendChart data={trends} />
                                <p className="text-[10px] text-slate-400 font-medium px-2 italic">Visualizing codebase maturity vs. architectural adherence over time.</p>
                            </div>

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
                                    const risk = result?.riskAndDebt?.couplingRisk?.level || 'Low';
                                    const maturity = result?.healthBreakdown?.score ? `${result.healthBreakdown.score}%` : '85%';
                                    
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
                                        {stats.totalAnalyses}
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-xs h-6 mb-1.5">Active</Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Avg Maturity</p>
                                        <p className="text-xl font-bold">{stats.avgMaturity}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">High Risks</p>
                                        <p className="text-xl font-bold text-rose-400">{stats.highRiskAlerts}</p>
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
                                {members.slice(0, 5).map((m, i) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center text-sm font-bold shadow-sm relative group/avatar",
                                            m.role === 'architect' ? "bg-slate-900 text-[#FF7D29]" : "bg-slate-100 text-slate-400"
                                        )}
                                        title={`${m.email} (${m.role})`}
                                    >
                                        {m.avatar}
                                        {m.role === 'architect' && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7D29] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                                <ShieldCheck className="w-2 h-2 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {members.length > 5 && (
                                    <div className="w-12 h-12 rounded-2xl border-4 border-white bg-[#FF7D29] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                        +{members.length - 5}
                                    </div>
                                )}
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
