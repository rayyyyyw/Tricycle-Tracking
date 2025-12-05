import { useState } from 'react';

export default function AppLogo({ isCollapsed = false }) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-0'}`}>
            {/* Logo Container - Adjust position based on state */}
            <div className={`flex aspect-square size-12 items-center justify-center transition-all duration-300 ${
                isCollapsed ? 'translate-x-0' : '-translate-x-1.5'
            }`}>
                {imageError ? (
                    // Fallback when image fails to load
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-purple-600 text-white">
                        <span className="text-lg font-bold">TG</span>
                    </div>
                ) : (
                    // Logo Image from public folder - Extra Large
                    <img 
                        src="/cutey.png" 
                        alt="TriGo Logo" 
                        className="h-full w-full rounded-lg object-contain p-0"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                )}
            </div>
            
            {/* Logo Text - Only show when not collapsed */}
            {!isCollapsed && (
                <div className="grid flex-1 text-left min-w-0">
                    <span className="truncate leading-tight font-semibold text-base">
                        TRIGO ADMIN
                    </span>
                    <span className="truncate text-xs text-muted-foreground mt-0.5">
                        Admin Panel
                    </span>
                </div>
            )}
        </div>
    );
}