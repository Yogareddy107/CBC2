import React from 'react';

export const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="bg-white py-[140px] border-b border-[#1A1A1A]/5">
            <div className="max-w-[1200px] mx-auto px-6 space-y-20">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">How It Works</h2>
                    <p className="text-[#1A1A1A]/60 text-lg">From repository link to structured technical clarity.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            step: "01",
                            title: "Sync Any Source",
                            desc: "Support for GitHub, GitLab Enterprise, local folder drag-and-drop, and ZIP uploads."
                        },
                        {
                            step: "02",
                            title: "Predict & Protect",
                            desc: "We map the entire dependency graph to predict the impact of changes before they are committed."
                        },
                        {
                            step: "03",
                            title: "Connect & Automate",
                            desc: "Securely connect GitHub or GitLab. Set up RBAC and register webhooks to automate your architectural governance."
                        },
                    ].map((item, i) => (
                        <div key={i} className="relative bg-gradient-to-br from-white to-[#FFF5ED] rounded-xl p-10 shadow-lg hover:shadow-xl transition-all duration-500 flex flex-col items-start gap-8 min-h-[320px] border border-[#FF782D]/10 group overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF782D]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#FF782D]/10 transition-colors" />
                            <div className="w-10 h-10 bg-[#FF782D] rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110">
                                <span className="text-white font-bold text-lg">{item.step}</span>
                            </div>
                            <div className="space-y-4 text-[#1A1A1A] relative z-10">
                                <h3 className="text-xl font-bold text-[#1A1A1A]">{item.title}</h3>
                                <p className="text-[#1A1A1A]/70 leading-[1.7] text-md font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
