'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Github,
    ArrowRight,
    Compass,
    ChevronDown,
    ChevronRight,
    Folder,
    FileText,
    Map,
    Code2,
    BarChart3,
    ShieldAlert,
    Search,
    Check,
    X
} from 'lucide-react';
import Link from 'next/link';
import { CTASection } from '@/components/ui/hero-dithering-card';
import { Reveal } from '@/components/ui/Reveal';

export default function LandingClient() {
    const router = useRouter();
    const heroRef = useRef<HTMLDivElement>(null);
    const [url, setUrl] = useState('');
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await account.get();
                if (currentUser) {
                    router.replace('/dashboard');
                } else {
                    setUser(null);
                    setIsLoading(false);
                }
            } catch (e) {
                setUser(null);
                setIsLoading(false);
            }
        };
        checkUser();

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [router]);

    const handleInitialAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        const nextPath = user ? `/dashboard?url=${encodeURIComponent(url)}` : `/login?next=${encodeURIComponent(`/dashboard?url=${url}`)}`;
        router.push(nextPath);
    };

    if (isLoading) return null;

    return (
        <div className="min-h-screen text-[#1A1A1A] font-sans selection:bg-[#FFBF78]/30">
            <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#1A1A1A]/5 h-16' : 'bg-transparent h-20'}`}>
                <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                        Check<span className="text-[#FF7D29]">Before</span>Commit
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#how-it-works" className="text-sm font-medium text-[#1A1A1A]/60 hover:text-[#FF7D29] transition-colors">How It Works</Link>
                        <Link href="#who-it-is-for" className="text-sm font-medium text-[#1A1A1A]/60 hover:text-[#FF7D29] transition-colors">Who It's For</Link>
                        <Link href="#pricing" className="text-sm font-medium text-[#1A1A1A]/60 hover:text-[#FF7D29] transition-colors">Pricing</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <Button
                            onClick={() => {
                                if (user) {
                                    router.push('/dashboard');
                                } else {
                                    router.push('/login');
                                }
                            }}
                            className="bg-[#FF7D29] hover:bg-[#FF7D29]/90 text-white px-6 h-11 text-sm font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </nav>

            <main>
                <Reveal>
                    <div ref={heroRef} className="px-6 pt-0 pb-24">
                        <CTASection>
                            <div className="w-full max-w-2xl mx-auto space-y-6">
                                <form onSubmit={handleInitialAnalyze} className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A1A]/40" />
                                        <Input
                                            placeholder="https://github.com/owner/repository"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="h-14 pl-12 bg-white border-[#1A1A1A]/10 focus:border-[#FF7D29] focus:ring-[#FF7D29]/20 text-md rounded-xl shadow-sm"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="h-14 px-8 bg-[#FF7D29] hover:bg-[#FF7D29]/90 text-white font-bold text-md rounded-xl shadow-md transition-all whitespace-nowrap"
                                    >
                                        Analyze for Free
                                    </Button>
                                </form>

                                <div className="flex items-center justify-center gap-6 pt-4">
                                    <button
                                        onClick={() => router.push('/analysis/facebook-react-compiler-featured')}
                                        className="text-sm font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity"
                                    >
                                        View Sample Analysis <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </CTASection>
                    </div>
                </Reveal>

                <Reveal>
                    {/* Social Proof / Trusted By */}
                    <section className="py-20 bg-white border-b border-[#1A1A1A]/5">
                        <div className="max-w-[1200px] mx-auto px-6">
                            <p className="text-center text-sm font-bold text-[#1A1A1A]/40 uppercase tracking-widest mb-10">
                                Trusted by developers at forward-thinking teams
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-50 grayscale contrast-125">
                                {['Vercel', 'Stripe', 'Supabase', 'Linear', 'Railway'].map((company) => (
                                    <span key={company} className="text-2xl font-bold tracking-tighter text-[#1A1A1A]">
                                        {company}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>
                </Reveal>

                <Reveal>
                    {/* Before vs After Section */}
                    <section className="py-[120px] bg-[#F9FAFB]">
                        <div className="max-w-[1200px] mx-auto px-6">
                            <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
                                    The Old Way vs. The CBC Way
                                </h2>
                                <p className="text-lg text-[#1A1A1A]/60">
                                    Stop wasting the most expensive hours of your day on mental architecture mapping.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* The Old Way */}
                                <div className="bg-white border border-[#1A1A1A]/5 rounded-[32px] p-10 space-y-8 shadow-sm">
                                    <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-xs">
                                        <X className="w-4 h-4" />
                                        The Old Way
                                    </div>
                                    <ul className="space-y-6">
                                        {[
                                            "Untangling cryptic folder hierarchies without context.",
                                            "Scanning stale READMEs that don't match the code.",
                                            "Tracing deep imports just to find the actual entry point.",
                                            "Building mental maps that vanish by the next morning.",
                                            "Guessing the impact of changes in high-risk modules."
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex gap-4 text-[#1A1A1A]/70 leading-relaxed font-medium">
                                                <span className="text-[#1A1A1A]/20 font-bold italic shrink-0">0{idx + 1}</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* The CBC Way */}
                                <div className="bg-[#1A1A1A] text-white rounded-[32px] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7D29] opacity-10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                                    <div className="flex items-center gap-3 text-[#FF7D29] font-bold uppercase tracking-widest text-xs relative z-10">
                                        <Check className="w-4 h-4" />
                                        The CBC Way
                                    </div>
                                    <ul className="space-y-6 relative z-10">
                                        {[
                                            "Instant architecture mapping with structural intent.",
                                            "Verified entry points and execution flow diagrams.",
                                            "High-fidelity risk signal on critical path modules.",
                                            "A persistent 15-minute onboarding roadmap.",
                                            "Collaborative shared library for your whole team."
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex gap-4 text-white/80 leading-relaxed font-medium">
                                                <span className="text-[#FF7D29] font-bold italic shrink-0">0{idx + 1}</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="pt-4 relative z-10">
                                        <div className="inline-flex items-center gap-2 text-sm font-bold text-[#FF7D29] group-hover:gap-3 transition-all duration-300">
                                            Start Analyzing Now <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </Reveal>

                <section className="py-[140px] bg-white border-b border-[#1A1A1A]/5">
                    <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-[55%_45%] gap-20 items-start">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">
                                    What You Get From Every Analysis
                                </h2>
                                <p className="text-lg text-[#1A1A1A]/60 max-w-md">
                                    A high-fidelity mental model of the codebase, generated in seconds.
                                </p>
                            </div>

                            <div className="space-y-0">
                                {[
                                    { icon: Map, title: "Architecture Overview", desc: "The core design patterns and high-level structural intent." },
                                    { icon: Compass, title: "Entry Points", desc: "Critical initialization paths and primary API surfaces." },
                                    { icon: Code2, title: "Code Structure Breakdown", desc: "Detailed mapping of how modules interact and where logic lives." },
                                    { icon: BarChart3, title: "Maintainability Signals", desc: "Technical debt assessment and module coupling analysis." },
                                    { icon: ShieldAlert, title: "Hidden Complexity & Risks", desc: "Early warning on fragile modules and integration hazards." },
                                    { icon: Search, title: "Suggested Learning Path", desc: "A step-by-step roadmap for code review and onboarding." },
                                ].map((item, i) => (
                                    <div key={i} className={`py-5 flex gap-5 ${i !== 0 ? 'border-t border-[#1A1A1A]/5' : ''}`}>
                                        <div className="mt-1 w-8 h-8 rounded-lg bg-[#FF7D29]/5 flex items-center justify-center shrink-0 border border-[#FF7D29]/10">
                                            <item.icon className="w-4 h-4 text-[#FF7D29]" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-[#1A1A1A] mb-1">{item.title}</h3>
                                            <p className="text-sm text-[#1A1A1A]/60">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative bg-[#F8F9FA] rounded-xl border border-[#1A1A1A]/10 p-8 min-h-[500px] flex flex-col gap-6">
                            <div className="absolute top-6 right-6 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                                <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Analysis Complete</span>
                            </div>

                            <div className="bg-white border border-[#1A1A1A]/5 rounded-lg p-5 shadow-sm space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 rounded-sm bg-[#FF7D29]/10 border border-[#FF7D29]/20 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-[#FF7D29] rounded-[1px]" />
                                    </div>
                                    <span className="text-xs font-bold text-[#1A1A1A]">Architecture Overview</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-[#1A1A1A]/5 rounded" />
                                    <div className="h-2 w-4/5 bg-[#1A1A1A]/5 rounded" />
                                    <div className="h-2 w-2/3 bg-[#1A1A1A]/5 rounded" />
                                </div>
                            </div>

                            <div className="bg-white border border-[#1A1A1A]/5 rounded-lg p-5 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 rounded-sm bg-[#FF7D29]/10 border border-[#FF7D29]/20 flex items-center justify-center">
                                        <ShieldAlert className="w-2.5 h-2.5 text-[#FF7D29]" />
                                    </div>
                                    <span className="text-xs font-bold text-[#1A1A1A]">Risk & Complexity Signals</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { color: "bg-[#EF4444]", text: "Fragile Module Found: /core/dispatcher.ts" },
                                        { color: "bg-[#F59E0B]", text: "High Coupling Detected in /services/auth" }
                                    ].map((risk, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${risk.color}`} />
                                            <div className="h-2 flex-1 bg-[#1A1A1A]/5 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-[#1A1A1A]/5 rounded-lg p-5 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 rounded-sm bg-[#FF7D29]/10 border border-[#FF7D29]/20 flex items-center justify-center">
                                        <Search className="w-2.5 h-2.5 text-[#FF7D29]" />
                                    </div>
                                    <span className="text-xs font-bold text-[#1A1A1A]">Suggested Entry Path</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {[1, 2, 3].map((step) => (
                                        <div key={step} className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center text-[10px] font-bold text-[#1A1A1A]/40">
                                                {step}
                                            </div>
                                            {step < 3 && <div className="w-4 h-[1px] bg-[#1A1A1A]/10" />}
                                        </div>
                                    ))}
                                    <div className="h-2 flex-1 bg-[#1A1A1A]/5 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Reveal>
                    <section id="how-it-works" className="bg-white py-[140px] border-b border-[#1A1A1A]/5">
                        <div className="max-w-[1200px] mx-auto px-6 space-y-20">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">How It Works</h2>
                                <p className="text-[#1A1A1A]/60 text-lg">From repository link to structured technical clarity.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    {
                                        step: "01",
                                        title: "Paste Repository Link",
                                        desc: "Provide a public GitHub URL. No tokens or special permissions required for public code."
                                    },
                                    {
                                        step: "02",
                                        title: "Automated Structural Analysis",
                                        desc: "Our engine scans folder structure, dependencies, and code patterns to understand architecture and complexity."
                                    },
                                    {
                                        step: "03",
                                        title: "Structured Technical Breakdown",
                                        desc: "Receive a focused report highlighting architecture, risk areas, maintainability signals, and entry points."
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="relative bg-gradient-to-br from-white to-[#FFF5ED] rounded-xl p-10 shadow-lg hover:shadow-xl transition-all duration-500 flex flex-col items-start gap-8 min-h-[320px] border border-[#FF782D]/10 group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF782D]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#FF782D]/10 transition-colors" />
                                        <div className="w-10 h-10 bg-[#FF782D] rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110">
                                            <span className="text-white font-bold text-lg">{item.step}</span>
                                        </div>
                                        <div className="space-y-4 text-[#1A1A1A] relative z-10">
                                            <h3 className="text-xl font-bold text-[#1A1A1A]">{item.title}</h3>
                                            <p className="text-[#1A1A1A]/70 leading-[1.7] text-md font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </Reveal>

                <Reveal>
                    <section id="who-it-is-for" className="py-[140px] bg-[#F9FAFB] border-b border-[#1A1A1A]/5">
                        <div className="max-w-[1200px] mx-auto px-6 space-y-20">
                            <div className="text-center space-y-4 max-w-3xl mx-auto">
                                <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Built for engineers who deal with unfamiliar code.</h2>
                                <p className="text-[#1A1A1A]/60 text-lg">Understand architecture, structure, and real complexity — before you commit time to a repository.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 items-stretch">
                                <div className="bg-white rounded-[24px] p-10 border border-[#1A1A1A]/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-6 group">
                                    <h3 className="text-xl font-bold text-[#1A1A1A]">Engineers Exploring Open Source</h3>
                                    <p className="text-[#1A1A1A]/70 leading-relaxed text-md">
                                        Before adopting a new dependency, quickly understand structure, entry points, and architectural signals — without manually reading the entire repo.
                                    </p>
                                    <div className="mt-auto pt-4 flex items-center gap-2 text-[#FF782D] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        Verify Architecture <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="relative bg-white rounded-[24px] p-10 border border-[#FF782D]/20 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col gap-6 ring-1 ring-[#FF782D]/5 -mt-4 md:-mt-8 mb-4 md:mb-8 z-10">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#FF782D] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md">
                                        Core Use Case
                                    </div>
                                    <h3 className="text-xl font-bold text-[#1A1A1A]">Developers Onboarding to Existing Codebases</h3>
                                    <p className="text-[#1A1A1A]/70 leading-relaxed text-md">
                                        When joining a new team or inheriting legacy code, identify core modules, patterns, and risk areas in minutes — not days.
                                    </p>
                                    <div className="mt-4 h-24 w-full bg-[#FF782D]/5 rounded-xl border border-[#FF782D]/10 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 flex flex-col gap-2 p-4">
                                            <div className="flex gap-2">
                                                <div className="h-2 w-12 bg-[#FF782D]/20 rounded" />
                                                <div className="h-2 w-20 bg-[#FF782D]/10 rounded" />
                                            </div>
                                            <div className="ml-4 h-2 w-16 bg-[#FF782D]/10 rounded" />
                                            <div className="ml-8 flex gap-2">
                                                <div className="h-2 w-8 bg-[#FF782D]/40 rounded" />
                                                <div className="h-2 w-12 bg-[#FF782D]/10 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-4 flex items-center gap-2 text-[#FF782D] font-bold text-sm">
                                        Speed up Onboarding <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-[24px] p-10 border border-[#1A1A1A]/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-6 group">
                                    <h3 className="text-xl font-bold text-[#1A1A1A]">Senior Engineers Reviewing Technical Fit</h3>
                                    <p className="text-[#1A1A1A]/70 leading-relaxed text-md">
                                        Before approving integrations or refactors, get a high-level architectural understanding without digging through every file.
                                    </p>
                                    <div className="mt-auto pt-4 flex items-center gap-2 text-[#FF782D] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        Audit Systems <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </Reveal>

                <Reveal>
                    {/* Codebase of the Week */}
                    <section className="py-24 bg-white">
                        <div className="max-w-[1200px] mx-auto px-6">
                            <div className="bg-[#F9FAFB] border border-[#1A1A1A]/5 rounded-[48px] p-8 md:p-16 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <div className="bg-[#FF7D29]/10 text-[#FF7D29] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#FF7D29]/20">
                                        Featured This Week
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A]">
                                                facebook/react-compiler
                                            </h2>
                                            <p className="text-lg text-[#1A1A1A]/60 leading-relaxed">
                                                We analyzed the new React Compiler. See how the architecture handles complex memoization and structural transformations.
                                            </p>
                                        </div>
                                        <Button 
                                            asChild
                                            className="h-12 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white px-8 rounded-xl font-bold"
                                        >
                                            <Link href="/analysis/facebook-react-compiler-featured">View Detailed Analysis</Link>
                                        </Button>
                                    </div>
                                    <div className="relative">
                                        <div className="bg-white rounded-3xl border border-[#1A1A1A]/10 shadow-2xl p-6 transform rotate-2">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-bold text-[#1A1A1A]">Maturity Index</div>
                                                    <div className="text-sm font-bold text-[#FF782D]">Production-Grade</div>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary w-[95%]" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-4">
                                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                                        <div className="text-xs font-bold text-[#1A1A1A]/40 uppercase mb-1">Risk Level</div>
                                                        <div className="text-lg font-bold text-green-500">Low</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                                        <div className="text-xs font-bold text-[#1A1A1A]/40 uppercase mb-1">Maintainability</div>
                                                        <div className="text-lg font-bold text-[#1A1A1A]">9.2/10</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </Reveal>

                <Reveal>
                    <section id="pricing" className="bg-[#F9FAFB] py-[140px] border-t border-[#1A1A1A]/5">
                        <div className="max-w-[1200px] mx-auto px-6 space-y-16">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Simple, transparent pricing.</h2>
                                <p className="text-[#1A1A1A]/60 text-lg font-medium">Cheaper than one hour of engineering time.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
                                    <div className="bg-white border border-[#1A1A1A]/5 rounded-[32px] p-10 shadow-sm flex h-full flex-col justify-between gap-8 transition-all hover:shadow-md">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-[#1A1A1A]">Free</h3>
                                            <p className="text-sm font-medium text-[#1A1A1A]/50">For exploring and testing</p>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-bold text-[#1A1A1A]">$0</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]/40">/ forever</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <p className="text-sm font-bold text-[#1A1A1A]/40 uppercase tracking-widest">Includes:</p>
                                        <ul className="space-y-4">
                                            {[
                                                { included: true, text: "4 deep repo analyses (lifetime)" },
                                                { included: true, text: "Architecture mapping & entry points" },
                                                { included: true, text: "Basic structural overview" },
                                                { included: false, text: "Analysis history" },
                                                { included: false, text: "Large repository support" },
                                                { included: false, text: "Priority processing" },
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                                    {feature.included ? (
                                                        <Check className="w-4 h-4 text-[#FF782D]" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-[#1A1A1A]/20" />
                                                    )}
                                                    <span className={feature.included ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40"}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={() => router.push('/login')}
                                        className="w-full h-14 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white font-bold rounded-2xl transition-all"
                                    >
                                        Start Free
                                    </Button>
                                </div>

                                <div className="bg-white border border-[#1A1A1A]/5 rounded-[32px] p-10 shadow-sm flex h-full flex-col justify-between gap-8 transition-all hover:shadow-md">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold text-[#1A1A1A]">Pro</h3>
                                            <p className="text-sm font-medium text-[#1A1A1A]/50">For engineers evaluating code daily</p>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-bold text-[#1A1A1A]">$10</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]/40">/ month</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <p className="text-sm font-bold text-[#FF782D] uppercase tracking-widest">All Free features, plus:</p>
                                        <ul className="space-y-4">
                                            {[
                                                { included: true, text: "Unlimited analyses (fair use)" },
                                                { included: true, text: "Large repository support" },
                                                { included: true, text: "Detailed architecture breakdown" },
                                                { included: true, text: "Risk & complexity signals" },
                                                { included: true, text: "Analysis history" },
                                                { included: true, text: "Priority processing" },
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                                    <Check className="w-4 h-4 text-[#FF782D]" />
                                                    <span className="text-[#1A1A1A]">{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={() => router.push('/login')}
                                        className="w-full h-14 bg-[#FF782D] hover:bg-[#FF782D]/90 text-white font-bold rounded-2xl shadow-lg transition-all"
                                    >
                                        Upgrade to Pro Plan
                                    </Button>
                                </div>

                                <div className="relative bg-white border-2 border-[#FF782D]/20 rounded-[32px] p-10 shadow-xl flex h-full flex-col justify-between gap-8 transition-all hover:shadow-2xl ring-1 ring-[#FF782D]/5 z-10">
                                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#FF782D] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        Recommended
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-[#1A1A1A]">Pro Yearly</h3>
                                                <p className="text-sm font-medium text-[#1A1A1A]/50">For serious developers and teams</p>
                                            </div>
                                            <Badge className="bg-[#FF782D]/10 text-[#FF782D] border-none font-bold text-[10px] px-3 py-1 rounded-full whitespace-nowrap">
                                                Save 34%
                                            </Badge>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-bold text-[#1A1A1A]">$79</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]/40">/ year</span>
                                        </div>
                                        <p className="text-xs text-[#1A1A1A]/60">Save 34% compared to monthly</p>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <p className="text-sm font-bold text-[#FF782D] uppercase tracking-widest">Includes everything in Pro, plus:</p>
                                        <ul className="space-y-4">
                                            {[
                                                { included: true, text: "Unlimited analyses" },
                                                { included: true, text: "Priority processing" },
                                                { included: true, text: "Early access to new analysis features" },
                                                { included: true, text: "Advanced repository insights" },
                                                { included: true, text: "Historical trend tracking" },
                                                { included: true, text: "Priority support" },
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                                    <Check className="w-4 h-4 text-[#FF782D]" />
                                                    <span className="text-[#1A1A1A]">{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={() => router.push('/login')}
                                        className="w-full h-14 bg-[#FF782D] hover:bg-[#FF782D]/90 text-white font-bold rounded-2xl shadow-lg transition-all"
                                    >
                                        Upgrade to Pro Yearly Plan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </Reveal>

                <section className="py-[140px] px-6">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="relative bg-gradient-to-br from-[#FF782D] to-[#F04B3E] rounded-[48px] p-12 md:p-24 text-center space-y-10 shadow-2xl overflow-hidden group">
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />

                            <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                                <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white">
                                    Stop guessing. Start knowing.
                                </h2>
                                <p className="text-lg md:text-xl text-white/80 font-medium">
                                    Get a structured technical breakdown of any GitHub repository in minutes.
                                </p>
                            </div>

                            <div className="relative z-10 pt-4">
                                <Button
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="h-16 px-12 bg-white hover:bg-white/95 text-[#111] font-bold text-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0.5"
                                >
                                    Analyze Your First Repository
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-200 bg-white py-16 px-6">
                <div className="max-w-[1100px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-4">
                            <Link href="/" className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                                Check<span className="text-[#FF7D29]">Before</span>Commit
                            </Link>
                            <p className="text-[#1A1A1A]/60 text-sm leading-relaxed max-w-xs">
                                Structured technical insights for engineers working with unfamiliar codebases.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-[#1A1A1A]">Product</h4>
                            <ul className="space-y-3 text-sm text-[#1A1A1A]/60">
                                <li><Link href="#how-it-works" className="hover:text-[#FF7D29] transition-colors">How It Works</Link></li>
                                <li><Link href="#pricing" className="hover:text-[#FF7D29] transition-colors">Pricing</Link></li>
                                <li><Link href="/dashboard" className="hover:text-[#FF7D29] transition-colors">Dashboard</Link></li>
                                <li><Link href="/login" className="hover:text-[#FF7D29] transition-colors">Login</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-[#1A1A1A]">Connect</h4>
                            <ul className="space-y-3 text-sm text-[#1A1A1A]/60">
                                <li><Link href="mailto:teamintrasphere@gmail.com" className="hover:text-[#FF7D29] transition-colors">Contact</Link></li>
                                <li><Link href="https://github.com" target="_blank" className="hover:text-[#FF7D29] transition-colors">GitHub</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-[#1A1A1A]">Legal</h4>
                            <ul className="space-y-3 text-sm text-[#1A1A1A]/60">
                                <li><Link href="/privacy" className="hover:text-[#FF7D29] transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-[#FF7D29] transition-colors">Terms of Service</Link></li>
                                <li><Link href="/cookies" className="hover:text-[#FF7D29] transition-colors">Cookie Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-[#1A1A1A]/40">
                        <div>
                            &copy; 2026 Check<span className="text-[#FF7D29]">Before</span>Commit. All rights reserved.
                        </div>
                        <div className="text-right">
                            Built for engineers who value architectural clarity.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
