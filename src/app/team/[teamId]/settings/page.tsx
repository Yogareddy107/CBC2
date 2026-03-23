'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Settings, Save, Loader2, ArrowLeft, 
    ShieldCheck, Building, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTeamSettings, updateTeam } from '../../actions';
import Link from 'next/link';

export default function GeneralSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;

    const [teamName, setTeamName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (teamId) {
            loadSettings();
        }
    }, [teamId]);

    const loadSettings = async () => {
        setLoading(true);
        const res = await getTeamSettings(teamId);
        if (res.success && res.settings) {
            setTeamName(res.settings.name || '');
            // inviteCode might be in settings if updated in actions.ts getTeamSettings
            // Let's assume it's there or we might need to adjust getTeamSettings
            setInviteCode(res.settings.invite_code || 'CBC-INVITE-CODE');
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const res = await updateTeam(teamId, teamName);
        if (res.success) {
            setMessage({ type: 'success', text: 'Team name updated successfully!' });
            // Optional: refresh page to update header
            router.refresh();
        } else {
            setMessage({ type: 'error', text: res.error || 'Failed to update settings.' });
        }
        setSaving(false);
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(inviteCode);
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
            <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
                
                <header className="text-center space-y-10">
                    <div className="space-y-4">
                        <Link 
                            href={`/team/${teamId}`}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors mb-4"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to {teamName || 'Workspace'}
                        </Link>
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                <Settings className="w-8 h-8 text-[#FF7D29]" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
                                    General <span className="text-[#FF7D29] italic">Settings.</span>
                                </h1>
                                <p className="text-sm font-medium text-slate-500 max-w-xl mx-auto">
                                    Manage your workspace identity and access control.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600/70 uppercase tracking-[0.2em] pt-2">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Analysis
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-sm font-bold">{message.text}</span>
                    </div>
                )}

                <div className="grid gap-8">
                    
                    {/* Basic Info */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                                <Building className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Workspace Identity</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Identity & Branding</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Name</label>
                                <Input 
                                    placeholder="Enter team name"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="h-14 px-6 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-[#FF7D29]/20 text-slate-900 font-bold"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={saving}
                                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Update Workspace Name</>}
                            </Button>
                        </form>
                    </div>

                    {/* Access Control / Invite Code */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Access Control</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Invite Members</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-500 leading-relaxed px-1">
                                Share this code with your team members to grant them access to this workspace. Anyone with the code can join as a standard member.
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center px-6 font-mono text-lg font-bold tracking-widest text-[#FF7D29]">
                                    {inviteCode}
                                </div>
                                <Button 
                                    onClick={copyInviteCode}
                                    variant="outline"
                                    className="h-14 w-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
                                >
                                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link 
                            href={`/team/${teamId}/settings/notifications`}
                            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-[#FF7D29]/30 hover:shadow-lg transition-all group"
                        >
                            <h4 className="font-bold text-slate-900 group-hover:text-[#FF7D29] transition-colors">Intelligence Sync</h4>
                            <p className="text-xs text-slate-400 font-medium mt-1">Configure Slack & alert webhooks</p>
                        </Link>
                        <Link 
                            href={`/team/${teamId}/members`}
                            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-[#FF7D29]/30 hover:shadow-lg transition-all group"
                        >
                            <h4 className="font-bold text-slate-900 group-hover:text-[#FF7D29] transition-colors">Team Members</h4>
                            <p className="text-xs text-slate-400 font-medium mt-1">Manage roles and permissions</p>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
