// components/DriverSidebar.tsx
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
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
    TrendingUp,
    Heart,
} from 'lucide-react';
import DriverSidebarLogo from './driver-sidebar-logo';
import { type NavItem } from '@/types';

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
        title: 'Messages',
        href: '/driver/messages',
        icon: MessageCircle,
    },
    {
        title: 'Support',
        href: '/driver/support',
        icon: HelpCircle,
    },
    {
        title: 'Safety',
        href: '/driver/safety',
        icon: Shield,
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
                <DriverNavMain 
                    platformItems={platformNavItems}
                    workItems={workNavItems}
                    supportItems={supportNavItems}
                />
            </SidebarContent>

            <SidebarFooter className="border-t border-green-200/50 dark:border-green-800/30 bg-green-50/30 dark:bg-green-950/20 p-3 sm:p-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600/70 dark:text-green-400/70">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">Drive & Earn</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-green-600/50 dark:text-green-400/50">
                        <Heart className="h-3 w-3 fill-green-600/50 dark:fill-green-400/50" />
                        <span>TriGo Driver</span>
                    </div>
                    <div className="text-center text-[10px] text-green-600/40 dark:text-green-400/40 pt-1 border-t border-green-200/30 dark:border-green-800/30">
                        Questions? <Link href="/driver/support" className="underline hover:text-green-700 dark:hover:text-green-300">Get Support</Link>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}