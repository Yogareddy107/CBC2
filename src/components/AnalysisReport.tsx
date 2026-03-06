'use client';

import { AnalysisResult } from '@/lib/llm/client';
import {
    Activity, ShieldCheck, Zap, Server, Layout, GitBranch,
    Play, AlertTriangle, CheckCircle2, XCircle,
    TrendingUp, Box, Lock, Users,
    Thermometer, Component, Globe, Construction, BookOpen,
    Network, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// --- Helper Components ---

function SectionHeader({ title, icon: Icon, className }: { title: string, icon?: React.ElementType, className?: string }) {
    return (
        <div className={cn("flex items-center gap-3 mb-6", className)}>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {Icon && <Icon className="w-5 h-5" />}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        </div>
    );
}

function Card({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" | "danger" | "success" | "warning" }) {
    const variants = {
        default: "bg-card border-border shadow-sm",
        outline: "bg-transparent border-dashed border-border/60 hover:border-border",
        danger: "bg-red-500/5 border-red-500/20",
        success: "bg-green-500/5 border-green-500/20",
        warning: "bg-amber-500/5 border-amber-500/20",
    };

    return (
        <div className={cn("rounded-xl border p-5 transition-all relative overflow-hidden", variants[variant], className)}>
            {children}
        </div>
    );
}

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 8 ? "bg-green-500 text-white" : score >= 5 ? "bg-amber-500 text-white" : "bg-red-500 text-white";
    return (
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold font-mono shadow-md", color)}>
            {score}
        </div>
    );
}

function TrafficLight({ level }: { level: string }) {
    let color = "bg-gray-200";
    // Bad levels
    if (["Low", "Weak", "Experimental", "Poor", "Low Activity", "Stagnant", "Deprecated"].includes(level)) color = "bg-red-500";
    // Medium levels
    if (["Moderate", "Medium", "Early-stage", "Average", "Low Activity"].includes(level)) color = "bg-amber-500";
    // Good levels
    if (["High", "Strong", "Stable", "Production-Hardened", "Excellent", "Actively Maintained", "Production-Grade", "Growing"].includes(level)) color = "bg-green-500";

    // Invert logic for Risks/Complexity (Low is Good)
    if (["Low", "Small"].includes(level)) color = "bg-green-500";
    if (["High", "Massive"].includes(level)) color = "bg-red-500";

    return <div className={cn("w-3 h-3 rounded-full", color)} title={level} />;
}

function ContextTooltip({ text }: { text: string }) {
    if (!text) return null;
    return (
        <div className="absolute inset-0 bg-popover/95 backdrop-blur-sm p-4 flex flex-col justify-center items-center text-center opacity-0 hover:opacity-100 transition-opacity z-10 cursor-help">
            <p className="text-sm font-medium text-popover-foreground">{text}</p>
        </div>
    );
}


// --- Sections ---

function ReportHeader({ data, repoUrl }: { data: AnalysisResult, repoUrl: string }) {
    const { repoSnapshot } = data;

    // Parse owner/repo from URL
    let owner = "Unknown";
    let repoName = "Repository";
    try {
        const url = new URL(repoUrl);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
            owner = parts[0];
            repoName = parts[1];
        }
    } catch {
        if (repoUrl.includes('/')) {
            const parts = repoUrl.split('/');
            if (parts.length >= 2) {
                owner = parts[parts.length - 2];
                repoName = parts[parts.length - 1];
            }
        }
    }

    return (
        <div className="mb-12 relative overflow-hidden rounded-2xl bg-[#F4F4F5] border-l-4 border-primary p-8 shadow-sm">
            <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                    <span className="font-bold text-foreground">{owner}/{repoName}</span>
                    <span>•</span>
                    <span>{repoSnapshot.primaryStack}</span>
                </div>

                <p className="text-lg leading-relaxed text-foreground/80 max-w-3xl font-medium">
                    {repoSnapshot.description}
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                    <Badge variant="outline" className="bg-white/50">{repoSnapshot.architectureType} Arch</Badge>
                    <Badge variant="outline" className="bg-white/50">{repoSnapshot.codebaseSize} Size</Badge>
                    <Badge className={cn(
                        "border-none",
                        repoSnapshot.activitySignal?.includes("Active") ? "bg-green-500/10 text-green-700" : "bg-amber-500/10 text-amber-700"
                    )}>
                        {repoSnapshot.activitySignal}
                    </Badge>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </div>
    );
}

