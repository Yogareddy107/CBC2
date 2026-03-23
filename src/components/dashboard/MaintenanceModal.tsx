"use client";

import React, { useState, useEffect } from 'react';
import { X, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MaintenanceModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Only show if not previously dismissed in this browser environment
        const wasDismissed = localStorage.getItem('cbc-maintenance-v2-dismissed');
        if (!wasDismissed) {
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('cbc-maintenance-v2-dismissed', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-md animate-in fade-in duration-500"
                onClick={handleDismiss}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white border border-[#1A1A1A]/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
                {/* Accent Header */}
                <div className="h-2 bg-gradient-to-r from-[#FF7D29] via-[#FF7D29]/50 to-[#FF7D29]" />
                
                <button
                    onClick={handleDismiss}
                    className="absolute right-6 top-8 text-[#1A1A1A]/30 hover:text-[#1A1A1A] transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-10 space-y-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-[#FF7D29]/10 rounded-3xl flex items-center justify-center animate-pulse">
                            <Sparkles className="w-8 h-8 text-[#FF7D29]" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                                System Upgrade v2.0
                            </h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-3 h-3" />
                                Professional Deployment
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1A1A1A]/5 rounded-2xl p-6 border border-[#1A1A1A]/5">
                        <p className="text-sm font-medium leading-relaxed text-[#1A1A1A]/70 text-center">
                            We are currently upgrading **CheckBeforeCommit** to enhance your architectural governance experience. 
                            Our team is deploying high-performance optimizations and new security modules. 
                            Some advanced features may be temporarily limited during this maintenance window.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleDismiss}
                            className="w-full h-14 rounded-2xl font-bold bg-[#1A1A1A] hover:bg-[#FF7D29] text-white transition-all duration-300 shadow-lg hover:shadow-[#FF7D29]/30"
                        >
                            Understood, Continue to Dashboard
                        </Button>
                        <p className="text-[10px] text-center font-bold text-[#1A1A1A]/30 uppercase tracking-[0.2em]">
                            Updating version • April 2024
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
