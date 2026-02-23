import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWA_DISMISSED_KEY = 'pwa-install-dismissed';
const SHOW_DELAY_MS = 3000;

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Don't show if already running as installed app
        if (
            typeof window === 'undefined' ||
            window.matchMedia('(display-mode: standalone)').matches ||
            // @ts-expect-error - standalone is a Safari-specific property
            window.navigator.standalone === true
        ) {
            return;
        }

        if (localStorage.getItem(PWA_DISMISSED_KEY)) {
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
                showTimeoutRef.current = null;
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
                showTimeoutRef.current = null;
            }
        });

        // Show the install banner after a delay for every logged-in user (so notification is visible)
        showTimeoutRef.current = setTimeout(() => {
            showTimeoutRef.current = null;
            setShowPrompt(true);
        }, SHOW_DELAY_MS);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
            }
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            // Direct install: trigger the browser's native install dialog
            try {
                await deferredPrompt.prompt();
                await deferredPrompt.userChoice;
            } catch {
                // Ignore if prompt fails (e.g. already shown)
            }
            setDeferredPrompt(null);
            setShowPrompt(false);
            return;
        }

        // No native prompt (e.g. Safari, or Chrome without PWA criteria): one short message only, no steps
        const message =
            "To install TriGo, use your browser menu: choose \"Install app\" or \"Add to Home Screen\".";
        alert(message);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString());
    };

    if (!showPrompt) {
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
