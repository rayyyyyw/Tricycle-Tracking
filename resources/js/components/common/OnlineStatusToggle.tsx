// resources/js/components/common/OnlineStatusToggle.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff } from 'lucide-react';

interface OnlineStatusToggleProps {
    isOnline: boolean;
    setIsOnline: (value: boolean) => void;
}

export default function OnlineStatusToggle({ isOnline, setIsOnline }: OnlineStatusToggleProps) {
    return (
        <Button
            variant={isOnline ? "default" : "outline"}
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 transition-all ${
                isOnline 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            size="sm"
        >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </Button>
    );
}