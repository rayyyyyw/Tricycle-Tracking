// components/common/UserProfileDropdown.tsx
// components/common/UserProfileDropdown.tsx
import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User, Settings, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfileDropdownProps {
    user: {
        name?: string;
        email?: string;
    };
    adminProfile?: {
        avatar?: string;
        avatar_url?: string | null;
    };
}

/** Use full URL from backend when present (R2); otherwise /storage/ path for local. */
function getDisplayAvatarUrl(adminProfile: UserProfileDropdownProps['adminProfile'], authAvatar: string | null | undefined): string | undefined {
    if (authAvatar && (authAvatar.startsWith('http') || authAvatar.startsWith('//'))) return authAvatar;
    if (adminProfile?.avatar_url && (adminProfile.avatar_url.startsWith('http') || adminProfile.avatar_url.startsWith('//'))) return adminProfile.avatar_url;
    if (adminProfile?.avatar) return `/storage/${adminProfile.avatar}`;
    return undefined;
}

export default function UserProfileDropdown({ user, adminProfile }: UserProfileDropdownProps) {
    const authUser = usePage().props?.auth?.user as { avatar?: string | null } | undefined;
    const getUserInitials = (): string => {
        return user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'A';
    };

    const getAvatarUrl = (): string | undefined => {
        return getDisplayAvatarUrl(adminProfile, authUser?.avatar ?? undefined);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium overflow-hidden">
                        {getAvatarUrl() ? (
                            <img
                                src={getAvatarUrl()}
                                alt={user?.name || 'Admin'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span>{getUserInitials()}</span>
                        )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                        {user?.name || 'Admin'}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Profile Section */}
                <DropdownMenuItem asChild>
                     <Link 
                        href="/AdminNav/Profile" 
                        className="cursor-pointer flex items-center gap-2 w-full"
                    >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                
                {/* Settings Section */}
                <DropdownMenuItem asChild>
                    <Link 
                        href="/AdminNav/Settings" 
                        className="cursor-pointer flex items-center gap-2 w-full"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Logout */}
                <DropdownMenuItem asChild>
                    <Link 
                        href="/logout" 
                        method="post" 
                        as="button" 
                        className="cursor-pointer flex items-center gap-2 w-full text-red-600 focus:text-red-600"
                        preserveState={false}
                        preserveScroll={false}
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}