// components/DriverNavbar.tsx
import { type ReactNode, useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, MessageCircle, MapPin, Clock, User, Settings, LogOut, Car, Wifi, WifiOff } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button';

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
            const options: Intl.DateTimeFormatOptions = {
                timeZone: 'Asia/Manila',
                hour12: true,
                hour: 'numeric',
                minute: '2-digit',
            };
            const timeString = now.toLocaleTimeString('en-US', options);
            setCurrentTime(timeString);
        };

        updateTime();
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Online Status Toggle
    const OnlineStatusToggle = () => (
        <Button
            variant={isOnline ? "default" : "outline"}
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 ${
                isOnline 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
            }`}
            size="sm"
        >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="hidden sm:block">
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </Button>
    );

    // User Profile Dropdown Component
    const UserProfileDropdown = () => {
        const getUserInitials = () => {
            if (!user?.name) return 'D';
            return user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        };

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {getUserInitials()}
                        </div>
                        <span className="text-sm font-medium hidden sm:block">
                            {user?.name || 'Driver'}
                        </span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Driver Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                         <Link href="/driver/profile" className="cursor-pointer flex items-center gap-2 w-full">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/driver/settings" className="cursor-pointer flex items-center gap-2 w-full">
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
                            className="cursor-pointer flex items-center gap-2 w-full text-red-600 focus:text-red-600"
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
                    className="flex items-center gap-2 text-sm font-medium text-card-foreground hover:text-foreground cursor-pointer p-2 rounded-md hover:bg-accent transition-colors"
                >
                    <span>☰</span>
                    {breadcrumbs && breadcrumbs.length === 1 && (
                        <span className="hidden sm:block">{breadcrumbs[0].title}</span>
                    )}
                </button>

                {/* Breadcrumbs for multiple items */}
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
                {/* Online Status Toggle */}
                <OnlineStatusToggle />

                {/* Current Time in Philippines */}
                <div className="flex items-center gap-2 text-sm text-foreground/80 px-3 py-2 rounded-md hover:bg-accent/30 transition-colors cursor-default">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="hidden md:inline font-medium">{currentTime || 'Loading...'}</span>
                    <span className="md:hidden font-medium">{currentTime ? currentTime.replace(' ', '') : '...'}</span>
                </div>

                {/* Current Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} className="text-red-500" />
                    <span className="hidden md:inline">Hinoba-an, PH</span>
                </div>

                {/* Switch to Passenger Button */}
                <Link 
                    href="/passenger/dashboard" 
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <User size={16} />
                    <span>Passenger Mode</span>
                </Link>

                {/* Notifications */}
                <button className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors relative">
                    <Bell size={18} className="text-orange-500" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </button>

                {/* Messages */}
                <button className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors relative">
                    <MessageCircle size={18} className="text-green-500" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                </button>

                {/* User Profile Dropdown */}
                <UserProfileDropdown />
            </div>
        </div>
    );
}