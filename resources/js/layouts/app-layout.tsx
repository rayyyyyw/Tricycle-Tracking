// layouts/app-layout.tsx
import { type ReactNode, useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AdminNavbar } from '@/components/AdminNavbar';
import { type BreadcrumbItem, type AdminProfile } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
    adminProfile?: AdminProfile;
    [key: string]: unknown;
}

// Layout content component that uses the sidebar context
function LayoutContent({ children, breadcrumbs, title }: AppLayoutProps) {
    const { state } = useSidebar();
    const page = usePage<PageProps>();
    const adminProfile = page.props.adminProfile;

    // Save sidebar state to localStorage
    useEffect(() => {
        const isCollapsed = state === 'collapsed';
        localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [state]);

    return (
        <div className="flex h-screen w-full bg-background">
            <AppSidebar />
            
            <div className="flex-1 min-w-0 flex flex-col">
                <AdminNavbar 
                    breadcrumbs={breadcrumbs} 
                    title={title}
                />
                
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
    const [defaultOpen, setDefaultOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin-sidebar-collapsed');
            return saved ? !JSON.parse(saved) : true;
        }
        return true;
    });

    // Initialize theme from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
            const root = window.document.documentElement;
            
            root.classList.remove('light', 'dark');
            
            if (savedTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(savedTheme);
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