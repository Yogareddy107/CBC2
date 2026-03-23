import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Zap, 
  Activity, 
  Shield, 
  MessageSquare, 
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function HelpCategory({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="group relative p-8 rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-primary/20 hover:-translate-y-1">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
          <Icon className="w-6 h-6 animate-in zoom-in-50 duration-500" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function StepCard({ number, title, text }: { number: string; title: string, text: string }) {
    return (
        <div className="flex gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white transition-colors duration-300">
            <span className="text-4xl font-black text-slate-200/80 mt-1 select-none">{number}</span>
            <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900">{title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{text}</p>
            </div>
        </div>
    )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white transition-all group">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                {question}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium pl-3.5 border-l border-slate-200 ml-0.5">
                {answer}
            </p>
        </div>
    )
}

export default function DashboardHelpPage() {
  return (
    <div className="relative min-h-screen bg-slate-50/30">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10 blur-3xl opacity-60" />

      <div className="max-w-6xl mx-auto px-6 py-20 pb-32">
        {/* Hero Section */}
        <header className="text-center space-y-8 mb-24 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4" />
            Support Center
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900">
                How can we <span className="bg-gradient-to-r from-indigo-600 to-primary bg-clip-text text-transparent italic">help you?</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
               Get specialized guidance on repository analysis, architecture mapping, and real-time security guards.
            </p>
          </div>

          {/* Decorative Search (Visual only) */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative flex items-center h-16 bg-white rounded-2xl border border-slate-200 px-6 shadow-xl shadow-slate-200/20 group-focus-within:border-primary/50 transition-all">
                <Search className="w-6 h-6 text-slate-400 mr-4" />
                <input 
                    type="text" 
                    placeholder="Search for guides, features, or FAQs..." 
                    className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                />
                <kbd className="hidden sm:flex h-6 px-2 items-center gap-1 rounded border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Category: Getting Started */}
          <div className="lg:col-span-2">
            <HelpCategory title="Getting Started" icon={Zap}>
              <p className="text-slate-600 mb-8 font-medium">Unlock full codebase visibility in three simple steps.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StepCard 
                    number="01" 
                    title="Connect Source" 
                    text="Paste any public or private repository URL from GitHub, GitLab, or Bitbucket." 
                />
                <StepCard 
                    number="02" 
                    title="Deep Analytics" 
                    text="Our engine scans structural signals, dependencies, and commit frequency." 
                />
                <StepCard 
                    number="03" 
                    title="Actionable Insights" 
                    text="Receive a full architecture map, risk verdict, and maintainability score." 
                />
                <div className="p-6 rounded-2xl bg-indigo-600 text-white flex flex-col justify-center items-center text-center group cursor-pointer border border-indigo-500 shadow-xl shadow-indigo-200">
                    <CheckCircle2 className="w-8 h-8 mb-3 opacity-80 group-hover:scale-110 transition-transform" />
                    <p className="font-bold">Ready to analyze?</p>
                    <Link href="/dashboard" className="text-xs font-bold opacity-80 group-hover:opacity-100 flex items-center gap-1.6 mt-1 underline-offset-4 hover:underline">
                        Go to Dashboard <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
              </div>
            </HelpCategory>
          </div>

          <HelpCategory title="Core Features" icon={BookOpen}>
            <div className="space-y-6">
                <div className="flex gap-4 group">
                    <div className="w-1.5 rounded-full bg-emerald-500 h-10 group-hover:h-12 transition-all duration-300" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">Architecture Mapping</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Auto-generated entry points and module flows.</p>
                    </div>
                </div>
                <div className="flex gap-4 group">
                    <div className="w-1.5 rounded-full bg-blue-500 h-10 group-hover:h-12 transition-all duration-300" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">Dependency Guard</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Detect complex, dead, or high-risk packages.</p>
                    </div>
                </div>
                <div className="flex gap-4 group">
                    <div className="w-1.5 rounded-full bg-indigo-500 h-10 group-hover:h-12 transition-all duration-300" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">Real-time Guard</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Git hooks to prevent high-risk commits locally.</p>
                    </div>
                </div>
                <div className="flex gap-4 group">
                    <div className="w-1.5 rounded-full bg-primary h-10 group-hover:h-12 transition-all duration-300" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">Team Analytics</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Track health scores across multiple repositories.</p>
                    </div>
                </div>
            </div>
          </HelpCategory>

          <HelpCategory title="Report Guide" icon={Activity}>
             <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Metrics</p>
                    <div className="space-y-2">
                        <p className="text-xs font-bold flex items-center justify-between">
                            Maturity Score <span className="text-primary">0-100</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">Derived from testing, activity, and structure.</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Verdict Types</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold text-center border border-emerald-100">STABLE</div>
                        <div className="px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold text-center border border-amber-100">CAUTION</div>
                        <div className="px-2 py-1.5 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold text-center border border-red-100">RISKY</div>
                        <div className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold text-center border border-slate-200">UNKNOWN</div>
                    </div>
                </div>
             </div>
          </HelpCategory>

          <div className="lg:col-span-2">
            <HelpCategory title="Common Questions" icon={MessageSquare}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FaqItem 
                        question="Is my code safe?" 
                        answer="We only read public repository data or metadata from private repos you authorize. We never write to your repos."
                    />
                    <FaqItem 
                        question="How is data analyzed?" 
                        answer="Our engine combines static code signals with structured LLM reasoning for deep architectural understanding."
                    />
                    <FaqItem 
                        question="Can I share reports?" 
                        answer="Yes, every report generates a unique slug. Use the top-right Share button to send it to your team."
                    />
                    <FaqItem 
                        question="Rate limits?" 
                        answer="Free users get limited analyses. Professional teams enjoy high-throughput analysis and priority support."
                    />
                </div>
            </HelpCategory>
          </div>
        </div>

        {/* Support Section */}
        <section className="mt-24 p-12 rounded-[40px] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] -z-0" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 mb-2">
                    <Shield className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight">Still have questions?</h3>
                <p className="text-slate-400 max-w-xl font-medium">
                    Our engineering team is here to help you integrate CBC into your enterprise architecture or Git workflows.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        <a href="mailto:teamintrasphere@gmail.com">Email Support</a>
                    </Button>
                    <Button variant="ghost" className="h-12 px-10 rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all text-slate-300">
                        <Link href="/dashboard">View Roadmap</Link>
                    </Button>
                </div>

                <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
                    <a href="https://cbc1.vercel.app/privacy" className="text-xs font-bold hover:opacity-100 transition-opacity">Privacy</a>
                    <a href="https://cbc1.vercel.app/terms" className="text-xs font-bold hover:opacity-100 transition-opacity">Terms</a>
                    <a href="https://cbc1.vercel.app/cookies" className="text-xs font-bold hover:opacity-100 transition-opacity">Cookies</a>
                    <div className="text-xs font-bold">© 2026 CBC</div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
