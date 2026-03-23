'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Folder,
    FileText,
} from 'lucide-react';
import Link from 'next/link';
import { CTASection } from '@/components/ui/hero-dithering-card';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/Reveal';
import dynamic from 'next/dynamic';

// Dynamic imports for below-the-fold sections to improve LCP and initial bundle size
const SocialProofSection = dynamic(() => import('@/components/landing/SocialProofSection').then(mod => mod.SocialProofSection));
const DeepIntelligenceSection = dynamic(() => import('@/components/landing/DeepIntelligenceSection').then(mod => mod.DeepIntelligenceSection));
const ProblemSection = dynamic(() => import('@/components/landing/ProblemSection').then(mod => mod.ProblemSection));
const EnterpriseIntelligenceSection = dynamic(() => import('@/components/landing/EnterpriseIntelligenceSection').then(mod => mod.EnterpriseIntelligenceSection));
const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection').then(mod => mod.HowItWorksSection));
const WhoItIsForSection = dynamic(() => import('@/components/landing/WhoItIsForSection').then(mod => mod.WhoItIsForSection));
const PricingSection = dynamic(() => import('@/components/landing/PricingSection').then(mod => mod.PricingSection));
const CTASectionBottom = dynamic(() => import('@/components/landing/CTASectionBottom').then(mod => mod.CTASectionBottom));
const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => mod.Footer));

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
                        <Link href="#who-it-is-for" className="text-sm font-medium text-[#1A1A1A]/60 hover:text-[#FF7D29] transition-colors">Who It&apos;s For</Link>
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
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A1A]/40" />
                                        <Input
                                            placeholder="Enter Repository URL (GitHub, GitLab...)"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="h-14 pl-12 bg-white border-[#1A1A1A]/10 focus:border-[#FF7D29] focus:ring-[#FF7D29]/20 text-md rounded-xl shadow-sm"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="h-14 px-8 bg-[#FF7D29] hover:bg-[#FF7D29]/90 text-white font-bold text-md rounded-xl shadow-md transition-all whitespace-nowrap"
                                    >
                                        Predict Impact
                                    </Button>
                                </form>
                                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 pt-6 text-[#1A1A1A]/40">
                                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-[#FF7D29] transition-colors cursor-pointer">
                                        <Folder className="w-3.5 h-3.5" /> Or Upload Folder
                                    </div>
                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-[#1A1A1A]/10" />
                                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-[#FF7D29] transition-colors cursor-pointer">
                                        <FileText className="w-3.5 h-3.5" /> Analyze ZIP
                                    </div>
                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-[#1A1A1A]/10" />
                                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-[#FF7D29] transition-colors cursor-pointer">
                                        <Badge className="bg-[#FF7D29]/10 text-[#FF7D29] border-none text-[8px] px-1.5 py-0">New</Badge> Account-Free Mode
                                    </div>
                                </div>

                            </div>
                        </CTASection>
                    </div>
                </Reveal>

                <Reveal>
                    <SocialProofSection />
                </Reveal>

                <DeepIntelligenceSection />

                <Reveal>
                    <ProblemSection />
                </Reveal>

                <Reveal>
                    <EnterpriseIntelligenceSection />
                </Reveal>

                <Reveal>
                    <HowItWorksSection />
                </Reveal>

                <Reveal>
                    <WhoItIsForSection />
                </Reveal>

                <Reveal>
                    <PricingSection onLoginClick={() => router.push('/login')} />
                </Reveal>

                <CTASectionBottom onAnalyzeClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            </main>

            <Footer />
        </div>
    );
}
