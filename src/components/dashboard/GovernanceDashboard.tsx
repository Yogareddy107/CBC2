"use client";

import React, { useState } from 'react';
import { 
    Shield, 
    Plus, 
    Trash2, 
    Zap, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle,
    Info,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { generateGovernanceRule, saveGovernanceRule, deleteGovernanceRule } from '@/app/analyze/actions';

interface GovernanceRule {
    id: string;
    name: string;
    description?: string;
    definition: {
        type: string;
        from: string;
        to: string;
        prohibited: boolean;
    };
    enforced: boolean;
}

interface GovernanceDashboardProps {
    teamId: string;
    initialRules: GovernanceRule[];
}

const GovernanceDashboard: React.FC<GovernanceDashboardProps> = ({ teamId, initialRules }) => {
    const [rules, setRules] = useState<GovernanceRule[]>(initialRules);
    const [isGenerating, setIsGenerating] = useState(false);
    const [description, setDescription] = useState("");
    const [previewRule, setPreviewRule] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!description.trim()) return;
        setIsGenerating(true);
        setError(null);
        try {
            const res = await generateGovernanceRule(description);
            if (res.success) {
                setPreviewRule({ ...res.rule, description });
            } else {
                setError(res.error || "Failed to generate rule structure.");
            }
        } catch (err) {
            setError("LLM parsing failed. Please try a clearer description.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveRule = async () => {
        if (!previewRule) return;
        try {
            const res = await saveGovernanceRule(teamId, previewRule);
            if (res.success) {
                // In a real app we'd fetch the new rule ID from the DB
                // for local state we'll just refresh or re-fetch
                window.location.reload(); 
            } else {
                setError(res.error || "Failed to save rule.");
            }
        } catch (err) {
            setError("Save operation failed.");
        }
    };

    const handleDelete = async (ruleId: string) => {
        if (!confirm("Are you sure you want to delete this architectural rule?")) return;
        try {
            const res = await deleteGovernanceRule(teamId, ruleId);
            if (res.success) {
                setRules(rules.filter(r => r.id !== ruleId));
            }
        } catch (err) {
            setError("Delete operation failed.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <Shield className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Architectural Governance</h2>
                        <p className="text-sm text-slate-400">Define and enforce custom dependency constraints.</p>
                    </div>
                </div>
            </div>

            {/* AI Rule Generator */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4 text-indigo-400">
                    <Zap className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold uppercase tracking-wider">AI Rule Generator</span>
                </div>
                
                <div className="space-y-4">
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., UI components in src/components/ui should never import anything from src/lib/db."
                        className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                    />
                    
                    <div className="flex justify-end gap-3">
                        {previewRule && (
                            <button 
                                onClick={() => setPreviewRule(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !description.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg shadow-indigo-600/20"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Generate Rule Structure
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {previewRule && (
                        <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-indigo-300 mb-2 underline decoration-indigo-500/30">Proposed Rule: {previewRule.name}</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">From (Source)</span>
                                    <code className="block p-2 bg-slate-950 rounded text-xs text-indigo-300 border border-slate-800">{previewRule.definition.from}</code>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">To (Dependency)</span>
                                    <code className="block p-2 bg-slate-950 rounded text-xs text-rose-300 border border-slate-800">{previewRule.definition.to}</code>
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveRule}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-all text-sm"
                            >
                                Confirm & Enforce Rule
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Rules List */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest px-2">Active Policies ({rules.length})</h3>
                {rules.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-xl">
                        <Shield className="w-12 h-12 text-slate-700 mx-auto mb-3 opacity-20" />
                        <p className="text-slate-500 text-sm">No architectural rules defined yet.</p>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div 
                            key={rule.id}
                            className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${rule.enforced ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
                                    {rule.enforced ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200">{rule.name}</h4>
                                    <p className="text-xs text-slate-500">{rule.description || "Constraint enforced via glob patterns."}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400">{rule.definition.from}</code>
                                        <span className="text-[10px] text-slate-600">cannot depend on</span>
                                        <code className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400">{rule.definition.to}</code>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleDelete(rule.id)}
                                className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GovernanceDashboard;
