import { type ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { PassengerSidebar } from '@/components/PassengerSidebar';
import { type BreadcrumbItem } from '@/types';

interface PassengerLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

function BreadcrumbHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    const { toggleSidebar } = useSidebar();
    
    return (
        <div className="flex w-full border-b border-gray-200 bg-white">
            <div className="flex h-12 w-full items-center justify-start px-6">
                {breadcrumbs && breadcrumbs.length === 1 ? (
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
                    >
                        <span>☰</span>
                        <span>{breadcrumbs[0].title}</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-sm">
                        {breadcrumbs?.map((breadcrumb, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <span>/</span>}
                                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900' : 'text-gray-500'}>
                                    {breadcrumb.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function LayoutContent({ children, breadcrumbs }: PassengerLayoutProps) {
    const { state } = useSidebar();
    
    return (
        <div className="flex h-screen w-full bg-gray-50">
            {/* ONLY CHANGE: Conditional width for sidebar */}
            <div className={state === 'collapsed' ? 'w-16' : 'w-64'}>
                <PassengerSidebar />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col">
                <BreadcrumbHeader breadcrumbs={breadcrumbs} />
                
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
        <SidebarProvider>
            <LayoutContent breadcrumbs={passengerBreadcrumbs}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}