import { useEffect } from 'react';

const PING_INTERVAL_MS = 30_000; // 30 seconds
const HINOBAAN_BOUNDS = {
    south: 9.42,
    north: 9.67,
    west: 122.42,
    east: 122.62,
};

function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
}

/**
 * Pings the backend with the user's current location so the admin dashboard
 * can show logged-in users on the map. Only runs when tab is visible.
 */
export function useLocationPing() {
    useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return;

        const sendLocation = (latitude: number, longitude: number) => {
            const lat = clamp(
                latitude,
                HINOBAAN_BOUNDS.south,
                HINOBAAN_BOUNDS.north,
            );
            const lng = clamp(
                longitude,
                HINOBAAN_BOUNDS.west,
                HINOBAAN_BOUNDS.east,
            );
            const url =
                typeof window !== 'undefined' && window.location?.origin
                    ? `${window.location.origin}/api/user/location`
                    : '/api/user/location';
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content ?? '',
                },
                body: JSON.stringify({ latitude: lat, longitude: lng }),
                credentials: 'same-origin',
            }).catch(() => {});
        };

        const tick = () => {
            if (
                typeof document !== 'undefined' &&
                document.visibilityState !== 'visible'
            )
                return;
            navigator.geolocation.getCurrentPosition(
                (pos) =>
                    sendLocation(pos.coords.latitude, pos.coords.longitude),
                () => {},
                {
                    enableHighAccuracy: false,
                    maximumAge: 60000,
                    timeout: 10000,
                },
            );
        };

        tick();
        const interval = setInterval(tick, PING_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);
}
