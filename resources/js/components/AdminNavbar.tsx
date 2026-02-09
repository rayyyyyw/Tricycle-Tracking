// resources/js/components/AdminNavbar.tsx
import UserProfileDropdown from '@/components/common/UserProfileDropdown';
import NotificationDropdown from '@/components/NotificationDropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Clock, MapPin, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AdminNavbarProps {
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export function AdminNavbar({
    breadcrumbs = [],
    title = 'Dashboard',
}: AdminNavbarProps) {
    const [currentTime, setCurrentTime] = useState<string>('');
    const { auth, adminProfile } = usePage<
        SharedData & { adminProfile?: { avatar?: string } }
    >().props;
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

    // Additional navbar functions
    const handleMessagesClick = () => {
        console.log('Open messages panel');
    };

    return (
        <div className="flex h-14 w-full items-center justify-between gap-2 border-b border-emerald-200/50 bg-linear-to-r from-emerald-50/30 via-card to-card px-2 shadow-sm backdrop-blur-sm sm:h-16 sm:px-4 md:px-6 dark:border-emerald-800/30 dark:from-emerald-950/20 dark:via-card dark:to-card">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:gap-4">
                <SidebarTrigger className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />

                {/* Breadcrumbs - Show on mobile if space allows */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="hidden min-w-0 items-center gap-1.5 text-xs sm:flex sm:gap-2 sm:text-sm">
                        {breadcrumbs.length === 1 ? (
                            <span className="truncate font-medium text-foreground">
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
                                            className={`truncate ${
                                                index === breadcrumbs.length - 1
                                                    ? 'font-medium text-foreground'
                                                    : 'text-muted-foreground'
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

                {/* Page Title - Show when no breadcrumbs */}
                {(!breadcrumbs || breadcrumbs.length === 0) && (
                    <h1 className="hidden truncate text-lg font-semibold text-foreground sm:block sm:text-xl">
                        {title}
                    </h1>
                )}
            </div>

            {/* Right Side - Navigation Icons */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                {/* Current Time with Location - Responsive layout */}
                <div className="hidden cursor-default items-center gap-2 rounded-md border border-emerald-200/30 px-2 py-1.5 text-xs text-foreground/80 transition-colors hover:bg-emerald-100/50 sm:text-sm md:flex lg:gap-3 lg:px-3 lg:py-2 dark:border-emerald-800/30 dark:hover:bg-emerald-900/30">
                    {/* Location */}
                    <div className="flex items-center gap-1 border-r border-emerald-200/50 pr-2 text-xs text-emerald-700/80 sm:gap-1.5 lg:pr-3 dark:border-emerald-800/50 dark:text-emerald-400/80">
                        <MapPin
                            size={12}
                            className="shrink-0 text-emerald-600 sm:h-[14px] sm:w-[14px] dark:text-emerald-400"
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
                            className="shrink-0 text-emerald-600/70 sm:h-4 sm:w-4 dark:text-emerald-400/70"
                        />
                        <span className="font-medium whitespace-nowrap">
                            {currentTime || 'Loading...'}
                        </span>
                    </div>
                </div>

                {/* Notifications - Always visible */}
                <NotificationDropdown variant="admin" />

                {/* Messages - Always visible */}
                <button
                    className="relative shrink-0 rounded-md p-1.5 transition-colors hover:bg-emerald-100/50 hover:text-foreground sm:p-2 dark:hover:bg-emerald-900/30"
                    onClick={handleMessagesClick}
                    aria-label="Messages"
                >
                    <MessageCircle
                        size={16}
                        className="text-emerald-600 sm:h-[18px] sm:w-[18px] dark:text-emerald-400"
                    />
                    <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 sm:top-1 sm:right-1 sm:h-2 sm:w-2 dark:bg-emerald-400"></div>
                </button>

                {/* User Profile Dropdown - Always visible */}
                <div className="shrink-0">
                    <UserProfileDropdown
                        user={user}
                        adminProfile={adminProfile}
                    />
                </div>
            </div>
        </div>
    );
}
