import BookingChat from '@/components/BookingChat';
import RatingDisplay from '@/components/RatingDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverLayout from '@/layouts/DriverLayout';
import bookings from '@/routes/bookings';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Bell,
    Car,
    CheckCircle,
    ClipboardList,
    Clock,
    FileText,
    Flag,
    Loader2,
    MapPin,
    MessageCircle,
    Navigation,
    Phone,
    Users,
    WifiOff,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Import Leaflet for mapping
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Booking {
    id: number;
    booking_id: string;
    passenger: {
        id: number;
        name: string;
        phone: string;
        avatar: string | null;
    };
    pickup: {
        lat: number;
        lng: number;
        address: string;
        barangay: string | null;
        purok: string | null;
    };
    destination: {
        lat: number;
        lng: number;
        address: string;
        barangay: string | null;
        purok: string | null;
    };
    ride_type: string;
    passenger_count: number;
    distance: string | null;
    duration: string | null;
    total_fare: number | string;
    estimated_arrival: string | null;
    special_instructions: string | null;
    emergency_contact?: {
        name: string | null;
        phone: string | null;
        relationship: string | null;
    } | null;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    accepted_at?: string | null;
    completed_at?: string | null;
    review?: {
        id: number;
        rating: number;
        comment: string | null;
    } | null;
}

