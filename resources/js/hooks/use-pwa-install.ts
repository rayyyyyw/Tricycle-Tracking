import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        // Check if already installed - run immediately and on every render
        const checkInstalled = () => {
            if (
                window.matchMedia('(display-mode: standalone)').matches ||
                // @ts-expect-error - standalone is a Safari-specific property
                window.navigator.standalone === true
            ) {
                setIsInstalled(true);
                return true;
            }
            return false;
        };

        // Check immediately
        if (checkInstalled()) {
            return;
        }

        // Check if PWA is installable (service worker registered and manifest valid)
        const checkInstallability = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker
                    .getRegistration()
                    .then((registration) => {
                        if (registration) {
                            setCanInstall(true);
                        }
                    })
                    .catch(() => {
                        // Service worker not available
                    });
            }
        };

        // Run check immediately
        checkInstallability();

        // Also check periodically in case service worker registers later (only for 5 seconds)
        let interval: NodeJS.Timeout | null = null;
        let checkCount = 0;
        const maxChecks = 5;

        interval = setInterval(() => {
            checkCount++;
            if (checkCount >= maxChecks) {
                if (interval) clearInterval(interval);
                return;
            }
            if (!checkInstalled()) {
                checkInstallability();
            } else {
                if (interval) clearInterval(interval);
            }
        }, 1000);

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for appinstalled event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setCanInstall(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            if (interval) clearInterval(interval);
        };
    }, []);

    const install = async (): Promise<boolean> => {
        if (isInstalled) {
            return false;
        }

        // If we have the deferred prompt, trigger it immediately - this is the automatic install
        if (deferredPrompt) {
            try {
                // Immediately trigger the browser's native install prompt
                // This will show the install dialog automatically
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                    setIsInstalled(true);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error during installation:', error);
            }
        }

        // No native prompt: one short message, no step-by-step instructions
        alert(
            'To install TriGo, use your browser menu: choose "Install app" or "Add to Home Screen".',
        );
        return false;
    };

    return {
        install,
        canInstall: canInstall && !isInstalled,
        isInstalled,
    };
}
