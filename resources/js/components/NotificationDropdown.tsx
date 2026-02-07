import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    read_at: string | null;
    created_at: string;
    time_ago: string;
}

interface NotificationDropdownProps {
    className?: string;
    variant?: 'passenger' | 'driver' | 'admin';
}

function getCsrfToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (meta) return meta;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function NotificationDropdown({ 
    className = '', 
    variant = 'passenger' 
}: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchNotifications = async () => {
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch('/notifications', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            } else {
                console.error('Failed to fetch notifications:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch('/notifications/unread-count', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Poll for unread count every 30 seconds when dropdown is closed
        intervalRef.current = setInterval(() => {
            if (!open) {
                fetchUnreadCount();
            }
        }, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [open]);

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    const handleMarkAsRead = async (id: number) => {
        try {
            const response = await fetch(`/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        setLoading(true);
        try {
            const response = await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            const response = await fetch(`/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
            });
            if (response.ok) {
                const n = notifications.find(x => x.id === id);
                setNotifications(prev => prev.filter(x => x.id !== id));
                if (n && !n.read) setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleDeleteAll = async () => {
        setLoading(true);
        try {
            const response = await fetch('/notifications', {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
            });
            if (response.ok) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to delete all notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_booking':
                return '📋';
            case 'driver_assigned':
            case 'booking_accepted':
                return '✅';
            case 'ride_completed':
            case 'booking_completed':
                return '🎉';
            case 'booking_cancelled':
                return '❌';
            case 'driver_rated':
                return '⭐';
            case 'ride_started':
                return '🚀';
            default:
                return '🔔';
        }
    };

    const getHoverColor = () => {
        switch (variant) {
            case 'passenger':
                return 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30';
            case 'driver':
                return 'hover:bg-green-100/50 dark:hover:bg-green-900/30';
            case 'admin':
                return 'hover:bg-accent';
            default:
                return 'hover:bg-accent';
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={`p-2 sm:p-2 rounded-md min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center touch-manipulation ${getHoverColor()} hover:text-foreground active:opacity-80 transition-colors relative shrink-0 ${className}`}
                    aria-label="Notifications"
                >
                    <Bell size={16} className="sm:w-[18px] sm:h-[18px] text-orange-500 dark:text-orange-400" />
                    {unreadCount > 0 && (
                        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] font-bold"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[min(24rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] sm:w-80 sm:max-w-96 p-0"
                align="end"
                sideOffset={8}
                collisionPadding={16}
            >
                <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b flex-wrap">
                    <h3 className="font-semibold text-sm truncate">Notifications</h3>
                    <div className="flex items-center gap-1 shrink-0">
                        {unreadCount > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead(); }}
                                disabled={loading}
                                className="h-8 min-w-8 sm:h-7 sm:min-w-0 px-2 sm:px-2 text-xs touch-manipulation"
                                aria-label="Mark all as read"
                                title="Mark all read"
                            >
                                {loading ? (
                                    <Loader2 className="h-3.5 w-3.5 sm:h-3 sm:w-3 animate-spin sm:mr-1" />
                                ) : (
                                    <CheckCheck className="h-3.5 w-3.5 sm:h-3 sm:w-3 sm:mr-1" />
                                )}
                                <span className="hidden sm:inline">Mark all read</span>
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleDeleteAll(); }}
                                disabled={loading}
                                className="h-8 min-w-8 sm:h-7 sm:min-w-0 px-2 sm:px-2 text-xs text-destructive hover:text-destructive touch-manipulation"
                                aria-label="Delete all"
                                title="Delete all"
                            >
                                <Trash2 className="h-3.5 w-3.5 sm:h-3 sm:w-3 sm:mr-1" />
                                <span className="hidden sm:inline">Delete all</span>
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[65vh] max-h-[400px] sm:h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 sm:p-4 min-h-[52px] sm:min-h-0 py-3 active:bg-accent/50 hover:bg-accent/50 transition-colors cursor-pointer touch-manipulation ${
                                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                                    }`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            handleMarkAsRead(notification.id);
                                        }
                                        // Navigate based on notification type
                                        if (notification.data?.booking_id) {
                                            if (variant === 'passenger') {
                                                if (notification.type === 'ride_completed') {
                                                    router.visit('/passenger/ride-history');
                                                } else {
                                                    router.visit('/BookRide');
                                                }
                                            } else if (variant === 'driver') {
                                                if (notification.type === 'new_booking') {
                                                    router.visit('/driver/bookings');
                                                } else if (notification.type === 'driver_rated') {
                                                    router.visit('/driver/ride-history');
                                                } else {
                                                    router.visit('/driver/bookings');
                                                }
                                            }
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="text-lg sm:text-xl shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium ${
                                                    !notification.read ? 'text-foreground' : 'text-muted-foreground'
                                                }`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-2">
                                                {notification.time_ago}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 sm:h-6 sm:w-6 p-0 touch-manipulation"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    aria-label="Mark as read"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4 sm:h-3 sm:w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-destructive touch-manipulation"
                                                onClick={(e) => handleDelete(e, notification.id)}
                                                aria-label="Delete"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
