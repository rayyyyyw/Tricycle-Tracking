// components/nav-main.tsx (FIXED)
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

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { state } = useSidebar();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    
    const isSidebarCollapsed = state === 'collapsed';
    
    // Check if an item or its children is active
    const isItemActive = (item: NavItem): boolean => {
        // Check main item
        if (item.href && page.url === resolveUrl(item.href)) {
            return true;
        }
        // Check children items
        if (item.items) {
            return item.items.some(subItem => page.url.startsWith(resolveUrl(subItem.href || '')));
        }
        return false;
    };

    // Check if a child item is active (for highlighting only the child)
    const isChildActive = (item: NavItem): boolean => {
        if (item.items) {
            return item.items.some(subItem => page.url.startsWith(resolveUrl(subItem.href || '')));
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

    const handleMouseEnter = (title: string) => {
        setHoveredItem(title);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const renderNavItem = (item: NavItem) => {
        const isActive = isItemActive(item);
        const isChildActiveItem = isChildActive(item);
        const isExpanded = expandedItems.has(item.title);
        const hasChildren = item.items && item.items.length > 0;
        const isHovered = hoveredItem === item.title;

        // Auto-expand if any child is active
        if (isChildActiveItem && !isExpanded) {
            setExpandedItems(prev => new Set([...prev, item.title]));
        }

        // Regular menu item (no nested items)
        if (!hasChildren) {
            return (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={{ children: item.title }}
                        className={`group relative transition-all duration-200 hover:bg-emerald-100/60 hover:shadow-sm dark:hover:bg-emerald-900/30 ${
                            isActive ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/20 font-medium shadow-sm border-l-2 border-emerald-500 dark:border-emerald-400' : ''
                        }`}
                    >
                        <Link 
                            href={item.href || '#'} 
                            prefetch 
                            className="flex items-center w-full"
                        >
                            {item.icon && (
                                <item.icon 
                                    className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                        isActive 
                                            ? 'text-emerald-600 dark:text-emerald-400' 
                                            : 'text-emerald-600/70 dark:text-emerald-400/70 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                                    }`}
                                />
                            )}
                            <span className={`truncate text-sm ${
                                isActive ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'font-medium'
                            }`}>
                                {item.title}
                            </span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        }

        // Collapsible menu item with nested items - CLICKABLE PARENT
        return (
            <div 
                key={item.title} 
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.title)}
                onMouseLeave={handleMouseLeave}
            >
                <SidebarMenuItem>
                    <div className={`flex items-center w-full rounded-md transition-all duration-200 ${
                        isHovered || isActive ? 'bg-green-100/60 shadow-sm dark:bg-green-900/30' : ''
                    } ${isActive ? 'bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20 font-medium border-l-2 border-green-500 dark:border-green-400' : ''}`}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={{ children: item.title }}
                            className={`flex-1 cursor-pointer transition-all duration-200 hover:bg-transparent group relative ${
                                isActive ? 'bg-transparent' : ''
                            }`}
                        >
                            <Link 
                                href={item.href || '#'} 
                                prefetch 
                                className="flex items-center w-full"
                            >
                                {item.icon && (
                                    <item.icon 
                                        className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                            isActive 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : 'text-green-600/70 dark:text-green-400/70 group-hover:text-green-700 dark:group-hover:text-green-300'
                                        }`}
                                    />
                                )}
                                <span className={`truncate text-sm ${
                                    isActive ? 'font-semibold text-green-700 dark:text-green-300' : 'font-medium'
                                }`}>
                                    {item.title}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                        
                        {/* Only show expand button when sidebar is not collapsed */}
                        {!isSidebarCollapsed && (
                            <button
                                onClick={(e) => toggleExpanded(item.title, e)}
                                className={`p-2 rounded-md transition-colors -mr-2 ${
                                    isHovered || isActive
                                        ? 'bg-green-100/60 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100/80 dark:hover:bg-green-900/40' 
                                        : 'hover:bg-green-100/60 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300'
                                }`}
                                aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200 text-green-600 dark:text-green-400" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 transition-transform duration-200 text-green-600 dark:text-green-400" />
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
                        <div className="ml-4 border-l border-green-200/50 dark:border-green-800/50 pl-2">
                            <SidebarMenu>
                                {item.items?.map((subItem) => {
                                    const subItemActive = page.url.startsWith(resolveUrl(subItem.href || ''));
                                    return (
                                        <SidebarMenuItem key={subItem.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={subItemActive}
                                                tooltip={{ children: subItem.title }}
                                                className={`group relative transition-all duration-200 hover:bg-green-100/60 hover:shadow-sm dark:hover:bg-green-900/30 ${
                                                    subItemActive ? 'bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20 font-medium shadow-sm border-l-2 border-green-500 dark:border-green-400' : ''
                                                }`}
                                            >
                                                <Link 
                                                    href={subItem.href || '#'} 
                                                    prefetch 
                                                    className="flex items-center w-full"
                                                >
                                                    {subItem.icon && (
                                                        <subItem.icon 
                                                            className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                                                subItemActive 
                                                                    ? 'text-green-600 dark:text-green-400' 
                                                                    : 'text-green-600/70 dark:text-green-400/70 group-hover:text-green-700 dark:group-hover:text-green-300'
                                                            }`}
                                                        />
                                                    )}
                                                    <span className={`truncate text-sm ${
                                                        subItemActive ? 'font-semibold text-green-700 dark:text-green-300' : 'font-medium'
                                                    }`}>
                                                        {subItem.title}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
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
                <SidebarGroupLabel className="text-green-600/70 dark:text-green-400/70 font-semibold text-xs uppercase tracking-wider">Platform</SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {items.slice(0, 1).map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* User Management Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel className="text-green-600/70 dark:text-green-400/70 font-semibold text-xs uppercase tracking-wider">User Management</SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {items.slice(1).map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}