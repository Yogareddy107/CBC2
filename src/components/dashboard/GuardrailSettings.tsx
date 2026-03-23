'use client';

import { useState } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink, Settings, Terminal, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function GuardrailSettings() {
    const [copied, setCopied] = useState(false);
    
    // In a real app, this would be an absolute URL
    const webhookUrl = "https://checkbeforecommit.com/api/webhooks/github";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white border border-[#1A1A1A]/10 rounded-[2rem] p-8 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600 italic">Architectural Guardrail</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#1A1A1A]">Automate Your Reviews</h2>
                        <p className="text-sm text-[#1A1A1A]/60 font-medium max-w-lg leading-relaxed">
                            Connect CBC to GitHub. Every Pull Request will automatically receive a deep architectural risk report and blast radius analysis.
                        </p>
                    </div>
                </div>

                {/* Webhook Configuration Section */}
                <div className="p-6 bg-[#F9FAFB] border border-[#1A1A1A]/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]/40 flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" /> Webhook Payload URL
                        </label>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px] uppercase px-2 py-0">Highly Secure</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white border border-[#1A1A1A]/10 rounded-xl px-4 py-3 font-mono text-sm text-[#1A1A1A]/70 truncate">
                            {webhookUrl}
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={copyToClipboard}
                            className={cn(
                                "h-11 px-4 rounded-xl border-[#1A1A1A]/10 hover:bg-white transition-all",
                                copied && "text-emerald-600 border-emerald-200 bg-emerald-50"
                            )}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { step: "01", icon: Settings, title: "Repo Settings", desc: "Open your GitHub Repository Settings and click on 'Webhooks'." },
                        { step: "02", icon: Zap, title: "Add Webhook", desc: "Paste the URL above. Set content-type to 'application/json'." },
                        { step: "03", icon: ShieldCheck, title: "Select Events", desc: "Select 'Pull Request' events. Save and you're set!" }
                    ].map((step, i) => (
                        <div key={i} className="relative p-6 bg-white border border-[#1A1A1A]/5 rounded-2xl hover:border-emerald-200 transition-colors">
                            <div className="text-[4rem] font-black text-[#1A1A1A]/[0.02] absolute -top-4 -right-2 pointer-events-none">{step.step}</div>
                            <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center text-[#1A1A1A]/40 mb-4">
                                <step.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-[#1A1A1A] mb-2">{step.title}</h4>
                            <p className="text-xs text-[#1A1A1A]/50 leading-relaxed font-medium">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Live Banner */}
                <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.15),transparent_50%)]" />
                    <div className="relative z-10">
                        <p className="text-xs font-black uppercase tracking-widest text-[#10B981] mb-1 italic">Pro Feature Available</p>
                        <h4 className="text-lg font-bold">Deep Sync Reporting enabled.</h4>
                        <p className="text-sm text-white/60 font-medium">Auto-comments will include historical hotspots and drift detection.</p>
                    </div>
                    <Button variant="outline" className="relative z-10 border-white/20 hover:bg-white/10 text-white rounded-xl h-11 px-6 font-bold flex items-center gap-2 group">
                        Live Demo PR <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
