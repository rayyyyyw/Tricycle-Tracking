// resources/js/components/DriverNavbar.tsx (FIXED)
import DriverUserProfileDropdown from '@/components/common/DriverUserProfileDropdown';
import OnlineStatusToggle from '@/components/common/OnlineStatusToggle';
import MessageNotificationDropdown from '@/components/MessageNotificationDropdown';
import NotificationDropdown from '@/components/NotificationDropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DriverNavbarProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function DriverNavbar({ breadcrumbs = [] }: DriverNavbarProps) {
    const [currentTime, setCurrentTime] = useState<string>('');
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const [isOnline, setIsOnline] = useState(user?.is_online || false);

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
            'bg-red-400',
            'bg-orange-400',
            'bg-amber-400',
            'bg-yellow-400',
            'bg-lime-400',
            'bg-green-400',
            'bg-emerald-400',
            'bg-teal-400',
            'bg-cyan-400',
            'bg-sky-400',
            'bg-blue-400',
            'bg-indigo-400',
            'bg-violet-400',
            'bg-purple-400',
            'bg-fuchsia-400',
            'bg-pink-400',
        ];

        const name = user.name;
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // REMOVED: OnlineStatusToggle component definition
    // REMOVED: UserProfileDropdown component definition

    return (
        <div className="flex h-14 w-full items-center justify-between gap-2 border-b border-green-200/50 bg-linear-to-r from-green-50/30 via-card to-card px-2 shadow-sm backdrop-blur-sm sm:h-16 sm:px-4 md:px-6 dark:border-green-800/30 dark:from-green-950/20 dark:via-card dark:to-card">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:gap-4">
                <SidebarTrigger className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />

                {/* Breadcrumbs - Show on mobile if space allows */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="hidden min-w-0 items-center gap-1.5 text-xs sm:flex sm:gap-2 sm:text-sm">
                        {breadcrumbs.length === 1 ? (
                            <span className="truncate font-semibold text-foreground">
                                {breadcrumbs[0].title}
                            </span>
                        ) : (
                            <>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div
                                        key={index}
                                        className="flex min-w-0 items-center gap-1.5 sm:gap-2"
                                    >
                                        {index > 0 && (
                                            <span className="shrink-0 text-muted-foreground">
                                                /
                                            </span>
                                        )}
                                        <span
                                            className={`truncate transition-colors ${
                                                index === breadcrumbs.length - 1
                                                    ? 'font-semibold text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
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
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                {/* Online Status Toggle - Responsive */}
                <div className="shrink-0">
                    <OnlineStatusToggle
                        isOnline={isOnline}
                        setIsOnline={setIsOnline}
                    />
                </div>

                {/* Current Time with Location - Responsive layout */}
                <div className="hidden cursor-default items-center gap-2 rounded-md border border-green-200/30 px-2 py-1.5 text-xs text-foreground/80 transition-colors hover:bg-green-100/50 sm:text-sm md:flex lg:gap-3 lg:px-3 lg:py-2 dark:border-green-800/30 dark:hover:bg-green-900/30">
                    {/* Location */}
                    <div className="flex items-center gap-1 border-r border-green-200/50 pr-2 text-xs text-green-700/80 sm:gap-1.5 lg:pr-3 dark:border-green-800/50 dark:text-green-400/80">
                        <MapPin
                            size={12}
                            className="shrink-0 text-green-600 sm:h-[14px] sm:w-[14px] dark:text-green-400"
                        />
                        <span className="hidden font-medium lg:inline">
                            Hinoba-an, PH
                        </span>
                        <span className="font-medium lg:hidden">Hinoba-an</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock
                            size={14}
                            className="shrink-0 text-green-600/70 sm:h-4 sm:w-4 dark:text-green-400/70"
                        />
                        <span className="font-medium whitespace-nowrap">
                            {currentTime || 'Loading...'}
                        </span>
                    </div>
                </div>

                {/* Notifications - Always visible */}
                <NotificationDropdown variant="driver" />

                {/* Messages - Dropdown with message notifications */}
                <MessageNotificationDropdown variant="driver" />

                {/* User Profile Dropdown - Always visible */}
                <div className="shrink-0">
                    <DriverUserProfileDropdown
                        user={user}
                        getAvatarColor={getAvatarColor}
                    />
                </div>
            </div>
        </div>
    );
}
