// components/PassengerNavbar.tsx
import { useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { Bell, MessageCircle, Clock, User, Settings, LogOut, Car, MapPin } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    const { toggleSidebar } = useSidebar();
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
    
    const hasRejectedApplication = user?.driver_application_status === 'rejected';
    const isApprovedDriver = user?.driver_application_status === 'approved' || user?.is_driver;
    
    const showBecomeDriver = user?.role === 'passenger' && 
                            !hasPendingApplication && 
                            !isApprovedDriver;

    // User Profile Dropdown Component
    const UserProfileDropdown = () => {
        const getUserInitials = (): string => {
            return user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
        };

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors">
                        <Avatar className="w-8 h-8 border-2 border-background">
                            <AvatarImage 
                                src={user?.avatar || ''} 
                                alt={user?.name || 'User'}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                                <User className="w-4 h-4" />
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium hidden sm:block">
                            {user?.name || 'User'}
                        </span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                         <Link href="/PassengerSide/profile" className="flex items-center gap-2 w-full cursor-pointer">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/PassengerSide/settings" className="flex items-center gap-2 w-full cursor-pointer">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button" 
                            className="flex items-center gap-2 w-full text-red-600 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <div className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="flex items-center gap-2 text-sm font-medium text-card-foreground hover:text-foreground p-2 rounded-md hover:bg-accent transition-colors"
                >
                    <span>☰</span>
                    {breadcrumbs && breadcrumbs.length === 1 && (
                        <span className="hidden sm:block">{breadcrumbs[0].title}</span>
                    )}
                </button>

                {breadcrumbs && breadcrumbs.length > 1 && (
                    <div className="flex items-center gap-2 text-sm">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <span className="text-muted-foreground">/</span>}
                                <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                    {breadcrumb.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Side - Navigation Icons */}
            <div className="flex items-center gap-4">
                {/* Current Time with Location - Same layout as Admin */}
                <div className="flex items-center gap-3 text-sm text-foreground/80 px-3 py-2 rounded-md hover:bg-accent/30 transition-colors cursor-default">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-r border-border pr-3">
                        <MapPin size={14} className="text-green-500 dark:text-green-400" />
                        <span className="hidden lg:inline font-medium">Hinoba-an PH</span>
                        <span className="lg:hidden font-medium">Hinoba-an</span>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="hidden md:inline font-medium">{currentTime || 'Loading...'}</span>
                        <span className="md:hidden font-medium">{currentTime ? currentTime.replace(' ', '') : '...'}</span>
                    </div>
                </div>

                {/* Application Pending - Show this FIRST if user has pending application */}
                {hasPendingApplication && (
                    <Link 
                        href="/application-status" 
                        className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
                    >
                        <Clock size={16} />
                        <span>Application Pending</span>
                    </Link>
                )}

                {/* Become a Driver Button - Show only if no pending application and not a driver */}
                {showBecomeDriver && (
                    <Link 
                        href="/become-driver" 
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Car size={16} />
                        <span>Become a Driver</span>
                    </Link>
                )}

                {/* Driver Dashboard - Show if user is approved driver */}
                {isApprovedDriver && (
                    <Link 
                        href="/driver/dashboard" 
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                        <Car size={16} />
                        <span>Driver Dashboard</span>
                    </Link>
                )}

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

                {/* User Profile Dropdown */}
                <UserProfileDropdown />
            </div>
        </div>
    );
}