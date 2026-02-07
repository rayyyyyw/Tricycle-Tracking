// resources/js/components/PassengerNavbar.tsx (FIXED)
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Clock, Car, MapPin } from 'lucide-react';
import PassengerUserProfileDropdown from '@/components/common/PassengerUserProfileDropdown';
import NotificationDropdown from '@/components/NotificationDropdown';
import MessageNotificationDropdown from '@/components/MessageNotificationDropdown';
import { type SharedData } from '@/types';

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
    const hasPendingApplication = user?.driver_application_status === 'pending' || 
                                 user?.has_pending_driver_application === true;
    
    // Removed unused variable: hasRejectedApplication
    const isApprovedDriver = user?.driver_application_status === 'approved' || user?.is_driver;
    
    const showBecomeDriver = user?.role === 'passenger' && 
                            !hasPendingApplication && 
                            !isApprovedDriver;

    return (
        <div className="flex h-14 sm:h-16 w-full items-center justify-between border-b border-emerald-200/50 bg-linear-to-r from-emerald-50/30 via-card to-card backdrop-blur-sm px-2 sm:px-4 md:px-6 gap-2 dark:border-emerald-800/30 dark:from-emerald-950/20 dark:via-card dark:to-card shadow-sm">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
                
                {/* Breadcrumbs - Show on mobile if space allows */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
                        {breadcrumbs.length === 1 ? (
                            <span className="font-medium text-foreground truncate">
                                {breadcrumbs[0].title}
                            </span>
                        ) : (
                            <>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div key={index} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                        {index > 0 && (
                                            <span className="text-muted-foreground shrink-0">/</span>
                                        )}
                                        <span className={`truncate ${
                                            index === breadcrumbs.length - 1 
                                                ? 'text-foreground font-medium' 
                                                : 'text-muted-foreground'
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
                {/* Current Time with Location - Responsive layout */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3 text-xs sm:text-sm text-foreground/80 px-2 lg:px-3 py-1.5 lg:py-2 rounded-md hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors cursor-default border border-emerald-200/30 dark:border-emerald-800/30">
                    {/* Location */}
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-emerald-700/80 dark:text-emerald-400/80 border-r border-emerald-200/50 dark:border-emerald-800/50 pr-2 lg:pr-3">
                        <MapPin size={12} className="sm:w-[14px] sm:h-[14px] text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="hidden lg:inline font-medium">Hinoba-an, PH</span>
                        <span className="lg:hidden font-medium">Hinoba-an</span>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock size={14} className="sm:w-4 sm:h-4 text-emerald-600/70 dark:text-emerald-400/70 shrink-0" />
                        <span className="font-medium whitespace-nowrap">{currentTime || 'Loading...'}</span>
                    </div>
                </div>

                {/* Action Buttons - Responsive with text hiding on mobile */}
                {hasPendingApplication && (
                    <Link 
                        href="/application-status" 
                        className="flex items-center gap-1.5 sm:gap-2 bg-yellow-500 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-yellow-600 transition-colors whitespace-nowrap"
                    >
                        <Clock size={14} className="sm:w-4 sm:h-4 shrink-0" />
                        <span className="hidden sm:inline">Application Pending</span>
                        <span className="sm:hidden">Pending</span>
                    </Link>
                )}

                {showBecomeDriver && (
                    <Link 
                        href="/become-driver" 
                        className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                    >
                        <Car size={14} className="sm:w-4 sm:h-4 shrink-0" />
                        <span className="hidden md:inline">Become a Driver</span>
                        <span className="md:hidden hidden sm:inline">Become Driver</span>
                        <span className="sm:hidden">Driver</span>
                    </Link>
                )}

                {isApprovedDriver && (
                    <Link 
                        href="/driver/dashboard" 
                        className="flex items-center gap-1.5 sm:gap-2 bg-green-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                    >
                        <Car size={14} className="sm:w-4 sm:h-4 shrink-0" />
                        <span className="hidden md:inline">Driver Dashboard</span>
                        <span className="md:hidden hidden sm:inline">Dashboard</span>
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