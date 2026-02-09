// components/common/UserProfileDropdown.tsx
// components/common/UserProfileDropdown.tsx
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, Settings, User } from 'lucide-react';

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
function getDisplayAvatarUrl(
    adminProfile: UserProfileDropdownProps['adminProfile'],
    authAvatar: string | null | undefined,
): string | undefined {
    if (
        authAvatar &&
        (authAvatar.startsWith('http') || authAvatar.startsWith('//'))
    )
        return authAvatar;
    if (
        adminProfile?.avatar_url &&
        (adminProfile.avatar_url.startsWith('http') ||
            adminProfile.avatar_url.startsWith('//'))
    )
        return adminProfile.avatar_url;
    if (adminProfile?.avatar) return `/storage/${adminProfile.avatar}`;
    return undefined;
}

export default function UserProfileDropdown({
    user,
    adminProfile,
}: UserProfileDropdownProps) {
    const authUser = usePage().props?.auth?.user as
        | { avatar?: string | null }
        | undefined;
    const getUserInitials = (): string => {
        return user?.name
            ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
            : 'A';
    };

    const getAvatarUrl = (): string | undefined => {
        return getDisplayAvatarUrl(adminProfile, authUser?.avatar ?? undefined);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-accent">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-medium text-primary-foreground">
                        {getAvatarUrl() ? (
                            <img
                                src={getAvatarUrl()}
                                alt={user?.name || 'Admin'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{getUserInitials()}</span>
                        )}
                    </div>
                    <span className="hidden text-sm font-medium sm:block">
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
                        className="flex w-full cursor-pointer items-center gap-2"
                    >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>

                {/* Settings Section */}
                <DropdownMenuItem asChild>
                    <Link
                        href="/AdminNav/Settings"
                        className="flex w-full cursor-pointer items-center gap-2"
                    >
                        <Settings className="h-4 w-4" />
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
                        className="flex w-full cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
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
