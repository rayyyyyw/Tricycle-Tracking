import { type ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { PassengerSidebar } from '@/components/PassengerSidebar';
import { PassengerNavbar } from '@/components/PassengerNavbar'; // Import the separate component
import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { User, Settings, LogOut } from 'lucide-react';
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
        <SidebarProvider defaultOpen={!defaultCollapsed}>
            <LayoutContent breadcrumbs={breadcrumbs}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}

function LayoutContent({ children, breadcrumbs }: PassengerLayoutProps) {
    const { state } = useSidebar();
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

    return (
        <div className="flex h-screen w-full bg-background">
            <PassengerSidebar />
            
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Use the separate PassengerNavbar component instead of the inline one */}
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