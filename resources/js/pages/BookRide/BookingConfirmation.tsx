import BookingChat from '@/components/BookingChat';
import RatingModal from '@/components/RatingModal';
import TricycleSearchingAnimation from '@/components/TricycleSearchingAnimation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { router, usePage } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    AlertCircle,
    AlertTriangle,
    Car,
    Check,
    CheckCircle,
    Clock,
    CreditCard,
    FileText,
    History,
    Loader2,
    Map as MapIcon,
    MapPin,
    Navigation,
    Navigation2,
    PhoneCall,
    Shield,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Fix for default markers in Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationData {
    lat: number;
    lng: number;
    address: string;
    name?: string;
    barangay?: string;
    purok?: string;
    type?: string;
}

interface RouteInfo {
    distance: string;
    duration: string;
    fare: string;
    totalFare: string;
    estimatedArrival: string;
}

interface RideFormData {
    rideType: string;
    passengerName: string;
    passengerPhone: string;
    passengerCount: number;
    specialInstructions: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    destination: LocationData | null;
}

interface DriverData {
    id: string;
    name: string;
    phone: string;
    vehicleNumber: string;
    rating: number;
    avatar?: string | null;
    location: {
        lat: number;
        lng: number;
    };
}

type BookingStatus =
    | 'pending'
    | 'submitting'
    | 'waiting'
    | 'accepted'
    | 'in-progress'
    | 'completed'
    | 'cancelled';

interface BookingConfirmationProps {
    formData: RideFormData;
    userLocation: LocationData | null;
    routeInfo: RouteInfo | null;
    onBookingComplete?: () => void;
    onCancel?: () => void;
}

