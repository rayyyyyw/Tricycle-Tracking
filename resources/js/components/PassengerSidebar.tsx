import { PassengerNavMain } from '@/components/passenger-nav-main';
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
    Car,
    Heart,
    HelpCircle,
    History,
    LayoutGrid,
    Shield,
    Sparkles,
} from 'lucide-react';
import PassengerSidebarLogo from './passenger-sidebar-logo';

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
        title: 'Support and Queries',
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
            className="border-r border-emerald-200/50 bg-linear-to-b from-emerald-50/30 via-background to-background shadow-sm dark:border-emerald-800/30 dark:from-emerald-950/30 dark:via-background dark:to-background"
        >
            <SidebarHeader className="border-b border-emerald-200/50 bg-emerald-50/50 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-emerald-950/20">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href="/passenger/dashboard"
                                prefetch
                                className="flex w-full items-center"
                            >
                                <PassengerSidebarLogo />
                                <span className="sr-only">TriGo Passenger</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto px-2 py-4 sm:px-3 sm:py-6">
                <PassengerNavMain
                    platformItems={platformNavItems}
                    bookingItems={bookingNavItems}
                    accountItems={accountNavItems}
                />
            </SidebarContent>

            <SidebarFooter className="border-t border-emerald-200/50 bg-emerald-50/30 p-3 sm:p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        <Sparkles className="h-3 w-3" />
                        <span className="font-medium">
                            Safe & Reliable Rides
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600/50 dark:text-emerald-400/50">
                        <Heart className="h-3 w-3 fill-emerald-600/50 dark:fill-emerald-400/50" />
                        <span>TriGo Passenger</span>
                    </div>
                    <div className="border-t border-emerald-200/30 pt-1 text-center text-[10px] text-emerald-600/40 dark:border-emerald-800/30 dark:text-emerald-400/40">
                        Need help? Visit{' '}
                        <Link
                            href="/passenger/support"
                            className="underline hover:text-emerald-700 dark:hover:text-emerald-300"
                        >
                            Support
                        </Link>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
