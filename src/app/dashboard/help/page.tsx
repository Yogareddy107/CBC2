import { HelpCircle, BookOpen, Settings, Zap, ShieldQuestion, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function CategoryCard({ icon: Icon, title, description, children }: { icon: any, title: string, description: string, children?: React.ReactNode }) {
  return (
    <div className="group rounded-[32px] border border-border/20 bg-white p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4 text-sm text-[#1A1A1A]/70 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function DashboardHelpPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-12">
      {/* Header Section */}
      <header className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3 text-primary">
          <HelpCircle className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Help Center</h1>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Everything you need to know about CheckBeforeCommit. From running your first analysis to understanding complex architectural signals.
        </p>
      </header>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <CategoryCard 
          icon={BookOpen} 
          title="Getting Started" 
          description="Learn the basics of code analysis"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/5">
              <p className="font-bold text-[#1A1A1A] mb-1">Step 1: Repository Link</p>
              <p>Paste any public GitHub URL into the dashboard search bar.</p>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/5">
              <p className="font-bold text-[#1A1A1A] mb-1">Step 2: Analysis Engine</p>
              <p>Our engine scans the structural integrity, entry points, and risks.</p>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/5">
              <p className="font-bold text-[#1A1A1A] mb-1">Step 3: Direct Verdict</p>
              <p>Get a production-grade verdict on whether to adopt or avoid.</p>
            </div>
          </div>
        </CategoryCard>

        <CategoryCard 
          icon={Zap} 
          title="Core Features" 
          description="Maximize your technical audits"
        >
          <ul className="space-y-3">
            {[
              "Repository Structure Analysis: Deep dive into folder hierarchies.",
              "Dependency Health: Tracking stale or high-risk packages.",
              "Maintainer Activity: Measuring commit velocity and health.",
              "Technical Debt: Spotting structural hazards before they bite."
            ].map((f, i) => (
              <li key={i} className="flex gap-2">
                <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </CategoryCard>

        <CategoryCard 
          icon={Settings} 
          title="Billing & Subscription" 
          description="Manage your professional account"
        >
          <div className="space-y-4">
            <p>We support multiple tiers designed for individual developers and large-scale engineering teams.</p>
            <Link href="/dashboard/plan" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
               Manage Subscription <ChevronRight className="w-4 h-4" />
            </Link>
            <div className="pt-4 border-t border-border/10">
              <p className="font-bold text-[#1A1A1A] mb-1">Need Enterprise access?</p>
              <p>Contact us for custom SLAs and private repository scanning at teamintrasphere@gmail.com.</p>
            </div>
          </div>
        </CategoryCard>

        <CategoryCard 
          icon={ShieldQuestion} 
          title="FAQ" 
          description="Commonly asked questions"
        >
          <div className="space-y-6">
            <div>
              <p className="font-bold text-[#1A1A1A] mb-1">Q: Does this modify my code?</p>
              <p>No. We only perform read-only structural analysis on public repos.</p>
            </div>
            <div>
              <p className="font-bold text-[#1A1A1A] mb-1">Q: Which languages are supported?</p>
              <p>JavaScript, TypeScript, Python, and Node.js are fully supported.</p>
            </div>
          </div>
        </CategoryCard>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-4 py-8 text-muted-foreground/40">
        <Info className="w-4 h-4" />
        <p className="text-xs font-medium italic">
          This documentation is updated weekly to reflect our latest analysis engine improvements.
        </p>
      </div>
    </div>
  );
}
