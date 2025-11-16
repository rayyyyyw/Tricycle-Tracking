// components/PassengerNavbar.tsx
import { type ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { PassengerSidebar } from '@/components/PassengerSidebar';
import { type BreadcrumbItem } from '@/types'; // Make sure this import exists
import { Link } from '@inertiajs/react';
import { Bell, MessageCircle, MapPin, Car } from 'lucide-react';

interface PassengerNavbarProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function PassengerNavbar({ breadcrumbs = [] }: PassengerNavbarProps) {
    const { toggleSidebar } = useSidebar();

    return (
        <div className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6">
            {/* Left Side - Breadcrumbs & Menu Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="flex items-center gap-2 text-sm font-medium text-card-foreground hover:text-foreground cursor-pointer p-2 rounded-md hover:bg-accent"
                >
                    <span>☰</span>
                    {breadcrumbs && breadcrumbs.length === 1 && (
                        <span className="hidden sm:block">{breadcrumbs[0].title}</span>
                    )}
                </button>

                {/* Breadcrumbs for multiple items */}
                {breadcrumbs && breadcrumbs.length > 1 && (
                    <div className="flex items-center gap-2 text-sm">
                        {breadcrumbs.map((breadcrumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <span className="text-muted-foreground">/</span>}
                                <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                    {breadcrumb.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Side - Navigation Icons */}
            <div className="flex items-center gap-4">
                {/* Current Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} />
                    <span className="hidden md:inline">Manila, PH</span>
                </div>

                {/* Notifications */}
                <button className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                    <Bell size={18} />
                </button>

                {/* Messages */}
                <button className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                    <MessageCircle size={18} />
                </button>

                {/* User Profile (if not in sidebar) */}
                {/* <UserNav /> */}
            </div>
        </div>
    );
}