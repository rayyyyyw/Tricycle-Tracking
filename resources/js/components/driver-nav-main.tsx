// components/driver-nav-main.tsx
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl, cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function DriverNavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    
    // Check if an item is active
    const isItemActive = (item: NavItem): boolean => {
        if (item.href && page.url === resolveUrl(item.href)) {
            return true;
        }
        return false;
    };

    return (
        <SidebarMenu className="space-y-1.5">
            {items.map((item) => {
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
            })}
        </SidebarMenu>
    );
}
