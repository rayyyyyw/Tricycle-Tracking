// layouts/app-layout.tsx
import { type ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AdminNavbar } from '@/components/AdminNavbar';
import { type BreadcrumbItem } from '@/types';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

// Layout content component that uses the sidebar context
function LayoutContent({ children, breadcrumbs, title }: AppLayoutProps) {
    const { state } = useSidebar();

    // Save sidebar state to localStorage
    useEffect(() => {
        const isCollapsed = state === 'collapsed';
        localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [state]);

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
            <AppSidebar />
            
            <div className="flex-1 min-w-0 flex flex-col">
                <AdminNavbar breadcrumbs={breadcrumbs} title={title} />
                
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
function PersistentSidebarWrapper({ children, breadcrumbs, title }: AppLayoutProps) {
    const [defaultOpen, setDefaultOpen] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin-sidebar-collapsed');
            if (saved) {
                setDefaultOpen(!JSON.parse(saved));
            }
        }
    }, []);

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <LayoutContent breadcrumbs={breadcrumbs} title={title}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}

export default function AppLayout({ children, breadcrumbs, title }: AppLayoutProps) {
    const adminBreadcrumbs = breadcrumbs || [
        { 
            title: 'Dashboard', 
            href: '/dashboard' 
        }
    ];

    return (
        <PersistentSidebarWrapper breadcrumbs={adminBreadcrumbs} title={title}>
            {children}
        </PersistentSidebarWrapper>
    );
}