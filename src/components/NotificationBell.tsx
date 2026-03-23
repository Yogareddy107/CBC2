'use client';

import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, Sparkles, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getNotifications, markAsRead } from '@/lib/actions/notifications';
import { cn, formatRelativeTime } from '@/lib/utils';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchNotifications = async () => {
            const data = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        };

        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await markAsRead(id);
        if (success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'feature': return <Sparkles className="w-4 h-4 text-purple-500" />;
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    if (!isMounted) return <Button variant="ghost" size="icon" className="relative"><Bell className="w-5 h-5 text-muted-foreground/30" /></Button>;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[10px] font-black text-white items-center justify-center">
                                {unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-border/40 shadow-2xl overflow-hidden bg-white/95 backdrop-blur-md">
                <DropdownMenuLabel className="p-4 bg-secondary/30 border-b border-border/10 flex items-center justify-between">
                    <span className="text-sm font-bold">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                            {unreadCount} New
                        </span>
                    )}
                </DropdownMenuLabel>
                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                            <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                            <p className="text-xs text-muted-foreground font-medium">All caught up!</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <DropdownMenuItem 
                                key={notif.id} 
                                className={cn(
                                    "p-4 border-b border-border/5 focus:bg-secondary/50 transition-colors flex gap-4 items-start cursor-default",
                                    !notif.is_read && "bg-primary/5"
                                )}
                            >
                                <div className="mt-1 shrink-0">
                                    {getTypeIcon(notif.type)}
                                </div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-bold text-[#1A1A1A] leading-tight">{notif.title}</p>
                                        {!notif.is_read && (
                                            <button 
                                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                className="text-[10px] font-bold text-primary hover:underline underline-offset-2"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{notif.message}</p>
                                    <p className="text-[10px] text-muted-foreground/40 font-medium">
                                        {formatRelativeTime(new Date(notif.created_at))}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="p-3 bg-secondary/10 border-t border-border/10 text-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40 hover:text-primary transition-colors">
                            View All History
                        </button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
