import { Icon } from '@/components/icon';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="text-green-600/70 hover:text-green-700 hover:bg-green-100/60 dark:text-green-400/70 dark:hover:text-green-300 dark:hover:bg-green-900/30 transition-all duration-200"
                            >
                                <a
                                    href={resolveUrl(item.href)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {item.icon && (
                                        <Icon
                                            iconNode={item.icon}
                                            className="h-5 w-5"
                                        />
                                    )}
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
