import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark =
        appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'light');
};

/** Apply appearance theme (for authenticated pages) - default light */
const applyAppearanceTheme = () => {
    const savedAppearance =
        (localStorage.getItem('appearance') as Appearance) || 'light';
    applyTheme(savedAppearance);
};

/** Apply landing theme (for landing page only) - never touches appearance */
const applyLandingTheme = () => {
    const savedLandingTheme = localStorage.getItem('landing-theme');
    const isDark = savedLandingTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
};

export function initializeTheme() {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;
    const usesLandingTheme = pathname === '/' || pathname === '/welcome' || pathname.startsWith('/welcome') || pathname === '/login' || pathname === '/register';

    if (usesLandingTheme) {
        applyLandingTheme();
    } else {
        applyAppearanceTheme();
        mediaQuery()?.addEventListener('change', handleSystemThemeChange);
    }
}

/** Call on Inertia navigation to re-apply correct theme when switching between landing and app */
export function syncThemeOnNavigate(url: string) {
    if (typeof window === 'undefined') return;
    const pathname = new URL(url, window.location.origin).pathname;
    const usesLandingTheme = pathname === '/' || pathname === '/welcome' || pathname.startsWith('/welcome') || pathname === '/login' || pathname === '/register';
    if (usesLandingTheme) {
        applyLandingTheme();
    } else {
        applyAppearanceTheme();
    }
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('light');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem(
            'appearance',
        ) as Appearance | null;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        updateAppearance(savedAppearance || 'light');

        return () =>
            mediaQuery()?.removeEventListener(
                'change',
                handleSystemThemeChange,
            );
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
