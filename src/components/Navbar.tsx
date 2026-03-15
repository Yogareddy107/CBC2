'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Github, LogOut, Layout, Activity, GitPullRequest, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/auth/actions';
import { usePathname, useRouter } from 'next/navigation';
import { LogoutConfirmModal } from '@/components/ui/LogoutConfirmModal';

interface User {
    id: string;
    email?: string;
}

interface NavbarProps {
    user: User | null;
    freeTries?: number;
}

export function Navbar({ user, freeTries }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const [isMounted, setIsMounted] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
        } finally {
            setIsLoggingOut(false);
            setIsLogoutModalOpen(false);
        }
    };

    // Prevent hydration mismatch by rendering a stable skeleton or nothing until mounted.
    // Auth-dependent UI elements (like user email or freeTries) shouldn't be rendered during SSR.
    if (!isMounted) {
        return (
            <nav className="border-b border-border/40 p-4 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                    <span className="hidden sm:inline">Check<span className="text-[#FF7D29]">Before</span>Commit</span>
                    <span className="sm:hidden text-primary">CBC</span>
                </div>
                <div className="h-9 w-20 bg-secondary/20 rounded animate-pulse" />
            </nav>
        );
    }

    return (
        <>
            <nav className="border-b border-border/40 p-4 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground hover:opacity-90 transition-opacity">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                    <span className="hidden sm:inline">Check<span className="text-[#FF7D29]">Before</span>Commit</span>
                    <span className="sm:hidden text-primary">CBC</span>
                </Link>

                <div className="flex items-center gap-4">
                    {!user && isHomePage && freeTries !== undefined && (
                        <span className="text-sm text-muted-foreground hidden md:inline-block">
                            {freeTries} free analyses left
                        </span>
                    )}

                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-4">
                            <span className="text-xs sm:text-sm text-muted-foreground hidden lg:inline-block truncate max-w-[150px]">
                                {user.email}
                            </span>

                            {pathname !== '/dashboard' && (
                                <Button asChild variant="ghost" size="sm" className="gap-2">
                                    <Link href="/dashboard">
                                        <Layout className="w-4 h-4" />
                                        <span className="hidden sm:inline">Dashboard</span>
                                    </Link>
                                </Button>
                            )}

                            <Button asChild variant="ghost" size="sm" className="gap-2 hidden md:flex">
                                <Link href="/impact">
                                    <Activity className="w-4 h-4" />
                                    <span className="hidden sm:inline">Impact Analyzer</span>
                                </Link>
                            </Button>

                            <Button asChild variant="ghost" size="sm" className="gap-2 hidden lg:flex">
                                <Link href="/pr-review">
                                    <GitPullRequest className="w-4 h-4" />
                                    <span className="hidden sm:inline">PR Review</span>
                                </Link>
                            </Button>

                            <Button asChild variant="ghost" size="sm" className="gap-2 hidden lg:flex">
                                <Link href="/team">
                                    <Users className="w-4 h-4" />
                                    <span className="hidden sm:inline">Team</span>
                                </Link>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="text-muted-foreground hover:text-foreground gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </div>
                    ) : (
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    )}
                </div>
            </nav>

            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleSignOut}
                isLoading={isLoggingOut}
            />
        </>
    );
}

