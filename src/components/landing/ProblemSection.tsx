import React from 'react';
import { X, Zap, Search } from 'lucide-react';

export const ProblemSection = () => {
    return (
        <section className="py-[120px] bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
                <div className="max-w-3xl mx-auto mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        The Fear of <span className="text-red-500">Breaking Code</span> is the Real Bottleneck.
                    </h2>
                    <p className="text-lg text-white/50 font-medium">
                        Onboarding, refactoring, and merging shouldn&apos;t feel like walking through a minefield.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: X, title: "Production Outages", desc: "Break critical services because you missed a hidden coupling." },
                        { icon: Zap, title: "Hidden Side Effects", desc: "Change one file, break three others you didn't know were related." },
                        { icon: Search, title: "Lost Debugging Hours", desc: "Spend days hunting bugs introduced by &apos;simple&apos; refactors." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4 text-left hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <h4 className="text-xl font-bold text-white">{item.title}</h4>
                            <p className="text-sm text-white/40 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
