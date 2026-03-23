import React from 'react';
import { Sparkles, Globe, Activity, ShieldAlert, Code2, Brain, Construction } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const EnterpriseIntelligenceSection = () => {
    return (
        <section className="py-[140px] bg-white border-b border-[#1A1A1A]/5">
            <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-[55%_45%] gap-20 items-start">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">
                            Enterprise Engineering Intelligence
                        </h2>
                        <p className="text-lg text-[#1A1A1A]/60 max-w-md">
                            From solo refactors to team-wide architecture audits. CBC scales with your organization.
                        </p>
                    </div>

                    <div className="space-y-0">
                        {[
                            { icon: Sparkles, title: "AI-Driven Auto-Remediation", desc: "Identify a violation, click &apos;Magic Fix&apos;, and CBC opens a remediation PR for you." },
                            { icon: Globe, title: "Multi-VCS Ecosystem", desc: "Seamless integration with GitHub (Cloud/Server) and GitLab (Cloud/Self-hosted)." },
                            { icon: Activity, title: "Engineering Health Trending", desc: "Track architectural safety and technical debt trends over months. Detect drift automatically." },
                            { icon: ShieldAlert, title: "PR Governance Enforcement", desc: "Simulate structural impact and enforce natural language rules via Slack & PR webhooks." },
                            { icon: Code2, title: "IDE Extension (VS Code/IntelliJ)", desc: "Get real-time CBC intelligence inside your editor via our high-performance API bridge." },
                            { icon: Brain, title: "Architecture Sign-offs", desc: "Collaborative review platform with attributed sign-offs for high-impact changes." },
                        ].map((item, i) => (
                            <div key={i} className={`py-5 flex gap-5 ${i !== 0 ? 'border-t border-[#1A1A1A]/5' : ''}`}>
                                <div className="mt-1 w-8 h-8 rounded-lg bg-[#FF7D29]/5 flex items-center justify-center shrink-0 border border-[#FF7D29]/10">
                                    <item.icon className="w-4 h-4 text-[#FF7D29]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#1A1A1A] mb-1">{item.title}</h3>
                                    <p className="text-sm text-[#1A1A1A]/60 font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sticky top-32 bg-[#F8F9FA] rounded-3xl border border-[#1A1A1A]/10 p-8 min-h-[500px] flex flex-col gap-6 shadow-sm overflow-hidden">
                    <div className="absolute top-6 right-6 px-3 py-1 bg-[#FF7D29]/10 border border-[#FF7D29]/20 rounded-full flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#FF7D29] rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-[#FF7D29] uppercase tracking-wider">Deep Sync Active</span>
                    </div>

                    <div className="bg-white border border-[#1A1A1A]/10 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#FF7D29]" />
                            <span className="text-xs font-bold text-[#1A1A1A]">Cloud Resources Detected</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-mono">AWS::Lambda::Function</span>
                                <Badge variant="outline" className="text-[8px] h-4 bg-emerald-50 text-emerald-600 border-none">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-mono">AWS::RDS::DBInstance</span>
                                <Badge variant="outline" className="text-[8px] h-4 bg-emerald-50 text-emerald-600 border-none">Active</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-white rounded-xl border border-[#1A1A1A]/10 shadow-sm flex items-center gap-4 border-l-4 border-l-indigo-500">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#1A1A1A]">Health Trend: Improving</p>
                                <p className="text-[10px] text-[#1A1A1A]/40">+12% Safety Score since Jan 15</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-[#1A1A1A]/10 shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                <Construction className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#1A1A1A]">Architecture Drift Alert</p>
                                <p className="text-[10px] text-[#1A1A1A]/40">Maturity shifted to "Moderate"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
