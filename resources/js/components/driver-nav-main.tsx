// components/driver-nav-main.tsx
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

interface DriverNavMainProps {
    platformItems?: NavItem[];
    workItems?: NavItem[];
    supportItems?: NavItem[];
}

export function DriverNavMain({ platformItems = [], workItems = [], supportItems = [] }: DriverNavMainProps) {
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
                        "hover:bg-green-100/60 hover:shadow-sm dark:hover:bg-green-900/30",
                        active && "bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20 font-medium shadow-sm border-l-2 border-green-500 dark:border-green-400"
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
                                        ? "text-green-600 dark:text-green-400" 
                                        : "text-green-600/70 dark:text-green-400/70 group-hover:text-green-700 dark:group-hover:text-green-300"
                                )} 
                            />
                        )}
                        <span className={cn(
                            "truncate text-sm",
                            active ? "font-semibold text-green-700 dark:text-green-300" : "font-medium"
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
                <SidebarGroupLabel className="text-green-600/70 dark:text-green-400/70 font-semibold text-xs uppercase tracking-wider">Platform</SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {platformItems.map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* Work & Earnings Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel className="text-green-600/70 dark:text-green-400/70 font-semibold text-xs uppercase tracking-wider">Work & Earnings</SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {workItems.map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* Support & Safety Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel className="text-green-600/70 dark:text-green-400/70 font-semibold text-xs uppercase tracking-wider">Support & Safety</SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {supportItems.map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}
