'use client';

import { useState } from 'react';
import { Terminal, Copy, Check, RotateCcw, ShieldCheck, AlertTriangle, Info, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createApiKeyAction, deleteApiKeyAction } from '@/app/dashboard/profile/actions';

interface HookGeneratorProps {
    user: {
        $id: string;
        prefs?: any;
    };
}

export function HookGenerator({ user }: HookGeneratorProps) {
    const [apiKey, setApiKey] = useState(user.prefs?.cbc_api_key || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [scriptCopied, setScriptCopied] = useState(false);

    const handleGenerateKey = async () => {
        setIsGenerating(true);
        const result = await createApiKeyAction();
        if (result.success && result.apiKey) {
            setApiKey(result.apiKey);
        }
        setIsGenerating(false);
    };

    const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    const hookScript = `#!/bin/bash
# CheckBeforeCommit (CBC) Pre-commit Guard
# Install: Save this as .git/hooks/pre-commit and chmod +x .git/hooks/pre-commit

echo "🔍 CBC: Analyzing staged changes..."

# 1. Get staged files
STAGED_FILES=$(git diff --cached --name-only)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# 2. Collect file contents (limited to first 5 files for speed)
JSON_FILES="["
COUNT=0
for FILE in $STAGED_FILES; do
  if [ $COUNT -ge 5 ]; then break; fi
  if [ -f "$FILE" ]; then
    CONTENT=$(cat "$FILE" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\\n/\\\\n/g')
    JSON_FILES="$JSON_FILES{\\"path\\":\\"$FILE\\",\\"content\\":\\"$CONTENT\\"},"
    COUNT=$((COUNT+1))
  fi
done
JSON_FILES="\${JSON_FILES%,}]"

# 3. Call CBC API
REPO_URL=$(git config --get remote.origin.url)
API_KEY="${apiKey}"

RESPONSE=$(curl -s -X POST "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/hook/analyze" \\
  -H "Content-Type: application/json" \\
  -d "{\\"apiKey\\":\\"$API_KEY\\",\\"repoUrl\\":\\"$REPO_URL\\",\\"files\\":$JSON_FILES}")

# 4. Parse Results
SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
if [ -z "$SUCCESS" ]; then
  echo "❌ CBC: Analysis failed or unauthorized."
  echo "$RESPONSE"
  exit 0 # Don't block if API is down
fi

SAFETY_SCORE=$(echo $RESPONSE | grep -o '"safetyScore":[0-9]*' | grep -o '[0-9]*')
MAX_RISK=$(echo $RESPONSE | grep -o '"maxRisk":"[^"]*"' | cut -d'"' -f4)

echo "----------------------------------------"
echo "✅ CBC Analysis Complete"
echo "🛡️  Safety Score: $SAFETY_SCORE%"
echo "⚠️  Max Risk: \${MAX_RISK^^}"
echo "----------------------------------------"

if [ "$MAX_RISK" == "critical" ]; then
  echo "🛑 CRITICAL RISK DETECTED. Commit blocked."
  exit 1
fi

if [ "$MAX_RISK" == "high" ]; then
  echo "⚠️  HIGH RISK change. Proceed with caution."
  # exit 1 # Uncomment to block high risk changes
fi

exit 0`;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section inside the card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-600">
                         <ShieldCheck className="w-5 h-5" />
                         <h3 className="text-xl font-bold tracking-tight">Local Repository Guard</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Authenticate and deploy real-time security guards to your local Git workflow.</p>
                </div>
                
                {!apiKey ? (
                    <Button 
                        onClick={handleGenerateKey} 
                        disabled={isGenerating} 
                        className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                        Generate Security Key
                    </Button>
                ) : (
                    <div className="flex items-center gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-200/50">
                        <div className="px-4 py-2 border-r border-slate-200">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Active Key</p>
                            <code className="text-xs font-mono text-slate-600">
                                {apiKey.substring(0, 8)}••••
                            </code>
                        </div>
                        <div className="flex items-center gap-1 pr-1.5">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 px-3 text-xs font-bold hover:bg-white hover:shadow-sm rounded-lg"
                                onClick={() => copyToClipboard(apiKey, setCopied)}
                            >
                                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 px-3 text-xs font-bold text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg"
                                onClick={async () => {
                                    if (confirm("Rotate Security Key? Existing hooks will stop working.")) {
                                        await handleGenerateKey();
                                    }
                                }}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {apiKey && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal className="w-5 h-5 text-slate-900" />
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Security Protocol</h3>
                        </div>

                        <div className="relative group overflow-hidden rounded-[24px] shadow-2xl shadow-indigo-900/10 border border-slate-800">
                            <div className="absolute top-0 inset-x-0 h-10 bg-slate-800 flex items-center px-4 justify-between border-b border-slate-700">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/40" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/40" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/40" />
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">pre-commit-guard.sh</div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2 text-[10px] font-bold bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600"
                                    onClick={() => copyToClipboard(hookScript, setScriptCopied)}
                                >
                                    {scriptCopied ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
                                    {scriptCopied ? 'Copied' : 'Copy Script'}
                                </Button>
                            </div>
                            <pre className="bg-[#0f172a] text-[#94a3b8] p-8 pt-16 overflow-x-auto text-[12px] font-mono leading-relaxed max-h-[400px] scrollbar-thin scrollbar-thumb-slate-700">
                                {hookScript}
                            </pre>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Deployment Instructions</h4>
                            <div className="space-y-4">
                                {[
                                    { step: "01", icon: BookOpen, text: "Navigate to your local repository root.", subtext: "Terminal: cd your-project-path" },
                                    { step: "02", icon: Terminal, text: "Save script as pre-commit hook.", subtext: "Path: .git/hooks/pre-commit" },
                                    { step: "03", icon: ShieldCheck, text: "Grant execution permissions.", subtext: "Command: chmod +x .git/hooks/pre-commit" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shadow-sm">
                                            {item.step}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[13px] font-bold text-slate-900">{item.text}</p>
                                            <p className="text-[11px] text-slate-500 font-mono bg-slate-100/50 px-1.5 py-0.5 rounded ml-[-2px]">{item.subtext}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-[24px] bg-amber-50/50 border border-amber-100 flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-amber-900 tracking-tight">Encryption Warning</p>
                                <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
                                    Your Security Key is used to verify repository ownership. Never commit this script containing the key to public repositories.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
