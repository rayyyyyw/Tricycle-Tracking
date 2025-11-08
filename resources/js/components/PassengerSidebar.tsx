import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Car, History, CreditCard, HelpCircle } from 'lucide-react';
import AppLogo from './app-logo';
import { type NavItem } from '@/types';

const passengerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/passenger/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Book a Ride',
        href: '#',
        icon: Car,
    },
    {
        title: 'Ride History',
        href: '#',
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
            className="bg-white border-r border-gray-200"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/passenger/dashboard" prefetch>
                                <AppLogo />
                                <span className="sr-only">TriGo Passenger</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={passengerNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}