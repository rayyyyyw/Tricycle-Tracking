// resources/js/components/DriverNavbar.tsx (FIXED)
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
        <div className="flex h-14 sm:h-16 w-full items-center justify-between border-b border-green-200/50 bg-gradient-to-r from-green-50/30 via-card to-card backdrop-blur-sm px-2 sm:px-4 md:px-6 gap-2 dark:border-green-800/30 dark:from-green-950/20 dark:via-card dark:to-card shadow-sm">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
                
                {/* Breadcrumbs - Show on mobile if space allows */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
                        {breadcrumbs.length === 1 ? (
                            <span className="font-semibold text-foreground truncate">
                                {breadcrumbs[0].title}
                            </span>
                        ) : (
                            <>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div key={index} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                        {index > 0 && (
                                            <span className="text-muted-foreground shrink-0">/</span>
                                        )}
                                        <span className={`truncate transition-colors ${
                                            index === breadcrumbs.length - 1 
                                                ? 'text-foreground font-semibold' 
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}>
                                            {breadcrumb.title}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Right Side - Navigation Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 shrink-0">
                {/* Online Status Toggle - Responsive */}
                <div className="shrink-0">
                    <OnlineStatusToggle isOnline={isOnline} setIsOnline={setIsOnline} />
                </div>

                {/* Current Time with Location - Responsive layout */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3 text-xs sm:text-sm text-foreground/80 px-2 lg:px-3 py-1.5 lg:py-2 rounded-md hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors cursor-default border border-green-200/30 dark:border-green-800/30">
                    {/* Location */}
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-green-700/80 dark:text-green-400/80 border-r border-green-200/50 dark:border-green-800/50 pr-2 lg:pr-3">
                        <MapPin size={12} className="sm:w-[14px] sm:h-[14px] text-green-600 dark:text-green-400 shrink-0" />
                        <span className="hidden lg:inline font-medium">Hinoba-an, PH</span>
                        <span className="lg:hidden font-medium">Hinoba-an</span>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock size={14} className="sm:w-4 sm:h-4 text-green-600/70 dark:text-green-400/70 shrink-0" />
                        <span className="font-medium whitespace-nowrap">{currentTime || 'Loading...'}</span>
                    </div>
                </div>

                {/* Notifications - Always visible */}
                <button className="p-1.5 sm:p-2 rounded-md hover:bg-green-100/50 dark:hover:bg-green-900/30 hover:text-foreground transition-colors relative shrink-0" aria-label="Notifications">
                    <Bell size={16} className="sm:w-[18px] sm:h-[18px] text-orange-500 dark:text-orange-400" />
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                </button>

                {/* Messages - Always visible */}
                <button className="p-1.5 sm:p-2 rounded-md hover:bg-green-100/50 dark:hover:bg-green-900/30 hover:text-foreground transition-colors relative shrink-0" aria-label="Messages">
                    <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px] text-green-600 dark:text-green-400" />
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                </button>

                {/* User Profile Dropdown - Always visible */}
                <div className="shrink-0">
                    <DriverUserProfileDropdown user={user} getAvatarColor={getAvatarColor} />
                </div>
            </div>
        </div>
    );
}