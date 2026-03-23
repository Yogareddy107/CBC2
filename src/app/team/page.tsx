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
        console.log("[TeamWorkspace] Loaded teams:", res);
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
        <div className="relative min-h-screen bg-slate-50/20">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
            
            <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* Hero Section */}
                <header className="text-center space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-sm shadow-sm ring-1 ring-primary/5">
                                <Users className="w-3.5 h-3.5" />
                                Collaborative Workspace
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
                            Analyze Code <span className="text-[#FF7D29]">Together.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                            A professional space where teams audit repositories in real-time, share insights, and enforce architectural standards.
                        </p>
                    </div>

                    {/* Integrated Join Team Search */}
                    <div className="max-w-md mx-auto relative group">
                        <form onSubmit={handleJoinTeam} className="flex gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 group-focus-within:border-[#FF7D29]/30 transition-all">
                            <Input 
                                placeholder="Paste Invite Code (CBC-XXXX)" 
                                className="flex-1 h-12 bg-transparent border-none font-mono uppercase text-center tracking-widest focus-visible:ring-0"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value)}
                                required
                            />
                            <Button type="submit" disabled={isJoining} className="h-12 px-6 rounded-xl bg-slate-900 font-bold hover:bg-black transition-all">
                                {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join"}
                            </Button>
                        </form>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Have a code? Paste it above to join a workspace.</p>
                    </div>
                </header>

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
                                        {(t.teamName || 'T')[0].toUpperCase()}
                                    </div>
                                    <Badge variant="outline" className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px] tracking-widest border-slate-200 text-slate-400">
                                        {t.role || 'Member'}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className="font-bold text-xl text-slate-900">{t.teamName || 'Untitled Workspace'}</h3>
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

            </div>
        </div>
    );
}
