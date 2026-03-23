'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#FFFDF6] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm border border-red-100 italic">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-3xl font-black tracking-tighter text-[#1A1A1A]">Something went wrong</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        We encountered an unexpected error. Our team has been notified.
                    </p>
                    {error.digest && (
                        <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={() => reset()}
                        className="h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl transition-all"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
                    </Button>
                    <Button 
                        variant="outline" 
                        asChild
                        className="h-12 border-slate-200 hover:bg-white rounded-xl font-bold transition-all"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" /> Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
