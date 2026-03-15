'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) return this.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Something went wrong</h2>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">
              We encountered an unexpected crash while rendering this section. Our engineers have been notified.
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="rounded-2xl font-bold bg-slate-900 shadow-xl shadow-slate-200 gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Refreshing
          </Button>
        </div>
      );
    }

    return this.props.children;
  }

  // Need to fix this.fallback usage in child class pattern if needed, 
  // but let's stick to this.props.fallback
  private get fallback() {
    return this.props.fallback;
  }
}
