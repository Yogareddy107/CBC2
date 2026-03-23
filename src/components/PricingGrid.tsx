"use client";

import React, { useState } from 'react';
import { PricingCard } from './PricingCard';
import { cn } from '@/lib/utils';
import PlanActions from './PlanActions';

interface PricingGridProps {
    onAction?: (plan: string) => void;
    userId?: string;
    currentPlanName?: string;
}

export const PricingGrid = ({ 
    onAction, 
    userId, 
    currentPlanName = 'Explorer'
}: PricingGridProps) => {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            id: 'explorer',
            name: "Explorer",
            description: "For individual developers",
            monthlyPrice: "$0",
            yearlyPrice: "$0",
            period: "/ forever",
            features: [
                "Public Repository Analysis",
                "3 analyses per month",
                "Architecture mapping & entry points",
                "Privacy-First (No code storage)"
            ],
            buttonText: "Start Free"
        },
        {
            id: 'pro_monthly',
            name: "Professional",
            description: "For serious solo-founders",
            monthlyPrice: "$15",
            yearlyPrice: "$12",
            period: "/ month",
            features: [
                "Private Repo Analysis (Unlimited)",
                "Unlimited Public Analyses",
                "Deep Intelligence (Cloud & Infra)",
                "Historical trend tracking",
                "Priority processing"
            ],
            buttonText: "Get Pro"
        },
        {
            id: 'team_monthly',
            name: "Team",
            description: "Up to 5 members included",
            monthlyPrice: "$39",
            yearlyPrice: "$32",
            period: "/ month",
            features: [
                "Shared Team Workspaces",
                "Collaborative Analysis & Sharing",
                "Advanced PR Governance & Webhooks",
                "Workspace Admin & RBAC",
                "Custom Governance Rules",
                "Priority Discord Support"
            ],
            buttonText: "Create Team Workspace",
            highlighted: true,
            badgeText: "Best Value"
        }
    ];

    return (
        <div className="space-y-12 w-full max-w-6xl mx-auto px-6">
            {/* Toggle Switch */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center p-1 bg-[#1A1A1A]/5 rounded-full border border-[#1A1A1A]/5">
                    <button
                        onClick={() => setIsYearly(false)}
                        className={cn(
                            "px-8 py-3 text-sm font-bold rounded-full transition-all duration-300",
                            !isYearly ? "bg-white text-[#1A1A1A] shadow-md" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setIsYearly(true)}
                        className={cn(
                            "px-8 py-3 text-sm font-bold rounded-full transition-all duration-300",
                            isYearly ? "bg-white text-[#1A1A1A] shadow-md" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60"
                        )}
                    >
                        Yearly
                    </button>
                </div>
                {isYearly && (
                    <span className="text-xs font-bold text-[#FF7D29] animate-bounce">
                        Save up to 20% with yearly billing!
                    </span>
                )}
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-3 gap-10 items-stretch">
                {plans.map((plan) => {
                    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                    let planId = plan.id;
                    if (plan.id === 'pro_monthly' && isYearly) planId = 'pro_yearly';
                    if (plan.id === 'team_monthly' && isYearly) planId = 'team_yearly';
                    
                    const isCurrent = currentPlanName?.toLowerCase() === plan.name.toLowerCase();

                    return (
                        <PricingCard
                            key={plan.id}
                            name={plan.name}
                            price={price}
                            period={plan.period}
                            description={plan.description}
                            features={plan.features}
                            buttonText={plan.buttonText}
                            highlighted={plan.highlighted}
                            badgeText={plan.badgeText}
                            currentPlan={isCurrent}
                            onAction={() => onAction?.(planId)}
                            customButton={userId ? (
                                <PlanActions 
                                    userId={userId}
                                    currentSub={
                                        (currentPlanName === 'Professional' && (planId === 'pro_monthly' || planId === 'pro_yearly')) ||
                                        (currentPlanName === 'Team' && (planId === 'team_monthly' || planId === 'team_yearly' || planId === 'team'))
                                            ? { plan: planId, status: 'active' } 
                                            : null
                                    }
                                    planId={planId}
                                    label={plan.buttonText}
                                />
                            ) : undefined}
                        />
                    );
                })}
            </div>
        </div>
    );
};
