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
    BookOpen, 
    Folder, 
    LayoutGrid, 
    BusFront, 
    Users, 
    Car, 
    Shield,
    MessageSquare,
    BarChart,
    HelpCircle,
    Star
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
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
                icon: Shield,
            },
        ],
    },
];

const feedbackNavItems: NavItem[] = [
    {
        title: 'Customer Feedback',
        href: '/CustomerFeedback',
        icon: MessageSquare,
        items: [
            {
                title: 'Chat Messages',
                href: '/CustomerFeedback/Chats',
                icon: MessageSquare,
            },
            {
                title: 'Complaints',
                href: '/CustomerFeedback/Complaints',
                icon: HelpCircle,
            },
            {
                title: 'Ratings & Reviews',
                href: '/CustomerFeedback/Ratings',
                icon: Star,
            },
        ],
    },
];

const reportsNavItems: NavItem[] = [
    {
        title: 'Reports & Analytics',
        href: '/Reports',
        icon: BarChart,
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
        <Sidebar collapsible="icon" variant="inset" className="bg-sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                                <span className="sr-only">TriGo Admin</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain 
                    mainItems={mainNavItems}
                    feedbackItems={feedbackNavItems}
                    reportsItems={reportsNavItems}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}