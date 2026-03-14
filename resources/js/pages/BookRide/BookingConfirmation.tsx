import BookingChat from '@/components/BookingChat';
import RatingModal from '@/components/RatingModal';
import TricycleSearchingAnimation from '@/components/TricycleSearchingAnimation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
    MessageCircle,
    Navigation,
    Navigation2,
    PhoneCall,
    Shield,
    X,
} from 'lucide-react';
import { useRealtimeLocationPing } from '@/hooks/use-location-ping';
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
    fareType?: 'regular' | 'discounted';
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
                location?: { lat: number; lng: number } | null;
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
            }
            if (
                activeBooking.status === 'in_progress' &&
                activeBooking.driver
            ) {
                return 'in-progress';
            }
            if (
                activeBooking.status === 'accepted' &&
                activeBooking.driver
            ) {
                return 'accepted';
            }
            if (activeBooking.status === 'pending') {
                return 'waiting';
            }
        }
        return 'pending';
    });

    const [driver, setDriver] = useState<DriverData | null>(() => {
        if (activeBooking?.driver) {
            const loc = activeBooking.driver.location;
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
                        loc?.lat ??
                        (userLocation?.lat || 0) +
                            (Math.random() * 0.01 - 0.005),
                    lng:
                        loc?.lng ??
                        (userLocation?.lng || 0) +
                            (Math.random() * 0.01 - 0.005),
                },
            };
        }
        return null;
    });

    // Realtime location ping so driver/passenger maps can show live position
    useRealtimeLocationPing(
        !!(
            activeBooking &&
            (activeBooking.status === 'accepted' ||
                activeBooking.status === 'in_progress')
        ),
    );

    // Poll for driver position and status (e.g. in_progress after driver clicks Start trip)
    useEffect(() => {
        if (
            !activeBooking ||
            !(activeBooking.status === 'accepted' || activeBooking.status === 'in_progress')
        )
            return;
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['activeBooking'] });
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [activeBooking?.id, activeBooking?.status]);

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
    const [rideTab, setRideTab] = useState<'trip' | 'chat'>('trip');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReasonInput, setCancelReasonInput] = useState('');
    const [cancellationReasonDisplay, setCancellationReasonDisplay] = useState<
        string | null
    >(null);
    const [cancelledByDisplay, setCancelledByDisplay] = useState<
        'passenger' | 'driver' | null
    >(null);
    const chatCardRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const passengerMarkerRef = useRef<L.Marker | null>(null);
    const driverMarkerRef = useRef<L.Marker | null>(null);
    const destMarkerRef = useRef<L.Marker | null>(null);
    const routeLineRef = useRef<L.Polyline | null>(null);
    const driverLocationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sync state when activeBooking changes (e.g. after "Start New Booking" or new booking created)
    useEffect(() => {
        const status: BookingStatus = activeBooking
            ? activeBooking.status === 'completed'
                ? 'completed'
                : activeBooking.status === 'in_progress' && activeBooking.driver
                  ? 'in-progress'
                  : activeBooking.status === 'accepted' && activeBooking.driver
                    ? 'accepted'
                    : activeBooking.status === 'pending'
                      ? 'waiting'
                      : 'pending'
            : 'pending';
        setBookingStatus(status);

        const nextDriver: DriverData | null = activeBooking?.driver
            ? {
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
              }
            : null;
        setDriver(nextDriver);

        setBookingId(activeBooking?.booking_id ?? null);
        setBookingDbId(activeBooking?.id ?? null);
        setShowRatingModal(
            !!(activeBooking?.status === 'completed' && !activeBooking?.review),
        );
        setHasReviewed(!!activeBooking?.review);
        setCancellationReasonDisplay(null);
        setCancelledByDisplay(null);
    }, [activeBooking, userLocation?.lat, userLocation?.lng]);

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
            fare_type: formData.fareType ?? 'regular',
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
            preserveState: true,
            onSuccess: (page) => {
                // Try to get booking from flash data or page props
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const flash = (page.props as any)?.flash;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const booking = flash?.booking || (page.props as any)?.booking;

                if (booking && booking.id) {
                    setBookingDbId(booking.id);
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
                    // If booking not in response, try to fetch it from the latest booking
                    setBookingStatus('waiting');
                    console.warn(
                        'Booking created but booking data not in response, fetching...',
                    );
                    // Fetch the latest booking for this user
                    setTimeout(() => {
                        router.reload({
                            only: ['activeBooking'],
                            onSuccess: (reloadPage) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const activeBooking = (reloadPage.props as any)
                                    ?.activeBooking;
                                if (activeBooking && activeBooking.id) {
                                    setBookingDbId(activeBooking.id);
                                    setBookingId(
                                        activeBooking.booking_id ?? null,
                                    );
                                    pollForDriverAcceptance(activeBooking.id);
                                } else {
                                    // Last resort: reload full page to get booking
                                    window.location.reload();
                                }
                            },
                        });
                    }, 1000);
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
                                setCancellationReasonDisplay(
                                    booking.cancellation_reason ?? null,
                                );
                                setCancelledByDisplay(
                                    (booking.cancelled_by as
                                        | 'passenger'
                                        | 'driver') ?? null,
                                );
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

                        if (booking.status === 'in_progress') {
                            if (isPolling) {
                                setBookingStatus('in-progress');
                                setBookingDbId(booking.id);
                                const driverData = booking.driver;
                                const driverApplication =
                                    driverData?.approvedDriverApplication || {};
                                if (driverData) {
                                    setDriver({
                                        id: String(
                                            booking.driver_id ??
                                                driverData.id ??
                                                '0',
                                        ),
                                        name: driverData.name || 'Driver',
                                        phone: driverData.phone || '',
                                        vehicleNumber:
                                            driverApplication
                                                .vehicle_plate_number || 'N/A',
                                        rating: 4.8,
                                        avatar: driverData.avatar || null,
                                        location: {
                                            lat:
                                                driverData.location?.lat ??
                                                (userLocation?.lat || 0) +
                                                    (Math.random() * 0.01 -
                                                        0.005),
                                            lng:
                                                driverData.location?.lng ??
                                                (userLocation?.lng || 0) +
                                                    (Math.random() * 0.01 -
                                                        0.005),
                                        },
                                    });
                                }
                                localStorage.setItem(
                                    'activeBookingStatus',
                                    'in_progress',
                                );
                            }
                            // Keep polling for completion
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
                                setCancellationReasonDisplay(
                                    booking.cancellation_reason ?? null,
                                );
                                setCancelledByDisplay(
                                    (booking.cancelled_by as
                                        | 'passenger'
                                        | 'driver') ?? null,
                                );
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
                (activeBooking.status === 'accepted' ||
                    activeBooking.status === 'in_progress') &&
                activeBooking.driver
            ) {
                setBookingStatus(
                    activeBooking.status === 'in_progress'
                        ? 'in-progress'
                        : 'accepted',
                );
                setBookingId(activeBooking.booking_id ?? null);
                setBookingDbId(activeBooking.id ?? null);
                if (activeBooking.driver) {
                    const driverLoc = activeBooking.driver.location;
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
                                driverLoc?.lat ??
                                (userLocation?.lat || 0) +
                                    (Math.random() * 0.01 - 0.005),
                            lng:
                                driverLoc?.lng ??
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

    // Initialize map when booking is accepted or in progress (route: driver→pickup or driver→destination)
    useEffect(() => {
        const showMap =
            (bookingStatus === 'accepted' || bookingStatus === 'in-progress') &&
            driver &&
            userLocation &&
            formData.destination &&
            mapRef.current;
        if (!showMap) return;

            let isMounted = true;
            const updateDriverAndRoute = async () => {
                if (!mapInstanceRef.current || !driver) return;
                const map = mapInstanceRef.current;
                // Ensure pickup (passenger) and destination markers exist when map already exists (e.g. after tab switch or re-render)
                if (!passengerMarkerRef.current && userLocation) {
                    const passengerMarker = L.marker(
                        [userLocation.lat, userLocation.lng],
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
                    passengerMarker.bindPopup(
                        `<b>Pickup (You)</b><br>${userLocation.address}`,
                    );
                    passengerMarkerRef.current = passengerMarker;
                }
                if (!driverMarkerRef.current) {
                    const driverIcon = L.divIcon({
                        className: 'driver-marker',
                        html: `<div style="background:#3b82f6;width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:11px;">Driver</div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14],
                    });
                    const driverMarker = L.marker(
                        [driver.location.lat, driver.location.lng],
                        { icon: driverIcon },
                    ).addTo(map);
                    driverMarker.bindPopup(
                        `<b>Driver: ${driver.name}</b><br>Plate: ${driver.vehicleNumber}<br>Rating: ${driver.rating} ⭐`,
                    );
                    driverMarkerRef.current = driverMarker;
                } else {
                    driverMarkerRef.current.setLatLng([
                        driver.location.lat,
                        driver.location.lng,
                    ]);
                }
                if (!destMarkerRef.current && formData.destination) {
                    const destMarker = L.marker(
                        [
                            formData.destination.lat,
                            formData.destination.lng,
                        ],
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
                        `<b>Destination</b><br>${formData.destination.address}`,
                    );
                    destMarkerRef.current = destMarker;
                }
                if (routeLineRef.current) {
                    map.removeLayer(routeLineRef.current);
                    routeLineRef.current = null;
                }
                const isInProgress = bookingStatus === 'in-progress';
                const endPoint = isInProgress
                    ? formData.destination
                    : userLocation;
                if (!endPoint) return;
                const endLat = endPoint.lat;
                const endLng = endPoint.lng;
                try {
                    const response = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${driver.location.lng},${driver.location.lat};${endLng},${endLat}?overview=full&geometries=geojson`,
                    );
                    const data = await response.json();
                    if (
                        data.code === 'Ok' &&
                        data.routes &&
                        data.routes[0] &&
                        mapInstanceRef.current
                    ) {
                        const route = data.routes[0];
                        const coordinates = route.geometry.coordinates.map(
                            (c: [number, number]) => [c[1], c[0]],
                        );
                        const routeLine = L.polyline(
                            coordinates as [number, number][],
                            { color: '#22c55e', weight: 5, opacity: 0.9 },
                        ).addTo(mapInstanceRef.current);
                        routeLineRef.current = routeLine;
                    } else if (mapInstanceRef.current) {
                        const routeLine = L.polyline(
                            [
                                [driver.location.lat, driver.location.lng],
                                [endLat, endLng],
                            ],
                            { color: '#22c55e', weight: 5, opacity: 0.9 },
                        ).addTo(mapInstanceRef.current);
                        routeLineRef.current = routeLine;
                    }
                } catch {
                    if (mapInstanceRef.current) {
                        const routeLine = L.polyline(
                            [
                                [driver.location.lat, driver.location.lng],
                                [endLat, endLng],
                            ],
                            { color: '#22c55e', weight: 5, opacity: 0.9 },
                        ).addTo(mapInstanceRef.current);
                        routeLineRef.current = routeLine;
                    }
                }
            };

            const initializeMap = async () => {
                if (!isMounted || !mapRef.current) return;

                try {
                    if (mapInstanceRef.current) {
                        await updateDriverAndRoute();
                        return;
                    }

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

                    // Initialize map (same options as driver map: zoom 13, same tiles)
                    const map = L.map(container, {
                        preferCanvas: false,
                    }).setView([userLocation.lat, userLocation.lng], 13);

                    L.tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            attribution:
                                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            maxZoom: 19,
                        },
                    ).addTo(map);

                    L.control.zoom({ position: 'topleft' }).addTo(map);

                    mapInstanceRef.current = map;

                    // Force map to recalculate size after a short delay
                    // This ensures the container is fully rendered
                    setTimeout(() => {
                        if (isMounted && mapInstanceRef.current === map) {
                            try {
                                mapInstanceRef.current.invalidateSize();
                            } catch (error) {
                                console.warn(
                                    'Failed to invalidate map size:',
                                    error,
                                );
                            }
                        }
                    }, 200);

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
                    if (destMarkerRef.current) {
                        mapInstance.removeLayer(destMarkerRef.current);
                        destMarkerRef.current = null;
                    }

                    // Same marker style as driver map: green pin for pickup/passenger, blue "Driver" circle, red pin for destination
                    const passengerMarker = L.marker(
                        [userLocation.lat, userLocation.lng],
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
                    ).addTo(mapInstance);
                    passengerMarker.bindPopup(
                        `<b>Passenger (You)</b><br>${userLocation.address}`,
                    );
                    passengerMarkerRef.current = passengerMarker;

                    const driverIcon = L.divIcon({
                        className: 'driver-marker',
                        html: `<div style="background:#3b82f6;width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:11px;">Driver</div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14],
                    });
                    const driverMarker = L.marker(
                        [driver.location.lat, driver.location.lng],
                        { icon: driverIcon },
                    ).addTo(mapInstance);
                    driverMarker.bindPopup(
                        `<b>Driver: ${driver.name}</b><br>Plate: ${driver.vehicleNumber}<br>Rating: ${driver.rating} ⭐`,
                    );
                    driverMarkerRef.current = driverMarker;

                    if (formData.destination) {
                        const destMarker = L.marker(
                            [
                                formData.destination.lat,
                                formData.destination.lng,
                            ],
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
                        ).addTo(mapInstance);
                        destMarker.bindPopup(
                            `<b>Destination</b><br>${formData.destination.address}`,
                        );
                        destMarkerRef.current = destMarker;
                    }

                    // Route: driver → pickup (accepted) or driver → destination (in-progress)
                    const isInProgress = bookingStatus === 'in-progress';
                    const endPoint = isInProgress
                        ? formData.destination
                        : userLocation;
                    if (!endPoint) return;
                    const endLat = endPoint.lat;
                    const endLng = endPoint.lng;

                    try {
                        const response = await fetch(
                            `https://router.project-osrm.org/route/v1/driving/${driver.location.lng},${driver.location.lat};${endLng},${endLat}?overview=full&geometries=geojson`,
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
                                    color: '#22c55e',
                                    weight: 5,
                                    opacity: 0.9,
                                },
                            ).addTo(mapInstance);
                            routeLineRef.current = routeLine;
                        }
                    } catch (error) {
                        console.error('Error fetching route:', error);
                        if (isMounted && mapInstanceRef.current) {
                            const routeLine = L.polyline(
                                [
                                    [driver.location.lat, driver.location.lng],
                                    [endLat, endLng],
                                ],
                                {
                                    color: '#22c55e',
                                    weight: 5,
                                    opacity: 0.9,
                                },
                            ).addTo(mapInstanceRef.current);
                            routeLineRef.current = routeLine;
                        }
                    }

                    if (!isMounted || !mapInstanceRef.current) return;

                    const boundsLayers: L.Layer[] = [
                        passengerMarker,
                        driverMarker,
                    ];
                    if (destMarkerRef.current)
                        boundsLayers.push(destMarkerRef.current);
                    const group = new L.FeatureGroup(boundsLayers);
                    mapInstance.fitBounds(group.getBounds().pad(0.15));

                    setTimeout(() => {
                        if (isMounted && mapInstanceRef.current) {
                            mapInstanceRef.current.invalidateSize();
                        }
                    }, 200);
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
                if (destMarkerRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(destMarkerRef.current);
                    destMarkerRef.current = null;
                }
                if (routeLineRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(routeLineRef.current);
                    routeLineRef.current = null;
                }
            };
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

    // When switching to Trip tab, invalidate map size so tiles and layers render
    useEffect(() => {
        if (rideTab === 'trip' && mapInstanceRef.current) {
            const t1 = setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
            }, 100);
            const t2 = setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
            }, 400);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [rideTab]);

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

    const handleCancelBooking = () => {
        if (isCancelling) return;
        setShowCancelModal(true);
    };

    /** Cancel without opening the reason modal (used while still searching for driver). */
    const cancelBookingWhileSearching = () => {
        if (isCancelling) return;

        const bookingIdToCancel =
            activeBooking?.id || localStorage.getItem('activeBookingId');

        if (!bookingIdToCancel) {
            setBookingStatus('cancelled');
            setCancellationReasonDisplay(null);
            setCancelledByDisplay('passenger');
            localStorage.removeItem('activeBookingId');
            localStorage.removeItem('activeBookingStatus');
            if (onCancel) onCancel();
            return;
        }

        setIsCancelling(true);
        router.post(
            `/bookings/${bookingIdToCancel}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBookingStatus('cancelled');
                    setCancellationReasonDisplay(null);
                    setCancelledByDisplay('passenger');
                    localStorage.removeItem('activeBookingId');
                    localStorage.removeItem('activeBookingStatus');
                    if (onCancel) onCancel();
                },
                onError: (errors) => {
                    const errorMessage =
                        (errors as { message?: string; error?: string })
                            .message ||
                        (errors as { message?: string; error?: string })
                            .error ||
                        'Failed to cancel booking';
                    alert(errorMessage);
                },
                onFinish: () => setIsCancelling(false),
            },
        );
    };

    const confirmCancelBooking = () => {
        if (isCancelling) return;

        const bookingIdToCancel =
            activeBooking?.id || localStorage.getItem('activeBookingId');

        if (!bookingIdToCancel) {
            setBookingStatus('cancelled');
            setCancellationReasonDisplay(cancelReasonInput.trim() || null);
            setCancelledByDisplay('passenger');
            setShowCancelModal(false);
            setCancelReasonInput('');
            localStorage.removeItem('activeBookingId');
            localStorage.removeItem('activeBookingStatus');
            if (onCancel) onCancel();
            return;
        }

        setIsCancelling(true);
        if (driverLocationIntervalRef.current) {
            clearInterval(driverLocationIntervalRef.current);
            driverLocationIntervalRef.current = null;
        }

        const reason = cancelReasonInput.trim() || undefined;

        router.post(
            `/bookings/${bookingIdToCancel}/cancel`,
            { cancellation_reason: reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBookingStatus('cancelled');
                    setCancellationReasonDisplay(reason ?? null);
                    setCancelledByDisplay('passenger');
                    setShowCancelModal(false);
                    setCancelReasonInput('');
                    localStorage.removeItem('activeBookingId');
                    localStorage.removeItem('activeBookingStatus');
                    if (onCancel) onCancel();
                },
                onError: (errors) => {
                    const errorMessage =
                        (errors as { message?: string; error?: string })
                            .message ||
                        (errors as { message?: string; error?: string })
                            .error ||
                        'Failed to cancel booking';
                    alert(errorMessage);
                },
                onFinish: () => setIsCancelling(false),
            },
        );
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
                                <div className="mb-1 text-2xl font-bold text-emerald-500 sm:text-3xl">
                                    {routeInfo?.totalFare || '₱0.00'}
                                </div>
                                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                    {formData.fareType === 'discounted'
                                        ? 'SC / PWD / Student (discounted price)'
                                        : 'Regular fare'}
                                </p>
                                <Button
                                    type="button"
                                    size="lg"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirmBooking();
                                    }}
                                    disabled={!routeInfo}
                                    className="min-h-[44px] w-full bg-emerald-500 px-6 text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
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
            <>
                <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-bottom-4">
                    <Card className="relative overflow-hidden border border-slate-200/60 bg-linear-to-br from-slate-50/90 via-blue-50/50 to-indigo-50/60 shadow-lg backdrop-blur-sm transition-all duration-300 dark:border-slate-700/50 dark:from-slate-900/40 dark:via-blue-950/30 dark:to-indigo-950/40">
                        {/* Decorative background pattern - balanced blue/indigo theme */}
                        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_70%)]" />
                        </div>

                        <CardContent className="relative p-5 sm:p-6 lg:p-8">
                            <div className="flex flex-col items-center justify-center space-y-6 text-center">
                                {/* Tricycle A→B animation - Keep as is since user likes it */}
                                <div className="w-full">
                                    <TricycleSearchingAnimation />
                                </div>

                                {/* Status Text - Balanced blue/indigo theme */}
                                <div className="max-w-md space-y-3">
                                    <div className="space-y-1.5">
                                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                                            Looking for a Driver
                                        </h3>
                                        <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                                            We're matching you with the best
                                            available driver in your area...
                                        </p>
                                    </div>

                                    {/* Balanced Status Indicator */}
                                    <div className="flex items-center justify-center gap-2 rounded-full bg-blue-100/60 px-3.5 py-1.5 backdrop-blur-sm dark:bg-indigo-500/20">
                                        <div className="relative flex h-2 w-2 items-center justify-center">
                                            <div className="absolute h-2 w-2 animate-ping rounded-full bg-blue-500 opacity-50"></div>
                                            <div className="relative h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                                        </div>
                                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                            Searching nearby drivers
                                        </span>
                                    </div>
                                </div>

                                {/* Booking ID - Balanced styling */}
                                {bookingId && (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="group relative">
                                            <Badge
                                                variant="outline"
                                                className="border border-slate-200/70 bg-white/85 px-4 py-2 font-mono text-xs shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300/70 hover:shadow-md dark:border-slate-600/50 dark:bg-slate-900/85 dark:hover:border-indigo-500/50"
                                            >
                                                <FileText className="mr-1.5 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                                <span className="font-medium text-slate-900 dark:text-slate-50">
                                                    {bookingId}
                                                </span>
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                            Keep this ID for your records
                                        </p>
                                    </div>
                                )}

                                {/* Compact Non-Repetitive Loading Animation */}
                                <div className="w-full max-w-sm space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-medium">
                                        <span className="text-slate-500 dark:text-slate-400">
                                            Searching...
                                        </span>
                                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                            <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                                                <div className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-blue-500 opacity-50"></div>
                                                <div className="relative h-1 w-1 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
                                            </div>
                                            <span className="font-medium">
                                                Active
                                            </span>
                                        </span>
                                    </div>

                                    {/* Compact Radar/Sonar Loading Effect - Balanced blue/indigo theme */}
                                    <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-xl border border-slate-200/40 bg-linear-to-br from-blue-50/50 via-white/40 to-indigo-50/50 shadow-inner backdrop-blur-sm dark:border-slate-700/40 dark:from-blue-950/20 dark:via-slate-900/30 dark:to-indigo-950/20">
                                        {/* Pulsing circles - balanced blue/indigo */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {/* Outer ring */}
                                            <div
                                                className="absolute h-20 w-20 rounded-full border border-blue-300/50 dark:border-indigo-500/40"
                                                style={{
                                                    animation:
                                                        'pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                                }}
                                            ></div>
                                            {/* Middle ring */}
                                            <div
                                                className="absolute h-14 w-14 rounded-full border border-indigo-400/60 dark:border-indigo-400/50"
                                                style={{
                                                    animation:
                                                        'pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.5s',
                                                }}
                                            ></div>
                                            {/* Inner ring */}
                                            <div
                                                className="absolute h-8 w-8 rounded-full border border-indigo-500/70 dark:border-indigo-300/60"
                                                style={{
                                                    animation:
                                                        'pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s',
                                                }}
                                            ></div>
                                            {/* Center dot - balanced glow */}
                                            <div className="relative h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_6px_2px_rgba(99,102,241,0.4)] dark:bg-indigo-400 dark:shadow-[0_0_6px_2px_rgba(129,140,248,0.5)]"></div>
                                        </div>

                                        {/* Rotating scanning line - balanced */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div
                                                className="h-full w-0.5 bg-linear-to-b from-transparent via-indigo-400/60 to-transparent"
                                                style={{
                                                    animation:
                                                        'scan-line 4s linear infinite',
                                                    transformOrigin: 'center',
                                                }}
                                            ></div>
                                        </div>

                                        {/* Van icon - balanced colors */}
                                        <div className="relative z-10 flex items-center justify-center">
                                            <div className="rounded-full bg-blue-100/70 p-1.5 backdrop-blur-sm dark:bg-indigo-500/20">
                                                <Car
                                                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                    style={{
                                                        animation:
                                                            'gentle-bounce 2.5s ease-in-out infinite',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Subtle floating particles - balanced colors */}
                                        <div className="absolute inset-0">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute h-1 w-1 rounded-full bg-indigo-400/40 dark:bg-indigo-400/25"
                                                    style={{
                                                        left: `${25 + i * 20}%`,
                                                        top: `${35 + (i % 2) * 25}%`,
                                                        animation: `float-slow ${3 + i * 0.5}s ease-in-out infinite ${i * 0.4}s`,
                                                    }}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cancel button - no reason popup while searching; reason popup only after driver accepts */}
                                <Button
                                    variant="outline"
                                    onClick={cancelBookingWhileSearching}
                                    disabled={isCancelling}
                                    className="mt-1 min-h-[44px] border border-red-200 bg-white/70 px-5 py-2 text-sm text-red-500 shadow-sm transition-all hover:border-red-300 hover:bg-red-50/80 hover:shadow-md disabled:opacity-50 dark:border-red-500/30 dark:bg-gray-900/70 dark:text-red-400 dark:hover:border-red-400/50 dark:hover:bg-red-500/10"
                                >
                                    {isCancelling ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            <span className="font-medium">
                                                Cancelling...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="mr-1.5 h-3.5 w-3.5" />
                                            <span className="font-medium">
                                                Cancel Booking
                                            </span>
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
                                                A nearby driver will receive
                                                your booking request
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                            <span>
                                                You'll be notified immediately
                                                when a driver accepts
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                            <span>
                                                You can track your driver's
                                                location in real-time
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Dialog
                    open={showCancelModal}
                    onOpenChange={setShowCancelModal}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Cancel booking</DialogTitle>
                            <DialogDescription>
                                Optionally provide a reason for cancellation.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="e.g. Change of plans, wrong address..."
                            value={cancelReasonInput}
                            onChange={(e) =>
                                setCancelReasonInput(e.target.value)
                            }
                            className="min-h-[100px] resize-none"
                            maxLength={500}
                        />
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReasonInput('');
                                }}
                                disabled={isCancelling}
                            >
                                Keep booking
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmCancelBooking}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Cancel booking'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    if ((bookingStatus === 'accepted' || bookingStatus === 'in-progress') && driver) {
        return (
            <>
                <div
                    ref={chatCardRef}
                    className="flex max-h-[calc(100vh-8rem)] animate-in flex-col duration-500 fade-in slide-in-from-bottom-4"
                >
                    <Card className="flex flex-col overflow-hidden border-emerald-500/20 bg-white shadow-lg dark:bg-gray-800">
                        {/* Driver header: avatar, name, plate | Call, SOS, Share */}
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-emerald-200/50 bg-emerald-50/30 px-4 py-3 dark:border-emerald-800/30 dark:bg-emerald-950/20">
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

                        {/* Trip | Chat tabs — reference style: horizontal tabs, selected = light gray rounded */}
                        <Tabs
                            value={rideTab}
                            onValueChange={(v) =>
                                setRideTab(v as 'trip' | 'chat')
                            }
                            className="flex flex-1 flex-col overflow-hidden"
                        >
                            <div className="shrink-0 border-b border-emerald-200/50 bg-white px-3 py-2 dark:border-emerald-800/30 dark:bg-gray-800/50">
                                <TabsList className="h-10 w-full justify-start gap-1 rounded-lg bg-transparent p-0">
                                    <TabsTrigger
                                        value="trip"
                                        className="gap-2 rounded-md px-4 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-slate-100"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        Trip
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="chat"
                                        className="gap-2 rounded-md px-4 data-[state=active]:bg-slate-200 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-slate-100"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Chat
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Trip tab: SOS note, Cancel, map, optional ride summary. forceMount so map stays in DOM when Chat is selected. */}
                            <TabsContent
                                value="trip"
                                forceMount
                                className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible data-[state=inactive]:absolute data-[state=inactive]:h-0 data-[state=inactive]:overflow-hidden"
                            >
                                <p className="shrink-0 px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                    Emergency contact receives SMS when you tap
                                    SOS. Delivery usually 1–2 min.
                                </p>
                                <div className="flex min-h-0 flex-1 flex-col border-t border-emerald-100 dark:border-emerald-800/30">
                                    <div className="flex shrink-0 items-center justify-between border-b border-emerald-100 bg-emerald-50/50 px-3 py-2 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                                        <div className="flex items-center gap-2">
                                            <MapIcon className="h-4 w-4 text-emerald-500" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Live Location Tracking
                                            </span>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                        >
                                            <div className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
                                            Live
                                        </Badge>
                                    </div>
                                    <div
                                        ref={mapRef}
                                        className="h-[280px] min-h-[240px] w-full flex-1 rounded-b-lg sm:h-[320px] sm:min-h-[280px]"
                                    />
                                </div>
                                {routeInfo && (
                                    <div className="shrink-0 border-t border-gray-200 px-3 py-2 dark:border-gray-700">
                                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                <Navigation className="mr-1 inline h-3.5 w-3.5" />
                                                {routeInfo.distance}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                <Clock className="mr-1 inline h-3.5 w-3.5" />
                                                {routeInfo.duration}
                                            </span>
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {routeInfo.totalFare}
                                                {formData.fareType ===
                                                    'discounted' && (
                                                    <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                                                        (discounted)
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                ETA {routeInfo.estimatedArrival}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex shrink-0 justify-center border-t border-gray-200 py-3 dark:border-gray-700">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelBooking}
                                        disabled={isCancelling}
                                        className="min-h-[44px] border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
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
                            </TabsContent>

                            {/* Chat tab: chat only */}
                            <TabsContent
                                value="chat"
                                className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                            >
                                {bookingDbId && auth?.user?.id && socketUrl ? (
                                    <div className="flex min-h-[200px] flex-1 flex-col overflow-hidden">
                                        <BookingChat
                                            bookingId={bookingDbId}
                                            currentUserId={auth.user.id}
                                            socketUrl={socketUrl}
                                            embedded
                                            onStatus={({
                                                connected,
                                                connectError,
                                            }) => (
                                                <div className="flex shrink-0 items-center justify-end gap-2 border-b border-emerald-200/30 bg-emerald-50/20 px-3 py-1.5 text-xs dark:border-emerald-800/30 dark:bg-emerald-950/20">
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
                                                                    window
                                                                        .location
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
                                ) : (
                                    <div className="flex flex-1 items-center justify-center p-4 text-sm text-gray-500 dark:text-gray-400">
                                        Chat unavailable for this booking.
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
                <Dialog
                    open={showCancelModal}
                    onOpenChange={setShowCancelModal}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Cancel booking</DialogTitle>
                            <DialogDescription>
                                Optionally provide a reason for cancellation.
                                The driver will be able to see this.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="e.g. Change of plans, wrong address..."
                            value={cancelReasonInput}
                            onChange={(e) =>
                                setCancelReasonInput(e.target.value)
                            }
                            className="min-h-[100px] resize-none"
                            maxLength={500}
                        />
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReasonInput('');
                                }}
                                disabled={isCancelling}
                            >
                                Keep booking
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmCancelBooking}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Cancel booking'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
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
        const cancelledByLabel =
            cancelledByDisplay === 'passenger'
                ? 'You cancelled this booking.'
                : cancelledByDisplay === 'driver'
                  ? 'The driver cancelled this booking.'
                  : 'This booking was cancelled.';
        return (
            <div className="space-y-6">
                <Card className="border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <AlertCircle className="mb-4 h-16 w-16 text-red-500 sm:h-20 sm:w-20" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                                Booking Cancelled
                            </h3>
                            <p className="mb-2 max-w-md text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                {cancelledByLabel}
                            </p>
                            {cancellationReasonDisplay && (
                                <div className="mb-4 w-full max-w-md rounded-lg border border-red-200 bg-white/80 p-3 text-left dark:border-red-800 dark:bg-gray-800/50">
                                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                                        Reason for cancellation
                                    </p>
                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                        {cancellationReasonDisplay}
                                    </p>
                                </div>
                            )}
                            <p className="mb-4 max-w-md text-sm text-gray-600 dark:text-gray-400">
                                You can start a new booking anytime.
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
