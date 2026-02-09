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

interface NavMainProps {
    platformItems?: NavItem[];
    userManagementItems?: NavItem[];
}

export function NavMain({
    platformItems = [],
    userManagementItems = [],
}: NavMainProps) {
    const page = usePage();
    const { state } = useSidebar();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const isSidebarCollapsed = state === 'collapsed';

    // Check if an item is active - only the exact route, not parent when child is active
    const isItemActive = (item: NavItem): boolean => {
        if (item.href && page.url === resolveUrl(item.href)) {
            return true;
        }
        return false;
    };

    // Check if a child item is active (for highlighting only the child)
    const isChildActive = (item: NavItem): boolean => {
        if (item.items) {
            return item.items.some((subItem) =>
                page.url.startsWith(resolveUrl(subItem.href || '')),
            );
        }
        return false;
    };

    const toggleExpanded = (title: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setExpandedItems((prev) => {
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
            setExpandedItems((prev) => new Set([...prev, item.title]));
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
                            isActive
                                ? 'border-l-2 border-emerald-500 bg-emerald-500/10 font-medium text-emerald-700 shadow-sm dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : ''
                        }`}
                    >
                        <Link
                            href={item.href || '#'}
                            prefetch
                            className="flex w-full items-center"
                        >
                            {item.icon && (
                                <item.icon
                                    className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                        isActive
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-emerald-600/70 group-hover:text-emerald-700 dark:text-emerald-400/70 dark:group-hover:text-emerald-300'
                                    }`}
                                />
                            )}
                            <span
                                className={`truncate text-sm ${
                                    isActive
                                        ? 'font-semibold text-emerald-700 dark:text-emerald-300'
                                        : 'font-medium'
                                }`}
                            >
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
                    <div
                        className={`flex w-full items-center rounded-md transition-all duration-200 ${
                            isHovered || isActive
                                ? 'bg-green-100/60 shadow-sm dark:bg-green-900/30'
                                : ''
                        } ${isActive ? 'border-l-2 border-green-500 bg-green-500/10 font-medium text-green-700 dark:border-green-400 dark:bg-green-500/20 dark:text-green-400' : ''}`}
                    >
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={{ children: item.title }}
                            className={`group relative flex-1 cursor-pointer transition-all duration-200 hover:bg-transparent ${
                                isActive ? 'bg-transparent' : ''
                            }`}
                        >
                            <Link
                                href={item.href || '#'}
                                prefetch
                                className="flex w-full items-center"
                            >
                                {item.icon && (
                                    <item.icon
                                        className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                            isActive
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-green-600/70 group-hover:text-green-700 dark:text-green-400/70 dark:group-hover:text-green-300'
                                        }`}
                                    />
                                )}
                                <span
                                    className={`truncate text-sm ${
                                        isActive
                                            ? 'font-semibold text-green-700 dark:text-green-300'
                                            : 'font-medium'
                                    }`}
                                >
                                    {item.title}
                                </span>
                            </Link>
                        </SidebarMenuButton>

                        {/* Only show expand button when sidebar is not collapsed */}
                        {!isSidebarCollapsed && (
                            <button
                                onClick={(e) => toggleExpanded(item.title, e)}
                                className={`-mr-2 rounded-md p-2 transition-colors ${
                                    isHovered || isActive
                                        ? 'bg-green-100/60 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40'
                                        : 'hover:bg-green-100/60 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-300'
                                }`}
                                aria-label={
                                    isExpanded
                                        ? `Collapse ${item.title}`
                                        : `Expand ${item.title}`
                                }
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-green-600 transition-transform duration-200 dark:text-green-400" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-green-600 transition-transform duration-200 dark:text-green-400" />
                                )}
                            </button>
                        )}
                    </div>
                </SidebarMenuItem>

                {/* Nested items with smooth animation - only show when not collapsed */}
                {!isSidebarCollapsed && (
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded
                                ? 'max-h-32 opacity-100'
                                : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="ml-4 pl-2">
                            <SidebarMenu>
                                {item.items?.map((subItem) => {
                                    const subItemActive = page.url.startsWith(
                                        resolveUrl(subItem.href || ''),
                                    );
                                    return (
                                        <SidebarMenuItem key={subItem.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={subItemActive}
                                                tooltip={{
                                                    children: subItem.title,
                                                }}
                                                className={`group relative transition-all duration-200 hover:bg-green-100/60 hover:shadow-sm dark:hover:bg-green-900/30 ${
                                                    subItemActive
                                                        ? 'border-l-2 border-green-500 bg-green-500/10 font-medium text-green-700 shadow-sm dark:border-green-400 dark:bg-green-500/20 dark:text-green-400'
                                                        : ''
                                                }`}
                                            >
                                                <Link
                                                    href={subItem.href || '#'}
                                                    prefetch
                                                    className="flex w-full items-center"
                                                >
                                                    {subItem.icon && (
                                                        <subItem.icon
                                                            className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                                                                subItemActive
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-green-600/70 group-hover:text-green-700 dark:text-green-400/70 dark:group-hover:text-green-300'
                                                            }`}
                                                        />
                                                    )}
                                                    <span
                                                        className={`truncate text-sm ${
                                                            subItemActive
                                                                ? 'font-semibold text-green-700 dark:text-green-300'
                                                                : 'font-medium'
                                                        }`}
                                                    >
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
                <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-emerald-600/70 uppercase dark:text-emerald-400/70">
                    Platform
                </SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {platformItems.map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>

            {/* User Management Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-emerald-600/70 uppercase dark:text-emerald-400/70">
                    User Management
                </SidebarGroupLabel>
                <SidebarMenu className="space-y-1.5">
                    {userManagementItems.map((item) => renderNavItem(item))}
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}
