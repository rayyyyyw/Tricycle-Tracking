// resources/js/components/AdminNavbar.tsx
import { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { Bell, MessageCircle, Clock, MapPin } from 'lucide-react';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';
import { type SharedData } from '@/types';

interface AdminNavbarProps {
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export function AdminNavbar({ breadcrumbs = [], title = 'Dashboard' }: AdminNavbarProps) {
    const { toggleSidebar } = useSidebar();
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
    const handleNotificationsClick = () => {
        console.log('Open notifications panel');
    };

    const handleMessagesClick = () => {
        console.log('Open messages panel');
    };

    const handleMenuToggle = () => {
        toggleSidebar();
    };

    return (
        <div className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleMenuToggle}
                    className="flex items-center gap-2 text-sm font-medium text-card-foreground hover:text-foreground cursor-pointer p-2 rounded-md hover:bg-accent transition-colors"
                >
                    <span>☰</span>
                    {breadcrumbs && breadcrumbs.length === 1 && (
                        <span className="hidden sm:block">{breadcrumbs[0].title}</span>
                    )}
                </button>

                {/* Page Title */}
                {!breadcrumbs || breadcrumbs.length === 0 ? (
                    <h1 className="text-xl font-semibold text-foreground hidden sm:block">
                        {title}
                    </h1>
                ) : null}

                {/* Breadcrumbs for multiple items */}
                {breadcrumbs && breadcrumbs.length > 1 && (
                    <div className="flex items-center gap-2 text-sm">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <span className="text-muted-foreground">/</span>}
                                <span className={index === breadcrumbs.length - 1 
                                    ? 'text-foreground font-medium' 
                                    : 'text-muted-foreground'
                                }>
                                    {breadcrumb.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Side - Navigation Icons */}
            <div className="flex items-center gap-4">
                {/* Current Time with Location */}
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
                <button 
                    className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors relative"
                    onClick={handleNotificationsClick}
                >
                    <Bell size={18} className="text-orange-500 dark:text-orange-400" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </button>

                {/* Messages */}
                <button 
                    className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors relative"
                    onClick={handleMessagesClick}
                >
                    <MessageCircle size={18} className="text-green-500 dark:text-green-400" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                </button>

                {/* User Profile Dropdown - USE IMPORTED COMPONENT */}
                <UserProfileDropdown user={user} adminProfile={adminProfile} />
            </div>
        </div>
    );
}