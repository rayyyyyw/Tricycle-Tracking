// resources/js/components/common/PassengerUserProfileDropdown.tsx
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

interface PassengerUserProfileDropdownProps {
    user: {
        name?: string;
        email?: string;
        avatar?: string;
    };
}

export default function PassengerUserProfileDropdown({
    user,
}: PassengerUserProfileDropdownProps) {
    const getUserInitials = (): string => {
        return user?.name
            ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
            : 'U';
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-accent">
                    <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage
                            src={user?.avatar || ''}
                            alt={user?.name || 'User'}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                            {getUserInitials()} {/* Use the function here */}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:block">
                        {user?.name || 'User'}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href="/PassengerSide/profile"
                        className="flex w-full cursor-pointer items-center gap-2"
                    >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/PassengerSide/settings"
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
                        className="flex w-full cursor-pointer items-center gap-2 text-red-600"
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
