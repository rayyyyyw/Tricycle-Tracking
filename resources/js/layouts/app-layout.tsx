// layouts/app-layout.tsx (FIXED)
import { AdminNavbar } from '@/components/AdminNavbar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect, useState } from 'react';

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
        localStorage.setItem(
            'admin-sidebar-collapsed',
            JSON.stringify(isCollapsed),
        );
    }, [state]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <AppSidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <AdminNavbar breadcrumbs={breadcrumbs} title={title} />

                <main className="min-w-0 flex-1 overflow-auto">
                    <div className="w-full max-w-full p-3 sm:p-4 md:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Persistent sidebar wrapper
function PersistentSidebarWrapper({
    children,
    breadcrumbs,
    title,
}: AppLayoutProps) {
    const [defaultOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin-sidebar-collapsed');
            return saved ? !JSON.parse(saved) : true;
        }
        return true;
    });

    // Initialize theme from localStorage (use 'appearance' key for consistency) - default light
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedAppearance =
                (localStorage.getItem('appearance') as
                    | 'light'
                    | 'dark'
                    | 'system') || 'light';
            const root = window.document.documentElement;

            root.classList.remove('light', 'dark');

            if (savedAppearance === 'system') {
                const systemTheme = window.matchMedia(
                    '(prefers-color-scheme: dark)',
                ).matches
                    ? 'dark'
                    : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(savedAppearance);
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

export default function AppLayout({
    children,
    breadcrumbs,
    title,
}: AppLayoutProps) {
    const adminBreadcrumbs = breadcrumbs || [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ];

    return (
        <PersistentSidebarWrapper breadcrumbs={adminBreadcrumbs} title={title}>
            {children}
        </PersistentSidebarWrapper>
    );
}