export default function Bookings() {
    const {
        pendingBookings = [],
        acceptedBookings = [],
        completedBookings = [],
        auth,
        socketUrl,
    } = usePage().props as {
        pendingBookings?: Booking[];
        acceptedBookings?: Booking[];
        completedBookings?: Booking[];
        auth?: { user?: { id?: number; is_online?: boolean } };
        socketUrl?: string;
    };
    const pageUrl = usePage().url;
    const isOnline = auth?.user?.is_online ?? false;
    const [acceptingBookingId, setAcceptingBookingId] = useState<number | null>(
        null,
    );
    const [completingBookingId, setCompletingBookingId] = useState<
        number | null
    >(null);
    // Kept for future map expansion feature
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [expandedMaps, setExpandedMaps] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') return 'pending';
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab');
        return t === 'accepted' || t === 'completed' ? t : 'pending';
    });
    const [cancelledBanner, setCancelledBanner] = useState(false);
    const prevAcceptedIdsRef = useRef<Set<number>>(new Set());
    // Sync tab from URL so Accept redirect to ?tab=accepted opens Accepted tab (state can be preserved otherwise)
    useEffect(() => {
        try {
            const fullUrl = pageUrl.startsWith('http')
                ? pageUrl
                : `${window.location.origin}${pageUrl.startsWith('/') ? '' : '/'}${pageUrl}`;
            const t = new URL(fullUrl).searchParams.get('tab');
            if (t === 'accepted' || t === 'completed') setActiveTab(t);
        } catch {
            const t = new URLSearchParams(
                typeof window !== 'undefined' ? window.location.search : '',
            ).get('tab');
            if (t === 'accepted' || t === 'completed') setActiveTab(t);
        }
    }, [pageUrl]);
    const mapRefs = useRef<{
        [key: number]: { map: L.Map | null; container: HTMLDivElement | null };
    }>({});
    const hasActiveBooking = (acceptedBookings?.length ?? 0) > 0;

    // Tab-aware refresh: 3s for new requests (Pending), 20s on Accepted so chat isn’t disrupted
    const refreshIntervalMs =
        activeTab === 'pending'
            ? 3000
            : activeTab === 'accepted'
              ? 60000
              : 15000;
    useEffect(() => {
        if (!isOnline) return;
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({
                    only: [
                        'pendingBookings',
                        'acceptedBookings',
                        'completedBookings',
                    ],
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        }, refreshIntervalMs);
        return () => clearInterval(interval);
    }, [isOnline, activeTab, refreshIntervalMs]);

    // Detect when a passenger cancels: accepted list shrinks and we didn't just complete that ride
    useEffect(() => {
        const currentIds = new Set((acceptedBookings ?? []).map((b) => b.id));
        const prev = prevAcceptedIdsRef.current;
        if (prev.size > 0 && currentIds.size < prev.size) {
            const completedId = completingBookingId;
            const disappeared = [...prev].filter((id) => !currentIds.has(id));
            const wasCancelled = disappeared.some((id) => id !== completedId);
            if (wasCancelled) setCancelledBanner(true);
        }
        prevAcceptedIdsRef.current = currentIds;
    }, [acceptedBookings, completingBookingId]);

    const handleAcceptBooking = async (bookingId: number) => {
        setAcceptingBookingId(bookingId);
        try {
            // Use Inertia router.post which handles CSRF automatically
            router.post(
                bookings.accept.url({ booking: bookingId }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Server redirects to /driver/bookings?tab=accepted so we land on Accepted tab with fresh data
                    },
                    onError: (errors) => {
                        const errorMessage =
                            errors.message ||
                            errors.error ||
                            'Failed to accept booking';
                        console.error(
                            'Failed to accept booking:',
                            errorMessage,
                        );
                        alert(`Failed to accept booking: ${errorMessage}`);
                    },
                    onFinish: () => {
                        setAcceptingBookingId(null);
                    },
                },
            );
        } catch (error) {
            console.error('Error accepting booking:', error);
            setAcceptingBookingId(null);
        }
    };

    const handleCompleteRide = async (bookingId: number) => {
        setCompletingBookingId(bookingId);
        try {
            // Use Inertia router.post which handles CSRF automatically
            router.post(
                bookings.complete.url({ booking: bookingId }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload();
                    },
                    onError: (errors) => {
                        const errorMessage =
                            errors.message ||
                            errors.error ||
                            'Failed to complete ride';
                        console.error('Failed to complete ride:', errorMessage);
                        alert(`Failed to complete ride: ${errorMessage}`);
                    },
                    onFinish: () => {
                        setCompletingBookingId(null);
                    },
                },
            );
        } catch (error) {
            console.error('Error completing ride:', error);
            setCompletingBookingId(null);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - date.getTime()) / 1000,
        );

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    // Kept for future map toggle functionality
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const toggleMap = (bookingId: number) => {
        setExpandedMaps((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(bookingId)) {
                newSet.delete(bookingId);
                if (mapRefs.current[bookingId]?.map) {
                    mapRefs.current[bookingId].map?.remove();
                    mapRefs.current[bookingId].map = null;
                }
            } else {
                newSet.add(bookingId);
            }
            return newSet;
        });
    };

    // Initialize map for all bookings
    useEffect(() => {
        const allBookings = [
            ...(pendingBookings || []),
            ...(acceptedBookings || []),
            ...(completedBookings || []),
        ];

        const initializeMaps = () => {
            allBookings.forEach((booking) => {
                const mapContainer = document.getElementById(
                    `map-${booking.id}`,
                );
                // Check if container exists and is in the DOM
                if (mapContainer && mapContainer.offsetParent !== null) {
                    // If map already exists, just invalidate its size and ensure it's still attached
                    if (mapRefs.current[booking.id]?.map) {
                        const existingMap = mapRefs.current[booking.id].map;
                        // Check if map is still valid (not removed from DOM)
                        try {
                            if (
                                existingMap &&
                                existingMap.getContainer() &&
                                existingMap.getContainer().parentNode
                            ) {
                                setTimeout(() => {
                                    existingMap.invalidateSize();
                                }, 100);
                                return;
                            } else {
                                // Map was removed, clear reference and reinitialize
                                mapRefs.current[booking.id].map = null;
                            }
                        } catch {
                            // Map is invalid, clear and reinitialize
                            mapRefs.current[booking.id].map = null;
                        }
                    }

                    // Ensure container has dimensions
                    const containerElement = mapContainer as HTMLElement;
                    // Always set explicit dimensions
                    containerElement.style.height = '400px';
                    containerElement.style.width = '100%';
                    containerElement.style.minHeight = '400px';
                    containerElement.style.position = 'relative';

                    // Initialize map after a short delay to ensure container is rendered
                    setTimeout(() => {
                        if (mapRefs.current[booking.id]?.map) return; // Already initialized

                        // Double-check container dimensions before initializing
                        if (containerElement.offsetHeight < 100) {
                            containerElement.style.height = '400px';
                        }
                        if (containerElement.offsetWidth < 100) {
                            containerElement.style.width = '100%';
                        }

                        // Only initialize if container is visible and has dimensions
                        if (
                            containerElement.offsetHeight === 0 ||
                            containerElement.offsetWidth === 0
                        ) {
                            console.log(
                                `Map container for booking ${booking.id} not ready yet, will retry`,
                            );
                            return;
                        }

                        // Check if Leaflet already initialized a map on this container
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if ((containerElement as any)._leaflet_id) {
                            // Container already has a map, try to get it
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const existingMap = (L as any).map.get(
                                containerElement,
                            );
                            if (existingMap) {
                                mapRefs.current[booking.id] = {
                                    map: existingMap,
                                    container: mapContainer as HTMLDivElement,
                                };
                                setTimeout(() => {
                                    existingMap.invalidateSize();
                                }, 100);
                                return;
                            }
                        }

                        const map = L.map(`map-${booking.id}`, {
                            preferCanvas: false,
                        }).setView(
                            [booking.pickup.lat, booking.pickup.lng],
                            13,
                        );

                        L.tileLayer(
                            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            {
                                attribution:
                                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                maxZoom: 19,
                            },
                        ).addTo(map);

                        const pickupMarker = L.marker(
                            [booking.pickup.lat, booking.pickup.lng],
                            {
                                icon: L.icon({
                                    iconUrl:
                                        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                                    shadowUrl:
                                        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41],
                                }),
                            },
                        ).addTo(map);
                        pickupMarker.bindPopup(
                            `<b>Pickup Location</b><br>${booking.pickup.address}`,
                        );

                        const destMarker = L.marker(
                            [booking.destination.lat, booking.destination.lng],
                            {
                                icon: L.icon({
                                    iconUrl:
                                        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                                    shadowUrl:
                                        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41],
                                }),
                            },
                        ).addTo(map);
                        destMarker.bindPopup(
                            `<b>Destination</b><br>${booking.destination.address}`,
                        );

                        // Add route using OSRM to follow roads
                        (async () => {
                            try {
                                const response = await fetch(
                                    `https://router.project-osrm.org/route/v1/driving/${booking.pickup.lng},${booking.pickup.lat};${booking.destination.lng},${booking.destination.lat}?overview=full&geometries=geojson`,
                                );
                                const data = await response.json();

                                if (
                                    data.code === 'Ok' &&
                                    data.routes &&
                                    data.routes[0]
                                ) {
                                    const route = data.routes[0];
                                    // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
                                    const coordinates =
                                        route.geometry.coordinates.map(
                                            (coord: [number, number]) => [
                                                coord[1],
                                                coord[0],
                                            ],
                                        );

                                    const routeLine = L.polyline(
                                        coordinates as [number, number][],
                                        {
                                            color: '#3b82f6',
                                            weight: 5,
                                            opacity: 0.7,
                                            dashArray: '10, 5',
                                        },
                                    ).addTo(map);

                                    // Fit map to show route
                                    const group = new L.FeatureGroup([
                                        pickupMarker,
                                        destMarker,
                                        routeLine,
                                    ]);
                                    map.fitBounds(group.getBounds().pad(0.1));
                                } else {
                                    // Fallback: fit to markers
                                    const group = new L.FeatureGroup([
                                        pickupMarker,
                                        destMarker,
                                    ]);
                                    map.fitBounds(group.getBounds().pad(0.1));
                                }
                            } catch (error) {
                                console.error('Error fetching route:', error);
                                // Fallback: draw straight line
                                L.polyline(
                                    [
                                        [
                                            booking.pickup.lat,
                                            booking.pickup.lng,
                                        ],
                                        [
                                            booking.destination.lat,
                                            booking.destination.lng,
                                        ],
                                    ],
                                    {
                                        color: '#3b82f6',
                                        weight: 4,
                                        opacity: 0.7,
                                        dashArray: '10, 10',
                                    },
                                ).addTo(map);

                                const group = new L.FeatureGroup([
                                    pickupMarker,
                                    destMarker,
                                ]);
                                map.fitBounds(group.getBounds().pad(0.1));
                            }

                            // Invalidate size after route is drawn to ensure map renders correctly
                            setTimeout(() => {
                                map.invalidateSize();
                                // Force resize after a bit more delay
                                setTimeout(() => {
                                    map.invalidateSize();
                                }, 200);
                            }, 100);
                        })();

                        mapRefs.current[booking.id] = {
                            map,
                            container: mapContainer as HTMLDivElement,
                        };
                    }, 150);
                }
            });
        };

        // Initial attempt
        const timer1 = setTimeout(initializeMaps, 100);

        // Retry after tab change or if maps didn't initialize
        const timer2 = setTimeout(() => {
            initializeMaps();
        }, 500);

        // Another retry for slower renders
        const timer3 = setTimeout(() => {
            initializeMaps();
        }, 1000);

        // Re-initialize maps when tab becomes visible (handles navigation back)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                setTimeout(initializeMaps, 200);
            }
        };

        // Also re-initialize when window gains focus (handles tab switching)
        const handleFocus = () => {
            setTimeout(initializeMaps, 200);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            window.removeEventListener('focus', handleFocus);
            // Don't remove maps on cleanup, just on unmount - maps will persist
        };
    }, [activeTab, pendingBookings, acceptedBookings, completedBookings]);

    // Component for accepted bookings with map
    const BookingCardWithMap = ({
        booking,
        onComplete,
        completingBookingId,
        currentUserId,
        socketUrl: chatSocketUrl,
    }: {
        booking: Booking;
        onComplete: (id: number) => void;
        completingBookingId: number | null;
        currentUserId: number;
        socketUrl: string;
    }) => {
        const mapRef = useRef<HTMLDivElement>(null);
        const mapInstanceRef = useRef<L.Map | null>(null);
        const pickupMarkerRef = useRef<L.Marker | null>(null);
        const destMarkerRef = useRef<L.Marker | null>(null);
        const routeLineRef = useRef<L.Polyline | null>(null);

        useEffect(() => {
            if (!mapRef.current) return;

            const initializeMap = async () => {
                // If map already exists, just invalidate its size
                if (mapInstanceRef.current) {
                    setTimeout(() => {
                        mapInstanceRef.current?.invalidateSize();
                    }, 100);
                    return;
                }

                const container = mapRef.current as HTMLElement;

                // Ensure container has dimensions
                if (!container.offsetHeight || container.offsetHeight < 100) {
                    container.style.height = '500px';
                    container.style.minHeight = '500px';
                    container.style.width = '100%';
                }

                // Final check before initialization
                if (!container.offsetHeight || container.offsetHeight < 100) {
                    console.warn(
                        'Map container still has no height, will retry',
                    );
                    return;
                }

                try {
                    console.log('Initializing map for booking:', booking.id);
                    const map = L.map(mapRef.current!, {
                        preferCanvas: false,
                    }).setView([booking.pickup.lat, booking.pickup.lng], 13);

                    L.tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            attribution:
                                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            maxZoom: 19,
                        },
                    ).addTo(map);

                    mapInstanceRef.current = map;

                    const pickupMarker = L.marker(
                        [booking.pickup.lat, booking.pickup.lng],
                        {
                            icon: L.icon({
                                iconUrl:
                                    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                                shadowUrl:
                                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41],
                            }),
                        },
                    ).addTo(map);
                    pickupMarker.bindPopup(
                        `<b>Pickup Location</b><br>${booking.pickup.address}`,
                    );
                    pickupMarkerRef.current = pickupMarker;

                    const destMarker = L.marker(
                        [booking.destination.lat, booking.destination.lng],
                        {
                            icon: L.icon({
                                iconUrl:
                                    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                                shadowUrl:
                                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41],
                            }),
                        },
                    ).addTo(map);
                    destMarker.bindPopup(
                        `<b>Destination</b><br>${booking.destination.address}`,
                    );
                    destMarkerRef.current = destMarker;

                    // Add route using OSRM to follow roads
                    try {
                        const response = await fetch(
                            `https://router.project-osrm.org/route/v1/driving/${booking.pickup.lng},${booking.pickup.lat};${booking.destination.lng},${booking.destination.lat}?overview=full&geometries=geojson`,
                        );
                        const data = await response.json();

                        if (
                            data.code === 'Ok' &&
                            data.routes &&
                            data.routes[0]
                        ) {
                            const route = data.routes[0];
                            const coordinates = route.geometry.coordinates.map(
                                (coord: [number, number]) => [
                                    coord[1],
                                    coord[0],
                                ],
                            );

                            const routeLine = L.polyline(
                                coordinates as [number, number][],
                                {
                                    color: '#3b82f6',
                                    weight: 5,
                                    opacity: 0.7,
                                    dashArray: '10, 5',
                                },
                            ).addTo(map);
                            routeLineRef.current = routeLine;

                            const group = new L.FeatureGroup([
                                pickupMarker,
                                destMarker,
                                routeLine,
                            ]);
                            map.fitBounds(group.getBounds().pad(0.1));
                        } else {
                            const group = new L.FeatureGroup([
                                pickupMarker,
                                destMarker,
                            ]);
                            map.fitBounds(group.getBounds().pad(0.1));
                        }
                    } catch (error) {
                        console.error('Error fetching route:', error);
                        const routeLine = L.polyline(
                            [
                                [booking.pickup.lat, booking.pickup.lng],
                                [
                                    booking.destination.lat,
                                    booking.destination.lng,
                                ],
                            ],
                            {
                                color: '#3b82f6',
                                weight: 4,
                                opacity: 0.7,
                                dashArray: '10, 10',
                            },
                        ).addTo(map);
                        routeLineRef.current = routeLine;

                        const group = new L.FeatureGroup([
                            pickupMarker,
                            destMarker,
                        ]);
                        map.fitBounds(group.getBounds().pad(0.1));
                    }

                    // Force map to recalculate size
                    setTimeout(() => {
                        if (mapInstanceRef.current) {
                            mapInstanceRef.current.invalidateSize();
                            console.log('Map size invalidated');
                        }
                    }, 100);

                    setTimeout(() => {
                        if (mapInstanceRef.current) {
                            mapInstanceRef.current.invalidateSize();
                        }
                    }, 500);

                    console.log('Map initialized successfully');
                } catch (error) {
                    console.error('Error initializing map:', error);
                }
            };

            // Wait for DOM to be ready and container to have dimensions
            const timer1 = setTimeout(() => {
                if (!mapRef.current) return;
                initializeMap();
            }, 100);

            // Retry if first attempt fails (container might not be ready)
            const timer2 = setTimeout(() => {
                if (!mapRef.current) return;
                if (!mapInstanceRef.current) {
                    console.log('Retrying map initialization...');
                    initializeMap();
                }
            }, 500);

            // Re-initialize when component becomes visible
            const handleVisibilityChange = () => {
                if (!document.hidden && mapRef.current) {
                    setTimeout(() => {
                        if (mapInstanceRef.current) {
                            mapInstanceRef.current.invalidateSize();
                        } else {
                            initializeMap();
                        }
                    }, 200);
                }
            };

            document.addEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                document.removeEventListener(
                    'visibilitychange',
                    handleVisibilityChange,
                );
                // Don't remove map on cleanup - let it persist when navigating away
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
            booking.id,
            booking.pickup.lat,
            booking.pickup.lng,
            booking.destination.lat,
            booking.destination.lng,
        ]);

        const [innerTab, setInnerTab] = useState<'trip' | 'chat'>('chat');

        return (
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
                {/* Left Card - Trip | Chat tabs */}
                <Card className="flex min-h-[500px] flex-col overflow-hidden border border-gray-200 shadow-sm dark:border-gray-700">
                    <Tabs
                        value={innerTab}
                        onValueChange={(v) => setInnerTab(v as 'trip' | 'chat')}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <TabsList className="grid min-h-[44px] w-full shrink-0 grid-cols-2 gap-1 rounded-none border-b border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/50">
                            <TabsTrigger
                                value="trip"
                                className="flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 dark:data-[state=inactive]:text-gray-400"
                            >
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                Trip
                            </TabsTrigger>
                            <TabsTrigger
                                value="chat"
                                className="flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-500 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100 dark:data-[state=inactive]:text-gray-400"
                            >
                                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                                Chat
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="trip"
                            className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-lg data-[state=inactive]:hidden"
                        >
                            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
                                {/* Passenger */}
                                <section className="shrink-0 border-b border-gray-100 pb-4 dark:border-gray-700/60">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            {booking.passenger.avatar ? (
                                                <img
                                                    src={
                                                        booking.passenger.avatar
                                                    }
                                                    alt={booking.passenger.name}
                                                    className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-600"
                                                />
                                            ) : (
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600">
                                                    <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                    {booking.passenger.name}
                                                </h3>
                                                <p className="truncate font-mono text-xs text-muted-foreground">
                                                    {booking.booking_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="px-2 py-0.5 text-xs"
                                            >
                                                {booking.status ===
                                                'in_progress'
                                                    ? 'In progress'
                                                    : 'Accepted'}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-9 w-9 p-0"
                                                onClick={() =>
                                                    window.open(
                                                        `tel:${booking.passenger.phone}`,
                                                    )
                                                }
                                            >
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </section>

                                {/* Fare & route summary */}
                                <section className="shrink-0 border-b border-gray-100 py-4 dark:border-gray-700/60">
                                    <div className="mb-4 flex items-end justify-between gap-4">
                                        <div>
                                            <p className="mb-0.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                Fare
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                ₱
                                                {typeof booking.total_fare ===
                                                'number'
                                                    ? booking.total_fare.toFixed(
                                                          2,
                                                      )
                                                    : parseFloat(
                                                          String(
                                                              booking.total_fare ||
                                                                  '0',
                                                          ),
                                                      ).toFixed(2)}
                                            </p>
                                        </div>
                                        {booking.distance &&
                                            booking.duration && (
                                                <p className="text-sm text-muted-foreground tabular-nums">
                                                    {booking.distance} ·{' '}
                                                    {booking.duration}
                                                </p>
                                            )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                                                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="mb-0.5 text-xs font-medium tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
                                                    Pickup
                                                </p>
                                                <p className="warp-break-words text-sm leading-snug text-gray-900 dark:text-white">
                                                    {booking.pickup.address}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                                                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="mb-0.5 text-xs font-medium tracking-wider text-blue-700 uppercase dark:text-blue-300">
                                                    Destination
                                                </p>
                                                <p className="warp-break-words text-sm leading-snug text-gray-900 dark:text-white">
                                                    {
                                                        booking.destination
                                                            .address
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {booking.special_instructions && (
                                    <section className="shrink-0 border-b border-gray-100 py-4 dark:border-gray-700/60">
                                        <p className="mb-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            Note
                                        </p>
                                        <p className="warp-break-words rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                                            {booking.special_instructions}
                                        </p>
                                    </section>
                                )}

                                {/* Spacer to push actions down when content is short */}
                                <div className="min-h-[24px] flex-1" />
                            </div>

                            {/* Actions – fixed at bottom of tab */}
                            <div className="flex shrink-0 flex-col gap-2 border-t border-gray-100 bg-white p-4 pt-0 dark:border-gray-700/60 dark:bg-transparent">
                                <Button
                                    onClick={() => onComplete(booking.id)}
                                    disabled={
                                        completingBookingId === booking.id
                                    }
                                    size="sm"
                                    className="h-10 w-full bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    {completingBookingId === booking.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Flag className="mr-2 h-4 w-4" />
                                    )}
                                    Complete Ride
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 w-full text-sm font-medium"
                                    onClick={() =>
                                        window.open(
                                            `tel:${booking.passenger.phone}`,
                                        )
                                    }
                                >
                                    <Phone className="mr-2 h-4 w-4" />
                                    Call Passenger
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent
                            value="chat"
                            className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-lg data-[state=inactive]:hidden"
                        >
                            {currentUserId && chatSocketUrl ? (
                                <>
                                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                                        <div className="flex min-w-0 items-center gap-2">
                                            {booking.passenger.avatar ? (
                                                <img
                                                    src={
                                                        booking.passenger.avatar
                                                    }
                                                    alt={booking.passenger.name}
                                                    className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-600"
                                                />
                                            ) : (
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                </div>
                                            )}
                                            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                {booking.passenger.name}
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 shrink-0 p-0"
                                            onClick={() =>
                                                window.open(
                                                    `tel:${booking.passenger.phone}`,
                                                )
                                            }
                                        >
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                                        <BookingChat
                                            bookingId={booking.id}
                                            currentUserId={currentUserId}
                                            socketUrl={chatSocketUrl}
                                            embedded
                                            onStatus={({
                                                connected,
                                                connectError,
                                            }) => (
                                                <div className="flex shrink-0 justify-end border-b border-gray-100 px-4 py-1.5 text-xs dark:border-gray-700/50">
                                                    {connected ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400">
                                                            Live
                                                        </span>
                                                    ) : connectError ? (
                                                        <span className="text-amber-600 dark:text-amber-400">
                                                            Offline
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            Connecting…
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
                                    Chat unavailable
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>

                {/* Right Card - Map */}
                <Card className="overflow-hidden border-2 border-emerald-200 p-0 shadow-lg dark:border-emerald-500/30">
                    <div
                        className="relative h-full w-full"
                        style={{ minHeight: '500px', height: '500px' }}
                    >
                        <div
                            ref={mapRef}
                            id={`map-container-${booking.id}`}
                            className="absolute inset-0 h-full w-full"
                            style={{ height: '100%', width: '100%', zIndex: 1 }}
                        />
                        {!mapInstanceRef.current && (
                            <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                                <div className="text-center">
                                    <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Loading map...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        );
    };

    const renderCompletedBookingCard = (booking: Booking) => {
        // Simple, compact card for completed bookings
        return (
            <Card
                key={booking.id}
                className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700"
            >
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Passenger Avatar */}
                        {booking.passenger.avatar ? (
                            <img
                                src={booking.passenger.avatar}
                                alt={booking.passenger.name}
                                className="h-12 w-12 shrink-0 rounded-full border-2 border-gray-200 object-cover dark:border-gray-700"
                            />
                        ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                                <Users className="h-6 w-6 text-gray-400" />
                            </div>
                        )}

                        {/* Passenger Info & Rating */}
                        <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                                        {booking.passenger.name}
                                    </h3>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1.5 py-0 font-mono text-[9px]"
                                        >
                                            {booking.booking_id}
                                        </Badge>
                                        {booking.completed_at && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    booking.completed_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Rating Display */}
                                {booking.review ? (
                                    <div className="shrink-0">
                                        <RatingDisplay
                                            rating={booking.review.rating}
                                            size="sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span className="hidden sm:inline">
                                            Pending
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Review Comment */}
                            {booking.review?.comment && (
                                <p className="mt-2 line-clamp-2 text-xs text-gray-600 italic sm:text-sm dark:text-gray-400">
                                    "{booking.review.comment}"
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderBookingCard = (booking: Booking) => {
        // For completed bookings, use the simple compact card
        if (booking.status === 'completed') {
            return renderCompletedBookingCard(booking);
        }

        // For pending bookings, use the two-card layout: info left, map right
        // Note: accepted/in_progress bookings should use BookingCardWithMap component instead
        return (
            <div
                key={booking.id}
                className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2"
            >
                {/* Left Card - Booking Information */}
                <Card className="flex flex-col border-2 border-emerald-200 shadow-md dark:border-emerald-500/30">
                    <CardContent className="space-y-3 p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-emerald-100 pb-3 dark:border-emerald-500/20">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                {booking.passenger.avatar ? (
                                    <img
                                        src={booking.passenger.avatar}
                                        alt={booking.passenger.name}
                                        className="h-12 w-12 shrink-0 rounded-full border-2 border-emerald-300 object-cover dark:border-emerald-500/40"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/20">
                                        <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                                            {booking.passenger.name}
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1.5 py-0 font-mono text-[9px]"
                                        >
                                            {booking.booking_id}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="h-4 border-blue-200 bg-blue-50 px-1.5 py-0 text-[9px] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                                        >
                                            {booking.ride_type?.toUpperCase() ||
                                                'REGULAR'}
                                        </Badge>
                                        <Badge
                                            variant={
                                                booking.status === 'pending'
                                                    ? 'default'
                                                    : 'default'
                                            }
                                            className={`h-4 px-1.5 py-0 text-[9px] ${
                                                booking.status === 'pending'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-blue-500 text-white'
                                            }`}
                                        >
                                            {booking.status === 'in_progress'
                                                ? 'IN PROGRESS'
                                                : booking.status
                                                      .replace('_', ' ')
                                                      .toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        <a
                                            href={`tel:${booking.passenger.phone}`}
                                            className="hover:underline"
                                        >
                                            {booking.passenger.phone}
                                        </a>
                                        <span className="mx-1">•</span>
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {formatTimeAgo(booking.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                    <p className="mb-0.5 text-[9px] text-muted-foreground">
                                        Fare
                                    </p>
                                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                        ₱
                                        {typeof booking.total_fare === 'number'
                                            ? booking.total_fare.toFixed(2)
                                            : parseFloat(
                                                  booking.total_fare || '0',
                                              ).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Locations */}
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 rounded border border-emerald-100 bg-emerald-50/50 p-2 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <div className="min-w-0 flex-1">
                                    <p className="mb-0.5 text-[10px] font-semibold text-emerald-700 uppercase dark:text-emerald-300">
                                        Pickup
                                    </p>
                                    <p className="warp-break-words text-xs font-medium text-gray-900 dark:text-white">
                                        {booking.pickup.address}
                                    </p>
                                    {booking.pickup.barangay && (
                                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                                            {booking.pickup.barangay}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-2 rounded border border-blue-100 bg-blue-50/50 p-2 dark:border-blue-500/10 dark:bg-blue-500/5">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                <div className="min-w-0 flex-1">
                                    <p className="mb-0.5 text-[10px] font-semibold text-blue-700 uppercase dark:text-blue-300">
                                        Destination
                                    </p>
                                    <p className="warp-break-words text-xs font-medium text-gray-900 dark:text-white">
                                        {booking.destination.address}
                                    </p>
                                    {booking.destination.barangay && (
                                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                                            {booking.destination.barangay}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Route Info */}
                        {booking.distance && booking.duration && (
                            <div className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
                                <div className="flex flex-1 items-center gap-1.5">
                                    <Navigation className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Distance
                                        </p>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {booking.distance}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex flex-1 items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Duration
                                        </p>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {booking.duration}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="space-y-2">
                            {booking.special_instructions && (
                                <div className="rounded border border-amber-200 bg-amber-50 p-2 dark:border-amber-500/20 dark:bg-amber-500/10">
                                    <div className="flex items-start gap-1.5">
                                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                        <div>
                                            <p className="mb-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                                                Special Instructions
                                            </p>
                                            <p className="text-xs text-amber-900 dark:text-amber-200">
                                                {booking.special_instructions}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {booking.emergency_contact &&
                                booking.emergency_contact.name && (
                                    <div className="rounded border border-red-200 bg-red-50 p-2 dark:border-red-500/20 dark:bg-red-500/10">
                                        <div className="flex items-start gap-1.5">
                                            <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                                            <div>
                                                <p className="mb-0.5 text-[10px] font-semibold text-red-800 dark:text-red-300">
                                                    Emergency Contact
                                                </p>
                                                <p className="text-xs text-red-900 dark:text-red-200">
                                                    {
                                                        booking
                                                            .emergency_contact
                                                            ?.name
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        booking
                                                            .emergency_contact
                                                            ?.phone
                                                    }
                                                    {booking.emergency_contact
                                                        ?.relationship &&
                                                        ` (${booking.emergency_contact.relationship})`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Action Buttons */}
                        {booking.status === 'pending' && (
                            <div className="flex flex-col gap-2 border-t border-emerald-100 pt-2 dark:border-emerald-500/20">
                                {hasActiveBooking && (
                                    <p className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                                        You have an active booking. Complete or
                                        cancel it to accept new requests.
                                    </p>
                                )}
                                <Button
                                    onClick={() =>
                                        handleAcceptBooking(booking.id)
                                    }
                                    disabled={
                                        acceptingBookingId === booking.id ||
                                        hasActiveBooking
                                    }
                                    size="sm"
                                    className="h-9 w-full bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                                >
                                    {acceptingBookingId === booking.id ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                            {hasActiveBooking
                                                ? 'One booking at a time'
                                                : 'Accept Booking'}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-full border border-emerald-200 text-xs hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10"
                                    onClick={() =>
                                        window.open(
                                            `tel:${booking.passenger.phone}`,
                                        )
                                    }
                                >
                                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                                    Call Passenger
                                </Button>
                            </div>
                        )}

                        {(booking.status === 'accepted' ||
                            booking.status === 'in_progress') && (
                            <div className="flex flex-col gap-2 border-t border-emerald-100 pt-2 dark:border-emerald-500/20">
                                <Button
                                    onClick={() =>
                                        handleCompleteRide(booking.id)
                                    }
                                    disabled={
                                        completingBookingId === booking.id
                                    }
                                    size="sm"
                                    className="h-9 w-full bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                                >
                                    {completingBookingId === booking.id ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            Completing...
                                        </>
                                    ) : (
                                        <>
                                            <Flag className="mr-1.5 h-3.5 w-3.5" />
                                            Complete Ride
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-full border border-emerald-200 text-xs hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10"
                                    onClick={() =>
                                        window.open(
                                            `tel:${booking.passenger.phone}`,
                                        )
                                    }
                                >
                                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                                    Call Passenger
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Card - OSRM Map */}
                <Card className="flex flex-col overflow-hidden border-2 border-emerald-200 p-0 shadow-md dark:border-emerald-500/30">
                    <div
                        id={`map-${booking.id}`}
                        className="z-0 w-full flex-1"
                        style={{ minHeight: '400px', height: '400px' }}
                    />
                </Card>
            </div>
        );
    };

    return (
        <DriverLayout>
            <Head title="Bookings" />

            <div className="space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-500/10 p-2 dark:bg-emerald-500/20">
                                <ClipboardList className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Bookings
                            </h1>
                        </div>
                        <p className="ml-14 text-gray-600 dark:text-gray-400">
                            Manage all your ride bookings and track their status
                        </p>
                    </div>
                </div>

                {!isOnline && (
                    <Card className="border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-950/20">
                        <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                                <WifiOff className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                    You are offline
                                </h3>
                                <p className="max-w-md text-muted-foreground">
                                    Bookings are only visible when you're
                                    online. Go online using the toggle in the
                                    top bar to see pending requests and manage
                                    your rides.
                                </p>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-400">
                                Switch to <strong>Online</strong> in the
                                navigation bar to get started.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {isOnline && (
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger
                                value="pending"
                                className="flex items-center gap-2"
                            >
                                <Bell className="h-4 w-4" />
                                Pending
                                {(pendingBookings?.length || 0) > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {pendingBookings?.length || 0}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="accepted"
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Accepted
                                {(acceptedBookings?.length || 0) > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {acceptedBookings?.length || 0}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="flex items-center gap-2"
                            >
                                <Car className="h-4 w-4" />
                                Completed
                                {(completedBookings?.length || 0) > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {completedBookings?.length || 0}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="mt-6 space-y-3">
                            {hasActiveBooking &&
                                (pendingBookings?.length ?? 0) > 0 && (
                                    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                                        <span className="shrink-0 text-amber-600 dark:text-amber-400">
                                            One booking at a time.
                                        </span>
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            Complete or cancel your active ride
                                            in the <strong>Accepted</strong> tab
                                            before you can accept new requests.
                                        </p>
                                    </div>
                                )}
                            {pendingBookings && pendingBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingBookings.map(renderBookingCard)}
                                </div>
                            ) : (
                                <Card className="border-dashed">
                                    <CardContent className="p-12 text-center">
                                        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                            <ClipboardList className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                            No Pending Bookings
                                        </h3>
                                        <p className="text-muted-foreground">
                                            You don't have any pending booking
                                            requests at the moment.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent
                            value="accepted"
                            className="mt-6 space-y-3"
                        >
                            {cancelledBanner && (
                                <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                                    <span className="text-sm text-amber-800 dark:text-amber-200">
                                        A booking was cancelled by the
                                        passenger.
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setCancelledBanner(false)
                                        }
                                        className="shrink-0 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            )}
                            {acceptedBookings && acceptedBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {acceptedBookings.map((booking) =>
                                        booking.status === 'accepted' ||
                                        booking.status === 'in_progress' ? (
                                            <BookingCardWithMap
                                                key={booking.id}
                                                booking={booking}
                                                onComplete={handleCompleteRide}
                                                completingBookingId={
                                                    completingBookingId
                                                }
                                                currentUserId={
                                                    auth?.user?.id ?? 0
                                                }
                                                socketUrl={socketUrl ?? ''}
                                            />
                                        ) : (
                                            renderBookingCard(booking)
                                        ),
                                    )}
                                </div>
                            ) : (
                                <Card className="border-dashed">
                                    <CardContent className="p-12 text-center">
                                        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                                            <CheckCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                            No Accepted Bookings
                                        </h3>
                                        <p className="text-muted-foreground">
                                            You haven't accepted any bookings
                                            yet.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent
                            value="completed"
                            className="mt-6 space-y-3"
                        >
                            {completedBookings &&
                            completedBookings.length > 0 ? (
                                <div className="space-y-2">
                                    {completedBookings.map(renderBookingCard)}
                                </div>
                            ) : (
                                <Card className="border-dashed">
                                    <CardContent className="p-8 text-center sm:p-12">
                                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 sm:h-20 sm:w-20 dark:bg-gray-700">
                                            <Car className="h-8 w-8 text-gray-600 sm:h-10 sm:w-10 dark:text-gray-400" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
                                            No Completed Rides
                                        </h3>
                                        <p className="text-sm text-muted-foreground sm:text-base">
                                            You haven't completed any rides yet.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </DriverLayout>
    );
}
