import DriverLayout from '@/layouts/DriverLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { 
    ClipboardList,
    Bell,
    MapPin,
    Clock,
    Phone,
    CheckCircle,
    X,
    FileText,
    Loader2,
    Navigation,
    Users,
    Map,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Car,
    Flag,
    Sparkles,
    ArrowRight,
    Star,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import bookings from '@/routes/bookings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RatingDisplay from '@/components/RatingDisplay';

// Import Leaflet for mapping
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
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
    const { pendingBookings = [], acceptedBookings = [], completedBookings = [] } = usePage().props as { 
        pendingBookings?: Booking[];
        acceptedBookings?: Booking[];
        completedBookings?: Booking[];
    };
    const [acceptingBookingId, setAcceptingBookingId] = useState<number | null>(null);
    const [completingBookingId, setCompletingBookingId] = useState<number | null>(null);
    const [expandedMaps, setExpandedMaps] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState('pending');
    const mapRefs = useRef<{ [key: number]: { map: L.Map | null; container: HTMLDivElement | null } }>({});

    const handleAcceptBooking = async (bookingId: number) => {
        setAcceptingBookingId(bookingId);
        try {
            // Use Inertia router.post which handles CSRF automatically
            router.post(bookings.accept.url({ booking: bookingId }), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
                onError: (errors) => {
                    const errorMessage = errors.message || errors.error || 'Failed to accept booking';
                    console.error('Failed to accept booking:', errorMessage);
                    alert(`Failed to accept booking: ${errorMessage}`);
                },
                onFinish: () => {
                    setAcceptingBookingId(null);
                }
            });
        } catch (error) {
            console.error('Error accepting booking:', error);
            setAcceptingBookingId(null);
        }
    };

    const handleCompleteRide = async (bookingId: number) => {
        setCompletingBookingId(bookingId);
        try {
            // Use Inertia router.post which handles CSRF automatically
            router.post(bookings.complete.url({ booking: bookingId }), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
                onError: (errors) => {
                    const errorMessage = errors.message || errors.error || 'Failed to complete ride';
                    console.error('Failed to complete ride:', errorMessage);
                    alert(`Failed to complete ride: ${errorMessage}`);
                },
                onFinish: () => {
                    setCompletingBookingId(null);
                }
            });
        } catch (error) {
            console.error('Error completing ride:', error);
            setCompletingBookingId(null);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const toggleMap = (bookingId: number) => {
        setExpandedMaps(prev => {
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
        const allBookings = [...(pendingBookings || []), ...(acceptedBookings || []), ...(completedBookings || [])];
        
        const initializeMaps = () => {
            allBookings.forEach((booking) => {
                const mapContainer = document.getElementById(`map-${booking.id}`);
                // Check if container exists and is in the DOM
                if (mapContainer && mapContainer.offsetParent !== null) {
                    // If map already exists, just invalidate its size and ensure it's still attached
                    if (mapRefs.current[booking.id]?.map) {
                        const existingMap = mapRefs.current[booking.id].map;
                        // Check if map is still valid (not removed from DOM)
                        try {
                            if (existingMap && existingMap.getContainer() && existingMap.getContainer().parentNode) {
                                setTimeout(() => {
                                    existingMap.invalidateSize();
                                }, 100);
                                return;
                            } else {
                                // Map was removed, clear reference and reinitialize
                                mapRefs.current[booking.id].map = null;
                            }
                        } catch (e) {
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
                        if (containerElement.offsetHeight === 0 || containerElement.offsetWidth === 0) {
                            console.log(`Map container for booking ${booking.id} not ready yet, will retry`);
                            return;
                        }
                        
                        // Check if Leaflet already initialized a map on this container
                        if ((containerElement as any)._leaflet_id) {
                            // Container already has a map, try to get it
                            const existingMap = (L as any).map.get(containerElement);
                            if (existingMap) {
                                mapRefs.current[booking.id] = { map: existingMap, container: mapContainer as HTMLDivElement };
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
                            13
                        );

                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            maxZoom: 19,
                        }).addTo(map);

                        const pickupMarker = L.marker([booking.pickup.lat, booking.pickup.lng], {
                            icon: L.icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            })
                        }).addTo(map);
                        pickupMarker.bindPopup(`<b>Pickup Location</b><br>${booking.pickup.address}`);

                        const destMarker = L.marker([booking.destination.lat, booking.destination.lng], {
                            icon: L.icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            })
                        }).addTo(map);
                        destMarker.bindPopup(`<b>Destination</b><br>${booking.destination.address}`);

                        // Add route using OSRM to follow roads
                        (async () => {
                            try {
                                const response = await fetch(
                                    `https://router.project-osrm.org/route/v1/driving/${booking.pickup.lng},${booking.pickup.lat};${booking.destination.lng},${booking.destination.lat}?overview=full&geometries=geojson`
                                );
                                const data = await response.json();
                                
                                if (data.code === 'Ok' && data.routes && data.routes[0]) {
                                    const route = data.routes[0];
                                    // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
                                    const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                                    
                                    const routeLine = L.polyline(coordinates as [number, number][], {
                                        color: '#3b82f6',
                                        weight: 5,
                                        opacity: 0.7,
                                        dashArray: '10, 5',
                                    }).addTo(map);
                                    
                                    // Fit map to show route
                                    const group = new L.FeatureGroup([pickupMarker, destMarker, routeLine]);
                                    map.fitBounds(group.getBounds().pad(0.1));
                                } else {
                                    // Fallback: fit to markers
                                    const group = new L.FeatureGroup([pickupMarker, destMarker]);
                                    map.fitBounds(group.getBounds().pad(0.1));
                                }
                            } catch (error) {
                                console.error('Error fetching route:', error);
                                // Fallback: draw straight line
                                L.polyline(
                                    [[booking.pickup.lat, booking.pickup.lng], [booking.destination.lat, booking.destination.lng]],
                                    { color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '10, 10' }
                                ).addTo(map);
                                
                                const group = new L.FeatureGroup([pickupMarker, destMarker]);
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

                        mapRefs.current[booking.id] = { map, container: mapContainer as HTMLDivElement };
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
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            // Don't remove maps on cleanup, just on unmount - maps will persist
        };
    }, [activeTab, pendingBookings, acceptedBookings, completedBookings]);

    // Component for accepted bookings with map
    const BookingCardWithMap = ({ booking, onComplete, completingBookingId }: { booking: Booking; onComplete: (id: number) => void; completingBookingId: number | null }) => {
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
                    console.warn('Map container still has no height, will retry');
                    return;
                }
                
                try {
                    console.log('Initializing map for booking:', booking.id);
                    const map = L.map(mapRef.current!, {
                        preferCanvas: false,
                    }).setView(
                        [booking.pickup.lat, booking.pickup.lng],
                        13
                    );

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        maxZoom: 19,
                    }).addTo(map);

                    mapInstanceRef.current = map;

                    const pickupMarker = L.marker([booking.pickup.lat, booking.pickup.lng], {
                        icon: L.icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })
                    }).addTo(map);
                    pickupMarker.bindPopup(`<b>Pickup Location</b><br>${booking.pickup.address}`);
                    pickupMarkerRef.current = pickupMarker;

                    const destMarker = L.marker([booking.destination.lat, booking.destination.lng], {
                        icon: L.icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })
                    }).addTo(map);
                    destMarker.bindPopup(`<b>Destination</b><br>${booking.destination.address}`);
                    destMarkerRef.current = destMarker;

                    // Add route using OSRM to follow roads
                    try {
                        const response = await fetch(
                            `https://router.project-osrm.org/route/v1/driving/${booking.pickup.lng},${booking.pickup.lat};${booking.destination.lng},${booking.destination.lat}?overview=full&geometries=geojson`
                        );
                        const data = await response.json();
                        
                        if (data.code === 'Ok' && data.routes && data.routes[0]) {
                            const route = data.routes[0];
                            const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                            
                            const routeLine = L.polyline(coordinates as [number, number][], {
                                color: '#3b82f6',
                                weight: 5,
                                opacity: 0.7,
                                dashArray: '10, 5',
                            }).addTo(map);
                            routeLineRef.current = routeLine;
                            
                            const group = new L.FeatureGroup([pickupMarker, destMarker, routeLine]);
                            map.fitBounds(group.getBounds().pad(0.1));
                        } else {
                            const group = new L.FeatureGroup([pickupMarker, destMarker]);
                            map.fitBounds(group.getBounds().pad(0.1));
                        }
                    } catch (error) {
                        console.error('Error fetching route:', error);
                        const routeLine = L.polyline(
                            [[booking.pickup.lat, booking.pickup.lng], [booking.destination.lat, booking.destination.lng]],
                            { color: '#3b82f6', weight: 4, opacity: 0.7, dashArray: '10, 10' }
                        ).addTo(map);
                        routeLineRef.current = routeLine;
                        
                        const group = new L.FeatureGroup([pickupMarker, destMarker]);
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
            
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                // Don't remove map on cleanup - let it persist when navigating away
            };
        }, [booking.id, booking.pickup.lat, booking.pickup.lng, booking.destination.lat, booking.destination.lng]);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Card - Ride Details */}
                    <Card className="border-2 border-emerald-200 dark:border-emerald-500/30 shadow-lg">
                        <CardContent className="p-6 space-y-4">
                        {/* Header with Passenger Info */}
                        <div className="flex items-start gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-500/20">
                            {booking.passenger.avatar ? (
                                <img 
                                    src={booking.passenger.avatar} 
                                    alt={booking.passenger.name}
                                    className="w-16 h-16 rounded-full border-3 border-emerald-300 dark:border-emerald-500/40 object-cover shrink-0 shadow-md"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-3 border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center shrink-0 shadow-md">
                                    <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">
                                        {booking.passenger.name}
                                    </h3>
                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono bg-emerald-50 dark:bg-emerald-500/10">
                                        {booking.booking_id}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300">
                                        {booking.ride_type?.toUpperCase() || 'REGULAR'}
                                    </Badge>
                                    <Badge className="text-xs bg-emerald-500 text-white px-2 py-1">
                                        {booking.status === 'in_progress' ? 'IN PROGRESS' : 'ACCEPTED'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <a 
                                            href={`tel:${booking.passenger.phone}`}
                                            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                                        >
                                            {booking.passenger.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            {formatTimeAgo(booking.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fare Display */}
                        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Total Fare</p>
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    ₱{typeof booking.total_fare === 'number' ? booking.total_fare.toFixed(2) : parseFloat(booking.total_fare || '0').toFixed(2)}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Passengers</p>
                                <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                                    {booking.passenger_count} {booking.passenger_count === 1 ? 'person' : 'people'}
                                </p>
                            </div>
                        </div>

                        {/* Location Cards */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg shrink-0">
                                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                                        Pickup Location
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white warp-break-words">
                                        {booking.pickup.address}
                                    </p>
                                    {booking.pickup.barangay && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                            📍 {booking.pickup.barangay}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg shrink-0">
                                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
                                        Destination
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white warp-break-words">
                                        {booking.destination.address}
                                    </p>
                                    {booking.destination.barangay && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            📍 {booking.destination.barangay}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Route Info */}
                        {booking.distance && booking.duration && (
                            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded">
                                        <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Distance</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{booking.distance}</p>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded">
                                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Duration</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{booking.duration}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Special Instructions */}
                        {booking.special_instructions && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                                    <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">Special Instructions</p>
                                            <p className="text-sm text-amber-900 dark:text-amber-200">{booking.special_instructions}</p>
                                        </div>
                                    </div>
                                </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 pt-3 border-t border-emerald-100 dark:border-emerald-500/20">
                            <Button
                                onClick={() => onComplete(booking.id)}
                                disabled={completingBookingId === booking.id}
                                size="lg"
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-11 text-sm font-semibold"
                            >
                                {completingBookingId === booking.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <Flag className="w-4 h-4 mr-2" />
                                        Complete Ride
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full border-2 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 h-10 text-sm font-medium transition-all"
                                onClick={() => window.open(`tel:${booking.passenger.phone}`)}
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Call Passenger
                            </Button>
                        </div>
                        </CardContent>
                    </Card>

                    {/* Right Card - Map */}
                    <Card className="border-2 border-emerald-200 dark:border-emerald-500/30 shadow-lg p-0 overflow-hidden">
                        <div className="relative w-full h-full" style={{ minHeight: '500px', height: '500px' }}>
                            <div 
                                ref={mapRef}
                                id={`map-container-${booking.id}`}
                                className="absolute inset-0 w-full h-full"
                                style={{ height: '100%', width: '100%', zIndex: 1 }}
                            />
                            {!mapInstanceRef.current && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 z-0">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
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
            <Card key={booking.id} className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Passenger Avatar */}
                        {booking.passenger.avatar ? (
                            <img 
                                src={booking.passenger.avatar} 
                                alt={booking.passenger.name}
                                className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                        
                        {/* Passenger Info & Rating */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                        {booking.passenger.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono h-4">
                                            {booking.booking_id}
                                        </Badge>
                                        {booking.completed_at && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(booking.completed_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Rating Display */}
                                {booking.review ? (
                                    <div className="shrink-0">
                                        <RatingDisplay rating={booking.review.rating} size="sm" />
                                    </div>
                                ) : (
                                    <div className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span className="hidden sm:inline">Pending</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Review Comment */}
                            {booking.review?.comment && (
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic mt-2 line-clamp-2">
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
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch"
            >
                {/* Left Card - Booking Information */}
                <Card className="border-2 border-emerald-200 dark:border-emerald-500/30 shadow-md flex flex-col">
                    <CardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-emerald-100 dark:border-emerald-500/20">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                {booking.passenger.avatar ? (
                                    <img 
                                        src={booking.passenger.avatar} 
                                        alt={booking.passenger.name}
                                        className="w-12 h-12 rounded-full border-2 border-emerald-300 dark:border-emerald-500/40 object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center shrink-0">
                                        <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
                                            {booking.passenger.name}
                                        </h3>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono h-4">
                                            {booking.booking_id}
                                        </Badge>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300">
                                            {booking.ride_type?.toUpperCase() || 'REGULAR'}
                                        </Badge>
                                        <Badge 
                                            variant={booking.status === 'pending' ? 'default' : 'default'}
                                            className={`text-[9px] px-1.5 py-0 h-4 ${
                                                booking.status === 'pending' 
                                                    ? 'bg-emerald-500 text-white' 
                                                    : 'bg-blue-500 text-white'
                                            }`}
                                        >
                                            {booking.status === 'in_progress'
                                                ? 'IN PROGRESS'
                                                : booking.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Phone className="w-3 h-3" />
                                        <a 
                                            href={`tel:${booking.passenger.phone}`}
                                            className="hover:underline"
                                        >
                                            {booking.passenger.phone}
                                        </a>
                                        <span className="mx-1">•</span>
                                        <Clock className="w-3 h-3" />
                                        <span>{formatTimeAgo(booking.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                                    <p className="text-[9px] text-muted-foreground mb-0.5">Fare</p>
                                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                        ₱{typeof booking.total_fare === 'number' ? booking.total_fare.toFixed(2) : parseFloat(booking.total_fare || '0').toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Locations */}
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 p-2 rounded bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase mb-0.5">Pickup</p>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white warp-break-words">{booking.pickup.address}</p>
                                    {booking.pickup.barangay && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{booking.pickup.barangay}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 rounded bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase mb-0.5">Destination</p>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white warp-break-words">{booking.destination.address}</p>
                                    {booking.destination.barangay && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{booking.destination.barangay}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Route Info */}
                        {booking.distance && booking.duration && (
                            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-1.5 flex-1">
                                    <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Distance</p>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{booking.distance}</p>
                                    </div>
                                </div>
                                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex items-center gap-1.5 flex-1">
                                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Duration</p>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{booking.duration}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="space-y-2">
                            {booking.special_instructions && (
                                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded border border-amber-200 dark:border-amber-500/20">
                                    <div className="flex items-start gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 mb-0.5">Special Instructions</p>
                                            <p className="text-xs text-amber-900 dark:text-amber-200">{booking.special_instructions}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {booking.emergency_contact && booking.emergency_contact.name && (
                                <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded border border-red-200 dark:border-red-500/20">
                                    <div className="flex items-start gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-red-800 dark:text-red-300 mb-0.5">Emergency Contact</p>
                                            <p className="text-xs text-red-900 dark:text-red-200">
                                                {booking.emergency_contact?.name} - {booking.emergency_contact?.phone}
                                                {booking.emergency_contact?.relationship && ` (${booking.emergency_contact.relationship})`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {booking.status === 'pending' && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-500/20">
                                <Button
                                    onClick={() => handleAcceptBooking(booking.id)}
                                    disabled={acceptingBookingId === booking.id}
                                    size="sm"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-9 text-xs font-semibold disabled:opacity-50"
                                >
                                    {acceptingBookingId === booking.id ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                            Accept Booking
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 h-8 text-xs"
                                    onClick={() => window.open(`tel:${booking.passenger.phone}`)}
                                >
                                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                                    Call Passenger
                                </Button>
                            </div>
                        )}

                        {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-500/20">
                                <Button
                                    onClick={() => handleCompleteRide(booking.id)}
                                    disabled={completingBookingId === booking.id}
                                    size="sm"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-9 text-xs font-semibold disabled:opacity-50"
                                >
                                    {completingBookingId === booking.id ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                            Completing...
                                        </>
                                    ) : (
                                        <>
                                            <Flag className="w-3.5 h-3.5 mr-1.5" />
                                            Complete Ride
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 h-8 text-xs"
                                    onClick={() => window.open(`tel:${booking.passenger.phone}`)}
                                >
                                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                                    Call Passenger
                                </Button>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Right Card - OSRM Map */}
                <Card className="border-2 border-emerald-200 dark:border-emerald-500/30 shadow-md p-0 overflow-hidden flex flex-col">
                    <div 
                        id={`map-${booking.id}`}
                        className="w-full flex-1 z-0"
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                                <ClipboardList className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookings</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-14">
                            Manage all your ride bookings and track their status
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Pending
                            {(pendingBookings?.length || 0) > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {pendingBookings?.length || 0}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="accepted" className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Accepted
                            {(acceptedBookings?.length || 0) > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {acceptedBookings?.length || 0}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            Completed
                            {(completedBookings?.length || 0) > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {completedBookings?.length || 0}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-3 mt-6">
                        {pendingBookings && pendingBookings.length > 0 ? (
                            <div className="space-y-3">
                                {pendingBookings.map(renderBookingCard)}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-4">
                                        <ClipboardList className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Pending Bookings</h3>
                                    <p className="text-muted-foreground">You don't have any pending booking requests at the moment.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="accepted" className="space-y-3 mt-6">
                        {acceptedBookings && acceptedBookings.length > 0 ? (
                            <div className="space-y-3">
                                {acceptedBookings.map((booking) => 
                                    booking.status === 'accepted' || booking.status === 'in_progress' 
                                        ? <BookingCardWithMap 
                                            key={booking.id} 
                                            booking={booking} 
                                            onComplete={handleCompleteRide}
                                            completingBookingId={completingBookingId}
                                        />
                                        : renderBookingCard(booking)
                                )}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-500/20 mb-4">
                                        <CheckCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Accepted Bookings</h3>
                                    <p className="text-muted-foreground">You haven't accepted any bookings yet.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-3 mt-6">
                        {completedBookings && completedBookings.length > 0 ? (
                            <div className="space-y-2">
                                {completedBookings.map(renderBookingCard)}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-8 sm:p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                                        <Car className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Completed Rides</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground">You haven't completed any rides yet.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DriverLayout>
    );
}
