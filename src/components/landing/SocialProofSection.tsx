import React from 'react';

export const SocialProofSection = () => {
    return (
        <section className="py-20 bg-white border-b border-[#1A1A1A]/5 overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-6">
                <p className="text-center text-sm font-bold text-[#1A1A1A]/40 uppercase tracking-widest mb-10">
                    Trusted by developers at forward-thinking teams
                </p>
                <div className="relative">
                    <div className="flex w-fit items-center gap-20 opacity-50 grayscale contrast-125 animate-scroll">
                        {[...['Vercel', 'Stripe', 'Supabase', 'Linear', 'Railway'], ...['Vercel', 'Stripe', 'Supabase', 'Linear', 'Railway']].map((company, idx) => (
                            <span key={`${company}-${idx}`} className="text-2xl font-bold tracking-tighter text-[#1A1A1A] whitespace-nowrap">
                                {company}
                            </span>
                        ))}
                    </div>
                    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
                </div>
            </div>
        </section>
    );
};
