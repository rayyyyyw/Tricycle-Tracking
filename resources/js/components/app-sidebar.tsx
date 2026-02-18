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
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    BusFront,
    Calendar,
    Car,
    ClipboardList,
    Heart,
    HelpCircle,
    LayoutGrid,
    Shield,
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
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        <Shield className="h-3 w-3" />
                        <span className="font-medium">Secure Admin Portal</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600/50 dark:text-emerald-400/50">
                        <Heart className="h-3 w-3 fill-emerald-600/50 dark:fill-emerald-400/50" />
                        <span>TriGo Admin Panel</span>
                    </div>
                    <div className="border-t border-emerald-200/30 pt-1 text-center text-[10px] text-emerald-600/40 dark:border-emerald-800/30 dark:text-emerald-400/40">
                        © {new Date().getFullYear()} TriGo. All rights reserved.
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
