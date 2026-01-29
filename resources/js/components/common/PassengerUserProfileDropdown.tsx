// resources/js/components/common/PassengerUserProfileDropdown.tsx
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

interface PassengerUserProfileDropdownProps {
    user: {
        name?: string;
        email?: string;
        avatar?: string;
    };
}

export default function PassengerUserProfileDropdown({ user }: PassengerUserProfileDropdownProps) {
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
                            {getUserInitials()} {/* Use the function here */}
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