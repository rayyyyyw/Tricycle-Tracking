// layouts/DriverLayout.tsx (FIXED)
import { type ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { DriverSidebar } from '@/components/DriverSidebar';
import { DriverNavbar } from '@/components/DriverNavbar';
import { type BreadcrumbItem } from '@/types';

interface DriverLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

// Layout content component that uses the sidebar context
function LayoutContent({ children, breadcrumbs }: DriverLayoutProps) {
    const { state } = useSidebar();

    // Save sidebar state to localStorage
    useEffect(() => {
        const isCollapsed = state === 'collapsed';
        localStorage.setItem('driver-sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [state]);

    return (
        <div className="flex h-screen w-full bg-background">
            <DriverSidebar />
            
            <div className="flex-1 min-w-0 flex flex-col">
                <DriverNavbar breadcrumbs={breadcrumbs} />
                
                <main className="flex-1 min-w-0 overflow-auto">
                    <div className="p-6 w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Persistent sidebar wrapper
function PersistentSidebarWrapper({ children, breadcrumbs }: DriverLayoutProps) {
    const [defaultOpen] = useState(() => {
        const saved = localStorage.getItem('driver-sidebar-collapsed');
        return saved ? !JSON.parse(saved) : true;
    });

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <LayoutContent breadcrumbs={breadcrumbs}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}

export default function DriverLayout({ children, breadcrumbs }: DriverLayoutProps) {
    const driverBreadcrumbs = breadcrumbs || [
        { 
            title: 'Driver Dashboard', 
            href: '/driver/dashboard' 
        }
    ];

    return (
        <PersistentSidebarWrapper breadcrumbs={driverBreadcrumbs}>
            {children}
        </PersistentSidebarWrapper>
    );
}