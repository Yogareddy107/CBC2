import React from 'react';
import { Sparkles, Cpu, Globe, Activity, Shield } from 'lucide-react';

export const DeepIntelligenceSection = () => {
    return (
        <section className="py-[120px] bg-white relative overflow-hidden text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF7D29]/5 via-transparent to-transparent opacity-50" />
            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto mb-24 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                        Secure, Private. <span className="text-[#FF7D29]">Deep Intelligence.</span>
                    </h2>
                    <p className="text-lg text-[#1A1A1A]/60 font-medium leading-relaxed">
                        Analyze your code with total peace of mind. Your source code is never stored and stays completely private.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        { icon: Sparkles, title: "Auto-Remediation", desc: "The &apos;Magic Fix&apos;. Automatically generate refactor PRs to resolve technical debt and governance violations." },
                        { icon: Shield, title: "Privacy-First", desc: "Your code is never stored or used for model training. Analysis happens in secure, ephemeral sessions." },
                        { icon: Globe, title: "Cloud Codebases", desc: "Deep analysis of Terraform, CDK, and CloudFormation. Map your infrastructure to your code logic." },
                        { icon: Activity, title: "PR Governance", desc: "Enforce natural language rules automatically and block high-risk changes via secure webhooks." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-[#F9FAFB] border border-[#1A1A1A]/5 rounded-[2.5rem] text-left hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all group" role="region" aria-label={item.title}>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#FF7D29] mb-8 group-hover:scale-110 transition-transform">
                                <item.icon className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <h4 className="text-xl font-bold text-[#1A1A1A] mb-4">{item.title}</h4>
                            <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
