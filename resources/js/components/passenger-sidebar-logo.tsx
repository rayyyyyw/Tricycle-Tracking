// components/passenger-sidebar-logo.tsx
import { useSidebar } from '@/components/ui/sidebar';
import AppLogoIcon from './app-logo-icon';
import { cn } from '@/lib/utils';

export default function PassengerSidebarLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <div className="flex items-center gap-2.5 w-full">
            <div className={cn(
                "flex aspect-square items-center justify-center rounded-lg transition-all duration-200 shrink-0",
                "bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700",
                "shadow-md shadow-emerald-500/20 dark:shadow-emerald-900/30",
                "size-10"
            )}>
                <AppLogoIcon className="size-5 fill-current text-white transition-all duration-200" />
            </div>
            {!isCollapsed && (
                <div className="grid flex-1 text-left min-w-0">
                    <span className="mb-0.5 truncate leading-tight font-bold text-sm text-emerald-700 dark:text-emerald-300">
                        TriGo
                    </span>
                    <span className="truncate text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        Passenger
                    </span>
                </div>
            )}
        </div>
    );
}
