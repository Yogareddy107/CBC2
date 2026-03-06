'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#FFFDF6]/50">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center mx-auto shadow-sm">
                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[#1A1A1A]">Dashboard Error</h2>
                    <p className="text-muted-foreground">
                        Something went wrong while loading this section. You can try refreshing or return to the main dashboard.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={reset}
                        variant="default"
                        className="rounded-xl flex items-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try Refreshing
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="rounded-xl flex items-center gap-2"
                    >
                        <Link href="/dashboard">
                            <LayoutDashboard className="w-4 h-4" />
                            Reset Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
