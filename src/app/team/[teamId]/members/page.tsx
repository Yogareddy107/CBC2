'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
    Users, ShieldCheck, Mail, Copy, 
    Check, ArrowLeft, Loader2, UserPlus,
    Trash2, Shield, MoreVertical, Crown
} from 'lucide-react';
import { getTeamMembers, updateMemberRole, removeMember, getUserTeams } from '../../actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TeamMembersPage() {
    const params = useParams();
    const teamId = params.teamId as string;

    const [team, setTeam] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<string>('member');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (teamId) {
            loadData();
        }
    }, [teamId]);

    const loadData = async () => {
        setLoading(true);
        const [teamRes, membersRes] = await Promise.all([
            getUserTeams(),
            getTeamMembers(teamId)
        ]);

        if (teamRes.success) {
            const found = teamRes.teams?.find((t: any) => t.teamId === teamId);
            setTeam(found);
            setUserRole(found?.role || 'member');
        }

        if (membersRes.success) {
            setMembers(membersRes.members || []);
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId: string, newRole: any) => {
        setProcessingId(userId);
        const res = await updateMemberRole(teamId, userId, newRole);
        if (res.success) {
            await loadData();
        } else {
            alert(res.error || "Failed to update role");
        }
        setProcessingId(null);
    };

    const handleRemove = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        setProcessingId(userId);
        const res = await removeMember(teamId, userId);
        if (res.success) {
            await loadData();
        } else {
            alert(res.error || "Failed to remove member");
        }
        setProcessingId(null);
    };

    const copyInviteCode = () => {
        if (!team?.inviteCode) return;
        navigator.clipboard.writeText(team.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
                
                {/* Header Section */}
                <header className="text-center space-y-10 mb-12">
                    <div className="space-y-4">
                        <Link 
                            href={`/team/${teamId}`}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors mb-4"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to {team?.teamName || 'Workspace'}
                        </Link>
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                <Users className="w-8 h-8 text-[#FF7D29]" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
                                    Manage <span className="text-[#FF7D29] italic">Members.</span>
                                </h1>
                                <p className="text-sm font-medium text-slate-500 max-w-xl mx-auto">
                                    Collaborate with engineers across the {team?.teamName || 'current'} workspace.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600/70 uppercase tracking-[0.2em] pt-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Analysis
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid gap-12">
                    
                    {/* Invite Section */}
                    <section className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FF7D29]/10 text-[#FF7D29] flex items-center justify-center">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">Invite Members</h3>
                                <p className="text-sm text-slate-500 font-medium">Share this code with your colleagues to let them join instantly.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group">
                                <span className="font-mono font-black text-2xl tracking-[0.2em] text-slate-900">
                                    {team?.inviteCode || "REFRESH-CODE"}
                                </span>
                                <Button 
                                    onClick={copyInviteCode}
                                    variant="ghost" 
                                    className="rounded-xl hover:bg-white hover:shadow-md transition-all text-[#FF7D29]"
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </Button>
                            </div>
                            <Button className="h-full sm:h-auto px-10 rounded-2xl bg-slate-900 font-bold hover:bg-black">
                                Reset Link
                            </Button>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            * Anyone with the code can join your workspace.
                        </div>
                    </section>

                    {/* Members List */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            <Users className="w-5 h-5 text-slate-400" /> Members list
                        </h2>

                        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="divide-y divide-slate-50">
                                {members.map((member) => (
                                    <div key={member.user_id} className="p-8 flex items-center justify-between hover:bg-slate-50/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                                {member.avatar || <Users className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900">{member.name}</p>
                                                    {team?.ownerId === member.user_id && (
                                                        <Badge className="bg-slate-900 text-white border-none rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                            <Crown className="w-2 h-2" /> Owner
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium">{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                {team?.role === 'admin' && team.ownerId !== member.user_id ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 px-3 text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 rounded-lg">
                                                                <Shield className={cn("w-3 h-3", member.role === 'admin' ? "text-slate-900" : member.role === 'architect' ? "text-[#FF7D29]" : "text-slate-300")} /> 
                                                                {member.role}
                                                                <MoreVertical className="w-3 h-3 ml-1" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl">
                                                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign Role</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleRoleChange(member.user_id, 'admin')} className="font-bold text-sm py-3 px-4 focus:bg-slate-50 rounded-lg">Admin</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRoleChange(member.user_id, 'architect')} className="font-bold text-sm py-3 px-4 focus:bg-slate-50 rounded-lg text-[#FF7D29]">Architect</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleRoleChange(member.user_id, 'member')} className="font-bold text-sm py-3 px-4 focus:bg-slate-50 rounded-lg">Member</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                        <Shield className={cn("w-3 h-3", member.role === 'admin' ? "text-slate-900" : member.role === 'architect' ? "text-[#FF7D29]" : "text-slate-300")} /> {member.role}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {team?.role === 'admin' && team.ownerId !== member.user_id && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                    disabled={processingId === member.user_id}
                                                    onClick={() => handleRemove(member.user_id)}
                                                >
                                                    {processingId === member.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Subscription / Upsell */}
                    {team?.plan === 'free' && (
                        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-12 text-white shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7D29]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <Badge className="bg-[#FF7D29] text-white border-none font-black px-4 py-1 text-[10px]">PRO TEAM</Badge>
                                    <h3 className="text-3xl font-black tracking-tighter">Scale Your Collaboration</h3>
                                    <p className="text-slate-400 text-sm max-w-md font-medium">
                                        You're currently on the free plan which is limited to 2 members. 
                                        Upgrade to Pro for unlimited members, advanced permissions, and early access to PR reviews.
                                    </p>
                                </div>
                                <Button className="rounded-2xl h-14 px-10 bg-white text-slate-900 font-black hover:bg-slate-100 transition-all">
                                    Upgrade Workspace
                                </Button>
                            </div>
                        </section>
                    )}

                </div>

            </main>
        </div>
    );
}
