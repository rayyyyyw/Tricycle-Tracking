// components/app-sidebar.tsx
import { NavFooter } from '@/components/nav-footer';
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
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    BusFront, 
    Users, 
    Car, 
    ClipboardList,
    BarChart3,
    HelpCircle
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Analytics & Reports',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Support',
        href: '/admin/support',
        icon: HelpCircle,
    },
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

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
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
                            <Link href={dashboard().url} prefetch className="flex items-center w-full">
                                <AppLogo />
                                <span className="sr-only">TriGo Admin</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 sm:px-3 py-4 sm:py-6 overflow-y-auto">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-emerald-200/50 dark:border-emerald-800/30">
                <NavFooter items={footerNavItems} className="mt-auto" />
                {/* Removed NavUser component from here */}
            </SidebarFooter>
        </Sidebar>
    );
}