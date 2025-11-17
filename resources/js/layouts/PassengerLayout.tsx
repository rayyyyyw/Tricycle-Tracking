import { type ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { PassengerSidebar } from '@/components/PassengerSidebar';
import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, MessageCircle, MapPin, Car, User, Settings, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';

interface PassengerLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

// Move all components that use useSidebar INSIDE the SidebarProvider
function SidebarContent({ children, breadcrumbs }: PassengerLayoutProps) {
    const [defaultCollapsed, setDefaultCollapsed] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('passenger-sidebar-collapsed');
            if (saved) {
                setDefaultCollapsed(JSON.parse(saved));
            }
        }
    }, []);

    return (
        <SidebarProvider 
            defaultOpen={!defaultCollapsed} // Use defaultOpen instead of defaultCollapsed
            // OR try one of these alternatives:
            // defaultState={defaultCollapsed ? "collapsed" : "expanded"}
            // collapsed={defaultCollapsed}
        >
            <LayoutContent breadcrumbs={breadcrumbs}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}

// This component now has access to useSidebar
function LayoutContent({ children, breadcrumbs }: PassengerLayoutProps) {
    const { state, toggleSidebar } = useSidebar(); // Use the correct properties from your sidebar
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Save sidebar state to localStorage
    useEffect(() => {
        const isCollapsed = state === 'collapsed';
        localStorage.setItem('passenger-sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [state]);

    // User Profile Dropdown Component
    const UserProfileDropdown = () => {
        const getUserInitials = () => {
            if (!user?.name) return 'U';
            return user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        };

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                            {getUserInitials()}
                        </div>
                        <span className="text-sm font-medium hidden sm:block">
                            {user?.name || 'User'}
                        </span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                         <Link href="/PassengerSide/profile" className="cursor-pointer flex items-center gap-2 w-full">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/PassengerSide/settings" className="cursor-pointer flex items-center gap-2 w-full">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button" 
                            className="cursor-pointer flex items-center gap-2 w-full text-red-600 focus:text-red-600"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    // PassengerNavbar Component - now inside SidebarProvider
    const PassengerNavbar = ({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) => {
        return (
            <div className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6">
                {/* Left Side - Menu Toggle & Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center gap-2 text-sm font-medium text-card-foreground hover:text-foreground cursor-pointer p-2 rounded-md hover:bg-accent transition-colors"
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

                {/* Right Side - Navigation Items */}
                <div className="flex items-center gap-4">
                    {/* Current Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={16} />
                        <span className="hidden md:inline">Manila, PH</span>
                    </div>

                    {/* Become a Driver Button */}
                    <Link 
                        href="/become-driver" 
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Car size={16} />
                        <span>Become a Driver</span>
                    </Link>

                    {/* Notifications */}
                    <button className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                        <Bell size={18} />
                    </button>

                    {/* Messages */}
                    <button className="p-2 rounded-md hover:bg-accent hover:text-foreground transition-colors">
                        <MessageCircle size={18} />
                    </button>

                    {/* User Profile Dropdown */}
                    <UserProfileDropdown />
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen w-full bg-background">
            <PassengerSidebar />
            
            <div className="flex-1 min-w-0 flex flex-col">
                <PassengerNavbar breadcrumbs={breadcrumbs} />
                
                <main className="flex-1 min-w-0 overflow-auto">
                    <div className="p-6 w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function PassengerLayout({ children, breadcrumbs }: PassengerLayoutProps) {
    const passengerBreadcrumbs = breadcrumbs || [
        { 
            title: 'Dashboard', 
            href: '/passenger/dashboard' 
        }
    ];

    return (
        <SidebarContent breadcrumbs={passengerBreadcrumbs}>
            {children}
        </SidebarContent>
    );
}