'use client';

import { useMemo, useState, useEffect } from 'react';
import { Search, History, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HistoryTable } from './HistoryTable';

interface Analysis {
  id: string;
  repo_url: string;
  slug: string | null;
  status: string;
  created_at: string;
  summary: string | null;
}

interface HistoryPageClientProps {
  analyses: Analysis[];
}

export function HistoryPageClient({ analyses }: HistoryPageClientProps) {
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return analyses;

    const lower = query.toLowerCase();
    return analyses.filter((analysis) => {
      const repoName = analysis.repo_url.split('/').pop() || analysis.repo_url;
      return (
        analysis.repo_url.toLowerCase().includes(lower) ||
        repoName.toLowerCase().includes(lower) ||
        (analysis.summary ?? '').toLowerCase().includes(lower)
      );
    });
  }, [analyses, query]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Analysis History</h1>
          <p className="text-sm text-muted-foreground">Manage and review your previous codebase explorations.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              className="h-9 pl-9 text-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {!mounted ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/20" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border/40 rounded-2xl bg-secondary/5">
          <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4 border border-border/10">
            <History className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No history yet</h3>
          <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Start by analyzing your first repository from the dashboard.</p>
        </div>
      ) : (
        <HistoryTable initialAnalyses={filtered} />
      )}
    </div>
  );
}
