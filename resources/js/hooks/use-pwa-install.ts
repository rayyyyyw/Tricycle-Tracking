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
        // Check if already installed
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
                    });
            }
        };

        checkInstallability();

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
        };
    }, []);

    const install = async (): Promise<boolean> => {
        if (isInstalled) {
            return false;
        }

        if (deferredPrompt) {
            // Use the browser's install prompt
            try {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error during installation:', error);
                return false;
            }
        } else {
            // Fallback: Show instructions for manual installation
            const isIOS =
                /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                // @ts-expect-error - MSStream is a legacy IE property
                !window.MSStream;
            const isAndroid = /Android/.test(navigator.userAgent);

            if (isIOS) {
                alert(
                    'To install TriGo:\n1. Tap the Share button (square with arrow)\n2. Scroll down and select "Add to Home Screen"\n3. Tap "Add"',
                );
            } else if (isAndroid) {
                alert(
                    'To install TriGo:\n1. Tap the menu (3 dots) in your browser\n2. Select "Install app" or "Add to Home screen"\n3. Tap "Install"',
                );
            } else {
                alert(
                    'To install TriGo:\n1. Look for the install icon (➕) in your browser address bar\n2. Click it and follow the prompts\n\nOr use your browser menu to find "Install TriGo"',
                );
            }
            return false;
        }
    };

    return {
        install,
        canInstall: canInstall && !isInstalled,
        isInstalled,
    };
}
