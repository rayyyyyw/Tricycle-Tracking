import TriGoLogoImg from './TriGoLogoImg';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    if (isCollapsed) {
        return (
            <div className="flex items-center justify-center w-full h-10">
                <TriGoLogoImg size="sm" className="w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 w-full">
            <TriGoLogoImg size="sm" className="w-10 h-10 shrink-0" />
            <div className="grid flex-1 text-left min-w-0">
                <span className="mb-0.5 truncate leading-tight font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    TriGo
                </span>
                <span className="truncate text-xs text-emerald-600/70 dark:text-emerald-400/70">
                    Administrator
                </span>
            </div>
        </div>
    );
}
