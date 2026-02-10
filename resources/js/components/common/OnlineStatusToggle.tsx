// resources/js/components/common/OnlineStatusToggle.tsx
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';

interface OnlineStatusToggleProps {
    isOnline: boolean;
    setIsOnline: (value: boolean) => void;
}

export default function OnlineStatusToggle({
    isOnline,
    setIsOnline,
}: OnlineStatusToggleProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = () => {
        const newStatus = !isOnline;
        setIsUpdating(true);

        // Optimistically update the UI
        setIsOnline(newStatus);

        // Send to backend
        router.post(
            '/driver/toggle-online',
            { is_online: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsUpdating(false);
                    // Reload to update bookings list
                    router.reload({ only: ['pendingBookings', 'auth'] });
                },
                onError: () => {
                    // Revert on error
                    setIsOnline(!newStatus);
                    setIsUpdating(false);
                    alert('Failed to update online status');
                },
            },
        );
    };

    return (
        <Button
            variant={isOnline ? 'default' : 'outline'}
            onClick={handleToggle}
            disabled={isUpdating}
            className={`flex items-center gap-2 transition-all ${
                isOnline
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                    : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30'
            }`}
            size="sm"
        >
            {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isOnline ? (
                <Wifi className="h-4 w-4" />
            ) : (
                <WifiOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </Button>
    );
}
