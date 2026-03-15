'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    CheckCircle2, FlaskConical, History, 
    CreditCard, HelpCircle, User, 
    Users, LayoutDashboard, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Teams', href: '/team', icon: Users },
];

const secondaryNavItems = [
    { name: 'Upgrade Plan', href: '/dashboard/plan', icon: CreditCard },
    { name: 'Help & Docs', href: '/dashboard/help', icon: HelpCircle },
];

interface SidebarProps {
    open?: boolean;
    onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "w-72 border-r border-slate-200 bg-white flex flex-col fixed inset-y-0 left-0 z-50 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out",
                open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
        >
            {/* Header / Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-slate-900">C<span className="text-[#FF7D29]">B</span>C</span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto scrollbar-hide">
                <div className="px-3 mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analysis Console</p>
                </div>
                {mainNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => onClose?.()}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200",
                                isActive
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "text-slate-400")} />
                            {item.name}
                        </Link>
                    );
                })}

                <div className="pt-8 px-3 mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Settings & Help</p>
                </div>
                {secondaryNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => onClose?.()}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all",
                                isActive
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="w-4.5 h-4.5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section: Profile & Teams */}
            <div className="p-4 mt-auto space-y-4">
                <div className="bg-slate-50 rounded-[2rem] p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Library</p>
                        <Settings className="w-3.5 h-3.5 text-slate-300 hover:text-slate-600 cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                            PS
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">Personal Space</p>
                            <p className="text-[10px] text-slate-400 font-bold">Standard Account</p>
                        </div>
                    </div>
                </div>

                <Link
                    href="/dashboard/profile"
                    onClick={() => onClose?.()}
                    className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all",
                        pathname === '/dashboard/profile'
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-100 hover:border-slate-300 text-slate-600"
                    )}
                >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 leading-none">
                        <p className="text-sm font-black tracking-tight">My Profile</p>
                        <p className="text-[10px] mt-1 opacity-60">Account Settings</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}
