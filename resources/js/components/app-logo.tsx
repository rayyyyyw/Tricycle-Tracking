import { useSidebar } from '@/components/ui/sidebar';
import TriGoLogoImg from './TriGoLogoImg';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    if (isCollapsed) {
        return (
            <div className="flex h-10 w-full items-center justify-center">
                <TriGoLogoImg size="sm" className="h-10 w-10" />
            </div>
        );
    }

    return (
        <div className="flex w-full items-center gap-2">
            <TriGoLogoImg size="sm" className="h-10 w-10 shrink-0" />
            <div className="grid min-w-0 flex-1 text-left">
                <span className="mb-0.5 truncate text-sm leading-tight font-bold text-emerald-700 dark:text-emerald-300">
                    TriGo
                </span>
                <span className="truncate text-xs text-emerald-600/70 dark:text-emerald-400/70">
                    Administrator
                </span>
            </div>
        </div>
    );
}
