// resources/js/components/AdminNavbar.tsx
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { MessageCircle, Clock, MapPin } from 'lucide-react';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';
import NotificationDropdown from '@/components/NotificationDropdown';
import { type SharedData } from '@/types';

interface AdminNavbarProps {
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export function AdminNavbar({ breadcrumbs = [], title = 'Dashboard' }: AdminNavbarProps) {
    const [currentTime, setCurrentTime] = useState<string>('');
    const { auth, adminProfile } = usePage<SharedData & { adminProfile?: { avatar?: string } }>().props;
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
        <div className="flex h-14 sm:h-16 w-full items-center justify-between border-b border-border bg-card px-2 sm:px-4 md:px-6 gap-2">
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

                {/* Page Title - Show when no breadcrumbs */}
                {(!breadcrumbs || breadcrumbs.length === 0) && (
                    <h1 className="text-lg sm:text-xl font-semibold text-foreground hidden sm:block truncate">
                        {title}
                    </h1>
                )}
            </div>

            {/* Right Side - Navigation Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 shrink-0">
                {/* Current Time with Location - Responsive layout */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3 text-xs sm:text-sm text-foreground/80 px-2 lg:px-3 py-1.5 lg:py-2 rounded-md hover:bg-accent/30 transition-colors cursor-default">
                    {/* Location */}
                    <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground border-r border-border pr-2 lg:pr-3">
                        <MapPin size={12} className="sm:w-[14px] sm:h-[14px] text-green-500 dark:text-green-400 shrink-0" />
                        <span className="hidden lg:inline font-medium">Hinoba-an, PH</span>
                        <span className="lg:hidden font-medium">Hinoba-an</span>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock size={14} className="sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium whitespace-nowrap">{currentTime || 'Loading...'}</span>
                    </div>
                </div>

                {/* Notifications - Always visible */}
                <NotificationDropdown variant="admin" />

                {/* Messages - Always visible */}
                <button 
                    className="p-1.5 sm:p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors relative shrink-0"
                    onClick={handleMessagesClick}
                    aria-label="Messages"
                >
                    <MessageCircle size={16} className="sm:w-[18px] sm:h-[18px] text-green-500 dark:text-green-400" />
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                </button>

                {/* User Profile Dropdown - Always visible */}
                <div className="shrink-0">
                    <UserProfileDropdown user={user} adminProfile={adminProfile} />
                </div>
            </div>
        </div>
    );
}