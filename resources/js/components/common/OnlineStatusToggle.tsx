// resources/js/components/common/OnlineStatusToggle.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface OnlineStatusToggleProps {
    isOnline: boolean;
    setIsOnline: (value: boolean) => void;
}

export default function OnlineStatusToggle({ isOnline, setIsOnline }: OnlineStatusToggleProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = () => {
        const newStatus = !isOnline;
        setIsUpdating(true);
        
        // Optimistically update the UI
        setIsOnline(newStatus);
        
        // Send to backend
        router.post('/driver/toggle-online', 
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
            }
        );
    };

    return (
        <Button
            variant={isOnline ? "default" : "outline"}
            onClick={handleToggle}
            disabled={isUpdating}
            className={`flex items-center gap-2 transition-all ${
                isOnline 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            size="sm"
        >
            {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </Button>
    );
}