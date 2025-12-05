// components/nav-main.tsx
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface NavMainProps {
    mainItems?: NavItem[];
    feedbackItems?: NavItem[];
    reportsItems?: NavItem[];
}

export function NavMain({ 
    mainItems = [], 
    feedbackItems = [], 
    reportsItems = [] 
}: NavMainProps) {
    const page = usePage();
    const { state } = useSidebar();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    
    const isSidebarCollapsed = state === 'collapsed';
    
    // Check if an item or its children is active
    const isItemActive = (item: NavItem): boolean => {
        if (item.href && page.url.startsWith(resolveUrl(item.href))) {
            return true;
        }
        if (item.items) {
            return item.items.some(subItem => isItemActive(subItem));
        }
        return false;
    };

    const toggleExpanded = (title: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }
            return newSet;
        });
    };

    const renderNavItem = (item: NavItem) => {
        const isActive = isItemActive(item);
        const isExpanded = expandedItems.has(item.title);
        const hasChildren = item.items && item.items.length > 0;

        // Regular menu item (no nested items)
        if (!hasChildren) {
            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href || '#'} prefetch>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        }

        // Collapsible menu item with nested items - CLICKABLE PARENT
        return (
            <div key={item.title}>
                <SidebarMenuItem>
                    <div className="flex items-center w-full">
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={{ children: item.title }}
                            className="flex-1 cursor-pointer"
                        >
                            <Link href={item.href || '#'} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                        
                        {/* Only show expand button when sidebar is not collapsed */}
                        {!isSidebarCollapsed && (
                            <button
                                onClick={(e) => toggleExpanded(item.title, e)}
                                className="p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors ml-1 flex-shrink-0"
                                aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                                ) : (
                                    <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                                )}
                            </button>
                        )}
                    </div>
                </SidebarMenuItem>
                
                {/* Nested items with smooth animation - only show when not collapsed */}
                {!isSidebarCollapsed && (
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="ml-4 border-l border-sidebar-border pl-2">
                            <SidebarMenu>
                                {item.items?.map((subItem) => (
                                    <SidebarMenuItem key={subItem.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={page.url.startsWith(resolveUrl(subItem.href || ''))}
                                            tooltip={{ children: subItem.title }}
                                        >
                                            <Link href={subItem.href || '#'} prefetch>
                                                {subItem.icon && <subItem.icon />}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Platform Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                <SidebarMenu>
                    {mainItems.slice(0, 1).map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* User Management Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>User Management</SidebarGroupLabel>
                <SidebarMenu>
                    {mainItems.slice(1).map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* Customer Feedback Section */}
            {feedbackItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Customer Feedback</SidebarGroupLabel>
                    <SidebarMenu>
                        {feedbackItems.map((item) => renderNavItem(item))}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {/* Reports & Analytics Section */}
            {reportsItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Reports & Analytics</SidebarGroupLabel>
                    <SidebarMenu>
                        {reportsItems.map((item) => renderNavItem(item))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </>
    );
}