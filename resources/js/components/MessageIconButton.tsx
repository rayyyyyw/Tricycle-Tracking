import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MessageIconButtonProps {
    variant?: 'passenger' | 'driver';
    href?: string;
}

export default function MessageIconButton({ variant = 'passenger', href = '/messages' }: MessageIconButtonProps) {
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchUnreadMessageCount = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/notifications/unread-message-count', {
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
            console.error('Failed to fetch unread message count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadMessageCount();

        intervalRef.current = setInterval(fetchUnreadMessageCount, 30000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const iconColor = variant === 'passenger'
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-green-600 dark:text-green-400';

    const hoverBg = variant === 'passenger'
        ? 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30'
        : 'hover:bg-green-100/50 dark:hover:bg-green-900/30';

    const badgeColor = variant === 'passenger'
        ? 'bg-emerald-500 dark:bg-emerald-400'
        : 'bg-green-500 dark:bg-green-400';

    return (
        <Link
            href={href}
            className={`p-1.5 sm:p-2 rounded-md ${hoverBg} hover:text-foreground transition-colors relative shrink-0 flex items-center justify-center`}
            aria-label="Messages"
        >
            <MessageCircle size={16} className={`sm:w-[18px] sm:h-[18px] ${iconColor}`} />
            {unreadCount > 0 && (
                <Badge
                    variant="destructive"
                    className={`absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] font-bold min-w-4 ${badgeColor} border-0`}
                >
                    {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
            )}
        </Link>
    );
}
