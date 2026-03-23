'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Bell, Slack, Save, Loader2, ArrowLeft, 
    AlertTriangle, CheckCircle2, ShieldCheck, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTeamSettings, updateTeamSettings } from '../../../actions';
import Link from 'next/link';

export default function NotificationSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;

    const [slackWebhook, setSlackWebhook] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
            setSlackWebhook(res.settings.slackWebhook || '');
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const res = await updateTeamSettings(teamId, { slackWebhook });
        if (res.success) {
            setMessage({ type: 'success', text: 'Notification settings updated successfully!' });
        } else {
            setMessage({ type: 'error', text: res.error || 'Failed to update settings.' });
        }
        setSaving(false);
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
                            <ArrowLeft className="w-3 h-3" /> Back to Team
                        </Link>
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                <Bell className="w-8 h-8 text-[#FF7D29]" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-tight">
                                    Intelligence <span className="text-[#FF7D29] italic">Sync.</span>
                                </h1>
                                <p className="text-sm font-medium text-slate-500 max-w-xl mx-auto">
                                    Configure where your team receives high-risk impact alerts and real-time governance signals.
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
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="text-sm font-bold">{message.text}</span>
                    </div>
                )}

                <div className="grid gap-8">
                    
                    {/* Slack Integration */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#4A154B] flex items-center justify-center text-white">
                                    <Slack className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Slack Alerts</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time intelligence</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Enterprise Sync
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    Send automated alerts to your Slack channel when a <span className="text-rose-500 font-bold">High Risk</span> commit or architectural violation is detected.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Blast radius threshold warnings
                                    </li>
                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> New team review requests
                                    </li>
                                </ul>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incoming Webhook URL</label>
                                    <Input 
                                        placeholder="https://hooks.slack.com/services/..."
                                        value={slackWebhook}
                                        onChange={(e) => setSlackWebhook(e.target.value)}
                                        className="h-14 px-6 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#FF7D29]/20 text-slate-900 font-mono text-sm"
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={saving}
                                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Configuration</>}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Email Digest (Coming Soon) */}
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] p-10 opacity-60">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-400 tracking-tight">Weekly Health Digest</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic">Coming Soon</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
