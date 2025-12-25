// resources/js/components/DriverNavbar.tsx (FIXED)
import { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { Bell, MessageCircle, MapPin, Clock } from 'lucide-react';
import { type SharedData } from '@/types';
import OnlineStatusToggle from '@/components/common/OnlineStatusToggle';
import DriverUserProfileDropdown from '@/components/common/DriverUserProfileDropdown';

interface DriverNavbarProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function DriverNavbar({ breadcrumbs = [] }: DriverNavbarProps) {
    const { toggleSidebar } = useSidebar();
    const [currentTime, setCurrentTime] = useState<string>('');
    const [isOnline, setIsOnline] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                timeZone: 'Asia/Manila',
                hour12: true,
                hour: 'numeric',
                minute: '2-digit',
            });
            setCurrentTime(timeString);
        };

        updateTime();
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Generate consistent color based on user's name
    const getAvatarColor = () => {
        if (!user?.name) return 'bg-gray-400';
        
        const colors = [
            'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-yellow-400', 
            'bg-lime-400', 'bg-green-400', 'bg-emerald-400', 'bg-teal-400', 
            'bg-cyan-400', 'bg-sky-400', 'bg-blue-400', 'bg-indigo-400', 
            'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-pink-400'
        ];
        
        const name = user.name;
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // REMOVED: OnlineStatusToggle component definition
    // REMOVED: UserProfileDropdown component definition

    return (
        <div className="flex h-16 w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 sm:px-6">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="flex items-center gap-2 text-sm font-medium text-card-foreground hover:text-foreground cursor-pointer p-2 rounded-lg hover:bg-accent transition-colors"
                >
                    <span className="text-lg">☰</span>
                    {breadcrumbs && breadcrumbs.length === 1 && (
                        <span className="hidden sm:block font-semibold">{breadcrumbs[0].title}</span>
                    )}
                </button>

                {/* Breadcrumbs for multiple items */}
                {breadcrumbs && breadcrumbs.length > 1 && (
                    <div className="hidden md:flex items-center gap-2 text-sm">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <span className="text-muted-foreground">/</span>}
                                <span className={`transition-colors ${
                                    index === breadcrumbs.length - 1 
                                        ? 'text-foreground font-semibold' 
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}>
                                    {breadcrumb.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Side - Navigation Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Online Status Toggle - USE IMPORTED COMPONENT */}
                <OnlineStatusToggle isOnline={isOnline} setIsOnline={setIsOnline} />

                {/* Current Time with Location - Same layout as Admin */}
                <div className="flex items-center gap-3 text-sm text-foreground/80 px-3 py-2 rounded-md hover:bg-accent/30 transition-colors cursor-default">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-r border-border pr-3">
                        <MapPin size={14} className="text-green-500 dark:text-green-400" />
                        <span className="hidden lg:inline font-medium">Hinoba-an, PH</span>
                        <span className="lg:hidden font-medium">Hinoba-an</span>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="hidden md:inline font-medium">{currentTime || 'Loading...'}</span>
                        <span className="md:hidden font-medium">{currentTime ? currentTime.replace(' ', '') : '...'}</span>
                    </div>
                </div>

                {/* Notifications */}
                <button className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors relative">
                    <Bell size={18} className="text-orange-500 dark:text-orange-400" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </button>

                {/* Messages */}
                <button className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors relative">
                    <MessageCircle size={18} className="text-green-500 dark:text-green-400" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                </button>

                {/* User Profile Dropdown - USE IMPORTED COMPONENT */}
                <DriverUserProfileDropdown user={user} getAvatarColor={getAvatarColor} />
            </div>
        </div>
    );
}