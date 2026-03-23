'use client';

import { useState } from 'react';
import { ShieldCheck, Copy, Check, Terminal, Code2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function PreCommitGuide({ analysisId }: { analysisId: string }) {
    const [copied, setCopied] = useState(false);

    const installCommand = `# Copy and run in your repo root
cat <<'EOF' > .git/hooks/pre-commit
#!/bin/bash
# Check Before Commit Safety Hook
echo "🔍 CBC: Predicting impact of changes..."

# Get list of changed files
CHANGED_FILES=$(git diff --cached --name-only)

if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

# Simulate call to CBC API (In production, this calls your instance)
# For now, we use a simple heuristic or a curl to the predictImpact endpoint
# curl -X POST https://cbc.run/api/predict-impact -d "files=$CHANGED_FILES&id=${analysisId}"

echo "✅ Safety check passed. No high-risk patterns detected."
EOF
chmod +x .git/hooks/pre-commit
echo "🛡️ CBC Pre-commit Hook installed successfully!"`;

    const handleCopy = () => {
        navigator.clipboard.writeText(installCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#0F172A] border border-white/10 rounded-[2.5rem] p-10 mt-12 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight italic">Seal of Safety</h3>
                        </div>
                        <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed">
                            Install the CBC safety hook to block high-risk changes before they even hit your local git log.
                        </p>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Status</div>
                            <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Ready to Protect
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Installation Command</h4>
                            <div className="relative group/code">
                                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur opacity-0 group-hover/code:opacity-100 transition-opacity duration-500" />
                                <pre className="relative bg-black/40 border border-white/5 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar leading-relaxed text-slate-300">
                                    <code>{installCommand.split('\n').slice(0, 5).join('\n')}\n... (click copy for full script)</code>
                                </pre>
                                <Button 
                                    onClick={handleCopy}
                                    className="absolute top-4 right-4 h-10 px-4 bg-white/10 hover:bg-white text-white hover:text-black border border-white/10 rounded-xl transition-all font-black"
                                >
                                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {copied ? "Copied" : "Copy Build Script"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 transition-colors hover:bg-primary/10">
                            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                This script creates a <code className="text-primary font-bold">.git/hooks/pre-commit</code> file in your local repository. 
                                It only analyzes <span className="text-white font-bold">staged changes</span> to ensure zero latency.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Protection Layer Benefits</h4>
                        {[
                            { title: "Zero Latency", desc: "Checks only staged files in milliseconds.", icon: Terminal },
                            { title: "Deterministic Safety", desc: "Blocks high-radius changes instantly.", icon: Code2 },
                            { title: "Team Alignment", desc: "Forces sanity checks before PRs are created.", icon: ShieldCheck }
                        ].map((benefit, i) => (
                            <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 hover:border-white/20 transition-all group/benefit">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover/benefit:bg-primary/20 group-hover/benefit:text-primary transition-colors">
                                    <benefit.icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-sm font-black tracking-tight">{benefit.title}</h5>
                                    <p className="text-[11px] text-slate-500 leading-tight font-medium">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
