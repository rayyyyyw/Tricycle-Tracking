// resources/js/components/PassengerNavbar.tsx (FIXED)
import PassengerUserProfileDropdown from '@/components/common/PassengerUserProfileDropdown';
import MessageNotificationDropdown from '@/components/MessageNotificationDropdown';
import NotificationDropdown from '@/components/NotificationDropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Car, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PassengerNavbarProps {
    breadcrumbs?: Array<{ title: string; href: string }>;
}

// Extended User type to include the properties we need
interface ExtendedUser {
    id: number;
    name: string;
    email: string;
    role?: string;
    has_pending_driver_application?: boolean;
    is_driver?: boolean;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    driver_application_status?: 'pending' | 'approved' | 'rejected' | null;
}

export function PassengerNavbar({ breadcrumbs = [] }: PassengerNavbarProps) {
    const [currentTime, setCurrentTime] = useState<string>('');
    const { auth } = usePage<SharedData>().props;

    // Safe type assertion for user properties
    const user = auth.user as ExtendedUser;

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

    // Improved logic for driver application status
    const hasPendingApplication =
        user?.driver_application_status === 'pending' ||
        user?.has_pending_driver_application === true;

    // Removed unused variable: hasRejectedApplication
    const isApprovedDriver =
        user?.driver_application_status === 'approved' || user?.is_driver;

    const showBecomeDriver =
        user?.role === 'passenger' &&
        !hasPendingApplication &&
        !isApprovedDriver;

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

                {/* Action Buttons - Responsive with text hiding on mobile */}
                {hasPendingApplication && (
                    <Link
                        href="/application-status"
                        className="flex items-center gap-1.5 rounded-md bg-yellow-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white transition-colors hover:bg-yellow-600 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm md:px-4"
                    >
                        <Clock size={14} className="shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">
                            Application Pending
                        </span>
                        <span className="sm:hidden">Pending</span>
                    </Link>
                )}

                {showBecomeDriver && (
                    <Link
                        href="/become-driver"
                        className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-sm transition-colors hover:bg-emerald-600 hover:shadow-md sm:gap-2 sm:px-3 sm:py-2 sm:text-sm md:px-4 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                        <Car size={14} className="shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden md:inline">
                            Become a Driver
                        </span>
                        <span className="hidden sm:inline md:hidden">
                            Become Driver
                        </span>
                        <span className="sm:hidden">Driver</span>
                    </Link>
                )}

                {isApprovedDriver && (
                    <Link
                        href="/driver/dashboard"
                        className="flex items-center gap-1.5 rounded-md bg-green-600 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-sm transition-colors hover:bg-green-700 hover:shadow-md sm:gap-2 sm:px-3 sm:py-2 sm:text-sm md:px-4 dark:bg-green-700 dark:hover:bg-green-800"
                    >
                        <Car size={14} className="shrink-0 sm:h-4 sm:w-4" />
                        <span className="hidden md:inline">
                            Driver Dashboard
                        </span>
                        <span className="hidden sm:inline md:hidden">
                            Dashboard
                        </span>
                        <span className="sm:hidden">Driver</span>
                    </Link>
                )}

                {/* Notifications - Always visible */}
                <NotificationDropdown variant="passenger" />

                {/* Messages - Dropdown with message notifications */}
                <MessageNotificationDropdown variant="passenger" />

                {/* User Profile Dropdown - Always visible */}
                <div className="shrink-0">
                    <PassengerUserProfileDropdown user={user} />
                </div>
            </div>
        </div>
    );
}
