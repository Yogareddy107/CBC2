'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Check, Loader2, ShieldCheck, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function APIKeyManager() {
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [recentlyCreatedKey, setRecentlyCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/extension/auth');
            const data = await res.json();
            setKeys(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch keys:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!newKeyName) return;
        setGenerating(true);
        try {
            const res = await fetch('/api/extension/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
            });
            const data = await res.json();
            if (data.apiKey) {
                setRecentlyCreatedKey(data.apiKey);
                setNewKeyName('');
                fetchKeys();
            }
        } catch (err) {
            console.error("Failed to generate key:", err);
        } finally {
            setGenerating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        try {
            await fetch('/api/extension/auth', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchKeys();
        } catch (err) {
            console.error("Failed to revoke key:", err);
        }
    };

    const copyToClipboard = () => {
        if (!recentlyCreatedKey) return;
        navigator.clipboard.writeText(recentlyCreatedKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" />
                        IDE Extension Keys
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Generate keys to use the CheckBeforeCommit VS Code extension.</p>
                </div>
            </div>

            {recentlyCreatedKey && (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                        Key Generated Successfully
                    </div>
                    <p className="text-xs text-amber-600 font-medium">Copy this key now. It will not be shown again for security reasons.</p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 truncate">
                            {recentlyCreatedKey}
                        </div>
                        <Button onClick={copyToClipboard} variant="outline" className="rounded-xl border-amber-200 hover:bg-amber-100">
                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button onClick={() => setRecentlyCreatedKey(null)} variant="ghost" className="rounded-xl text-amber-700">
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <Input 
                    placeholder="Key Name (e.g. VS Code - MacBook)" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                />
                <Button 
                    onClick={handleGenerate} 
                    disabled={generating || !newKeyName}
                    className="rounded-xl bg-slate-900 text-white hover:bg-black font-bold h-10 px-6"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Generate Key
                </Button>
            </div>

            <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Active Keys</div>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                ) : keys.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-400 font-medium">No active keys found.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {keys.map((key) => (
                            <div key={key.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Monitor className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{key.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                                            Created {new Date(key.created_at).toLocaleDateString()} • {key.last_used ? `Last used ${new Date(key.last_used).toLocaleDateString()}` : 'Never used'}
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => handleRevoke(key.id)} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
