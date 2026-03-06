import {
  HelpCircle,
  BookOpen,
  Zap,
  Settings,
  ShieldCheck,
  MessageSquare,
  Terminal,
  Activity,
  Search,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

function HelpCard({
  title,
  description,
  icon: Icon,
  children,
  className
}: {
  title: string;
  description?: string;
  icon: any;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`group border-border/40 bg-card/60 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
        </div>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default function DashboardHelpPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF6] via-white to-amber-50/30 border border-amber-100/20 p-8 md:p-12 text-center space-y-6">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <HelpCircle className="w-64 h-64 -rotate-12" />
        </div>

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3 h-3" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            How can we <span className="text-primary">help?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about CheckBeforeCommit and its repository analysis reports.
          </p>
        </div>

        <div className="max-w-xl mx-auto relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for guides, features, or FAQs..."
              className="pl-12 h-14 rounded-2xl border-border/40 shadow-sm focus:ring-primary/20"
            />
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Getting Started */}
        <HelpCard
          title="Getting Started"
          description="The basics of CBC analysis"
          icon={BookOpen}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-amber-50">1</Badge>
              <p className="text-sm">Paste a public <span className="font-bold">GitHub URL</span> into the dashboard.</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-amber-50">2</Badge>
              <p className="text-sm">Click <span className="font-bold text-primary">Analyze</span> to start the scan.</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5 bg-amber-50">3</Badge>
              <p className="text-sm">Review the health report and overall verdict.</p>
            </div>
          </div>
        </HelpCard>

        {/* Features */}
        <HelpCard
          title="Core Features"
          description="What our engine evaluates"
          icon={Zap}
        >
          <ul className="space-y-3">
            {[
              "Architecture Overview",
              "Dependency Complexity",
              "Maintainer Activity",
              "Technical Risk Detection"
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                <ChevronRight className="w-3 h-3 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </HelpCard>

        {/* Technical Signals */}
        <HelpCard
          title="Understanding Signals"
          description="Deciphering the report results"
          icon={Activity}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1">Maintainability Score</p>
              <p className="text-xs text-muted-foreground">Measures how easy the codebase will be to maintain long-term.</p>
            </div>
            <div>
              <p className="text-sm font-bold mb-1">Risk Signals</p>
              <p className="text-xs text-muted-foreground">Highlights issues like low testing, inactivity, or poor structure.</p>
            </div>
          </div>
        </HelpCard>

        {/* Compatibility */}
        <HelpCard
          title="Compatibility"
          description="Supported languages & repos"
          icon={Terminal}
        >
          <div className="flex flex-wrap gap-2">
            {["JavaScript", "TypeScript", "Python", "Node.js", "Public Repos"].map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-bold uppercase">{tag}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Private repository support arriving in Q3.
          </p>
        </HelpCard>

        {/* Security */}
        <HelpCard
          title="Privacy & Security"
          description="Your data is safe with us"
          icon={ShieldCheck}
        >
          <p className="text-sm text-foreground/80 mb-4">
            CheckBeforeCommit only analyzes public repository data. We never modify your code.
          </p>
          <div className="space-y-2">
            <a href="https://cbc1.vercel.app/privacy" className="text-xs text-primary hover:underline flex items-center gap-1">
              Privacy Policy <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </HelpCard>

        {/* Support */}
        <HelpCard
          title="Contact & Support"
          description="Need more help?"
          icon={MessageSquare}
          className="bg-primary/5 border-primary/20"
        >
          <p className="text-sm mb-4">Talk to our developers directly via the <span className="font-bold">Support Chat</span>.</p>
          <a href="mailto:teamintrasphere@gmail.com" className="text-sm font-bold text-primary hover:underline block mb-1">
            teamintrasphere@gmail.com
          </a>
          <p className="text-[10px] text-muted-foreground">Avg. response time: &lt; 24h</p>
        </HelpCard>
      </div>

      {/* FAQ Accordion Mockup */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-sm">Quick answers to common queries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: "How long does analysis take?", a: "Most repositories are analyzed within 3-5 seconds." },
            { q: "Is it free for open source?", a: "Yes, public repo analysis is free for all users." },
            { q: "Does it support GitLab?", a: "Currently, only GitHub is supported." },
            { q: "Can I export the report?", a: "Report export features are currently in development." }
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border/30 bg-secondary/5 hover:border-primary/20 transition-colors">
              <p className="font-bold text-sm mb-2">{faq.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <footer className="pt-8 border-t border-border/20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
          <Info className="w-3 h-3 text-primary" />
          Professional Technical Analysis Engine
        </div>
      </footer>
    </div>
  );
}
