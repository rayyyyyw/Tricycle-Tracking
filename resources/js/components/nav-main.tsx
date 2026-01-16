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
                        className="w-full"
                    >
                        <Link href={item.href || '#'} prefetch className="flex items-center gap-3">
                            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                            <span className="truncate">{item.title}</span>
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
                    <div className={`flex items-center w-full rounded-md transition-colors ${
                        isHovered ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                    }`}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={{ children: item.title }}
                            className={`flex-1 cursor-pointer transition-colors ${
                                isHovered ? 'hover:bg-transparent' : ''
                            }`}
                        >
                            <Link href={item.href || '#'} prefetch className="flex-1 flex items-center gap-3">
                                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                <span className="truncate">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                        
                        {/* Only show expand button when sidebar is not collapsed */}
                        {!isSidebarCollapsed && (
                            <button
                                onClick={(e) => toggleExpanded(item.title, e)}
                                className={`p-2 rounded-md transition-colors -mr-2 ${
                                    isHovered 
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90' 
                                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`}
                                aria-label={isExpanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
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
                                            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        >
                                            <Link href={subItem.href || '#'} prefetch className="flex items-center gap-3">
                                                {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                                                <span className="truncate">{subItem.title}</span>
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
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                    {items.slice(0, 1).map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* User Management Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>User Management</SidebarGroupLabel>
                <SidebarMenu>
                    {items.slice(1).map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}