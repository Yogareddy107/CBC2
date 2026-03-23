import React from 'react';
import { ArrowRight } from 'lucide-react';

export const WhoItIsForSection = () => {
    return (
        <section id="who-it-is-for" className="py-[140px] bg-[#F9FAFB] border-b border-[#1A1A1A]/5">
            <div className="max-w-[1200px] mx-auto px-6 space-y-20">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Built for engineers who deal with unfamiliar code.</h2>
                    <p className="text-[#1A1A1A]/60 text-lg">Understand architecture, structure, and real complexity — before you commit time to a repository.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    <div className="bg-white rounded-[24px] p-10 border border-[#1A1A1A]/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-6 group">
                        <h3 className="text-xl font-bold text-[#1A1A1A]">Engineers Exploring Open Source</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed text-md">
                            Before adopting a new dependency, quickly understand structure, entry points, and architectural signals — without manually reading the entire repo.
                        </p>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-[#FF782D] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Verify Architecture <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="relative bg-white rounded-[24px] p-10 border border-[#FF782D]/20 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col gap-6 ring-1 ring-[#FF782D]/5 -mt-4 md:-mt-8 mb-4 md:mb-8 z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#FF782D] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md">
                            Core Use Case
                        </div>
                        <h3 className="text-xl font-bold text-[#1A1A1A]">Developers Onboarding to Existing Codebases</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed text-md">
                            When joining a new team or inheriting legacy code, identify core modules, patterns, and risk areas in minutes — not days.
                        </p>
                        <div className="mt-4 h-24 w-full bg-[#FF782D]/5 rounded-xl border border-[#FF782D]/10 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 flex flex-col gap-2 p-4">
                                <div className="flex gap-2">
                                    <div className="h-2 w-12 bg-[#FF782D]/20 rounded" />
                                    <div className="h-2 w-20 bg-[#FF782D]/10 rounded" />
                                </div>
                                <div className="ml-4 h-2 w-16 bg-[#FF782D]/10 rounded" />
                                <div className="ml-8 flex gap-2">
                                    <div className="h-2 w-8 bg-[#FF782D]/40 rounded" />
                                    <div className="h-2 w-12 bg-[#FF782D]/10 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-[#FF782D] font-bold text-sm">
                            Speed up Onboarding <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-10 border border-[#1A1A1A]/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-6 group">
                        <h3 className="text-xl font-bold text-[#1A1A1A]">Senior Engineers Reviewing Technical Fit</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed text-md">
                            Before approving integrations or refactors, get a high-level architectural understanding without digging through every file.
                        </p>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-[#FF782D] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Audit Systems <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
