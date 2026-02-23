// components/DriverSidebar.tsx
import { DriverNavMain } from '@/components/driver-nav-main';
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
    BarChart3,
    ClipboardList,
    DollarSign,
    HelpCircle,
    History,
    LayoutGrid,
    MessageSquare,
    Shield,
} from 'lucide-react';
import DriverSidebarLogo from './driver-sidebar-logo';

// Platform section items
const platformNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/driver/dashboard',
        icon: LayoutGrid,
    },
];

// Work & Earnings section items
const workNavItems: NavItem[] = [
    {
        title: 'Bookings',
        href: '/driver/bookings',
        icon: ClipboardList,
    },
    {
        title: 'Earnings',
        href: '/driver/earnings',
        icon: DollarSign,
    },
    {
        title: 'Ride History',
        href: '/driver/ride-history',
        icon: History,
    },
    {
        title: 'Analytics',
        href: '/driver/analytics',
        icon: BarChart3,
    },
];

// Support & Safety section items
const supportNavItems: NavItem[] = [
    {
        title: 'Support and Queries',
        href: '/driver/support',
        icon: HelpCircle,
    },
    {
        title: 'Safety',
        href: '/driver/safety',
        icon: Shield,
    },
    {
        title: 'Feedback',
        href: '/driver/feedback',
        icon: MessageSquare,
    },
];

export function DriverSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-green-200/50 bg-linear-to-b from-green-50/30 via-background to-background shadow-sm dark:border-green-800/30 dark:from-green-950/30 dark:via-background dark:to-background"
        >
            <SidebarHeader className="border-b border-green-200/50 bg-green-50/50 backdrop-blur-sm dark:border-green-800/30 dark:bg-green-950/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href="/driver/dashboard"
                                prefetch
                                className="flex w-full items-center"
                            >
                                <DriverSidebarLogo />
                                <span className="sr-only">TriGo Driver</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto px-2 py-4 sm:px-3 sm:py-6">
                <DriverNavMain
                    platformItems={platformNavItems}
                    workItems={workNavItems}
                    supportItems={supportNavItems}
                />
            </SidebarContent>

            <SidebarFooter className="border-t border-green-200/50 bg-green-50/30 p-3 sm:p-4 dark:border-green-800/30 dark:bg-green-950/20">
                {user && (
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Avatar className="h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                            <AvatarImage
                                src={user.avatar}
                                alt={user.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                {(user.name || 'D')
                                    .split(/\s+/)
                                    .map((s) => s[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-green-800 dark:text-green-200">
                                {user.name || 'Driver'}
                            </p>
                            <p className="truncate text-[10px] text-green-600/80 dark:text-green-400/80">
                                {user.email || ''}
                            </p>
                        </div>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
