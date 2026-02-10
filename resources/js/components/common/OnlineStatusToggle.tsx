// resources/js/components/common/OnlineStatusToggle.tsx
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';

interface OnlineStatusToggleProps {
    isOnline: boolean;
}

export default function OnlineStatusToggle({
    isOnline,
}: OnlineStatusToggleProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [optimisticOnline, setOptimisticOnline] = useState<boolean | null>(
        null,
    );
    const displayOnline =
        optimisticOnline !== null ? optimisticOnline : isOnline;

    const handleToggle = () => {
        const newStatus = !displayOnline;
        setIsUpdating(true);
        setOptimisticOnline(newStatus);

        router.post(
            '/driver/toggle-online',
            { is_online: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsUpdating(false);
                    setOptimisticOnline(null);
                    router.reload({ only: ['pendingBookings', 'auth'] });
                },
                onError: () => {
                    setOptimisticOnline(null);
                    setIsUpdating(false);
                    alert('Failed to update online status');
                },
            },
        );
    };

    return (
        <Button
            variant={displayOnline ? 'default' : 'outline'}
            onClick={handleToggle}
            disabled={isUpdating}
            className={`flex items-center gap-2 transition-all ${
                displayOnline
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                    : 'border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30'
            }`}
            size="sm"
        >
            {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : displayOnline ? (
                <Wifi className="h-4 w-4" />
            ) : (
                <WifiOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
                {displayOnline ? 'Online' : 'Offline'}
            </span>
        </Button>
    );
}
