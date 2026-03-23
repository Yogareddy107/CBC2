import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-16 h-16 rounded-[2rem] bg-slate-900/5 dark:bg-white/5 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                {/* Decorative pulse ring */}
                <div className="absolute inset-0 rounded-[2rem] border-2 border-primary/20 animate-ping opacity-20" />
            </div>
            <div className="space-y-1 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Clarity</p>
                <div className="flex gap-1 justify-center">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
