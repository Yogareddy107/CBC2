'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Loader2, ArrowRight, Settings, ShieldCheck, Mail, BuildingIcon } from 'lucide-react';
import { createTeam, getUserTeams, inviteMember } from './actions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TeamWorkspacePage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isCreating, setIsCreating] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState<string | null>(null);

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

    const handleInvite = async (e: React.FormEvent, teamId: string) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsInviting(teamId);
        const res = await inviteMember(teamId, inviteEmail);
        setIsInviting(null);

        if (res.success) {
            alert(res.message);
            setInviteEmail('');
        } else {
            alert(res.error || "Failed to invite");
        }
    };

    return (
        <div className="bg-transparent text-foreground font-sans">
            <main className="max-w-5xl mx-auto px-4 py-8 space-y-12">
                
                {/* Header */}
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <Users className="w-3.5 h-3.5" /> Team Workspace
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                        Collaborate on Code Quality
                    </h1>
                    <p className="text-muted-foreground text-base">
                        Create shared spaces for your organization to build a library of architectural reports and enforce quality standards across all repositories.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Team List & Creation */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                                <BuildingIcon className="w-5 h-5 text-muted-foreground" /> Your Teams
                            </h2>
                            
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : teams.length === 0 ? (
                                <div className="text-center py-8 bg-secondary/10 rounded-xl border border-dashed border-border mb-6">
                                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                    <h3 className="text-sm font-bold">No teams yet</h3>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Create a team to start sharing reports and collaborating.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mb-8">
                                    {teams.map((t, i) => (
                                        <div key={i} className="border border-border/50 rounded-xl p-5 hover:border-primary/20 transition-all flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg">{t.teamName}</h3>
                                                    {t.role === 'admin' && (
                                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] py-0">Admin</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Team Workspace • {t.role === 'admin' ? "You manage this team" : "You are a member"}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2 min-w-[240px]">
                                                {t.role === 'admin' && (
                                                    <form onSubmit={(e) => handleInvite(e, t.teamId)} className="flex gap-2">
                                                        <Input 
                                                            placeholder="colleague@company.com" 
                                                            className="h-8 text-xs" 
                                                            value={inviteEmail}
                                                            onChange={e => setInviteEmail(e.target.value)}
                                                            required
                                                        />
                                                        <Button size="sm" type="submit" disabled={isInviting === t.teamId} className="h-8 shrink-0">
                                                            {isInviting === t.teamId ? <Loader2 className="w-3 h-3 animate-spin"/> : "Invite"}
                                                        </Button>
                                                    </form>
                                                )}
                                                <Button variant="outline" size="sm" className="w-full justify-between" asChild>
                                                    <Link href={`/team/${t.teamId}`}>
                                                        View Shared Reports <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Create Team Form */}
                            <div className="pt-6 border-t border-border/40">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Create New Team</h3>
                                <form onSubmit={handleCreateTeam} className="flex gap-3">
                                    <Input 
                                        placeholder="Engineering Team, Startup Inc..." 
                                        className="h-10"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" disabled={isCreating} className="h-10 shrink-0 font-bold bg-[#1A1A1A]">
                                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Create</>}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Info */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-[#1A1A1A] to-slate-800 rounded-2xl p-6 text-white shadow-xl">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-5 h-5 text-primary" /> Enterprise Grade
                            </h3>
                            <ul className="space-y-4 text-sm text-slate-300">
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                    <p><strong className="text-white block">Shared Library</strong> All reports generated by members are pooled.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                    <p><strong className="text-white block">Access Control</strong> Admins manage invites and enforce security.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