function MaturityScale({ stage }: { stage: string }) {
    const stages = ['Prototype', 'Structured Early-Stage', 'Growing', 'Production-Grade'];
    const currentIndex = stages.indexOf(stage);

    return (
        <div className="mb-8 p-8 bg-secondary/10 rounded-xl border border-border/50 overflow-hidden">
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-8 tracking-wider">Engineering Maturity Index</h3>
            <div className="relative mx-4">
                {/* Connecting Line */}
                <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-border -z-0" />
                <div className="absolute top-2.5 left-0 h-0.5 bg-primary -z-0 transition-all duration-1000"
                    style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }} />

                <div className="flex justify-between relative z-10">
                    {stages.map((s, i) => {
                        const active = i <= currentIndex;
                        const current = i === currentIndex;
                        return (
                            <div key={i} className="relative flex flex-col items-center group">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-4 transition-all duration-500 z-10 box-content bg-background",
                                    active ? "border-primary" : "border-muted-foreground",
                                    current && "ring-4 ring-primary/20 scale-110"
                                )} />
                                <span className={cn(
                                    "absolute top-8 text-[10px] sm:text-xs font-bold uppercase w-32 text-center transition-opacity duration-300",
                                    active ? "text-foreground" : "text-muted-foreground",
                                    current ? "text-primary scale-105" : "",
                                    i === 0 ? "left-0 text-left origin-left" :
                                        i === stages.length - 1 ? "right-0 text-right origin-right" :
                                            "left-1/2 -translate-x-1/2"
                                )}>
                                    {s}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
            {/* Spacer for labels */}
            <div className="h-6" />
        </div>
    );
}

