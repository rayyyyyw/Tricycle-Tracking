// components/passenger-nav-main.tsx
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl, cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface PassengerNavMainProps {
    platformItems?: NavItem[];
    bookingItems?: NavItem[];
    accountItems?: NavItem[];
}

export function PassengerNavMain({ platformItems = [], bookingItems = [], accountItems = [] }: PassengerNavMainProps) {
    const page = usePage();
    
    // Check if an item is active
    const isItemActive = (item: NavItem): boolean => {
        if (item.href && page.url === resolveUrl(item.href)) {
            return true;
        }
        return false;
    };

    const renderNavItem = (item: NavItem) => {
        const active = isItemActive(item);
        return (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={{ children: item.title }}
                    className={cn(
                        "group relative transition-all duration-200",
                        "hover:bg-emerald-100/60 hover:shadow-sm dark:hover:bg-emerald-900/30",
                        active && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/20 font-medium shadow-sm border-l-2 border-emerald-500 dark:border-emerald-400"
                    )}
                >
                    <Link 
                        href={item.href || '#'} 
                        prefetch 
                        className="flex items-center w-full"
                    >
                        {item.icon && (
                            <item.icon 
                                className={cn(
                                    "h-4 w-4 shrink-0 transition-all duration-200",
                                    active 
                                        ? "text-emerald-600 dark:text-emerald-400" 
                                        : "text-emerald-600/70 dark:text-emerald-400/70 group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
                                )} 
                            />
                        )}
                        <span className={cn(
                            "truncate text-sm",
                            active ? "font-semibold text-emerald-700 dark:text-emerald-300" : "font-medium"
                        )}>
                            {item.title}
                        </span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

    return (
        <>
            {/* Platform Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel className="text-emerald-600/70 dark:text-emerald-400/70 font-semibold text-xs uppercase tracking-wider">Platform</SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {platformItems.map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* Booking & Rides Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel className="text-emerald-600/70 dark:text-emerald-400/70 font-semibold text-xs uppercase tracking-wider">Booking & Rides</SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {bookingItems.map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* Account & Support Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel className="text-emerald-600/70 dark:text-emerald-400/70 font-semibold text-xs uppercase tracking-wider">Account & Support</SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {accountItems.map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}
