// layouts/PassengerLayout.tsx (FIXED)
import { PassengerNavbar } from '@/components/PassengerNavbar'; // Import the separate component
import { PassengerSidebar } from '@/components/PassengerSidebar';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useLocationPing } from '@/hooks/use-location-ping';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect, useState } from 'react';

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
            <LayoutContent breadcrumbs={breadcrumbs}>{children}</LayoutContent>
        </SidebarProvider>
    );
}

function LayoutContent({ children, breadcrumbs }: PassengerLayoutProps) {
    const { state } = useSidebar();
    useLocationPing(); // Send location to admin map when passenger is active

    // Save sidebar state to localStorage
    useEffect(() => {
        const isCollapsed = state === 'collapsed';
        localStorage.setItem(
            'passenger-sidebar-collapsed',
            JSON.stringify(isCollapsed),
        );
    }, [state]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <PassengerSidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Use the separate PassengerNavbar component instead of the inline one */}
                <PassengerNavbar breadcrumbs={breadcrumbs} />

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

export default function PassengerLayout({
    children,
    breadcrumbs,
}: PassengerLayoutProps) {
    const passengerBreadcrumbs = breadcrumbs || [
        {
            title: 'Dashboard',
            href: '/passenger/dashboard',
        },
    ];

    return (
        <SidebarContent breadcrumbs={passengerBreadcrumbs}>
            {children}
        </SidebarContent>
    );
}
