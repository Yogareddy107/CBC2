import React from 'react';
import Link from 'next/link';

export const Footer = () => {
    return (
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
    );
};
