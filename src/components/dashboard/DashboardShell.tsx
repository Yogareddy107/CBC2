'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ErrorBoundary } from '../ErrorBoundary';
import { MaintenanceModal } from './MaintenanceModal';

interface DashboardShellProps {
  user: { $id: string; email: string } | null;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <MaintenanceModal />
      {/* Sidebar (Fixed width on desktop) */}
      <div className="hidden lg:block w-72 shrink-0 h-screen border-r border-slate-200 sticky top-0">
        <Sidebar open={false} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay when mobile sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TopBar (Sticky) */}
        <div className="sticky top-0 z-30 w-full">
           <TopBar user={user} onHamburger={() => setSidebarOpen(true)} />
        </div>

        {/* Workspace Area - This is where the scroll happens */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
