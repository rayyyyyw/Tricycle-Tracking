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

    useEffect(() => {
        // Check if already installed
        if (
            window.matchMedia('(display-mode: standalone)').matches ||
            // @ts-expect-error - standalone is a Safari-specific property
            window.navigator.standalone === true
        ) {
            return;
        }

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showPrompt || !deferredPrompt) {
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