function ExecutiveVerdict({ data }: { data: AnalysisResult['executiveVerdict'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="Executive Technical Verdict" icon={Activity} />

            <MaturityScale stage={data.maturityStage} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="col-span-1 md:col-span-2 flex items-center justify-between bg-primary/5 border-primary/20 group">
                    <ContextTooltip text={data.maintenanceContext} />
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">Maintainability Score</h3>
                        <p className="text-xs text-muted-foreground">1-10 Rating • Hover for Context</p>
                    </div>
                    <ScoreBadge score={data.maintainabilityScore} />
                </Card>

                <Card className="flex flex-col justify-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Modularity</span>
                    <div className="flex items-center gap-2">
                        <TrafficLight level={data.modularityStrength} />
                        <span className="font-semibold">{data.modularityStrength}</span>
                    </div>
                </Card>

                <Card className="flex flex-col justify-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Production Ready</span>
                    <div className="flex items-center gap-2">
                        <TrafficLight level={data.productionReadiness} />
                        <span className="font-semibold text-sm">{data.productionReadiness}</span>
                    </div>
                </Card>

                <div className="md:col-span-4 grid md:grid-cols-3 gap-6">
                    <Card className="flex items-center gap-4 group">
                        <ContextTooltip text={data.couplingContext} />
                        <div className="p-2 bg-secondary rounded-lg"><GitBranch className="w-5 h-5 text-muted-foreground" /></div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Coupling Risk</p>
                            <p className="font-semibold">{data.couplingRisk}</p>
                        </div>
                    </Card>
                    <Card className="flex items-center gap-4 group">
                        <ContextTooltip text={data.refactorContext} />
                        <div className="p-2 bg-secondary rounded-lg"><Construction className="w-5 h-5 text-muted-foreground" /></div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">Refactor Safety</p>
                            <p className="font-semibold">{data.refactorSafety}</p>
                        </div>
                    </Card>
                    <Card className={cn(
                        "flex items-center gap-4 border-l-4",
                        data.adoptionRecommendation?.includes("Safe") ? "border-l-green-500 bg-green-50" : "border-l-amber-500 bg-amber-50"
                    )}>
                        <div>
                            <p className="text-xs text-foreground/60 uppercase font-bold">Recommendation</p>
                            <p className="font-bold text-foreground">{data.adoptionRecommendation}</p>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}

function ArchitecturalHealth({ data }: { data: AnalysisResult['architecturalHealth'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="Architectural Health Analysis" icon={Component} />
            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2"><Layout className="w-4 h-4" /> Architecture Identity</h4>
                <p className="text-lg font-medium text-foreground">{data.architectureIdentity}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-blue-500" /> Structure Pattern
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{data.pattern}</p>
                </Card>
                <Card>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-500" /> Boundary Strength
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{data.boundaryStrength}</p>
                </Card>
                <Card>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Box className="w-4 h-4 text-purple-500" /> Cohesion
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{data.cohesion}</p>
                </Card>
                <Card>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-orange-500" /> Consistency
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{data.consistency}</p>
                </Card>
            </div>
        </section>
    );
}

function DependencyAnalysis({ data }: { data: AnalysisResult['dependencyAnalysis'] }) {
    if (!data) return null; // Handle backward compatibility
    return (
        <section className="mb-16">
            <SectionHeader title="Dependency Gravity & Flow" icon={Network} />
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-purple-500">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-purple-700">
                        <Box className="w-4 h-4" /> Central Gravity Nodes
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">Imporant files that everyone depends on.</p>
                    <ul className="space-y-2">
                        {data.centralNodes?.map((node, i) => (
                            <li key={i} className="text-sm font-mono bg-secondary/30 px-2 py-1 rounded break-all border border-border/50">{node}</li>
                        ))}
                    </ul>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-700">
                        <ArrowRight className="w-4 h-4" /> Top Consumers
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2">Each circle represents a file. The size shows complexity, lines show how they&apos;re coupled.</p>
                    <ul className="space-y-2">
                        {data.topConsumers?.map((node, i) => (
                            <li key={i} className="text-sm font-mono bg-secondary/30 px-2 py-1 rounded break-all border border-border/50">{node}</li>
                        ))}
                    </ul>
                </Card>
            </div>
        </section>
    );
}


function BlastRadius({ data }: { data: AnalysisResult['blastRadius'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="Change Blast Radius" icon={AlertTriangle} />
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card variant="danger">
                    <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> High Impact Areas
                    </h4>
                    <ul className="space-y-2">
                        {data.highBlastRadiusAreas?.map((area, i) => (
                            <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                <span className="text-red-500 mt-1 flex-shrink-0 leading-none">•</span>
                                <span className="flex-1">{area}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card variant="success">
                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Safe Zones
                    </h4>
                    <ul className="space-y-2">
                        {data.safeZones?.map((area, i) => (
                            <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                <span className="text-green-500 mt-1 flex-shrink-0 leading-none">•</span>
                                <span className="flex-1">{area}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
            <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                <p className="text-sm text-center italic text-muted-foreground">
                    <span className="font-bold not-italic text-foreground">Refactor Confidence:</span> {data.refactorConfidence}
                </p>
            </div>
        </section>
    );
}

function Maintainability({ data }: { data: AnalysisResult['maintainability'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="Maintainability & Debt Sensors" icon={Thermometer} />
            <div className="grid gap-4">
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-secondary/10">
                        <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Abstraction</p>
                        <p className="text-sm font-medium">{data.abstractionQuality}</p>
                    </Card>
                    <Card className="bg-secondary/10">
                        <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Dependencies</p>
                        <p className="text-sm font-medium">{data.dependencySprawl}</p>
                    </Card>
                    <Card className="bg-secondary/10">
                        <p className="text-xs uppercase text-muted-foreground font-bold mb-1">Centralization</p>
                        <p className="text-sm font-medium">{data.centralization}</p>
                    </Card>
                </div>

                <div className="mt-2">
                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide mb-3">Debt Indicators</h4>
                    <div className="space-y-2">
                        {data.technicalDebtIndicators?.map((debt, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                <Zap className="w-3 h-3 text-orange-400 mt-1 flex-shrink-0" />
                                <span className="flex-1">{debt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ExecutionFlow({ data }: { data: AnalysisResult['executionFlow'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="Execution Flow & Boundaries" icon={Play} />
            <div className="relative border-l-2 border-border/60 ml-3 pl-8 space-y-8 py-2">
                <div className="relative">
                    <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-background">1</span>
                    <h4 className="font-bold text-sm text-foreground mb-1">Entry Point</h4>
                    <code className="text-xs bg-secondary px-2 py-1 rounded block w-fit mb-2">{data.entryPoint}</code>
                </div>

                <div className="relative">
                    <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-secondary text-muted-foreground border flex items-center justify-center text-xs font-bold ring-4 ring-background">2</span>
                    <h4 className="font-bold text-sm text-foreground mb-1">Core Flow</h4>
                    <p className="text-sm text-muted-foreground">{data.corePath}</p>
                </div>

                <div className="relative">
                    <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-secondary text-muted-foreground border flex items-center justify-center text-xs font-bold ring-4 ring-background">3</span>
                    <h4 className="font-bold text-sm text-foreground mb-1">State Mutation</h4>
                    <p className="text-sm text-muted-foreground">{data.stateMutationPattern}</p>
                </div>

                <div className="relative">
                    <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-background">4</span>
                    <h4 className="font-bold text-sm text-foreground mb-1">API Boundary</h4>
                    <p className="text-sm text-muted-foreground">{data.apiBoundary}</p>
                </div>

                <div className="relative">
                    <span className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-background">!</span>
                    <h4 className="font-bold text-sm text-foreground mb-1">Side Effects</h4>
                    <p className="text-sm text-muted-foreground">{data.sideEffectZones}</p>
                </div>
            </div>
        </section>
    );
}

function TestingProfile({ data }: { data: AnalysisResult['testingProfile'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="Test & Safety Profile" icon={Lock} />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <span className="text-xs font-bold uppercase text-muted-foreground">Unit Coverage</span>
                        <div className="mt-1 h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: data.unitCoverage?.includes('0%') ? '5%' : '50%' }} />
                        </div>
                        <p className="text-xs text-left mt-1 font-mono text-muted-foreground">{data.unitCoverage}</p>
                    </div>

                    <div className="flex items-start gap-4 py-2 border-b border-border/50">
                        <span className="text-sm font-medium w-40">Integration Depth</span>
                        <span className="text-sm text-muted-foreground flex-1">{data.integrationDepth}</span>
                    </div>
                    <div className="flex items-start gap-4 py-2 border-b border-border/50">
                        <span className="text-sm font-medium w-40">E2E Presence</span>
                        <span className="text-sm text-muted-foreground flex-1">{data.e2ePresence}</span>
                    </div>
                </div>

                <Card className="bg-secondary/5 flex flex-col justify-center text-center">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Safety Rating</p>
                    <div className="flex items-center justify-center gap-2">
                        <TrafficLight level={data.refactorSafetyRating === 'High' ? 'Strong' : data.refactorSafetyRating === 'Moderate' ? 'Medium' : 'Weak'} />
                        <span className="font-bold text-lg">{data.refactorSafetyRating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 px-4 italic">&quot;{data.mockingStrategy}&quot;</p>
                </Card>
            </div>
        </section>
    );
}

function Scalability({ data }: { data: AnalysisResult['scalability'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="Operational & Scalability" icon={Server} />
            <div className="grid grid-cols-2 gap-4">
                <Card variant="outline">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Deployment</p>
                    <p className="text-sm font-medium">{data.deploymentMaturity}</p>
                </Card>
                <Card variant="outline">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Config Hygiene</p>
                    <p className="text-sm font-medium">{data.configHygiene}</p>
                </Card>
                <Card variant="outline">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Bottlenecks</p>
                    <p className="text-sm font-medium text-amber-600">{data.scalingBottlenecks}</p>
                </Card>
                <Card variant="outline">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Caching</p>
                    <p className="text-sm font-medium">{data.caching}</p>
                </Card>
            </div>
        </section>
    );
}

function Onboarding({ data }: { data: AnalysisResult['onboarding'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="🚀 15-Minute Onboarding Path" icon={Users} />

            {/* Core Domain Summary - Prominent Header */}
            <Card variant="success" className="mb-6 border-l-4 border-l-green-500">
                <div className="flex items-start gap-3">
                    <div className="text-green-600 mt-1">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-green-600 mb-2">🧠 Core Domain Summary</h4>
                        <p className="text-sm text-foreground/90 leading-relaxed">{data.coreDomainSummary}</p>
                    </div>
                </div>
            </Card>

            {/* START HERE + THEN READ - Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* START HERE */}
                <Card className="border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                        <Play className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-bold text-blue-600">🎯 START HERE</h4>
                    </div>
                    <ul className="space-y-2">
                        {data.startHere?.map((file, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <ArrowRight className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-foreground/80 code bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded flex-1">
                                    {file}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* THEN READ */}
                <Card className="border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm font-bold text-purple-600">📖 THEN READ</h4>
                    </div>
                    <ul className="space-y-2">
                        {data.thenRead?.map((file, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <ArrowRight className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-foreground/80 code bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded flex-1">
                                    {file}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* DATA FLOW */}
            <Card className="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-l-4 border-l-cyan-500">
                <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-cyan-600" />
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-cyan-600 mb-2">⚡ DATA FLOW</h4>
                        <p className="text-sm font-mono text-foreground/90 leading-relaxed">{data.dataFlowSummary}</p>
                    </div>
                </div>
            </Card>

            {/* HIGH-RISK FILES */}
            <Card variant="danger" className="mb-6 border-l-4 border-l-red-500">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <h4 className="text-sm font-bold text-red-600">⚠️ HIGH-RISK FILES (Avoid Initially)</h4>
                </div>
                <ul className="space-y-2">
                    {data.highRiskFiles?.map((file, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                            <span className="text-sm text-foreground/80 code bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded flex-1 leading-relaxed">
                                {file}
                            </span>
                        </li>
                    ))}
                </ul>
            </Card>

            {/* FIRST DAY ADVICE */}
            <Card variant="warning" className="mb-6 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-3">
                    <Construction className="w-5 h-5 text-amber-600" />
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-amber-600 mb-2">💡 If You&apos;re Joining This Project</h4>
                        <p className="text-sm text-foreground/90 leading-relaxed">{data.firstDayAdvice}</p>
                    </div>
                </div>
            </Card>

            {/* Original Friction Metrics */}
            <div className="pt-6 border-t border-border">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4">Onboarding Friction Index</h4>
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="text-center">
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Complexity</p>
                        <p className="font-bold text-lg">{data.setupComplexity}</p>
                    </Card>
                    <Card className="text-center">
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Docs</p>
                        <p className="font-bold text-lg">{data.documentationClarity}</p>
                    </Card>
                    <Card className="text-center">
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Ramp Up</p>
                        <p className="font-bold text-lg">{data.estimatedOnboardingTime}</p>
                    </Card>
                </div>
            </div>
        </section>
    );
}

function Improvements({ data }: { data: AnalysisResult['improvements'] }) {
    return (
        <section className="mb-16">
            <SectionHeader title="Strategic Improvement Priorities" icon={TrendingUp} />
            <div className="space-y-4">
                {data?.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                        <div className={cn("px-2 py-1 rounded text-xs font-bold uppercase flex-shrink-0",
                            item.priority === 'High' ? "bg-red-100 text-red-700" :
                                item.priority === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        )}>
                            {item.priority}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-foreground text-sm mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function FinalRecommendation({ data }: { data: AnalysisResult['finalRecommendation'] }) {
    return (
        <div className="p-8 rounded-2xl bg-foreground text-background shadow-xl">
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Good For</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.goodFor?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="bg-white/10 text-white border-none hover:bg-white/20">{tag}</Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Risky For</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.riskyFor?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="bg-white/10 text-white border-none hover:bg-white/20">{tag}</Badge>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Recommended Approach</h3>
                <p className="text-xl font-bold leading-relaxed text-white">{data.recommendedApproach}</p>
            </div>
        </div>
    );
}

// --- Main Layout ---

export function AnalysisReport({ data, repoUrl }: { data: AnalysisResult, repoUrl: string }) {
    if (!data) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto pb-32 font-sans selection:bg-primary/20">
            <ReportHeader data={data} repoUrl={repoUrl} />
            <ExecutiveVerdict data={data.executiveVerdict} />

            {/* 🚀 15-Minute Onboarding Path - Positioned prominently after verdict */}
            <Onboarding data={data.onboarding} />

            <div className="grid gap-2">
                <ArchitecturalHealth data={data.architecturalHealth} />
                <DependencyAnalysis data={data.dependencyAnalysis} />
                <BlastRadius data={data.blastRadius} />
                <Maintainability data={data.maintainability} />
                <div className="grid md:grid-cols-2 gap-12">
                    <ExecutionFlow data={data.executionFlow} />
                    <TestingProfile data={data.testingProfile} />
                </div>
                <Scalability data={data.scalability} />
                <Improvements data={data.improvements} />
                <FinalRecommendation data={data.finalRecommendation} />
            </div>
        </div>
    );
}
