// components/AdminNavbar.tsx
import { type ReactNode, useState, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, MessageCircle, Clock, User, Settings, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';

interface AdminNavbarProps {
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export function AdminNavbar({ breadcrumbs = [], title = 'Dashboard' }: AdminNavbarProps) {
    const { toggleSidebar } = useSidebar();
    const [currentTime, setCurrentTime] = useState<string>('');
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

    // User Profile Dropdown Component
    const UserProfileDropdown = () => {
        const getUserInitials = (): string => {
            return user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'A';
        };

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {getUserInitials()}
                        </div>
                        <span className="text-sm font-medium hidden sm:block text-slate-700 dark:text-slate-200">
                            {user?.name || 'Admin'}
                        </span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <DropdownMenuLabel className="text-slate-900 dark:text-slate-100">Admin Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-700">
                         <Link href="/admin/profile" className="flex items-center gap-2 w-full text-slate-700 dark:text-slate-300">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-700">
                        <Link href="/admin/settings" className="flex items-center gap-2 w-full text-slate-700 dark:text-slate-300">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 text-red-600 dark:text-red-400">
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button" 
                            className="flex items-center gap-2 w-full"
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
        <div className="flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <span>☰</span>
                    {breadcrumbs && breadcrumbs.length === 1 && (
                        <span className="hidden sm:block">{breadcrumbs[0].title}</span>
                    )}
                </button>

                {/* Page Title */}
                {!breadcrumbs || breadcrumbs.length === 0 ? (
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white hidden sm:block">
                        {title}
                    </h1>
                ) : null}

                {/* Breadcrumbs for multiple items */}
                {breadcrumbs && breadcrumbs.length > 1 && (
                    <div className="flex items-center gap-2 text-sm">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <span className="text-slate-400 dark:text-slate-500">/</span>}
                                <span className={index === breadcrumbs.length - 1 
                                    ? 'text-slate-900 dark:text-white font-medium' 
                                    : 'text-slate-600 dark:text-slate-400'
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
                {/* Current Time */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                    <Clock size={16} className="text-slate-400 dark:text-slate-500" />
                    <span className="hidden md:inline font-medium">{currentTime || 'Loading...'}</span>
                    <span className="md:hidden font-medium">{currentTime ? currentTime.replace(' ', '') : '...'}</span>
                </div>

                {/* Notifications */}
                <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors relative">
                    <Bell size={18} className="text-slate-600 dark:text-slate-400" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </button>

                {/* Messages */}
                <button className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors relative">
                    <MessageCircle size={18} className="text-slate-600 dark:text-slate-400" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                </button>

                {/* User Profile Dropdown */}
                <UserProfileDropdown />
            </div>
        </div>
    );
}