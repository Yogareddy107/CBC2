'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Send, Info, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { broadcastNotification } from '@/lib/actions/notifications';
import { cn } from '@/lib/utils';
import { isAdminEmail } from '@/lib/admin';

export function BroadcastBox({ userEmail }: { userEmail: string }) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'warning' | 'feature' | 'success'>('info');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ success?: boolean, error?: string } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Only show for admin
    const isAdmin = isAdminEmail(userEmail);
    if (!isAdmin || !isMounted) return null;

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setLoading(true);
        setStatus(null);
        try {
            const result = await broadcastNotification(title, message, type);
            if (result.success) {
                setStatus({ success: true });
                setTitle('');
                setMessage('');
            } else {
                setStatus({ error: result.error || 'Failed to broadcast' });
            }
        } catch (e) {
            setStatus({ error: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white border border-border/40 rounded-[2.5rem] p-10 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                    <Megaphone className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-[#1A1A1A]">Admin Broadcast</h2>
                    <p className="text-xs text-muted-foreground font-medium">Send a global notification to all users.</p>
                </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40 px-1">Alert Title</label>
                        <Input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. New Feature: Magic Fix"
                            className="h-12 rounded-xl bg-secondary/30 border-none focus-visible:ring-primary/20 placeholder:text-muted-foreground/30 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40 px-1">Alert Type</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'info', icon: Info, color: 'text-blue-500' },
                                { id: 'warning', icon: AlertTriangle, color: 'text-amber-500' },
                                { id: 'feature', icon: Sparkles, color: 'text-purple-500' },
                                { id: 'success', icon: CheckCircle2, color: 'text-emerald-500' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setType(item.id as any)}
                                    className={cn(
                                        "flex-1 h-12 rounded-xl flex items-center justify-center border-2 transition-all",
                                        type === item.id 
                                            ? "border-primary bg-primary/5 shadow-sm" 
                                            : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", item.color)} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40 px-1">Message Content</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell all users about the update..."
                        className="w-full min-h-[120px] rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary/20 p-4 text-sm font-medium resize-none placeholder:text-muted-foreground/30"
                    />
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                    {status && (
                        <p className={cn(
                            "text-xs font-bold px-4 py-2 rounded-lg",
                            status.success ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                        )}>
                            {status.success ? "Broadcast sent successfully!" : status.error}
                        </p>
                    )}
                    <Button 
                        type="submit" 
                        disabled={loading || !title || !message}
                        className="h-14 px-8 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white font-bold rounded-2xl md:ml-auto gap-2 shadow-xl hover:shadow-2xl transition-all"
                    >
                        {loading ? "Sending..." : "Send Broadcast"}
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </section>
    );
}
