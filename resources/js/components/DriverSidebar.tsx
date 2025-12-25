// components/DriverSidebar.tsx
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';
import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Car, 
    DollarSign, 
    History, 
    BarChart3, 
    MessageCircle,
    Shield,
} from 'lucide-react';
import AppLogo from './app-logo';
import { type NavItem } from '@/types';

const driverNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/driver/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Go Online',
        href: '/driver/go-online',
        icon: Car,
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
];

export function DriverSidebar() {
    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset" 
            className="bg-background"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/driver/dashboard" prefetch>
                                <AppLogo />
                                <span className="sr-only">TriGo Driver</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={driverNavItems} />
            </SidebarContent>

        </Sidebar>
    );
}