export default function BookingConfirmation({
    formData,
    userLocation,
    routeInfo,
    onCancel,
}: BookingConfirmationProps) {
    const { activeBooking, auth, socketUrl } = usePage().props as {
        activeBooking?: {
            id?: number;
            booking_id?: string;
            status?: string;
            driver?: {
                id?: number;
                name?: string;
                phone?: string;
                avatar?: string | null;
            };
            driver_application?: { vehicle_plate_number?: string };
            review?: unknown;
        };
        auth?: { user?: { id?: number } };
        socketUrl?: string;
    };

    // Initialize state from active booking if it exists
    const [bookingStatus, setBookingStatus] = useState<BookingStatus>(() => {
        if (activeBooking) {
            if (activeBooking.status === 'completed') {
                return 'completed';
            } else if (
                activeBooking.status === 'accepted' &&
                activeBooking.driver
            ) {
                return 'accepted';
            } else if (activeBooking.status === 'pending') {
                return 'waiting';
            }
        }
        return 'pending';
    });

    const [driver, setDriver] = useState<DriverData | null>(() => {
        if (activeBooking?.driver) {
            return {
                id:
                    activeBooking.driver.id != null
                        ? String(activeBooking.driver.id)
                        : '0',
                name: activeBooking.driver.name || 'Driver',
                phone: activeBooking.driver.phone || '',
                vehicleNumber:
                    activeBooking.driver_application?.vehicle_plate_number ||
                    'N/A',
                rating: 4.8,
                avatar: activeBooking.driver.avatar || null,
                location: {
                    lat:
                        (userLocation?.lat || 0) +
                        (Math.random() * 0.01 - 0.005),
                    lng:
                        (userLocation?.lng || 0) +
                        (Math.random() * 0.01 - 0.005),
                },
            };
        }
        return null;
    });

    const [bookingId, setBookingId] = useState<string | null>(() => {
        return activeBooking?.booking_id || null;
    });
    const [bookingDbId, setBookingDbId] = useState<number | null>(() => {
        return activeBooking?.id || null;
    });
    const [isCancelling, setIsCancelling] = useState(false);
    const [isSendingSOS, setIsSendingSOS] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(() => {
        // Show modal if booking is completed and not reviewed
        if (activeBooking?.status === 'completed' && !activeBooking?.review) {
            return true;
        }
        return false;
    });
    const [hasReviewed, setHasReviewed] = useState(() => {
        return activeBooking?.review ? true : false;
    });
    const chatCardRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const passengerMarkerRef = useRef<L.Marker | null>(null);
    const driverMarkerRef = useRef<L.Marker | null>(null);
    const routeLineRef = useRef<L.Polyline | null>(null);
    const driverLocationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Helper to get CSRF token from cookies or meta tag
    // Kept for future API calls
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getCsrfToken = () => {
        // Try meta tag first (if it exists)
        const metaToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
        if (metaToken) {
            return metaToken;
        }

        // Fallback to cookie (Laravel stores it as XSRF-TOKEN)
        const name = 'XSRF-TOKEN';
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) {
                return decodeURIComponent(value);
            }
        }
        return '';
    };

    // Scroll chat into view when driver accepts (so passenger can start chatting right away)
    useEffect(() => {
        if (bookingStatus === 'accepted' && chatCardRef.current) {
            const timer = setTimeout(() => {
                chatCardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [bookingStatus]);

    // Submit booking using Inertia router (handles CSRF automatically)
    const handleConfirmBooking = () => {
        if (!formData.destination || !userLocation || !routeInfo) {
            alert('Please complete all booking details before confirming.');
            return;
        }

        setBookingStatus('submitting');

        // Build full address with barangay and province when missing
        const fullPickupAddress =
            userLocation.barangay &&
            !userLocation.address.includes('Negros Occidental')
                ? `${userLocation.address}, ${userLocation.barangay}, Hinobaan, Negros Occidental`
                : userLocation.address;
        const fullDestinationAddress =
            formData.destination.barangay &&
            !formData.destination.address.includes('Negros Occidental')
                ? `${formData.destination.address}, ${formData.destination.barangay}, Hinobaan, Negros Occidental`
                : formData.destination.address;

        // Prepare booking data
        const bookingData = {
            ride_type: formData.rideType,
            passenger_count: formData.passengerCount,
            pickup_lat: userLocation.lat,
            pickup_lng: userLocation.lng,
            pickup_address: fullPickupAddress,
            pickup_barangay: userLocation.barangay || null,
            pickup_purok: userLocation.purok || null,
            pickup_designation:
                userLocation.type &&
                ['home', 'school', 'work', 'other'].includes(userLocation.type)
                    ? userLocation.type
                    : null,
            destination_lat: formData.destination.lat,
            destination_lng: formData.destination.lng,
            destination_address: fullDestinationAddress,
            destination_barangay: formData.destination.barangay || null,
            destination_purok: formData.destination.purok || null,
            destination_designation:
                formData.destination.type &&
                ['home', 'school', 'work', 'other'].includes(
                    formData.destination.type,
                )
                    ? formData.destination.type
                    : null,
            distance: routeInfo.distance,
            duration: routeInfo.duration,
            fare: parseFloat(routeInfo.fare.replace(/[^0-9.]/g, '')),
            total_fare: parseFloat(routeInfo.totalFare.replace(/[^0-9.]/g, '')),
            estimated_arrival: routeInfo.estimatedArrival || null,
            passenger_name: formData.passengerName,
            passenger_phone: formData.passengerPhone,
            special_instructions: formData.specialInstructions || null,
            emergency_contact_name: formData.emergencyContactName || null,
            emergency_contact_phone: formData.emergencyContactPhone || null,
            emergency_contact_relationship:
                formData.emergencyContactRelationship || null,
        };

        // Use Inertia router.post which handles CSRF automatically
        router.post('/bookings', bookingData, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Try to get booking from flash data or page props
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const flash = (page.props as any).flash;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const booking = flash?.booking || (page.props as any).booking;

                if (booking && booking.id) {
                    setBookingId(booking.booking_id ?? null);
                    setBookingStatus('waiting');
                    localStorage.setItem(
                        'activeBookingId',
                        booking.id.toString(),
                    );
                    localStorage.setItem('activeBookingStatus', 'waiting');
                    // Poll for driver acceptance
                    pollForDriverAcceptance(booking.id);
                } else {
                    // If booking not in response, we need to fetch it
                    // For now, set status and try to get booking ID from a follow-up request
                    setBookingStatus('waiting');
                    console.warn(
                        'Booking created but booking data not in response',
                    );
                    // Try to reload and get the booking
                    setTimeout(() => {
                        router.reload({
                            only: ['activeBooking'],
                            onSuccess: (page) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const activeBooking = (page.props as any)
                                    .activeBooking;
                                if (activeBooking && activeBooking.id) {
                                    setBookingId(
                                        activeBooking.booking_id ?? null,
                                    );
                                    pollForDriverAcceptance(activeBooking.id);
                                }
                            },
                        });
                    }, 500);
                }
            },
            onError: (errors) => {
                console.error('Booking failed:', errors);
                const errorMessage =
                    errors.message ||
                    errors.error ||
                    'Failed to create booking';
                alert(`Booking failed: ${errorMessage}`);
                setBookingStatus('pending');
            },
            onFinish: () => {
                // This runs whether success or error
            },
        });
    };

    // Poll for driver acceptance - continue even if component unmounts
    const pollForDriverAcceptance = (bookingId: number) => {
        const maxAttempts = 300; // Poll for up to 10 minutes (300 * 2 seconds)
        let attempts = 0;
        let pollTimeout: NodeJS.Timeout | null = null;
        let isPolling = true;

        const poll = async () => {
            if (!isPolling) return;

            try {
                const response = await fetch(
                    `/api/bookings/${bookingId}/status`,
                    {
                        method: 'GET',
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                    },
                );

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (
                        contentType &&
                        contentType.includes('application/json')
                    ) {
                        const result = await response.json();
                        const booking = result.booking;

                        if (
                            booking.status === 'accepted' &&
                            booking.driver_id &&
                            booking.driver
                        ) {
                            // Use driver information from booking response
                            const driverData = booking.driver;
                            const driverApplication =
                                driverData.approvedDriverApplication || {};

                            if (isPolling) {
                                setDriver({
                                    id: booking.driver_id.toString(),
                                    name: driverData.name || 'Driver',
                                    phone: driverData.phone || '',
                                    vehicleNumber:
                                        driverApplication.vehicle_plate_number ||
                                        'N/A',
                                    rating: 4.8, // Default rating, can be calculated from reviews later
                                    avatar: driverData.avatar || null,
                                    location: {
                                        lat:
                                            (userLocation?.lat || 0) +
                                            (Math.random() * 0.01 - 0.005),
                                        lng:
                                            (userLocation?.lng || 0) +
                                            (Math.random() * 0.01 - 0.005),
                                    },
                                });
                                setBookingStatus('accepted');
                                setBookingDbId(booking.id);
                                // Update localStorage
                                localStorage.setItem(
                                    'activeBookingStatus',
                                    'accepted',
                                );
                                // Start polling for completion
                                pollForCompletion(booking.id);
                            }
                            if (pollTimeout) {
                                clearTimeout(pollTimeout);
                                pollTimeout = null;
                            }
                            return;
                        } else if (booking.status === 'completed') {
                            if (isPolling) {
                                setBookingStatus('completed');
                                setBookingDbId(booking.id);
                                // Check if already reviewed
                                if (booking.review) {
                                    setHasReviewed(true);
                                } else {
                                    // Show rating modal after a short delay
                                    setTimeout(() => {
                                        setShowRatingModal(true);
                                    }, 1000);
                                }
                                localStorage.removeItem('activeBookingId');
                                localStorage.removeItem('activeBookingStatus');
                            }
                            if (pollTimeout) {
                                clearTimeout(pollTimeout);
                                pollTimeout = null;
                            }
                            return;
                        } else if (booking.status === 'cancelled') {
                            if (isPolling) {
                                setBookingStatus('cancelled');
                                localStorage.removeItem('activeBookingId');
                                localStorage.removeItem('activeBookingStatus');
                            }
                            if (pollTimeout) {
                                clearTimeout(pollTimeout);
                                pollTimeout = null;
                            }
                            return;
                        }
                    } else {
                        // Response is not JSON, might be HTML error page
                        console.warn(
                            'Polling received non-JSON response, stopping poll',
                        );
                        if (pollTimeout) {
                            clearTimeout(pollTimeout);
                            pollTimeout = null;
                        }
                        return;
                    }
                } else {
                    // Response not OK, check if it's a client error (4xx) and stop polling
                    if (response.status >= 400 && response.status < 500) {
                        console.warn(
                            `Polling stopped due to client error: ${response.status}`,
                        );
                        if (pollTimeout) {
                            clearTimeout(pollTimeout);
                            pollTimeout = null;
                        }
                        return;
                    }
                }

                attempts++;
                if (attempts < maxAttempts && isPolling) {
                    pollTimeout = setTimeout(poll, 2000); // Poll every 2 seconds
                } else {
                    // Timeout - booking still pending
                    if (isPolling) {
                        setBookingStatus('waiting');
                        localStorage.setItem('activeBookingStatus', 'waiting');
                    }
                }
            } catch (error) {
                console.error('Error polling for driver acceptance:', error);
                attempts++;
                if (attempts < maxAttempts && isPolling) {
                    pollTimeout = setTimeout(poll, 2000);
                }
            }
        };

        poll();

        // Return cleanup function
        return () => {
            isPolling = false;
            if (pollTimeout) {
                clearTimeout(pollTimeout);
                pollTimeout = null;
            }
        };
    };

    // Poll for booking completion when status is accepted
    const pollForCompletion = (bookingId: number) => {
        const maxAttempts = 1800; // Poll for up to 1 hour (1800 * 2 seconds)
        let attempts = 0;
        let pollTimeout: NodeJS.Timeout | null = null;
        let isPolling = true;

        const poll = async () => {
            if (!isPolling) return;

            try {
                const response = await fetch(
                    `/api/bookings/${bookingId}/status`,
                    {
                        method: 'GET',
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                    },
                );

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (
                        contentType &&
                        contentType.includes('application/json')
                    ) {
                        const result = await response.json();
                        const booking = result.booking;

                        if (booking.status === 'completed') {
                            if (isPolling) {
                                setBookingStatus('completed');
                                setBookingDbId(booking.id);
                                // Check if already reviewed
                                if (booking.review) {
                                    setHasReviewed(true);
                                } else {
                                    // Show rating modal after a short delay
                                    setTimeout(() => {
                                        setShowRatingModal(true);
                                    }, 1000);
                                }
                                localStorage.removeItem('activeBookingId');
                                localStorage.removeItem('activeBookingStatus');
                            }
                            if (pollTimeout) {
                                clearTimeout(pollTimeout);
                                pollTimeout = null;
                            }
                            return;
                        } else if (booking.status === 'cancelled') {
                            if (isPolling) {
                                setBookingStatus('cancelled');
                                localStorage.removeItem('activeBookingId');
                                localStorage.removeItem('activeBookingStatus');
                            }
                            if (pollTimeout) {
                                clearTimeout(pollTimeout);
                                pollTimeout = null;
                            }
                            return;
                        }
                    } else {
                        // Response is not JSON, might be HTML error page
                        console.warn(
                            'Polling received non-JSON response, stopping poll',
                        );
                        if (pollTimeout) {
                            clearTimeout(pollTimeout);
                            pollTimeout = null;
                        }
                        return;
                    }
                } else {
                    // Response not OK, check if it's a client error (4xx) and stop polling
                    if (response.status >= 400 && response.status < 500) {
                        console.warn(
                            `Polling stopped due to client error: ${response.status}`,
                        );
                        if (pollTimeout) {
                            clearTimeout(pollTimeout);
                            pollTimeout = null;
                        }
                        return;
                    }
                }

                attempts++;
                if (attempts < maxAttempts && isPolling) {
                    pollTimeout = setTimeout(poll, 2000); // Poll every 2 seconds
                }
            } catch (error) {
                console.error('Error polling for completion:', error);
                attempts++;
                if (attempts < maxAttempts && isPolling) {
                    pollTimeout = setTimeout(poll, 2000);
                }
            }
        };

        poll();

        // Return cleanup function
        return () => {
            isPolling = false;
            if (pollTimeout) {
                clearTimeout(pollTimeout);
                pollTimeout = null;
            }
        };
    };

    // Check for active booking on mount and continue polling if needed
    useEffect(() => {
        let pollingCleanup: (() => void) | null = null;

        if (activeBooking && activeBooking.id) {
            const bookingId = activeBooking.id;

            if (activeBooking.status === 'pending') {
                // Continue polling if booking is still pending
                setBookingStatus('waiting');
                setBookingId(activeBooking.booking_id ?? null);
                setBookingDbId(activeBooking.id ?? null);
                // Start polling using the existing function
                pollingCleanup = pollForDriverAcceptance(bookingId);
            } else if (
                activeBooking.status === 'accepted' &&
                activeBooking.driver
            ) {
                // Booking already accepted, show driver info
                setBookingStatus('accepted');
                setBookingId(activeBooking.booking_id ?? null);
                setBookingDbId(activeBooking.id ?? null);
                if (activeBooking.driver) {
                    setDriver({
                        id:
                            activeBooking.driver.id != null
                                ? String(activeBooking.driver.id)
                                : '0',
                        name: activeBooking.driver.name || 'Driver',
                        phone: activeBooking.driver.phone || '',
                        vehicleNumber:
                            activeBooking.driver_application
                                ?.vehicle_plate_number || 'N/A',
                        rating: 4.8,
                        avatar: activeBooking.driver.avatar || null,
                        location: {
                            lat:
                                (userLocation?.lat || 0) +
                                (Math.random() * 0.01 - 0.005),
                            lng:
                                (userLocation?.lng || 0) +
                                (Math.random() * 0.01 - 0.005),
                        },
                    });
                }
                // Start polling for completion
                pollingCleanup = pollForCompletion(activeBooking.id);
            } else if (activeBooking.status === 'completed') {
                // Booking already completed
                setBookingStatus('completed');
                setBookingId(activeBooking.booking_id ?? null);
                setBookingDbId(activeBooking.id ?? null);
                // Check if already reviewed
                if (activeBooking.review) {
                    setHasReviewed(true);
                } else {
                    // Show rating modal
                    setTimeout(() => {
                        setShowRatingModal(true);
                    }, 1000);
                }
            }
        }

        return () => {
            if (pollingCleanup) {
                pollingCleanup();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeBooking, userLocation]);

    // Initialize map when booking is accepted
    useEffect(() => {
        if (
            bookingStatus === 'accepted' &&
            driver &&
            userLocation &&
            formData.destination &&
            mapRef.current
        ) {
            let isMounted = true;

            const initializeMap = async () => {
                if (!isMounted || !mapRef.current) return;

                try {
                    // Clean up existing map if it exists
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.remove();
                        mapInstanceRef.current = null;
                    }

                    // Wait for container to have dimensions
                    const container = mapRef.current;
                    if (
                        container.offsetHeight === 0 ||
                        container.offsetWidth === 0
                    ) {
                        setTimeout(() => {
                            if (isMounted && mapRef.current) {
                                initializeMap();
                            }
                        }, 100);
                        return;
                    }

                    // Initialize map
                    const map = L.map(container, {
                        preferCanvas: false,
                    }).setView([userLocation.lat, userLocation.lng], 14);

                    L.tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            attribution:
                                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            maxZoom: 19,
                        },
                    ).addTo(map);

                    mapInstanceRef.current = map;

                    // Force map to recalculate size
                    setTimeout(() => {
                        if (isMounted && mapInstanceRef.current) {
                            mapInstanceRef.current.invalidateSize();
                        }
                    }, 100);

                    if (!isMounted) return;
                    const mapInstance = mapInstanceRef.current;

                    // Clear existing markers and route
                    if (passengerMarkerRef.current) {
                        mapInstance.removeLayer(passengerMarkerRef.current);
                        passengerMarkerRef.current = null;
                    }
                    if (driverMarkerRef.current) {
                        mapInstance.removeLayer(driverMarkerRef.current);
                        driverMarkerRef.current = null;
                    }
                    if (routeLineRef.current) {
                        mapInstance.removeLayer(routeLineRef.current);
                        routeLineRef.current = null;
                    }

                    // Create passenger marker (pickup location)
                    const passengerIcon = L.divIcon({
                        className: 'custom-passenger-marker',
                        html: `<div style="
                            background-color: #10b981;
                            width: 36px;
                            height: 36px;
                            border-radius: 50% 50% 50% 0;
                            transform: rotate(-45deg);
                            border: 3px solid white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        "></div><div style="
                            position: absolute;
                            top: 9px;
                            left: 9px;
                            transform: rotate(45deg);
                            color: white;
                            font-weight: bold;
                            font-size: 16px;
                        ">P</div>`,
                        iconSize: [36, 36],
                        iconAnchor: [18, 36],
                    });

                    const passengerMarker = L.marker(
                        [userLocation.lat, userLocation.lng],
                        {
                            icon: passengerIcon,
                        },
                    ).addTo(mapInstance);
                    passengerMarker.bindPopup(
                        `<strong>Passenger (You)</strong><br>${userLocation.address}`,
                    );
                    passengerMarkerRef.current = passengerMarker;

                    // Create driver marker
                    const driverIcon = L.divIcon({
                        className: 'custom-driver-marker',
                        html: `<div style="
                            background-color: #3b82f6;
                            width: 36px;
                            height: 36px;
                            border-radius: 50% 50% 50% 0;
                            transform: rotate(-45deg);
                            border: 3px solid white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        "></div><div style="
                            position: absolute;
                            top: 9px;
                            left: 9px;
                            transform: rotate(45deg);
                            color: white;
                            font-weight: bold;
                            font-size: 16px;
                        ">D</div>`,
                        iconSize: [36, 36],
                        iconAnchor: [18, 36],
                    });

                    const driverMarker = L.marker(
                        [driver.location.lat, driver.location.lng],
                        {
                            icon: driverIcon,
                        },
                    ).addTo(mapInstance);
                    driverMarker.bindPopup(
                        `<strong>Driver: ${driver.name}</strong><br>Plate: ${driver.vehicleNumber}<br>Rating: ${driver.rating} ⭐`,
                    );
                    driverMarkerRef.current = driverMarker;

                    // Draw route from driver to passenger (pickup route)
                    try {
                        const response = await fetch(
                            `https://router.project-osrm.org/route/v1/driving/${driver.location.lng},${driver.location.lat};${userLocation.lng},${userLocation.lat}?overview=full&geometries=geojson`,
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
                            ).addTo(mapInstance);
                            routeLineRef.current = routeLine;
                        }
                    } catch (error) {
                        console.error('Error fetching route:', error);
                        // Fallback: draw straight line
                        if (isMounted && mapInstanceRef.current) {
                            const routeLine = L.polyline(
                                [
                                    [driver.location.lat, driver.location.lng],
                                    [userLocation.lat, userLocation.lng],
                                ],
                                {
                                    color: '#3b82f6',
                                    weight: 5,
                                    opacity: 0.7,
                                    dashArray: '10, 5',
                                },
                            ).addTo(mapInstanceRef.current);
                            routeLineRef.current = routeLine;
                        }
                    }

                    if (!isMounted || !mapInstanceRef.current) return;

                    // Fit map to show both markers
                    const group = new L.FeatureGroup([
                        passengerMarker,
                        driverMarker,
                    ]);
                    mapInstance.fitBounds(group.getBounds().pad(0.2));

                    // Invalidate size again after fitting bounds
                    setTimeout(() => {
                        if (isMounted && mapInstanceRef.current) {
                            mapInstanceRef.current.invalidateSize();
                        }
                    }, 200);

                    // Simulate driver movement towards passenger
                    driverLocationIntervalRef.current = setInterval(() => {
                        if (
                            driverMarkerRef.current &&
                            passengerMarkerRef.current
                        ) {
                            const driverPos =
                                driverMarkerRef.current.getLatLng();
                            const passengerPos =
                                passengerMarkerRef.current.getLatLng();

                            // Move driver slightly closer to passenger
                            const latDiff = passengerPos.lat - driverPos.lat;
                            const lngDiff = passengerPos.lng - driverPos.lng;

                            const newLat = driverPos.lat + latDiff * 0.1;
                            const newLng = driverPos.lng + lngDiff * 0.1;

                            // Stop if very close
                            const distance = Math.sqrt(
                                latDiff * latDiff + lngDiff * lngDiff,
                            );
                            if (distance < 0.0001) {
                                if (driverLocationIntervalRef.current) {
                                    clearInterval(
                                        driverLocationIntervalRef.current,
                                    );
                                    driverLocationIntervalRef.current = null;
                                }
                                if (isMounted) {
                                    setBookingStatus('in-progress');
                                }
                                return;
                            }

                            driverMarkerRef.current.setLatLng([newLat, newLng]);

                            // Update route line
                            if (
                                routeLineRef.current &&
                                mapInstanceRef.current
                            ) {
                                mapInstanceRef.current.removeLayer(
                                    routeLineRef.current,
                                );
                                const newRouteLine = L.polyline(
                                    [
                                        [newLat, newLng],
                                        [passengerPos.lat, passengerPos.lng],
                                    ],
                                    {
                                        color: '#3b82f6',
                                        weight: 5,
                                        opacity: 0.7,
                                        dashArray: '10, 5',
                                    },
                                ).addTo(mapInstanceRef.current);
                                routeLineRef.current = newRouteLine;
                            }
                        }
                    }, 2000);
                } catch (error) {
                    console.error('Error initializing map:', error);
                }
            };

            // Delay initialization to ensure DOM is ready
            const timer = setTimeout(() => {
                if (isMounted) {
                    initializeMap();
                }
            }, 100);

            // Cleanup
            return () => {
                isMounted = false;
                clearTimeout(timer);
                if (driverLocationIntervalRef.current) {
                    clearInterval(driverLocationIntervalRef.current);
                    driverLocationIntervalRef.current = null;
                }
                if (passengerMarkerRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(
                        passengerMarkerRef.current,
                    );
                    passengerMarkerRef.current = null;
                }
                if (driverMarkerRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(driverMarkerRef.current);
                    driverMarkerRef.current = null;
                }
                if (routeLineRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(routeLineRef.current);
                    routeLineRef.current = null;
                }
            };
        }
    }, [bookingStatus, driver, userLocation, formData.destination]);

    // Cleanup map on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const handleSendSOS = async () => {
        if (
            !confirm(
                'Send an SOS? Your emergency contact will receive an SMS (usually within 1–2 minutes). ' +
                    'For immediate danger, call 911 now.',
            )
        ) {
            return;
        }

        setIsSendingSOS(true);

        try {
            const currentLocation = userLocation || {
                lat: 0,
                lng: 0,
                address: 'Location unavailable',
            };

            const sosData = {
                booking_id: bookingDbId,
                latitude: currentLocation.lat,
                longitude: currentLocation.lng,
                address: currentLocation.address,
                driver_id: driver?.id,
                driver_name: driver?.name,
                driver_phone: driver?.phone,
                vehicle_number: driver?.vehicleNumber,
            };

            router.post('/bookings/sos', sosData, {
                preserveScroll: true,
                onSuccess: () => {
                    alert(
                        'SOS sent. Your emergency contact will receive an SMS shortly (usually within 1–2 minutes). ' +
                            'For immediate danger, call 911.',
                    );
                },
                onError: (errors) => {
                    console.error('SOS failed:', errors);
                    alert(
                        'SOS could not be sent. Please call 911 if you need immediate help.',
                    );
                },
                onFinish: () => {
                    setIsSendingSOS(false);
                },
            });
        } catch (error) {
            console.error('SOS error:', error);
            alert(
                'SOS could not be sent. Please call 911 if you need immediate help.',
            );
            setIsSendingSOS(false);
        }
    };

    const handleCancelBooking = async () => {
        if (isCancelling) return;

        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        setIsCancelling(true);

        // Get booking ID from activeBooking or localStorage
        const bookingIdToCancel =
            activeBooking?.id || localStorage.getItem('activeBookingId');

        if (!bookingIdToCancel) {
            // If no booking ID, just clear local state
            setBookingStatus('cancelled');
            localStorage.removeItem('activeBookingId');
            localStorage.removeItem('activeBookingStatus');
            setIsCancelling(false);
            if (onCancel) {
                onCancel();
            }
            return;
        }

        // Stop polling if active
        if (driverLocationIntervalRef.current) {
            clearInterval(driverLocationIntervalRef.current);
            driverLocationIntervalRef.current = null;
        }

        try {
            // Use Inertia router.post which handles CSRF automatically
            router.post(
                `/bookings/${bookingIdToCancel}/cancel`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setBookingStatus('cancelled');
                        // Clear localStorage
                        localStorage.removeItem('activeBookingId');
                        localStorage.removeItem('activeBookingStatus');
                        setIsCancelling(false);
                        if (onCancel) {
                            onCancel();
                        }
                    },
                    onError: (errors) => {
                        console.error('Error cancelling booking:', errors);
                        const errorMessage =
                            errors.message ||
                            errors.error ||
                            'Failed to cancel booking';
                        alert(errorMessage);
                        setIsCancelling(false);
                    },
                    onFinish: () => {
                        setIsCancelling(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking. Please try again.');
            setIsCancelling(false);
        }
    };

    // Render based on booking status
    if (bookingStatus === 'pending') {
        return (
            <div className="space-y-6">
                <Card className="border-emerald-500/20 bg-linear-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
                            <div className="w-full lg:w-2/3">
                                <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
                                    Ready to Book Your Ride?
                                </h3>
                                <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                    Confirm your booking and your driver will be
                                    notified immediately.
                                </p>
                                <div className="mt-3 space-y-2 sm:mt-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 shrink-0 text-emerald-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Cash payment to driver upon arrival
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Verified Hinobaan tricycle drivers
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Service area: All 13 barangays
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 shrink-0 text-emerald-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Tariff: ₱20 for first 5km
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full flex-col items-center lg:w-1/3 lg:items-end">
                                <div className="mb-3 text-2xl font-bold text-emerald-500 sm:text-3xl">
                                    {routeInfo?.totalFare || '₱0.00'}
                                </div>
                                <Button
                                    type="button"
                                    size="lg"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirmBooking();
                                    }}
                                    disabled={!routeInfo}
                                    className="w-full bg-emerald-500 px-6 text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Confirm & Book Ride
                                </Button>
                                <p className="mt-2 text-center text-xs text-gray-500 lg:text-right dark:text-gray-500">
                                    Pay in cash to the driver
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (bookingStatus === 'submitting') {
        return (
            <div className="animate-in space-y-6 duration-300 fade-in">
                <Card className="border-emerald-500/30 bg-linear-to-br from-emerald-50/80 to-emerald-100/40 shadow-lg dark:from-emerald-500/10 dark:to-emerald-600/5">
                    <CardContent className="p-8 sm:p-12 lg:p-16">
                        <div className="flex flex-col items-center justify-center space-y-6 text-center">
                            <div className="relative">
                                <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-emerald-100 sm:h-24 sm:w-24 dark:bg-emerald-500/20">
                                    <Loader2 className="h-12 w-12 animate-spin text-emerald-500 sm:h-16 sm:w-16 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                                    Submitting Your Booking...
                                </h3>
                                <p className="max-w-md text-base text-gray-600 sm:text-lg dark:text-gray-400">
                                    Please wait while we process your ride
                                    request
                                </p>
                            </div>
                            <div className="w-full max-w-xs">
                                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="animate-loading h-full rounded-full bg-emerald-500"></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (bookingStatus === 'waiting') {
        return (
            <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-4">
                <Card className="border-blue-500/30 bg-linear-to-br from-blue-50/80 to-blue-100/40 shadow-lg dark:from-blue-500/10 dark:to-blue-600/5">
                    <CardContent className="p-6 sm:p-8 lg:p-12">
                        <div className="flex flex-col items-center justify-center space-y-6 text-center">
                            {/* Tricycle A→B animation */}
                            <TricycleSearchingAnimation />

                            {/* Status Text */}
                            <div className="max-w-md space-y-3">
                                <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                                    Looking for a Driver
                                </h3>
                                <p className="text-base text-gray-600 sm:text-lg dark:text-gray-400">
                                    We're matching you with the best available
                                    driver in your area...
                                </p>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                                    <span>Searching nearby drivers</span>
                                </div>
                            </div>

                            {/* Booking ID */}
                            {bookingId && (
                                <div className="flex flex-col items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="border-2 bg-white px-4 py-2 font-mono text-sm dark:bg-gray-900"
                                    >
                                        <FileText className="mr-2 h-3 w-3" />
                                        {bookingId}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">
                                        Keep this ID for your records
                                    </p>
                                </div>
                            )}

                            {/* Progress Indicator */}
                            <div className="w-full max-w-md space-y-2">
                                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Searching...</span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                                        <span>Active</span>
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="animate-loading h-full rounded-full bg-blue-500"></div>
                                </div>
                            </div>

                            {/* Cancel Button */}
                            <Button
                                variant="outline"
                                onClick={handleCancelBooking}
                                disabled={isCancelling}
                                className="mt-4 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel Booking
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-500/20 dark:bg-blue-500/5">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-500/20">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    What happens next?
                                </h4>
                                <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                        <span>
                                            A nearby driver will receive your
                                            booking request
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                        <span>
                                            You'll be notified immediately when
                                            a driver accepts
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                        <span>
                                            You can track your driver's location
                                            in real-time
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (bookingStatus === 'accepted' && driver) {
        return (
            <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-4">
                {/* Chat + driver card (no separate "coming soon" / Driver Found card — focus on communicating) */}
                <div ref={chatCardRef}>
                    <Card className="overflow-hidden border-emerald-500/20 bg-white shadow-lg dark:bg-gray-800">
                        {/* Header: avatar + name | Call, SOS, Share + status */}
                        <div className="flex items-center justify-between gap-3 border-b border-emerald-200/50 bg-emerald-50/30 px-4 py-3 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                {driver.avatar ? (
                                    <img
                                        src={driver.avatar}
                                        alt={driver.name}
                                        className="h-12 w-12 shrink-0 rounded-full border-2 border-emerald-200 object-cover dark:border-emerald-500/30"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/20">
                                        <Car className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                                        {driver.name}
                                    </h3>
                                    <p className="truncate font-mono text-xs text-emerald-600 dark:text-emerald-400">
                                        {driver.vehicleNumber}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    size="sm"
                                    className="h-9 bg-emerald-500 px-3 text-white hover:bg-emerald-600"
                                    onClick={() =>
                                        window.open(`tel:${driver.phone}`)
                                    }
                                >
                                    <PhoneCall className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-9 bg-red-600 px-3 text-white hover:bg-red-700"
                                    onClick={handleSendSOS}
                                    disabled={isSendingSOS}
                                >
                                    {isSendingSOS ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <AlertTriangle className="h-4 w-4" />
                                    )}
                                    <span className="ml-1.5 hidden sm:inline">
                                        SOS
                                    </span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 px-3"
                                    onClick={() =>
                                        navigator.share &&
                                        navigator.share({
                                            title: 'Driver',
                                            text: `Driver: ${driver.name}\nPhone: ${driver.phone}\nPlate: ${driver.vehicleNumber}`,
                                        })
                                    }
                                >
                                    <MapPin className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {/* Chat */}
                        {bookingDbId && auth?.user?.id && socketUrl && (
                            <div className="flex min-h-[240px] flex-col">
                                <BookingChat
                                    bookingId={bookingDbId}
                                    currentUserId={auth.user.id}
                                    socketUrl={socketUrl}
                                    embedded
                                    onStatus={({ connected, connectError }) => (
                                        <div className="flex items-center justify-end gap-2 border-b border-emerald-200/30 bg-emerald-50/20 px-3 py-1.5 text-xs dark:border-emerald-800/30 dark:bg-emerald-950/20">
                                            {connected ? (
                                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                    Live
                                                </span>
                                            ) : connectError ? (
                                                <span
                                                    className="text-amber-600 dark:text-amber-400"
                                                    title={
                                                        typeof window !==
                                                            'undefined' &&
                                                        /^localhost$|^127\.0\.0\.1$/i.test(
                                                            window.location
                                                                .hostname,
                                                        )
                                                            ? 'Run: npm run socket'
                                                            : 'Chat server unavailable'
                                                    }
                                                >
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
                        )}
                    </Card>
                </div>
                <p className="px-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Emergency contact receives SMS when you tap SOS. Delivery
                    usually 1–2 min.
                </p>

                {/* Cancel Button */}
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={handleCancelBooking}
                        disabled={isCancelling}
                        className="border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Cancel Booking
                            </>
                        )}
                    </Button>
                </div>

                {/* Map Card */}
                <Card className="overflow-hidden border-2 border-emerald-200 shadow-lg dark:border-emerald-500/20">
                    <CardHeader className="border-b border-emerald-100 bg-emerald-50/50 pb-3 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
                                    <MapIcon className="h-5 w-5 text-emerald-500" />
                                    Live Location Tracking
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs sm:text-sm">
                                    Track your driver's location in real-time
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                            >
                                <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
                                Live
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div
                            ref={mapRef}
                            className="h-64 w-full rounded-b-lg sm:h-96 lg:h-[500px]"
                        />
                    </CardContent>
                </Card>

                {/* Route Info */}
                {routeInfo && (
                    <Card className="border-gray-200 shadow-md dark:border-gray-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold sm:text-lg">
                                Ride Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Navigation className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                            Distance
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                                        {routeInfo.distance}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <p className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                            Duration
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                                        {routeInfo.duration}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                    <div className="mb-2 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                            Fare
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-emerald-600 sm:text-2xl dark:text-emerald-400">
                                        {routeInfo.totalFare}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                                            ETA
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-blue-600 sm:text-2xl dark:text-blue-400">
                                        {routeInfo.estimatedArrival}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    if (bookingStatus === 'in-progress') {
        return (
            <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-4">
                <Card className="border-blue-500/30 bg-linear-to-br from-blue-50/80 to-blue-100/40 shadow-lg dark:from-blue-500/10 dark:to-blue-600/5">
                    <CardContent className="p-6 sm:p-8 lg:p-12">
                        <div className="flex flex-col items-center justify-center space-y-6 text-center">
                            <div className="relative">
                                <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-blue-100 sm:h-32 sm:w-32 dark:bg-blue-500/20">
                                    <Navigation2 className="h-12 w-12 animate-bounce text-blue-500 sm:h-16 sm:w-16 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                                    Driver Arriving Soon! 🚗
                                </h3>
                                <p className="max-w-md text-base text-gray-600 sm:text-lg dark:text-gray-400">
                                    Your driver is nearby. Please be ready at
                                    your pickup location.
                                </p>
                            </div>
                            {driver && (
                                <div className="w-full max-w-md rounded-lg border border-blue-200 bg-white p-4 shadow-md dark:border-blue-500/20 dark:bg-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {driver.avatar ? (
                                                <img
                                                    src={driver.avatar}
                                                    alt={driver.name}
                                                    className="h-12 w-12 shrink-0 rounded-full border-2 border-emerald-200 object-cover dark:border-emerald-500/30"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/20">
                                                    <Car className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {driver.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {driver.vehicleNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-emerald-500 text-white hover:bg-emerald-600"
                                            onClick={() =>
                                                window.open(
                                                    `tel:${driver.phone}`,
                                                )
                                            }
                                        >
                                            <PhoneCall className="mr-1 h-4 w-4" />
                                            Call
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (bookingStatus === 'completed') {
        const handleViewRideHistory = () => {
            router.visit('/passenger/ride-history');
        };

        const handleBookAnotherRide = () => {
            // Clear localStorage
            localStorage.removeItem('activeBookingId');
            localStorage.removeItem('activeBookingStatus');
            // Reset the form by calling onCancel if provided
            if (onCancel) {
                onCancel();
            } else {
                // Fallback: reload the page to reset everything
                window.location.href = '/BookRide';
            }
        };

        return (
            <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-4">
                <Card className="border-emerald-500/30 bg-linear-to-br from-emerald-50/80 to-emerald-100/40 shadow-lg dark:from-emerald-500/10 dark:to-emerald-600/5">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <CheckCircle className="mb-4 h-16 w-16 text-emerald-500 sm:h-20 sm:w-20" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                                Ride Completed! 🎉
                            </h3>
                            <p className="mb-4 max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                Thank you for riding with TriGo. We hope you had
                                a great experience.
                            </p>
                            <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <Button
                                    onClick={handleViewRideHistory}
                                    variant="outline"
                                    className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 sm:w-auto dark:hover:bg-emerald-900/20"
                                >
                                    <History className="mr-2 h-4 w-4" />
                                    View Ride History
                                </Button>
                                <Button
                                    onClick={handleBookAnotherRide}
                                    className="w-full bg-emerald-500 text-white hover:bg-emerald-600 sm:w-auto"
                                >
                                    <Car className="mr-2 h-4 w-4" />
                                    Book Another Ride
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rating Modal */}
                {bookingDbId && bookingStatus === 'completed' && (
                    <RatingModal
                        bookingId={bookingDbId}
                        isOpen={showRatingModal}
                        onClose={() => {
                            setShowRatingModal(false);
                        }}
                        hasReviewed={hasReviewed}
                        driverName={driver?.name || 'Driver'}
                    />
                )}
            </div>
        );
    }

    if (bookingStatus === 'cancelled') {
        return (
            <div className="space-y-6">
                <Card className="border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <AlertCircle className="mb-4 h-16 w-16 text-red-500 sm:h-20 sm:w-20" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                                Booking Cancelled
                            </h3>
                            <p className="mb-4 max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                Your booking has been cancelled. You can start a
                                new booking anytime.
                            </p>
                            {onCancel && (
                                <Button onClick={onCancel}>
                                    Start New Booking
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Default fallback - should not happen, but prevents blank screen
    console.warn('Unknown booking status:', bookingStatus);
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                        <AlertCircle className="mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                            Loading...
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please wait while we load your booking information.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
