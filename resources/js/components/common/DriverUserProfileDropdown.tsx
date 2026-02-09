// resources/js/components/common/DriverUserProfileDropdown.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { LogOut, Settings, User } from 'lucide-react';

interface DriverUserProfileDropdownProps {
    user: {
        name?: string;
        email?: string;
        avatar?: string;
    };
    getAvatarColor: () => string;
}

export default function DriverUserProfileDropdown({
    user,
    getAvatarColor,
}: DriverUserProfileDropdownProps) {
    const getUserInitials = () => {
        if (!user?.name) return 'D';
        return user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-accent">
                    <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                        <AvatarImage
                            src={user?.avatar || ''}
                            alt={user?.name || 'Driver'}
                        />
                        <AvatarFallback
                            className={`text-xs ${getAvatarColor()} font-medium text-white`}
                        >
                            {getUserInitials()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left sm:block">
                        <div className="text-sm leading-none font-medium">
                            {user?.name || 'Driver'}
                        </div>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                    <span>Driver Account</span>
                    <span className="mt-0.5 text-xs font-normal text-muted-foreground">
                        {user?.email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href="/DriverSide/Profile"
                        className="flex w-full cursor-pointer items-center gap-2"
                    >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/DriverSide/Settings"
                        className="flex w-full cursor-pointer items-center gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex w-full cursor-pointer items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                        preserveState={false}
                        preserveScroll={false}
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
