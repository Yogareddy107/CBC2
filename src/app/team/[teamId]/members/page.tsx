'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUserTeams } from '../../actions';
import { 
    Users, ShieldCheck, Mail, Copy, 
    Check, ArrowLeft, Loader2, UserPlus,
    Trash2, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function TeamMembersPage() {
    const params = useParams();
    const teamId = params.teamId as string;

    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (teamId) {
            loadTeam();
        }
    }, [teamId]);

    const loadTeam = async () => {
        setLoading(true);
        const res = await getUserTeams();
        if (res.success) {
            const found = res.teams?.find((t: any) => t.teamId === teamId);
            setTeam(found);
        }
        setLoading(false);
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
                
                {/* Header */}
                <header className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-slate-100" asChild>
                        <Link href={`/team/${teamId}`}>
                            <ArrowLeft className="w-6 h-6 text-slate-400" />
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Manage Team</h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{team?.teamName} Workspace</p>
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
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900">{i === 1 ? "You" : `Developer ${i}`}</p>
                                                    {i === 1 && (
                                                        <Badge className="bg-slate-900 text-white border-none rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-widest">
                                                            Owner
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium">dev{i}@company.com</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <Shield className="w-3 h-3 text-slate-300" /> {i === 1 ? "Admin" : "Member"}
                                            </div>
                                            {i !== 1 && (
                                                <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
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
