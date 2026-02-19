// layouts/DriverLayout.tsx (FIXED)
import { DriverNavbar } from '@/components/DriverNavbar';
import { DriverSidebar } from '@/components/DriverSidebar';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useLocationPing } from '@/hooks/use-location-ping';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect, useState } from 'react';

interface DriverLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

// Layout content component that uses the sidebar context
function LayoutContent({ children, breadcrumbs }: DriverLayoutProps) {
    const { state } = useSidebar();
    useLocationPing(); // Send location to admin map when driver is active

    // Save sidebar state to localStorage
    useEffect(() => {
        const isCollapsed = state === 'collapsed';
        localStorage.setItem(
            'driver-sidebar-collapsed',
            JSON.stringify(isCollapsed),
        );
    }, [state]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <DriverSidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <DriverNavbar breadcrumbs={breadcrumbs} />

                <main className="min-w-0 flex-1 overflow-auto">
                    <div className="w-full max-w-full p-3 sm:p-4 md:p-6">
                        {children}
                    </div>
                </main>
            </div>
            <PWAInstallPrompt />
        </div>
    );
}

// Persistent sidebar wrapper
function PersistentSidebarWrapper({
    children,
    breadcrumbs,
}: DriverLayoutProps) {
    const [defaultOpen] = useState(() => {
        const saved = localStorage.getItem('driver-sidebar-collapsed');
        return saved ? !JSON.parse(saved) : true;
    });

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <LayoutContent breadcrumbs={breadcrumbs}>{children}</LayoutContent>
        </SidebarProvider>
    );
}

export default function DriverLayout({
    children,
    breadcrumbs,
}: DriverLayoutProps) {
    const driverBreadcrumbs = breadcrumbs || [
        {
            title: 'Driver Dashboard',
            href: '/driver/dashboard',
        },
    ];

    return (
        <PersistentSidebarWrapper breadcrumbs={driverBreadcrumbs}>
            {children}
        </PersistentSidebarWrapper>
    );
}
