import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingGrid } from '@/components/PricingGrid';

interface PricingSectionProps {
    onLoginClick: () => void;
}

export const PricingSection = ({ onLoginClick }: PricingSectionProps) => {
    return (
        <section id="pricing" className="bg-[#F9FAFB] py-[140px] border-t border-[#1A1A1A]/5">
            <div className="max-w-[1200px] mx-auto px-6 space-y-16">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Simple, transparent pricing.</h2>
                    <p className="text-[#1A1A1A]/60 text-lg font-medium">Cheaper than one hour of engineering time.</p>
                </div>

                <PricingGrid onAction={onLoginClick} />
            </div>
        </section>
    );
};
