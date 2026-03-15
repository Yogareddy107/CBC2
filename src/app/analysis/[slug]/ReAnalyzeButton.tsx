'use client';

import { useState } from 'react';
import { RefreshCcw, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reAnalyze } from '@/app/analyze/actions';
import { useRouter } from 'next/navigation';

export function ReAnalyzeButton({ slug }: { slug: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleReAnalyze = async () => {
        if (!confirm('This will clear the current report and start a fresh analysis. Continue?')) {
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const res = await reAnalyze(slug);
            if (res.success) {
                router.refresh();
            } else {
                setError(res.error || 'Failed to trigger re-analysis');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <Button 
                onClick={handleReAnalyze} 
                variant="outline"
                size="sm"
                disabled={loading}
                className="font-bold flex items-center gap-2"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <RefreshCcw className="w-4 h-4" />
                )}
                <span>Re-analyze</span>
            </Button>
            {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
        </div>
    );
}
