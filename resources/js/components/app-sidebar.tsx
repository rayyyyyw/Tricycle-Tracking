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
    HelpCircle,
    Heart,
    Shield
} from 'lucide-react';
import AppLogo from './app-logo';

// Platform section items
const platformNavItems: NavItem[] = [
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
        title: 'General Queries',
        href: '/admin/support',
        icon: HelpCircle,
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
                <NavMain platformItems={platformNavItems} userManagementItems={userManagementNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-950/20 p-3 sm:p-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        <Shield className="h-3 w-3" />
                        <span className="font-medium">Secure Admin Portal</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600/50 dark:text-emerald-400/50">
                        <Heart className="h-3 w-3 fill-emerald-600/50 dark:fill-emerald-400/50" />
                        <span>TriGo Admin Panel</span>
                    </div>
                    <div className="text-center text-[10px] text-emerald-600/40 dark:text-emerald-400/40 pt-1 border-t border-emerald-200/30 dark:border-emerald-800/30">
                        © {new Date().getFullYear()} TriGo. All rights reserved.
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}