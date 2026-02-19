import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    const meta = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
    if (meta) return meta;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function NotificationDropdown({
    className = '',
    variant = 'passenger',
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
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            } else {
                console.error(
                    'Failed to fetch notifications:',
                    response.status,
                    response.statusText,
                );
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
                    Accept: 'application/json',
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

        // Poll for unread count only when tab is visible and dropdown is closed (every 60s to reduce noise)
        const poll = () => {
            if (!open && document.visibilityState === 'visible') {
                fetchUnreadCount();
            }
        };
        intervalRef.current = setInterval(poll, 60000);

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
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === id
                            ? {
                                  ...n,
                                  read: true,
                                  read_at: new Date().toISOString(),
                              }
                            : n,
                    ),
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
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
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) => ({
                        ...n,
                        read: true,
                        read_at: new Date().toISOString(),
                    })),
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
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });
            if (response.ok) {
                const n = notifications.find((x) => x.id === id);
                setNotifications((prev) => prev.filter((x) => x.id !== id));
                if (n && !n.read)
                    setUnreadCount((prev) => Math.max(0, prev - 1));
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
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
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
            case 'driver_approved':
                return '🎉';
            case 'driver_rejected':
                return '❌';
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
                    className={`flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-md p-2 sm:min-h-0 sm:min-w-0 sm:p-2 ${getHoverColor()} relative shrink-0 transition-colors hover:text-foreground active:opacity-80 ${className}`}
                    aria-label="Notifications"
                >
                    <Bell
                        size={16}
                        className="text-orange-500 sm:h-[18px] sm:w-[18px] dark:text-orange-400"
                    />
                    {unreadCount > 0 && (
                        <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 sm:top-1 sm:right-1 sm:h-2 sm:w-2"></div>
                    )}
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center p-0 text-[9px] font-bold"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[min(24rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] p-0 sm:w-80 sm:max-w-96"
                align="end"
                sideOffset={8}
                collisionPadding={16}
            >
                <div className="flex flex-col gap-2 border-b p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:p-4">
                    <h3 className="truncate text-sm font-semibold">
                        Notifications
                    </h3>
                    {/* Mark all read + Delete all (passenger, driver, admin) */}
                    <div className="flex min-h-[44px] shrink-0 items-center gap-2 sm:min-h-0">
                        {unreadCount > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMarkAllAsRead();
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                disabled={loading}
                                className="min-h-[44px] min-w-[44px] touch-manipulation px-3 text-xs sm:min-h-7 sm:min-w-0 sm:px-2"
                                aria-label="Mark all as read"
                                title="Mark all read"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin sm:mr-1 sm:h-3 sm:w-3" />
                                ) : (
                                    <CheckCheck className="h-4 w-4 sm:mr-1 sm:h-3 sm:w-3" />
                                )}
                                <span className="ml-1.5 sm:ml-1">
                                    Mark all read
                                </span>
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteAll();
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                disabled={loading}
                                className="min-h-[44px] min-w-[44px] touch-manipulation px-3 text-xs text-destructive hover:text-destructive sm:min-h-7 sm:min-w-0 sm:px-2"
                                aria-label="Delete all"
                                title="Delete all"
                            >
                                <Trash2 className="h-4 w-4 sm:mr-1 sm:h-3 sm:w-3" />
                                <span className="ml-1.5 sm:ml-1">
                                    Delete all
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-[65vh] max-h-[400px] sm:h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                            <Bell className="mb-3 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                                No notifications yet
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`min-h-[52px] cursor-pointer touch-manipulation p-3 py-3 transition-colors hover:bg-accent/50 active:bg-accent/50 sm:min-h-0 sm:p-4 ${
                                        !notification.read
                                            ? 'bg-blue-50/50 dark:bg-blue-950/20'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            handleMarkAsRead(notification.id);
                                        }
                                        // Navigate based on notification type
                                        if (notification.data?.application_id != null) {
                                            // Driver application approved/rejected – passenger sees this
                                            if (
                                                notification.type === 'driver_approved' ||
                                                notification.type === 'driver_rejected'
                                            ) {
                                                if (notification.type === 'driver_approved') {
                                                    router.visit('/driver/bookings');
                                                } else {
                                                    router.visit('/become-driver');
                                                }
                                            }
                                        } else if (notification.data?.booking_id) {
                                            if (variant === 'passenger') {
                                                if (
                                                    notification.type ===
                                                    'ride_completed'
                                                ) {
                                                    router.visit(
                                                        '/passenger/ride-history',
                                                    );
                                                } else {
                                                    router.visit('/BookRide');
                                                }
                                            } else if (variant === 'driver') {
                                                if (
                                                    notification.type ===
                                                    'new_booking'
                                                ) {
                                                    router.visit(
                                                        '/driver/bookings',
                                                    );
                                                } else if (
                                                    notification.type ===
                                                    'driver_rated'
                                                ) {
                                                    router.visit(
                                                        '/driver/ride-history',
                                                    );
                                                } else {
                                                    router.visit(
                                                        '/driver/bookings',
                                                    );
                                                }
                                            } else if (variant === 'admin') {
                                                router.visit('/dashboard');
                                            }
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="mt-0.5 shrink-0 text-lg sm:text-xl">
                                            {getNotificationIcon(
                                                notification.type,
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className={`text-sm font-medium ${
                                                        !notification.read
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"></div>
                                                )}
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                {notification.message}
                                            </p>
                                            <p className="mt-2 text-[10px] text-muted-foreground">
                                                {notification.time_ago}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 touch-manipulation p-0 sm:h-6 sm:w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(
                                                            notification.id,
                                                        );
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
                                                className="h-9 w-9 touch-manipulation p-0 text-muted-foreground hover:text-destructive sm:h-6 sm:w-6"
                                                onClick={(e) =>
                                                    handleDelete(
                                                        e,
                                                        notification.id,
                                                    )
                                                }
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
