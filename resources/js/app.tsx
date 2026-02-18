import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme, syncThemeOnNavigate } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Set theme on initial load
initializeTheme();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);
                // Ensure the service worker is active
                if (registration.active) {
                    registration.update();
                }
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Re-apply correct theme when navigating between landing and app (prevents landing theme from affecting user account)
router.on('navigate', (event) => {
    const url =
        (event as CustomEvent & { detail?: { page?: { url?: string } } })
            ?.detail?.page?.url ?? window.location.href;
    syncThemeOnNavigate(url);
});
