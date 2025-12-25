// layouts/PassengerLayout.tsx (FIXED)
import { type ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { PassengerSidebar } from '@/components/PassengerSidebar';
import { PassengerNavbar } from '@/components/PassengerNavbar'; // Import the separate component
import { type BreadcrumbItem } from '@/types';

interface PassengerLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

function SidebarContent({ children, breadcrumbs }: PassengerLayoutProps) {
    const [defaultCollapsed] = useState(() => {
        const saved = localStorage.getItem('passenger-sidebar-collapsed');
        return saved ? JSON.parse(saved) : false;
    });

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

    // Save sidebar state to localStorage
    useEffect(() => {
        const isCollapsed = state === 'collapsed';
        localStorage.setItem('passenger-sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [state]);

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