// components/app-sidebar.tsx
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    BusFront,
    Calendar,
    Car,
    ClipboardList,
    HelpCircle,
    LayoutGrid,
    Star,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

// Platform section items
const platformNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Bookings',
        href: '/admin/bookings',
        icon: Calendar,
    },
    {
        title: 'Analytics & Reports',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Activity Logs',
        href: '/admin/activity-logs',
        icon: Activity,
    },
    {
        title: 'General Queries',
        href: '/admin/support',
        icon: HelpCircle,
    },
    {
        title: 'Ratings',
        href: '/admin/ratings',
        icon: Star,
    },
];

// User Management section items
const userManagementNavItems: NavItem[] = [
    {
        title: 'Tricycle Management',
        href: '/TricycleM',
        icon: BusFront,
    },
    {
        title: 'Passenger Management',
        href: '/PassengerM',
        icon: Users,
    },
    {
        title: 'Driver Management',
        href: '/DriverM',
        icon: Car,
        items: [
            {
                title: 'Driver Applications',
                href: '/DriverM/Application',
                icon: ClipboardList,
            },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-emerald-200/50 bg-linear-to-b from-emerald-50/30 via-background to-background shadow-sm dark:border-emerald-800/30 dark:from-emerald-950/30 dark:via-background dark:to-background"
        >
            <SidebarHeader className="border-b border-emerald-200/50 bg-emerald-50/50 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-emerald-950/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href="/dashboard"
                                prefetch
                                className="flex w-full items-center"
                            >
                                <AppLogo />
                                <span className="sr-only">TriGo Admin</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto px-2 py-4 sm:px-3 sm:py-6">
                <NavMain
                    platformItems={platformNavItems}
                    userManagementItems={userManagementNavItems}
                />
            </SidebarContent>

            <SidebarFooter className="border-t border-emerald-200/50 bg-emerald-50/30 p-3 sm:p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                {user && (
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Avatar className="h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                            <AvatarImage
                                src={user.avatar}
                                alt={user.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                {(user.name || 'A')
                                    .split(/\s+/)
                                    .map((s) => s[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-emerald-800 dark:text-emerald-200">
                                {user.name || 'Admin'}
                            </p>
                            <p className="truncate text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                                {user.email || ''}
                            </p>
                        </div>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
