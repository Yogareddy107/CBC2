'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Loader2, ArrowRight, Settings, ShieldCheck, Mail, BuildingIcon, User } from 'lucide-react';
import { createTeam, getUserTeams, inviteMember, joinTeam } from './actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TeamWorkspacePage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isCreating, setIsCreating] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    
    const [inviteCode, setInviteCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        const res = await getUserTeams();
        if (res.success && res.teams) {
            setTeams(res.teams);
        }
        setLoading(false);
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName) return;
        
        setIsCreating(true);
        const res = await createTeam(newTeamName);
        if (res.success) {
            setNewTeamName('');
            loadTeams();
        } else {
            alert(res.error);
        }
        setIsCreating(false);
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode) return;

        setIsJoining(true);
        const res = await joinTeam(inviteCode);
        if (res.success) {
            setInviteCode('');
            loadTeams();
        } else {
            alert(res.error || "Invalid invite code");
        }
        setIsJoining(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
                
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF7D29]/10 text-[#FF7D29] text-sm font-bold tracking-tight">
                            <Users className="w-4 h-4" /> Team Workspace
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                            Analyze Code <span className="text-slate-400">Together.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                            A collaborative space where teams audit GitHub repositories in real-time, share insights, and enforce quality standards across the organization.
                        </p>
                    </div>

                    {/* Join Team Card */}
                    <div className="w-full md:w-96 bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-bold text-xl text-slate-900">Join a Team</h3>
                            <p className="text-sm text-slate-400">Paste your invite code to enter a shared workspace.</p>
                        </div>
                        <form onSubmit={handleJoinTeam} className="space-y-4">
                            <Input 
                                placeholder="CBC-XXXX-XXXX" 
                                className="h-12 bg-slate-50 border-slate-200 rounded-xl font-mono uppercase text-center tracking-widest"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value)}
                                required
                            />
                            <Button type="submit" disabled={isJoining} className="w-full h-12 rounded-xl bg-slate-900 font-bold hover:bg-black transition-all">
                                {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join Workspace"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Team Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <BuildingIcon className="w-6 h-6 text-slate-400" /> Your Workspaces
                        </h2>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{teams.length} Active</span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* New Team Card */}
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 hover:border-[#FF7D29]/50 transition-all group flex flex-col justify-center items-center text-center space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#FF7D29]/10 group-hover:text-[#FF7D29] transition-all">
                                <Plus className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg text-slate-900">New Workspace</h3>
                                <p className="text-xs text-slate-400 max-w-[200px]">Set up a shared area for your engineers.</p>
                            </div>
                            <form onSubmit={handleCreateTeam} className="w-full flex gap-2">
                                <Input 
                                    className="h-10 border-slate-200 rounded-xl"
                                    placeholder="Team Name"
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                />
                                <Button size="sm" type="submit" disabled={isCreating} className="rounded-xl bg-slate-900 px-4">
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go"}
                                </Button>
                            </form>
                        </div>

                        {loading ? (
                            Array(2).fill(0).map((_, i) => (
                                <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
                            ))
                        ) : teams.map((t, i) => (
                            <Link 
                                key={i} 
                                href={`/team/${t.teamId}`}
                                className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all space-y-6"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl font-black">
                                        {t.teamName[0].toUpperCase()}
                                    </div>
                                    <Badge variant="outline" className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px] tracking-widest border-slate-200 text-slate-400">
                                        {t.role}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className="font-bold text-xl text-slate-900">{t.teamName}</h3>
                                    <p className="text-sm text-slate-500 font-medium">Shared Library & Collaborative Audits</p>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(j => (
                                            <div key={j} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                        ))}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-black" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 pt-8">
                    <div className="space-y-4 p-6 rounded-2xl bg-white border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900">Instant Collaboration</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">Real-time comments and file review statuses sync across every developer's screen instantly.</p>
                    </div>
                    <div className="space-y-4 p-6 rounded-2xl bg-white border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900">Shared Compliance</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">Maintain a single source of truth for repository health and architectural standards.</p>
                    </div>
                    <div className="space-y-4 p-6 rounded-2xl bg-white border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900">Invite Anywhere</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">Send a unique code to your colleagues. No complex permission management required.</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
