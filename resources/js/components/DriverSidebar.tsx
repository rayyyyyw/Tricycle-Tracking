// components/DriverSidebar.tsx
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { DriverNavMain } from '@/components/driver-nav-main';
import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    DollarSign, 
    History, 
    BarChart3, 
    MessageCircle,
    Shield,
    ClipboardList,
    HelpCircle,
} from 'lucide-react';
import DriverSidebarLogo from './driver-sidebar-logo';
import { type NavItem } from '@/types';

const driverNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/driver/dashboard',
        icon: LayoutGrid,
    },
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
    {
        title: 'Messages',
        href: '/driver/messages',
        icon: MessageCircle,
    },
    {
        title: 'Safety',
        href: '/driver/safety',
        icon: Shield,
    },
    {
        title: 'Support',
        href: '/driver/support',
        icon: HelpCircle,
    },
];

export function DriverSidebar() {
    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset" 
            className="bg-linear-to-b from-green-50/30 via-background to-background border-r border-green-200/50 dark:from-green-950/30 dark:via-background dark:to-background dark:border-green-800/30 shadow-sm"
        >
            <SidebarHeader className="border-b border-green-200/50 bg-green-50/50 backdrop-blur-sm dark:border-green-800/30 dark:bg-green-950/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/driver/dashboard" prefetch className="flex items-center w-full">
                                <DriverSidebarLogo />
                                <span className="sr-only">TriGo Driver</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 sm:px-3 py-4 sm:py-6 overflow-y-auto">
                <DriverNavMain items={driverNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}