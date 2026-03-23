'use client';

import { Terminal, Shield, Zap, Code, Cpu, ArrowRight, Lightbulb } from 'lucide-react';
import { eq, desc, and, Not } from "drizzle-orm";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function IDEGuide() {
    return (
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-1000" />
            
            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black italic tracking-tight flex items-center gap-2 text-primary">
                        <Zap className="w-6 h-6 fill-current" /> IDE Safety Layer
                    </h3>
                    <Badge variant="outline" className="bg-white/5 text-primary border-primary/20">v2.1 Enterprise</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Philosophy */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <h4 className="text-lg font-bold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-400" /> Proactive Protection
                             </h4>
                             <p className="text-sm text-slate-400 leading-relaxed">
                                Don't wait for the PR to fail. CBC's IDE layer brings deterministic blast-radius analysis directly into your editor.
                             </p>
                        </div>
                        
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">How it works</h5>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-xs">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                                    <span>Scan local changes on file save or commit.</span>
                                </li>
                                <li className="flex items-start gap-3 text-xs">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                                    <span>CBC identifies the "Blast Radius" of each modified module.</span>
                                </li>
                                <li className="flex items-start gap-3 text-xs">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                                    <span>Get instant warnings if you touch high-risk architectural hubs.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Steps */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Integration Steps</h4>
                            
                            <div className="space-y-4">
                                <div className="group/step cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/5 rounded-lg group-hover/step:bg-primary/20 transition-colors">
                                            <Terminal className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="font-bold text-sm">1. Install CBC CLI (Coming Soon)</span>
                                    </div>
                                    <div className="pl-9 text-xs text-slate-500">Run `npm install -g cbc-cli` to start using CBC in your terminal.</div>
                                </div>

                                <div className="group/step cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/5 rounded-lg group-hover/step:bg-primary/20 transition-colors">
                                            <Code className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="font-bold text-sm">2. Add API Key to .env</span>
                                    </div>
                                    <div className="pl-9 text-xs text-slate-500">Generate a key in Settings and add `CBC_API_KEY` to your environment.</div>
                                </div>

                                <div className="group/step cursor-pointer">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white/5 rounded-lg group-hover/step:bg-primary/20 transition-colors">
                                            <Lightbulb className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <span className="font-bold text-sm">3. VS Code Tasks</span>
                                    </div>
                                    <div className="pl-9 text-xs text-slate-500">Configure a 'post-save' task to run risk checks and show output in the IDE console.</div>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-slate-900 font-black rounded-xl">
                            Read Full Documentation <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">System Status: Active</span>
                    <Cpu className="w-4 h-4 text-slate-700" />
                </div>
            </div>
        </div>
    );
}
