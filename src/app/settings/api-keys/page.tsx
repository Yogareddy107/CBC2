'use client';

import { useState, useEffect } from 'react';
import { generateApiKey, listApiKeys, deleteApiKey } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Plus, Trash2, Copy, Check, Shield, Code, Cpu, Terminal, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        setLoading(true);
        try {
            const data = await listApiKeys();
            setKeys(data);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        const res = await generateApiKey(newName);
        setNewKey(res.key);
        setNewName('');
        loadKeys();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this API key? IDE integrations using it will stop working.")) return;
        await deleteApiKey(id);
        loadKeys();
    };

    const copyToClipboard = () => {
        if (!newKey) return;
        navigator.clipboard.writeText(newKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    <Shield className="w-3 h-3" /> Safety Infrastructure
                </div>
                <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A]">API Keys & IDE Safety</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Expose CBC intelligence to your local development environment. Power your IDE extensions, CLI tools, and pre-commit hooks with real-time risk analysis.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Key Management */}
                <div className="space-y-6">
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <Key className="w-4 h-4" /> Active Keys
                            </h2>
                            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">{keys.length} Active</Badge>
                        </div>

                        <form onSubmit={handleCreate} className="flex gap-2">
                            <Input
                                placeholder="Key Name (e.g. VS Code Laptop)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-11 bg-[#F8F9FA] border-none focus-visible:ring-primary/20"
                                required
                            />
                            <Button type="submit" className="h-11 bg-[#1A1A1A] hover:bg-primary text-white font-bold px-6 rounded-xl">
                                <Plus className="w-4 h-4 mr-2" /> Create
                            </Button>
                        </form>

                        {newKey && (
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-3 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">New API Key Generated</span>
                                    <Badge className="bg-emerald-500 text-white border-none text-[9px]">SAVE THIS NOW</Badge>
                                </div>
                                <p className="text-[10px] text-emerald-600/80 leading-tight">
                                    For security, we only show this key once. If you lose it, you'll need to create a new one.
                                </p>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 font-mono text-xs text-emerald-800 break-all select-all">
                                        {newKey}
                                    </div>
                                    <Button onClick={copyToClipboard} size="icon" variant="outline" className="shrink-0 bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-600">
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                {copied && <p className="text-[10px] font-bold text-emerald-600 animate-in fade-in slide-in-from-top-1">Copied to clipboard!</p>}
                            </div>
                        )}

                        <div className="space-y-3">
                            {loading ? (
                                <div className="py-8 text-center text-slate-400 text-sm animate-pulse italic">Loading your keys...</div>
                            ) : keys.length === 0 ? (
                                <div className="py-12 border border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 gap-3 grayscale opacity-60">
                                    <Key className="w-8 h-8" />
                                    <p className="text-xs font-medium">No API keys created yet.</p>
                                </div>
                            ) : (
                                keys.map((key) => (
                                    <div key={key.id} className="group flex items-center justify-between p-4 bg-[#F8F9FA] hover:bg-white border hover:border-border transition-all rounded-xl shadow-sm hover:shadow-md">
                                        <div className="space-y-1">
                                            <div className="font-bold text-[#1A1A1A] text-sm">{key.name}</div>
                                            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
                                                <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                                {key.last_used && (
                                                    <span className="flex items-center gap-1 text-emerald-500">
                                                        <Activity className="w-2.5 h-2.5" /> Last used: {new Date(key.last_used).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleDelete(key.id)}
                                            size="icon"
                                            variant="ghost"
                                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* IDE Integration Guide */}
                <div className="space-y-6 lg:sticky lg:top-8">
                    <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-1000" />
                        
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-xl font-black italic tracking-tight flex items-center gap-2 text-primary">
                                <Zap className="w-6 h-6 fill-current" /> IDE Safety Mode
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Terminal className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">CURL Verification</h4>
                                        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">Test your connection to the Predict Impact engine.</p>
                                        <div className="bg-black/40 p-2 rounded-lg font-mono text-[9px] text-slate-300 overflow-x-auto whitespace-pre">
{`curl -X POST https://cbc.app/api/predict-impact \\
-H "x-api-key: YOUR_KEY" \\
-d '{ "repoUrl": "...", "files": ["src/main.ts"] }'`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Code className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">VS Code Integration</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Integrate CBC directly into your workflow. Get risk alerts on file save or before commit.
                                        </p>
                                        <Button variant="link" className="p-0 h-auto text-[10px] text-primary font-bold uppercase mt-2 group/btn">
                                            View Integration Guide <Plus className="w-3 h-3 ml-1 group-hover/btn:rotate-90 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Engine Version: 2.1.0-deterministic</span>
                                <Cpu className="w-4 h-4 text-slate-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
