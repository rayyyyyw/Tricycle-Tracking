import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { PassengerNavMain } from '@/components/passenger-nav-main';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Car, History, CreditCard, HelpCircle } from 'lucide-react';
import PassengerSidebarLogo from './passenger-sidebar-logo';
import { type NavItem } from '@/types';

const passengerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/passenger/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Book a Ride',
        href: '/BookRide',
        icon: Car,
    },
    {
        title: 'Ride History',
        href: '/passenger/ride-history',
        icon: History,
    },
    {
        title: 'Payment Methods',
        href: '#',
        icon: CreditCard,
    },
    {
        title: 'Support',
        href: '#',
        icon: HelpCircle,
    },
];

export function PassengerSidebar() {
    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset" 
            className="bg-gradient-to-b from-emerald-50/30 via-background to-background border-r border-emerald-200/50 dark:from-emerald-950/30 dark:via-background dark:to-background dark:border-emerald-800/30 shadow-sm"
        >
            <SidebarHeader className="border-b border-emerald-200/50 bg-emerald-50/50 backdrop-blur-sm px-3 py-4 sm:px-4 sm:py-5 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-all duration-200 rounded-lg group">
                            <Link href="/passenger/dashboard" prefetch className="flex items-center justify-center px-2 py-2.5 group/logo w-full">
                                <div className="transition-transform duration-200 group-hover/logo:scale-105 w-full">
                                    <PassengerSidebarLogo />
                                </div>
                                <span className="sr-only">TriGo Passenger</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 sm:px-3 py-4 sm:py-6 overflow-y-auto">
                <PassengerNavMain items={passengerNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}