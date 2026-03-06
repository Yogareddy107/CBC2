'use client';

import { useState, useEffect } from 'react';
import { Github, Loader2, Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createAnalysis } from '@/app/analyze/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NewAnalysisForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const urlParam = searchParams.get('url');
        if (urlParam) {
            setUrl(urlParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || loading) return;

        setLoading(true);
        try {
            const res = await createAnalysis(url);
            if (res.id) {
                router.push(`/report/${res.id}`);
            }
        } catch (err) {
            console.error("Analysis creation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "max-w-3xl mx-auto space-y-4 transition-all duration-500",
                isFocused ? "scale-[1.01]" : "scale-100"
            )}
        >
            <div className="relative group">
                {/* Glow Effect */}
                <div className={cn(
                    "absolute -inset-1 bg-gradient-to-r from-primary/20 via-amber-200/20 to-primary/20 rounded-[2rem] blur-xl transition-opacity duration-500",
                    isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )} />

                <div className="relative flex items-center bg-white border border-border/40 rounded-[1.5rem] shadow-2xl p-2 transition-all group-focus-within:border-primary/40 group-focus-within:ring-4 group-focus-within:ring-primary/5">
                    <div className="flex-1 flex items-center px-4">
                        <Search className={cn(
                            "w-6 h-6 transition-colors duration-300",
                            isFocused ? "text-primary" : "text-muted-foreground/40"
                        )} />
                        <Input
                            name="url"
                            value={url}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste GitHub repository URL..."
                            className="h-14 border-none bg-transparent text-lg focus-visible:ring-0 placeholder:text-muted-foreground/30 font-medium"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !url}
                        className="h-14 px-8 rounded-[1.2rem] bg-[#1A1A1A] hover:bg-primary text-white font-bold transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Analyze</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
                <div className="flex flex-wrap justify-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 py-2">Try an example:</span>
                    {[
                        { name: 'React', url: 'https://github.com/facebook/react' },
                        { name: 'Next.js', url: 'https://github.com/vercel/next.js' },
                        { name: 'VS Code', url: 'https://github.com/microsoft/vscode' },
                        { name: 'Tailwind', url: 'https://github.com/tailwindlabs/tailwindcss' }
                    ].map((repo) => (
                        <button
                            key={repo.name}
                            type="button"
                            onClick={() => setUrl(repo.url)}
                            className="px-3 py-1.5 rounded-full bg-secondary/10 border border-border/20 text-[10px] font-bold text-muted-foreground hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all active:scale-95"
                        >
                            {repo.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        <Github className="w-3.5 h-3.5" />
                        Works with any public repo
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border/40" />
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        <span className="text-primary italic">Pro</span>
                        History support included
                    </div>
                </div>
            </div>
        </form>
    );
}
