import React from 'react';
import { Button } from '@/components/ui/button';

interface CTASectionBottomProps {
    onAnalyzeClick: () => void;
}

export const CTASectionBottom = ({ onAnalyzeClick }: CTASectionBottomProps) => {
    return (
        <section className="py-[140px] px-6">
            <div className="max-w-[1200px] mx-auto">
                <div className="relative bg-gradient-to-br from-[#FF782D] to-[#F04B3E] rounded-[48px] p-12 md:p-24 text-center space-y-10 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />

                    <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white">
                            Stop guessing. Start knowing.
                        </h2>
                        <p className="text-lg md:text-xl text-white/80 font-medium">
                            Get a structured technical breakdown of any GitHub repository in minutes.
                        </p>
                    </div>

                    <div className="relative z-10 pt-4">
                        <Button
                            onClick={onAnalyzeClick}
                            className="h-16 px-12 bg-white hover:bg-white/95 text-[#111] font-bold text-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0.5"
                        >
                            Analyze Your First Repository
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
