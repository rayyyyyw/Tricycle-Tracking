import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (
            window.matchMedia('(display-mode: standalone)').matches ||
            // @ts-expect-error - standalone is a Safari-specific property
            window.navigator.standalone === true
        ) {
            return;
        }

        // Check if user has dismissed the prompt before (but allow showing again after 7 days)
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (dismissedTime > sevenDaysAgo) {
                return;
            }
            // Clear dismissal if it's been more than 7 days
            localStorage.removeItem('pwa-install-dismissed');
        }

        // Check if PWA is installable (service worker registered and manifest valid)
        const checkInstallability = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker
                    .getRegistration()
                    .then((registration) => {
                        if (registration) {
                            setCanInstall(true);
                            // Show prompt after 3 seconds if beforeinstallprompt hasn't fired
                            setTimeout(() => {
                                if (!deferredPrompt && canInstall) {
                                    setShowPrompt(true);
                                }
                            }, 3000);
                        }
                    });
            }
        };

        checkInstallability();

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Also listen for appinstalled event
        window.addEventListener('appinstalled', () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, [deferredPrompt, canInstall]);

    const handleInstall = async () => {
        if (deferredPrompt) {
            // Use the browser's install prompt
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }

            setDeferredPrompt(null);
            setShowPrompt(false);
        } else {
            // Fallback: Show instructions for manual installation
            const isIOS =
                /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                // @ts-expect-error - MSStream is a legacy IE property
                !window.MSStream;
            const isAndroid = /Android/.test(navigator.userAgent);

            if (isIOS) {
                alert(
                    'To install TriGo:\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Tap "Add"',
                );
            } else if (isAndroid) {
                alert(
                    'To install TriGo:\n1. Tap the menu (3 dots)\n2. Select "Install app" or "Add to Home screen"\n3. Tap "Install"',
                );
            } else {
                alert(
                    'To install TriGo:\n1. Look for the install icon in your browser address bar\n2. Click it and follow the prompts',
                );
            }
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Show prompt if we have deferredPrompt OR if we can install (after delay)
    if (!showPrompt || (!deferredPrompt && !canInstall)) {
        return null;
    }

    return (
        <div className="fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:w-96">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <img
                                src="/logos/tlogo.png"
                                alt="TriGo"
                                className="h-8 w-8 shrink-0 object-contain"
                            />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Install TriGo App
                            </h3>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Install our app for a better experience. Quick
                            access and offline support included!
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleInstall}
                        size="sm"
                        className="flex-1"
                    >
                        Install
                    </Button>
                    <Button onClick={handleDismiss} variant="outline" size="sm">
                        Later
                    </Button>
                </div>
            </div>
        </div>
    );
}
