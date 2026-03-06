'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2, FlaskConical, History, CreditCard, HelpCircle, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navItems = [
    { name: 'New Analysis', href: '/dashboard', icon: FlaskConical },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Plan', href: '/dashboard/plan', icon: CreditCard },
    { name: 'Support', href: '/dashboard/support', icon: MessageCircle },
    { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
];

interface SidebarProps {
    open?: boolean;
    onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function fetchUnread() {
            try {
                const res = await fetch('/api/support/unread-count');
                const data = await res.json();
                if (isMounted && typeof data.unread === 'number') {
                    setUnreadCount(data.unread);
                }
            } catch {
                // ignore
            }
        }

        fetchUnread();

        const interval = setInterval(() => {
            fetchUnread();
        }, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <aside
            className={cn(
                "w-64 border-r border-[#1A1A1A]/5 bg-[#FFFDF6] flex flex-col fixed inset-y-0 left-0 z-50",
                // slide in/out on mobile
                open ? "translate-x-0" : "-translate-x-full",
                "transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto"
            )}
        >
            <div className="p-6 border-b border-border/20 flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                    <span className="font-bold text-lg tracking-tight">CBC</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => onClose?.()}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground/60")} />
                            {item.name}
                            {item.name === 'Support' && unreadCount > 0 ? (
                                <Badge className="ml-auto">{unreadCount}</Badge>
                            ) : null}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border/20">
                <div className="p-3 bg-secondary/20 rounded-lg border border-border/10">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-wider mb-2">Workspace</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Personal
                    </div>
                </div>
            </div>
        </aside>
    );
}
