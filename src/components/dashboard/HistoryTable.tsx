import { useState, useEffect } from 'react';
import { Github, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { deleteAnalysis } from '@/app/analyze/actions';
import { useRouter } from 'next/navigation';

interface Analysis {
    id: string;
    repo_url: string;
    slug: string | null;
    status: string;
    created_at: string;
    summary: string | null;
}

interface HistoryTableProps {
    initialAnalyses: Analysis[];
}

export function HistoryTable({ initialAnalyses }: HistoryTableProps) {
    const [analyses, setAnalyses] = useState(initialAnalyses);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this analysis?')) {
            return;
        }

        setDeletingId(id);
        try {
            const result = await deleteAnalysis(id) as { success: boolean };
            if (result.success) {
                setAnalyses(prev => prev.filter(a => a.id !== id));
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to delete analysis:', error);
            alert('Failed to delete analysis. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="border border-border/40 rounded-xl overflow-hidden bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-[#F7F7F7] border-b border-[#1A1A1A]/5">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-[#1A1A1A]/70">Repository</th>
                        <th className="px-6 py-4 font-semibold text-[#1A1A1A]/70">Date</th>
                        <th className="px-6 py-4 font-semibold text-[#1A1A1A]/70">Status</th>
                        <th className="px-6 py-4 font-semibold text-[#1A1A1A]/70">Summary</th>
                        <th className="px-6 py-4 font-semibold text-[#1A1A1A]/70 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]/5">
                    {analyses.map((analysis) => {
                        const repoName = analysis.repo_url.split('/').pop() || analysis.repo_url;
                        const date = new Date(analysis.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });

                        return (
                            <tr key={analysis.id} className="group hover:bg-[#FFF5ED] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-[#1A1A1A]/10 flex items-center justify-center">
                                            <Github className="w-4 h-4 text-[#1A1A1A]/40 group-hover:text-[#FF7D29] transition-colors" />
                                        </div>
                                        <Link
                                            href={`/analysis/${analysis.slug}`}
                                            className="font-medium text-[#1A1A1A] group-hover:text-[#FF7D29] transition-colors truncate max-w-[200px]"
                                            title={`View report for ${analysis.repo_url}`}
                                        >
                                            {repoName}
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[#1A1A1A]/50 text-xs font-medium whitespace-nowrap">
                                    {mounted ? date : null}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant={analysis.status === 'completed' ? 'secondary' : analysis.status === 'failed' ? 'destructive' : 'outline'}
                                        className="text-[10px] h-4 px-1.5 font-bold uppercase tracking-wider bg-[#F4F4F5] text-[#1A1A1A] border-none"
                                    >
                                        {analysis.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 truncate max-w-xs" title={analysis.summary || "No summary available"}>
                                    {analysis.summary || "No summary available"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/report/${analysis.id}`}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-[#FF7D29]/10 text-[#1A1A1A]/40 hover:text-[#FF7D29] transition-all"
                                            title="View Report"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(analysis.id)}
                                            disabled={deletingId === analysis.id}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-destructive/10 text-[#1A1A1A]/40 hover:text-destructive transition-all disabled:opacity-50"
                                            title="Delete Analysis"
                                        >
                                            {deletingId === analysis.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
