import React from 'react';
import { Check, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PricingCardProps {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    buttonText: string;
    onAction?: () => void;
    highlighted?: boolean;
    currentPlan?: boolean;
    badgeText?: string;
    className?: string;
    customButton?: React.ReactNode;
}

export const PricingCard = ({
    name,
    price,
    period,
    description,
    features,
    buttonText,
    onAction,
    highlighted = false,
    currentPlan = false,
    badgeText,
    className,
    customButton
}: PricingCardProps) => {
    return (
        <div className={cn(
            "relative flex flex-col p-10 transition-all duration-500 rounded-[3rem] border h-full",
            "bg-white border-[#1A1A1A]/10 shadow-sm hover:shadow-xl hover:bg-[#FF7D29]/5 hover:border-[#FF7D29]/20 group/card",
            className
        )}>
            {badgeText && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF7D29] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-xl z-20">
                    {badgeText}
                </div>
            )}

            <div className="flex flex-col items-center text-center space-y-6 mb-10">
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                            {name}
                        </h3>
                        {highlighted && <Zap className="w-5 h-5 text-[#FF7D29] fill-[#FF7D29]" />}
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A]/50">
                        {description}
                    </p>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black tracking-tighter text-[#1A1A1A] group-hover/card:text-[#FF7D29] transition-colors">
                        {price}
                    </span>
                    <span className="text-sm font-bold text-[#1A1A1A]/30">
                        {period}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="w-full h-px bg-[#1A1A1A]/5 mb-8" />
                
                <ul className="space-y-5 mb-10">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-[#FF7D29]/10 group-hover/card:bg-[#FF7D29]/20 transition-colors">
                                <Check className="w-2.5 h-2.5 text-[#FF7D29]" />
                            </div>
                            <span className="text-sm font-medium leading-tight text-[#1A1A1A]/70 group-hover/card:text-[#1A1A1A] transition-colors">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto">
                    {customButton ? (
                        customButton
                    ) : (
                        <Button
                            onClick={onAction}
                            disabled={currentPlan}
                            className={cn(
                                "w-full h-16 rounded-[2rem] font-black text-lg transition-all duration-300",
                                currentPlan 
                                    ? "bg-secondary text-muted-foreground cursor-not-allowed" 
                                    : "bg-[#1A1A1A] hover:bg-[#FF7D29] text-white shadow-lg hover:shadow-[#FF7D29]/40 hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            {currentPlan ? 'Current Plan' : buttonText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
