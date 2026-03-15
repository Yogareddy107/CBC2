'use client';

import { signOut } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutConfirmModal } from '@/components/ui/LogoutConfirmModal';
import { useState } from 'react';
import { User, LogOut, MessageSquare, Menu } from 'lucide-react';

interface TopBarProps {
    user: {
        email?: string;
    } | null;
    onHamburger?: () => void;
}

export function TopBar({ user, onHamburger }: TopBarProps) {
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
        } finally {
            setIsLoggingOut(false);
            setIsLogoutModalOpen(false);
        }
    };


    return (
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 gap-6">
            <div className="flex items-center gap-4">
                {/* hamburger for mobile */}
                {onHamburger && (
                    <button
                        className="lg:hidden p-2 rounded-md hover:bg-secondary/50"
                        onClick={onHamburger}
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                )}

                <a
                    href="mailto:teamintrasphere@gmail.com"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                    <MessageSquare className="w-3 h-3" />
                    Send Feedback
                </a>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 h-8 py-0 px-2 hover:bg-secondary/50">
                        <span className="text-xs font-medium max-w-[120px] truncate hidden sm:inline-block">
                            {user?.email}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <User className="w-3 h-3 text-primary" />
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-xs font-medium leading-none text-muted-foreground">Account</p>
                            <p className="text-sm font-semibold leading-none truncate">{user?.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="text-destructive focus:text-destructive cursor-pointer gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleSignOut}
                isLoading={isLoggingOut}
            />
        </header>

    );
}
