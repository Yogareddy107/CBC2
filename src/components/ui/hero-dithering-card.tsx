'use client';

import { ArrowRight, ShieldCheck } from "lucide-react"
import { useState, Suspense, lazy } from "react"

const Dithering = lazy(() =>
    import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
)

export function CTASection({ children }: { children?: React.ReactNode }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <section className="w-full flex justify-center items-center px-4 md:px-6">
            <div
                className="w-full max-w-[1200px] relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative overflow-hidden rounded-[48px] border border-[#1A1A1A]/5 bg-white shadow-sm pt-8 md:pt-12 pb-20 md:pb-24 px-6 md:px-[60px] flex flex-col items-center justify-center duration-500">
                    <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-25 mix-blend-multiply">
                            <Dithering
                                colorBack="#00000000" // Transparent
                                colorFront="#FF7D29"  // Using CheckBeforeCommit primary orange
                                shape="warp"
                                type="4x4"
                                speed={isHovered ? 0.6 : 0.2}
                                className="size-full"
                                minPixelRatio={1}
                            />
                        </div>
                    </Suspense>

                    <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center">

                        <div className="mt-6 mb-8 inline-flex flex-col items-center gap-4">
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-4 py-1.5 text-sm font-medium text-emerald-600 backdrop-blur-sm">
                                    <ShieldCheck className="w-4 h-4" />
                                    Secure & Private Analysis
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/40 mt-2">
                                Trusted by private repos • No data storage • Verified security
                            </p>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1A1A1A] mb-8 leading-[1.15] text-balance drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]">
                            Understand any <span className="bg-gradient-to-r from-[#E65A00] to-[#FF8C38] bg-clip-text text-transparent italic">codebase</span> in minutes.
                        </h1>

                        {/* Description */}
                        <p className="text-[#1A1A1A]/50 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-medium">
                            Stop digging through code manually. See the system architecture, problem areas, and integration risks instantly.
                        </p>

                        {children}
                    </div>
                </div>
            </div>
        </section>
    )
}
