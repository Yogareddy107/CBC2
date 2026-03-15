'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { AnalysisReport } from '@/components/AnalysisReport';
import { getTeamAnalyses } from '@/app/team/actions';
import { Loader2, ArrowLeft, Users, Share2, MessageSquare, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CollaborativeReportPage() {
    const params = useParams();
    const teamId = params.teamId as string;
    const analysisId = params.analysisId as string;
    const router = useRouter();

    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (teamId && analysisId) {
            loadAnalysis();
        }
    }, [teamId, analysisId]);

    const loadAnalysis = async () => {
        setLoading(true);
        try {
            const res = await getTeamAnalyses(teamId);
            if (res.success) {
                const found = res.analyses?.find((a: any) => a.id === analysisId);
                if (found) {
                    setAnalysis(found);
                } else {
                    setError("Analysis not found in this team.");
                }
            } else {
                setError(res.error || "Failed to load team data.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#FF7D29]" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Workspace...</p>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                    <History className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">{error || "Report Unavailable"}</h1>
                <Button asChild className="rounded-2xl bg-slate-900">
                    <Link href={`/team/${teamId}`}>Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    const repoName = analysis.repo_url.split('/').pop() || analysis.repo_url;

    return (
        <div className="bg-[#F8FAFC] min-h-screen">
            {/* Contextual Header */}
            <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" asChild>
                            <Link href={`/team/${teamId}`}>
                                <ArrowLeft className="w-5 h-5 text-slate-400" />
                            </Link>
                        </Button>
                        <div className="h-8 w-px bg-slate-200 mx-1" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-black text-slate-900 tracking-tight">{repoName}</h2>
                                <div className="px-2 py-0.5 rounded-md bg-slate-900/5 text-slate-500 font-bold text-[10px] uppercase tracking-widest">Team Report</div>
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                                Shared Workspace • Real-time Collaboration Active
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center -space-x-2 mr-4">
                            {[1, 2].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] shadow-sm">
                                    <Users className="w-4 h-4" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#FF7D29] flex items-center justify-center text-white font-black text-[10px] shadow-sm animate-pulse">
                                +1
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold text-slate-600 bg-white">
                            <Share2 className="w-4 h-4 mr-2" /> Share
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Report Area */}
            <main className="max-w-7xl mx-auto py-12 px-6">
                <AnalysisReport 
                    data={analysis.result} 
                    repoUrl={analysis.repo_url} 
                    analysisId={analysis.id}
                    teamId={teamId}
                />
            </main>
        </div>
    );
}
