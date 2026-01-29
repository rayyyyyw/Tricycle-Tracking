// resources/js/components/common/DriverUserProfileDropdown.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { User, Settings, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DriverUserProfileDropdownProps {
    user: {
        name?: string;
        email?: string;
        avatar?: string;
    };
    getAvatarColor: () => string;
}

export default function DriverUserProfileDropdown({ user, getAvatarColor }: DriverUserProfileDropdownProps) {
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
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer border border-transparent hover:border-border">
                    <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
                        <AvatarImage 
                            src={user?.avatar || ''} 
                            alt={user?.name || 'Driver'} 
                        />
                        <AvatarFallback className={`text-xs ${getAvatarColor()} text-white font-medium`}>
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium leading-none">
                            {user?.name || 'Driver'}
                        </div>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                    <span>Driver Account</span>
                    <span className="text-xs font-normal text-muted-foreground mt-0.5">
                        {user?.email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                     <Link href="/DriverSide/Profile" className="cursor-pointer flex items-center gap-2 w-full">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/DriverSide/Settings" className="cursor-pointer flex items-center gap-2 w-full">
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
                        className="cursor-pointer flex items-center gap-2 w-full text-red-600 focus:text-red-600 focus:bg-red-50"
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