// components/driver-sidebar-logo.tsx
import { useSidebar } from '@/components/ui/sidebar';
import AppLogoIcon from './app-logo-icon';
import { cn } from '@/lib/utils';

export default function DriverSidebarLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <div className="flex items-center gap-2.5 w-full">
            <div className={cn(
                "flex aspect-square items-center justify-center rounded-lg transition-all duration-200 shrink-0",
                "bg-linear-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
                "shadow-md shadow-green-500/20 dark:shadow-green-900/30",
                "size-10"
            )}>
                <AppLogoIcon className="size-5 fill-current text-white transition-all duration-200" />
            </div>
            {!isCollapsed && (
                <div className="grid flex-1 text-left min-w-0">
                    <span className="mb-0.5 truncate leading-tight font-bold text-sm text-green-700 dark:text-green-300">
                        TriGo
                    </span>
                    <span className="truncate text-xs text-green-600/70 dark:text-green-400/70">
                        Driver
                    </span>
                </div>
            )}
        </div>
    );
}
