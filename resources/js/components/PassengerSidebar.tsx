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
import { LayoutGrid, Car, History, Heart, HelpCircle, Shield } from 'lucide-react';
import PassengerSidebarLogo from './passenger-sidebar-logo';
import { type NavItem } from '@/types';

// Platform section items
const platformNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/passenger/dashboard',
        icon: LayoutGrid,
    },
];

// Booking & Rides section items
const bookingNavItems: NavItem[] = [
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
];

// Account & Support section items
const accountNavItems: NavItem[] = [
    {
        title: 'Saved & Favorites',
        href: '/passenger/saved-places',
        icon: Heart,
    },
    {
        title: 'Support',
        href: '/passenger/support',
        icon: HelpCircle,
    },
    {
        title: 'Safety',
        href: '/passenger/safety',
        icon: Shield,
    },
];

export function PassengerSidebar() {
    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset" 
            className="bg-linear-to-b from-emerald-50/30 via-background to-background border-r border-emerald-200/50 dark:from-emerald-950/30 dark:via-background dark:to-background dark:border-emerald-800/30 shadow-sm"
        >
            <SidebarHeader className="border-b border-emerald-200/50 bg-emerald-50/50 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-emerald-950/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/passenger/dashboard" prefetch className="flex items-center w-full">
                                <PassengerSidebarLogo />
                                <span className="sr-only">TriGo Passenger</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 sm:px-3 py-4 sm:py-6 overflow-y-auto">
                <PassengerNavMain 
                    platformItems={platformNavItems}
                    bookingItems={bookingNavItems}
                    accountItems={accountNavItems}
                />
            </SidebarContent>
        </Sidebar>
    );
}