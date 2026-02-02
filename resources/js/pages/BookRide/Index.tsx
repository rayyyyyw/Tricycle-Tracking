import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Clock,
    Car,
    Shield,
    CheckCircle,
    Users,
    Route,
    Map as MapIcon,
    Zap,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Navigation2,
    Target as TargetIcon,
    FileText,
    CreditCard,
    Check,
    Route as RouteIcon,
    Search,
    Pin,
    PlusCircle,
    MinusCircle,
    School,
    Hospital,
    ShoppingBag,
    Church,
    Building,
    Trees as Park,
    Landmark as LandmarkIcon,
    LucideIcon,
    X,
    ChevronDown,
    ChevronUp,
    Mountain,
    Waves,
    Anchor,
    Hotel,
    Home
} from 'lucide-react';
import { type SharedData, type BreadcrumbItem } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProfileRestrictionScreen from './ProfileRestrictionScreen';
import BookingConfirmation from './BookingConfirmation';

// Import Leaflet for mapping
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default markers in Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Type definitions
interface LocationData {
    lat: number;
    lng: number;
    address: string;
    name?: string;
    barangay?: string;
    purok?: string;
    type?: string;
}

interface SavedPlace {
    id: number;
    type: string;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    barangay: string | null;
    purok: string | null;
    is_primary: boolean;
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

interface RouteInfo {
    distance: string;
    duration: string;
    fare: string;
    totalFare: string;
    estimatedArrival: string;
}

interface UserData {
    name?: string;
    phone?: string;
    address?: string;
    emergency_contact?: {
        name?: string;
        phone?: string;
        relationship?: string;
    };
}

interface BarangayData {
    id: string;
    name: string;
    lat: number;
    lng: number;
    population?: number;
    area?: number;
    puroks?: PurokData[];
}

interface PurokData {
    id: string;
    name: string;
    barangayId: string;
    barangayName: string;
}

interface LandmarkData {
    name: string;
    type: string;
    icon: LucideIcon;
    lat: number;
    lng: number;
    barangay: string;
    barangayId: string;
    purok?: string;
}

interface RideType {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    baseFare: number;
    perKmRate: number;
    per5KmRate: number;
}

// Define Hinobaan municipality boundary coordinates with realistic boundaries
const HINOBAAN_BOUNDARY = {
    center: [9.5989, 122.4701] as [number, number], // More accurate center
    bounds: {
        north: 9.65,    // 9.65°N
        south: 9.44,    // 9.44°N
        east: 122.62,   // 122.62°E
        west: 122.46    // 122.46°E
    }
};

// All barangays in Hinobaan municipality with exact coordinates
const HINOBAAN_BARANGAYS: BarangayData[] = [
    { id: 'alim', name: 'Alim', lat: 9.5648, lng: 122.4911, population: 1200, area: 5.2 },
    { id: 'asia', name: 'Asia', lat: 9.5506, lng: 122.5164, population: 800, area: 3.8 },
    { id: 'bacuyangan', name: 'Bacuyangan', lat: 9.6268, lng: 122.4685, population: 1500, area: 8.5 },
    { id: 'barangay1', name: 'Barangay I (Poblacion)', lat: 9.5989, lng: 122.4676, population: 2000, area: 2.1 },
    { id: 'barangay2', name: 'Barangay II (Poblacion)', lat: 9.6001, lng: 122.4726, population: 1800, area: 2.3 },
    { id: 'bulwangan', name: 'Bulwangan', lat: 9.5165, lng: 122.5355, population: 600, area: 4.7 },
    { id: 'culipapa', name: 'Culipapa', lat: 9.4726, lng: 122.5616, population: 700, area: 6.3 },
    { id: 'damutan', name: 'Damutan', lat: 9.6010, lng: 122.6194, population: 900, area: 7.8 },
    { id: 'daug', name: 'Daug', lat: 9.4881, lng: 122.5454, population: 1100, area: 5.9 },
    { id: 'pook', name: 'Po-ok', lat: 9.5820, lng: 122.4776, population: 1300, area: 4.2 },
    { id: 'sanrafael', name: 'San Rafael', lat: 9.6083, lng: 122.5137, population: 1000, area: 6.1 },
    { id: 'sangke', name: 'Sangke', lat: 9.4455, lng: 122.5888, population: 500, area: 5.5 },
    { id: 'talacagay', name: 'Talacagay', lat: 9.6382, lng: 122.4701, population: 1400, area: 7.2 }
];

// Sample puroks for each barangay
const PUROKS: PurokData[] = [
    // Barangay I Puroks
    { id: 'p1-1', name: 'Purok 1', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    { id: 'p1-2', name: 'Purok 2', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    { id: 'p1-3', name: 'Purok 3', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    
    // Barangay II Puroks
    { id: 'p2-1', name: 'Purok 1', barangayId: 'barangay2', barangayName: 'Barangay II (Poblacion)' },
    { id: 'p2-2', name: 'Purok 2', barangayId: 'barangay2', barangayName: 'Barangay II (Poblacion)' },
    
    // Alim Puroks
    { id: 'alim-1', name: 'Purok 1', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-2', name: 'Purok 2', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-3', name: 'Purok 3', barangayId: 'alim', barangayName: 'Alim' },
    
    // Bacuyangan Puroks
    { id: 'bac-1', name: 'Purok 1', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bac-2', name: 'Purok 2', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    
    // Culipapa Puroks
    { id: 'cul-1', name: 'Purok 1', barangayId: 'culipapa', barangayName: 'Culipapa' },
    
    // Add more puroks as needed...
];

// Popular landmarks with exact coordinates - Grouped by barangay and purok
const POPULAR_LANDMARKS: LandmarkData[] = [
    // Barangay I Landmarks
    { name: 'Hinobaan Municipal Hall', type: 'government', icon: Building, lat: 9.5989, lng: 122.4676, barangay: 'Barangay I (Poblacion)', barangayId: 'barangay1', purok: 'Purok 1' },
    { name: 'Public Market', type: 'store', icon: ShoppingBag, lat: 9.5995, lng: 122.4680, barangay: 'Barangay I (Poblacion)', barangayId: 'barangay1', purok: 'Purok 2' },
    { name: 'Rural Health Unit', type: 'hospital', icon: Hospital, lat: 9.5990, lng: 122.4690, barangay: 'Barangay I (Poblacion)', barangayId: 'barangay1', purok: 'Purok 1' },
    { name: 'Police Station', type: 'government', icon: Shield, lat: 9.5985, lng: 122.4685, barangay: 'Barangay I (Poblacion)', barangayId: 'barangay1', purok: 'Purok 1' },
    
    // Barangay II Landmarks
    { name: 'St. Joseph Parish Church', type: 'church', icon: Church, lat: 9.6001, lng: 122.4726, barangay: 'Barangay II (Poblacion)', barangayId: 'barangay2', purok: 'Purok 1' },
    { name: 'Hinobaan National High School', type: 'school', icon: School, lat: 9.6008, lng: 122.4730, barangay: 'Barangay II (Poblacion)', barangayId: 'barangay2', purok: 'Purok 2' },
    
    // Talacagay Landmarks
    { name: 'Talacagay Elementary School', type: 'school', icon: School, lat: 9.6385, lng: 122.4705, barangay: 'Talacagay', barangayId: 'talacagay', purok: 'Purok 1' },
    { name: 'Salvacion Cave', type: 'cave', icon: Mountain, lat: 9.6390, lng: 122.4710, barangay: 'Talacagay', barangayId: 'talacagay', purok: 'Purok 1' },
    { name: 'Eden Island Resort & Spa', type: 'resort', icon: Hotel, lat: 9.6388, lng: 122.4708, barangay: 'Talacagay', barangayId: 'talacagay', purok: 'Purok 1' },
    
    // Bacuyangan Landmarks
    { name: 'Bacuyangan Beach', type: 'park', icon: Park, lat: 9.6275, lng: 122.4690, barangay: 'Bacuyangan', barangayId: 'bacuyangan', purok: 'Purok 1' },
    { name: 'Ubong Caves / Punta Ubong', type: 'cave', icon: Mountain, lat: 9.6280, lng: 122.4695, barangay: 'Bacuyangan', barangayId: 'bacuyangan', purok: 'Purok 1' },
    { name: 'Salvacion Port', type: 'port', icon: Anchor, lat: 9.6270, lng: 122.4688, barangay: 'Bacuyangan', barangayId: 'bacuyangan', purok: 'Purok 1' },
    
    // Culipapa Landmarks
    { name: 'Culipapa Beach', type: 'park', icon: Park, lat: 9.4730, lng: 122.5620, barangay: 'Culipapa', barangayId: 'culipapa', purok: 'Purok 1' },
    
    // Sangke Landmarks
    { name: 'Sangke Barangay Hall', type: 'government', icon: Building, lat: 9.4455, lng: 122.5888, barangay: 'Sangke', barangayId: 'sangke', purok: 'Purok 1' },
    
    // Damutan Landmarks
    { name: 'Damutan Barangay Hall', type: 'government', icon: Building, lat: 9.6010, lng: 122.6194, barangay: 'Damutan', barangayId: 'damutan', purok: 'Purok 1' },
    
    // San Rafael Landmarks
    { name: 'San Rafael Chapel', type: 'church', icon: Church, lat: 9.6083, lng: 122.5137, barangay: 'San Rafael', barangayId: 'sanrafael', purok: 'Purok 1' },
    
    // Alim Landmarks
    { name: 'Alim Elementary School', type: 'school', icon: School, lat: 9.5648, lng: 122.4911, barangay: 'Alim', barangayId: 'alim', purok: 'Purok 1' },
    
    // Asia Landmarks
    { name: 'Asia Beach', type: 'park', icon: Park, lat: 9.5510, lng: 122.5170, barangay: 'Asia', barangayId: 'asia', purok: 'Purok 1' },
    { name: 'Bolila Island', type: 'island', icon: Waves, lat: 9.5515, lng: 122.5175, barangay: 'Asia', barangayId: 'asia', purok: 'Purok 1' },
    
    // Po-ok Landmarks
    { name: 'Po-ok Barangay Hall', type: 'government', icon: Building, lat: 9.5820, lng: 122.4776, barangay: 'Po-ok', barangayId: 'pook', purok: 'Purok 1' },
    { name: 'Alfe Coral Reef Beach Resort', type: 'resort', icon: Hotel, lat: 9.5825, lng: 122.4780, barangay: 'Po-ok', barangayId: 'pook', purok: 'Purok 1' },
    
    // Bulwangan Landmarks
    { name: 'Bulwangan Elementary School', type: 'school', icon: School, lat: 9.5165, lng: 122.5355, barangay: 'Bulwangan', barangayId: 'bulwangan', purok: 'Purok 1' },
    { name: 'Century Tree Beach Resort', type: 'resort', icon: Hotel, lat: 9.5170, lng: 122.5360, barangay: 'Bulwangan', barangayId: 'bulwangan', purok: 'Purok 1' },
    
    // Daug Landmarks
    { name: 'Daug Elementary School', type: 'school', icon: School, lat: 9.4881, lng: 122.5454, barangay: 'Daug', barangayId: 'daug', purok: 'Purok 1' }
];

// Ride types with FIXED pricing: ₱20 for first 5km
const RIDE_TYPES: RideType[] = [
    { id: 'regular', name: 'Regular Ride', icon: Car, description: 'Standard tricycle ride within Hinobaan', baseFare: 20, perKmRate: 4, per5KmRate: 20 },
    { id: 'express', name: 'Express Ride', icon: Zap, description: 'Direct route, no stops', baseFare: 25, perKmRate: 5, per5KmRate: 25 },
    { id: 'group', name: 'Group Ride', icon: Users, description: 'For 3+ passengers', baseFare: 30, perKmRate: 6, per5KmRate: 30 },
    { id: 'night', name: 'Night Ride', icon: Shield, description: 'After 8 PM service', baseFare: 25, perKmRate: 5, per5KmRate: 25 }
];

// Get nearest barangay name from ALL 13 barangays
const getNearestBarangayName = (lat: number, lng: number): string => {
    let nearest = '';
    let minDistance = Infinity;

    HINOBAAN_BARANGAYS.forEach((barangay) => {
        const R = 6371;
        const dLat = (barangay.lat - lat) * Math.PI / 180;
        const dLng = (barangay.lng - lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(barangay.lat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        if (distance < minDistance) {
            minDistance = distance;
            nearest = barangay.name;
        }
    });

    return nearest || 'Hinobaan Area';
};

// Check if point is within Hinobaan bounds
const checkIfInHinobaan = (lat: number, lng: number): boolean => {
    const tolerance = 0.01; // Reduced tolerance for more accuracy
    
    return (
        lat >= HINOBAAN_BOUNDARY.bounds.south - tolerance &&
        lat <= HINOBAAN_BOUNDARY.bounds.north + tolerance &&
        lng >= HINOBAAN_BOUNDARY.bounds.west - tolerance &&
        lng <= HINOBAAN_BOUNDARY.bounds.east + tolerance
    );
};

// Calculate realistic distance for Hinobaan
const calculateHinobaanDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    // Haversine formula for straight-line distance
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const straightDistance = R * c;
    
    // For Hinobaan's small area, road distance multiplier is lower (1.2x for most routes)
    // Maximum distance within Hinobaan should not exceed 25km
    const roadDistance = Math.min(straightDistance * 1.2, 25);
    
    return Math.max(roadDistance, 0.1); // Minimum 0.1km
};

// Calculate realistic travel time for Hinobaan
const calculateHinobaanTravelTime = (distanceKm: number): number => {
    // Average tricycle speed in Hinobaan: 30-40 km/h
    const avgSpeed = 35; // km/h (average of 30-40)
    const timeHours = distanceKm / avgSpeed;
    const timeMinutes = Math.round(timeHours * 60);
    
    // Within Hinobaan's 13 barangays, maximum travel time should be 50 minutes
    // Minimum 5 minutes for very short distances
    return Math.min(Math.max(timeMinutes, 5), 50);
};

// Calculate fare based on Hinobaan pricing: ₱20 for first 5km
const calculateHinobaanFare = (distanceKm: number, rideType: string, passengerCount: number): { fare: number, totalFare: number } => {
    // Get ride type details
    const selectedRideType = RIDE_TYPES.find(r => r.id === rideType) || RIDE_TYPES[0];
    const per5KmRate = selectedRideType.per5KmRate; // ₱20 for first 5km
    const perKmRate = selectedRideType.perKmRate; // Additional km rate after 5km
    
    // Calculate fare: ₱20 for first 5km
    let fare = per5KmRate;
    
    // Add additional distance charge if beyond 5km
    if (distanceKm > 5) {
        const additionalKm = distanceKm - 5;
        fare += Math.ceil(additionalKm * perKmRate);
    }
    
    // Calculate total fare with passengers
    let totalFare = fare;
    if (passengerCount > 1) {
        // Additional passengers pay additional fare
        if (passengerCount <= 2) {
            totalFare += Math.round(passengerCount * 5); // ₱5 per additional passenger
        } else {
            totalFare += Math.round(passengerCount * 8); // ₱8 per passenger for groups
        }
    }
    
    return { fare, totalFare };
};

// Group landmarks by barangay and purok
const groupLandmarksByBarangayAndPurok = () => {
    const grouped: Record<string, Record<string, LandmarkData[]>> = {};
    
    // Initialize structure
    HINOBAAN_BARANGAYS.forEach(barangay => {
        grouped[barangay.id] = {};
    });
    
    // Group landmarks
    POPULAR_LANDMARKS.forEach(landmark => {
        if (!grouped[landmark.barangayId]) {
            grouped[landmark.barangayId] = {};
        }
        
        const purok = landmark.purok || 'General';
        if (!grouped[landmark.barangayId][purok]) {
            grouped[landmark.barangayId][purok] = [];
        }
        
        grouped[landmark.barangayId][purok].push(landmark);
    });
    
    return grouped;
};

// Route Map Component for Step 3
interface RouteMapProps {
    pickupLocation: LocationData | null;
    destination: LocationData | null;
}

const RouteMap = ({ pickupLocation, destination }: RouteMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routingControlRef = useRef<any>(null);
    const pickupMarkerRef = useRef<L.Marker | null>(null);
    const destinationMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapRef.current || !pickupLocation || !destination) return;

        const initializeMap = async () => {
            try {
                // Initialize map if not already done
                if (!mapInstanceRef.current) {
                    const map = L.map(mapRef.current!).setView(
                        [pickupLocation.lat, pickupLocation.lng],
                        13
                    );

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        maxZoom: 19,
                    }).addTo(map);

                    mapInstanceRef.current = map;
                }

                const map = mapInstanceRef.current;

                // Clear existing markers and route
                if (pickupMarkerRef.current) {
                    map.removeLayer(pickupMarkerRef.current);
                    pickupMarkerRef.current = null;
                }
                if (destinationMarkerRef.current) {
                    map.removeLayer(destinationMarkerRef.current);
                    destinationMarkerRef.current = null;
                }
                
                // Clear all existing route lines and controls
                if (routingControlRef.current) {
                    if (routingControlRef.current instanceof L.Control) {
                        map.removeControl(routingControlRef.current);
                    } else if (routingControlRef.current instanceof L.Layer) {
                        map.removeLayer(routingControlRef.current);
                    }
                    routingControlRef.current = null;
                }
                
                // Also remove any polylines that might be on the map (cleanup any orphaned routes)
                map.eachLayer((layer) => {
                    if (layer instanceof L.Polyline && layer.options.color === '#10b981') {
                        map.removeLayer(layer);
                    }
                });

                // Create custom icons for pickup and destination
                const pickupIcon = L.divIcon({
                    className: 'custom-pickup-marker',
                    html: `<div style="
                        background-color: #10b981;
                        width: 32px;
                        height: 32px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    "></div><div style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        transform: rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                    ">A</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                const destinationIcon = L.divIcon({
                    className: 'custom-destination-marker',
                    html: `<div style="
                        background-color: #ef4444;
                        width: 32px;
                        height: 32px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    "></div><div style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        transform: rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                    ">B</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                // Add pickup marker
                const pickupMarker = L.marker([pickupLocation.lat, pickupLocation.lng], {
                    icon: pickupIcon,
                }).addTo(map);
                pickupMarker.bindPopup(`<strong>Pickup:</strong><br>${pickupLocation.address}`);
                pickupMarkerRef.current = pickupMarker;

                // Add destination marker
                const destMarker = L.marker([destination.lat, destination.lng], {
                    icon: destinationIcon,
                }).addTo(map);
                destMarker.bindPopup(`<strong>Destination:</strong><br>${destination.address}`);
                destinationMarkerRef.current = destMarker;

                // Fit map to show both markers
                const group = new L.FeatureGroup([pickupMarker, destMarker]);
                map.fitBounds(group.getBounds().pad(0.1));

                // Add routing using OSRM to follow roads, constrained to Hinobaan
                try {
                    // Use OSRM API directly from point A to point B (no intermediate waypoints)
                    const response = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${pickupLocation.lng},${pickupLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
                    );
                    const data = await response.json();
                    
                    if (data.code === 'Ok' && data.routes && data.routes[0]) {
                        const route = data.routes[0];
                        // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
                        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                        
                        // Filter coordinates to ensure they stay within Hinobaan bounds
                        // Only keep coordinates that are within bounds
                        const filteredCoordinates = coordinates.filter((coord: [number, number]) => {
                            const [lat, lng] = coord;
                            return (
                                lat >= HINOBAAN_BOUNDARY.bounds.south &&
                                lat <= HINOBAAN_BOUNDARY.bounds.north &&
                                lng >= HINOBAAN_BOUNDARY.bounds.west &&
                                lng <= HINOBAAN_BOUNDARY.bounds.east
                            );
                        });
                        
                        // Always include start and end points, even if slightly outside bounds
                        const startPoint: [number, number] = [pickupLocation.lat, pickupLocation.lng];
                        const endPoint: [number, number] = [destination.lat, destination.lng];
                        
                        // Build final coordinates: start + filtered middle + end
                        const finalCoordinates: [number, number][] = [startPoint];
                        
                        // Add filtered coordinates (excluding start and end if they're in the list)
                        filteredCoordinates.forEach((coord: [number, number]) => {
                            const [lat, lng] = coord;
                            // Skip if it's too close to start or end point
                            const isStart = Math.abs(lat - startPoint[0]) < 0.001 && Math.abs(lng - startPoint[1]) < 0.001;
                            const isEnd = Math.abs(lat - endPoint[0]) < 0.001 && Math.abs(lng - endPoint[1]) < 0.001;
                            if (!isStart && !isEnd) {
                                finalCoordinates.push(coord);
                            }
                        });
                        
                        finalCoordinates.push(endPoint);
                        
                        // Create single route line from A to B
                        const routeLine = L.polyline(finalCoordinates, {
                            color: '#10b981',
                            weight: 6,
                            opacity: 0.8,
                        }).addTo(map);
                        
                        routingControlRef.current = routeLine;
                        
                        // Fit map to show the route, but constrain to Hinobaan bounds
                        const bounds = routeLine.getBounds();
                        const hinobaanBounds = L.latLngBounds(
                            [HINOBAAN_BOUNDARY.bounds.south, HINOBAAN_BOUNDARY.bounds.west],
                            [HINOBAAN_BOUNDARY.bounds.north, HINOBAAN_BOUNDARY.bounds.east]
                        );
                        // Constrain bounds to Hinobaan
                        const constrainedBounds = L.latLngBounds(
                            [
                                Math.max(bounds.getSouth(), hinobaanBounds.getSouth()),
                                Math.max(bounds.getWest(), hinobaanBounds.getWest())
                            ],
                            [
                                Math.min(bounds.getNorth(), hinobaanBounds.getNorth()),
                                Math.min(bounds.getEast(), hinobaanBounds.getEast())
                            ]
                        );
                        map.fitBounds(constrainedBounds.pad(0.1));
                    } else {
                        throw new Error('No route found from OSRM');
                    }
                } catch (error) {
                    console.error('Error fetching route from OSRM:', error);
                    // Fallback: Try using leaflet-routing-machine if available
                    try {
                        const LRM = await import('leaflet-routing-machine');
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const Routing = (LRM as any).default || LRM;
                        
                        if (Routing && Routing.control) {
                            const router = Routing.osrmv1({
                                serviceUrl: 'https://router.project-osrm.org',
                                profile: 'driving',
                            });
                            
                            const routingControl = Routing.control({
                                waypoints: [
                                    L.latLng(pickupLocation.lat, pickupLocation.lng),
                                    L.latLng(destination.lat, destination.lng),
                                ],
                                router: router,
                                routeWhileDragging: false,
                                showAlternatives: false,
                                addWaypoints: false,
                                fitSelectedRoutes: true,
                                lineOptions: {
                                    styles: [
                                        {
                                            color: '#10b981',
                                            opacity: 0.8,
                                            weight: 6,
                                        },
                                    ],
                                },
                                createMarker: () => null,
                            });

                            routingControl.addTo(map);
                            routingControlRef.current = routingControl;
                        } else {
                            throw new Error('Routing library not available');
                        }
                    } catch (routingError) {
                        console.error('Error using routing library:', routingError);
                        // Final fallback: draw a simple line
                        const polyline = L.polyline(
                            [
                                [pickupLocation.lat, pickupLocation.lng],
                                [destination.lat, destination.lng],
                            ],
                            {
                                color: '#10b981',
                                weight: 5,
                                opacity: 0.8,
                                dashArray: '10, 5',
                            }
                        ).addTo(map);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        routingControlRef.current = polyline as any;
                    }
                }
            } catch (error) {
                console.error('Error initializing map:', error);
            }
        };

        initializeMap();

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                // Remove route line/control
                if (routingControlRef.current) {
                    if (routingControlRef.current instanceof L.Control) {
                        mapInstanceRef.current.removeControl(routingControlRef.current);
                    } else if (routingControlRef.current instanceof L.Layer) {
                        mapInstanceRef.current.removeLayer(routingControlRef.current);
                    }
                    routingControlRef.current = null;
                }
                
                // Remove any orphaned route polylines (cleanup any duplicates)
                mapInstanceRef.current.eachLayer((layer) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (layer instanceof L.Polyline && (layer.options as any).color === '#10b981') {
                        mapInstanceRef.current!.removeLayer(layer);
                    }
                });
                
                // Remove markers
                if (pickupMarkerRef.current) {
                    mapInstanceRef.current.removeLayer(pickupMarkerRef.current);
                    pickupMarkerRef.current = null;
                }
                if (destinationMarkerRef.current) {
                    mapInstanceRef.current.removeLayer(destinationMarkerRef.current);
                    destinationMarkerRef.current = null;
                }
            }
        };
    }, [pickupLocation, destination]);

    if (!pickupLocation || !destination) {
        return (
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Select pickup and destination to view route</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6 overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <MapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    Route Map
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Visual route from pickup to destination
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div ref={mapRef} className="w-full h-64 sm:h-96 rounded-b-lg" />
            </CardContent>
        </Card>
    );
};

// Step 1: Ride Details Component (Simplified - removed personal info)
interface Step1RideDetailsProps {
    formData: RideFormData;
    setFormData: (data: RideFormData) => void;
    user: UserData;
}

const Step1RideDetails = ({ 
    formData, 
    setFormData 
}: Step1RideDetailsProps) => {
    const [passengers, setPassengers] = useState(formData.passengerCount || 1);
    
    const handlePassengerChange = (type: 'increment' | 'decrement') => {
        const minPassengers = formData.rideType === 'group' ? 2 : 1;
        const newCount = type === 'increment' 
            ? Math.min(passengers + 1, 6)
            : Math.max(passengers - 1, minPassengers);
        
        setPassengers(newCount);
        setFormData({ ...formData, passengerCount: newCount });
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Select Ride Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {RIDE_TYPES.map((ride) => {
                        const Icon = ride.icon;
                        const isSelected = formData.rideType === ride.id;
                        
                        return (
                            <button
                                key={ride.id}
                                onClick={() => {
                                    const newPassengerCount = ride.id === 'group' ? 2 : 1;
                                    setPassengers(newPassengerCount);
                                    setFormData({ ...formData, rideType: ride.id, passengerCount: newPassengerCount });
                                }}
                                className={`
                                    p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md
                                    ${isSelected 
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20 shadow-sm' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{ride.name}</h4>
                                            {isSelected && (
                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">{ride.description}</p>
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            ₱{ride.per5KmRate} for first 5km
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Separator className="my-4" />

            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Passenger Details</h3>
                <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                        <Label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">Number of Passengers</Label>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePassengerChange('decrement')}
                                    className="h-9 w-9 border-2 border-gray-300 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                >
                                    <MinusCircle className="h-4 w-4" />
                                </Button>
                                <div className="w-16 text-center">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{passengers}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePassengerChange('increment')}
                                    className="h-9 w-9 border-2 border-gray-300 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{passengers === 1 ? '1 passenger' : `${passengers} passengers`}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                    Max 6 passengers per ride
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="specialInstructions" className="text-sm font-semibold text-gray-900 dark:text-white">
                                Special Instructions
                            </Label>
                            <Badge variant="outline" className="text-xs font-medium text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700">
                                Optional
                            </Badge>
                        </div>
                        <Textarea
                            id="specialInstructions"
                            value={formData.specialInstructions || ''}
                            onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                            placeholder="E.g., waiting at specific landmark, need assistance with luggage, prefer a specific route, etc."
                            className="min-h-[100px] bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Provide any special requests or instructions for the driver
                            </p>
                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                {formData.specialInstructions?.length || 0}/500
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Location Selector Component (List View Only - No Map)
interface LocationSelectorProps {
    onLocationSelect: (location: LocationData) => void;
    currentLocation: LocationData | null;
    selectedLocation: LocationData | null;
    userLocation: LocationData | null;
}

const LocationSelector = ({ 
    onLocationSelect, 
    selectedLocation
}: LocationSelectorProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedBarangays, setExpandedBarangays] = useState<Record<string, boolean>>({});
    const [filteredBarangays, setFilteredBarangays] = useState<BarangayData[]>(HINOBAAN_BARANGAYS);
    const [selectedBarangayFilter, setSelectedBarangayFilter] = useState<string | null>(null);
    const [additionalAddressDetails, setAdditionalAddressDetails] = useState('');
    // Kept for future address parsing feature
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [baseAddress, setBaseAddress] = useState<string>('');
    const [customDestinations, setCustomDestinations] = useState<Record<string, string>>({});
    const groupedLandmarks = groupLandmarksByBarangayAndPurok();

    // Update base address when a new location is selected (not from manual input)
    useEffect(() => {
        if (selectedLocation && !additionalAddressDetails) {
            // Check if address looks like it has user input prepended
            // Standard addresses start with location name, landmark name, or purok name
            const locationName = selectedLocation.name || selectedLocation.barangay || '';
            const startsWithLocation = selectedLocation.address.startsWith(locationName);
            const hasStandardPattern = selectedLocation.address.match(/^[^,]+,\s*(Barangay|Hinobaan)/);
            
            // If it starts with location name or matches standard pattern, it's the base address
            if (startsWithLocation || hasStandardPattern) {
                setBaseAddress(selectedLocation.address);
            } else {
                // Might have user input, try to extract base address
                const match = selectedLocation.address.match(/^[^,]+,\s*(.+)$/);
                if (match && match[1].includes('Hinobaan')) {
                    setBaseAddress(match[1]);
                } else {
                    setBaseAddress(selectedLocation.address);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLocation?.name, selectedLocation?.barangay, selectedLocation?.purok]);

    // Filter barangays based on search and selected barangay filter
    useEffect(() => {
        let filtered = HINOBAAN_BARANGAYS;

        // Apply barangay filter first
        if (selectedBarangayFilter) {
            filtered = filtered.filter(barangay => barangay.id === selectedBarangayFilter);
        }

        // Then apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(barangay => {
                // Check barangay name
                if (barangay.name.toLowerCase().includes(query)) return true;
                
                // Check landmarks in this barangay
                const landmarksInBarangay = Object.values(groupedLandmarks[barangay.id] || {})
                    .flat()
                    .filter(landmark => 
                        landmark.name.toLowerCase().includes(query) ||
                        landmark.purok?.toLowerCase().includes(query)
                    );
                
                // Check puroks in this barangay
                const puroksInBarangay = PUROKS.filter(p => 
                    p.barangayId === barangay.id && 
                    p.name.toLowerCase().includes(query)
                );
                
                return landmarksInBarangay.length > 0 || puroksInBarangay.length > 0;
            });
        }

        setFilteredBarangays(filtered);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedBarangayFilter]);

    const handleBarangaySelect = (barangay: BarangayData) => {
        const location: LocationData = {
            lat: barangay.lat,
            lng: barangay.lng,
            address: `${barangay.name}, Hinobaan, Negros Occidental`,
            name: barangay.name,
            barangay: barangay.name,
            type: 'barangay'
        };
        
        setAdditionalAddressDetails(''); // Reset manual input
        setBaseAddress(location.address); // Store base address
        setCustomDestinations(prev => ({ ...prev, [barangay.id]: '' })); // Clear custom destination for this barangay
        onLocationSelect(location);
    };

    const handleLandmarkSelect = (landmark: LandmarkData) => {
        const location: LocationData = {
            lat: landmark.lat,
            lng: landmark.lng,
            address: `${landmark.name}, ${landmark.barangay}, Hinobaan, Negros Occidental`,
            name: landmark.name,
            barangay: landmark.barangay,
            purok: landmark.purok,
            type: 'landmark'
        };
        
        setAdditionalAddressDetails(''); // Reset manual input
        setBaseAddress(location.address); // Store base address
        // Clear custom destination for the barangay
        const barangayId = HINOBAAN_BARANGAYS.find(b => b.name === landmark.barangay)?.id;
        if (barangayId) {
            setCustomDestinations(prev => ({ ...prev, [barangayId]: '' }));
        }
        onLocationSelect(location);
    };

    const handlePurokSelect = (purok: PurokData, barangay: BarangayData) => {
        const location: LocationData = {
            lat: barangay.lat,
            lng: barangay.lng,
            address: `${purok.name}, ${barangay.name}, Hinobaan, Negros Occidental`,
            name: purok.name,
            barangay: barangay.name,
            purok: purok.name,
            type: 'purok'
        };
        
        setAdditionalAddressDetails(''); // Reset manual input
        setBaseAddress(location.address); // Store base address
        setCustomDestinations(prev => ({ ...prev, [barangay.id]: '' })); // Clear custom destination for this barangay
        onLocationSelect(location);
    };

    const toggleBarangay = (barangayId: string) => {
        setExpandedBarangays(prev => ({
            ...prev,
            [barangayId]: !prev[barangayId]
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Destination in Hinobaan</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Choose your destination from the options below</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 text-xs font-semibold">
                        {HINOBAAN_BARANGAYS.length} barangays
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 text-xs font-semibold">
                        {POPULAR_LANDMARKS.length} landmarks
                    </Badge>
                </div>
            </div>

            {/* Search Bar */}
            <div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search barangay, purok, or landmark..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-10 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    {searchQuery && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            onClick={() => setSearchQuery('')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Barangay Filter Chips */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-bold text-gray-900 dark:text-white">Filter by Barangay</Label>
                        <Badge variant="outline" className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                            {HINOBAAN_BARANGAYS.length} barangays
                        </Badge>
                    </div>
                    {selectedBarangayFilter && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setSelectedBarangayFilter(null);
                                setSearchQuery('');
                            }}
                            className="h-7 px-2.5 text-xs border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
                <div className="border-2 border-gray-200 dark:border-gray-800 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50">
                    <ScrollArea className="w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pr-4" style={{ maxHeight: '180px' }}>
                            {HINOBAAN_BARANGAYS.map((barangay) => {
                                const isSelected = selectedBarangayFilter === barangay.id;
                                const purokCount = PUROKS.filter(p => p.barangayId === barangay.id).length;
                                const landmarkCount = Object.values(groupedLandmarks[barangay.id] || {}).flat().length;
                                const totalItems = purokCount + landmarkCount;
                                
                                return (
                                    <button
                                        key={barangay.id}
                                        onClick={() => {
                                            setSelectedBarangayFilter(isSelected ? null : barangay.id);
                                            setSearchQuery('');
                                            // Auto-expand the selected barangay
                                            if (!isSelected) {
                                                setExpandedBarangays(prev => ({ ...prev, [barangay.id]: true }));
                                            }
                                        }}
                                        className={`
                                            relative px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left min-h-12 flex flex-col justify-center
                                            ${isSelected
                                                ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-500/30'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-700 border-2 border-gray-200 dark:border-gray-700 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <span className="flex-1 font-bold leading-tight text-left truncate">{barangay.name}</span>
                                            {totalItems > 0 && (
                                                <span className={`
                                                    shrink-0 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap
                                                    ${isSelected 
                                                        ? 'bg-white/30 text-white' 
                                                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                    }
                                                `}>
                                                    {totalItems}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-1.5 right-1.5">
                                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Barangays List with Expandable Sections */}
            <div className="space-y-3">
                {filteredBarangays.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                        <LandmarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 dark:text-white">No results found</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedBarangayFilter ? 'Try selecting a different barangay or clear the filter' : 'Try a different search term'}
                        </p>
                        {selectedBarangayFilter && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setSelectedBarangayFilter(null);
                                    setSearchQuery('');
                                }}
                                className="mt-3"
                            >
                                Clear Filter
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredBarangays.map((barangay) => {
                        const isExpanded = expandedBarangays[barangay.id];
                        const barangayPuroks = PUROKS.filter(p => p.barangayId === barangay.id);
                        const barangayLandmarks = Object.entries(groupedLandmarks[barangay.id] || {});
                        const hasContent = barangayPuroks.length > 0 || barangayLandmarks.length > 0;
                        const isFiltered = selectedBarangayFilter === barangay.id;
                        
                        return (
                            <div 
                                key={barangay.id}
                                className={`
                                    bg-white dark:bg-gray-900 rounded-lg border overflow-hidden transition-all
                                    ${isFiltered 
                                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' 
                                        : 'border-gray-200 dark:border-gray-800'
                                    }
                                `}
                            >
                                {/* Barangay Header */}
                                <div
                                    onClick={() => toggleBarangay(barangay.id)}
                                    className={`
                                        w-full p-4 flex items-center justify-between text-left transition-colors cursor-pointer
                                        ${selectedLocation?.barangay === barangay.name && selectedLocation?.type === 'barangay'
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500' 
                                            : isFiltered
                                            ? 'bg-emerald-50/30 dark:bg-emerald-500/5 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                            ${selectedLocation?.barangay === barangay.name && selectedLocation?.type === 'barangay'
                                                ? 'bg-emerald-100 dark:bg-emerald-500/20' 
                                                : isFiltered
                                                ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                            }
                                        `}>
                                            <MapPin className={`
                                                w-5 h-5
                                                ${selectedLocation?.barangay === barangay.name && selectedLocation?.type === 'barangay'
                                                    ? 'text-emerald-500' 
                                                    : isFiltered
                                                    ? 'text-emerald-500'
                                                    : 'text-gray-600 dark:text-gray-400'
                                                }
                                            `} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{barangay.name}</h4>
                                                {isFiltered && (
                                                    <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4">
                                                        Filtered
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    👥 {barangay.population?.toLocaleString()} • 📏 {barangay.area} km²
                                                </p>
                                                {hasContent && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                                        • {barangayPuroks.length} purok{barangayPuroks.length !== 1 ? 's' : ''} • {Object.values(groupedLandmarks[barangay.id] || {}).flat().length} landmark{Object.values(groupedLandmarks[barangay.id] || {}).flat().length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {selectedLocation?.barangay === barangay.name && selectedLocation?.type === 'barangay' && (
                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBarangaySelect(barangay);
                                                // Auto-expand to show custom destination
                                                if (!isExpanded) {
                                                    setExpandedBarangays(prev => ({ ...prev, [barangay.id]: true }));
                                                }
                                            }}
                                            className="h-7 px-2 text-xs border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                        >
                                            Select
                                        </Button>
                                        <div className={`
                                            ${isFiltered ? 'text-emerald-500' : 'text-gray-400'}
                                        `}>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Custom Destination - Shows when barangay is selected */}
                                {selectedLocation?.barangay === barangay.name && selectedLocation?.type === 'barangay' && (
                                    <div className="border-t border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="w-4 h-4 text-purple-500" />
                                            <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Add Custom Destination</h5>
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="E.g., House 123, School name, Building name, Street name..."
                                                value={customDestinations[barangay.id] || ''}
                                                className="bg-white dark:bg-gray-900 border-purple-300 dark:border-purple-700 h-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setCustomDestinations(prev => ({ ...prev, [barangay.id]: value }));
                                                    
                                                    if (value.trim()) {
                                                        const location: LocationData = {
                                                            lat: barangay.lat,
                                                            lng: barangay.lng,
                                                            address: `${value.trim()}, ${barangay.name}, Hinobaan, Negros Occidental`,
                                                            name: value.trim(),
                                                            barangay: barangay.name,
                                                            type: 'custom'
                                                        };
                                                        setAdditionalAddressDetails('');
                                                        setBaseAddress(`${barangay.name}, Hinobaan, Negros Occidental`);
                                                        onLocationSelect(location);
                                                    } else {
                                                        // If input is cleared, restore barangay selection
                                                        handleBarangaySelect(barangay);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-500 px-1">
                                                Enter your specific address within {barangay.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className={`
                                        border-t p-4 space-y-4 transition-all
                                        ${isFiltered 
                                            ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5' 
                                            : 'border-gray-200 dark:border-gray-800'
                                        }
                                    `}>
                                        {/* Puroks Section */}
                                        {barangayPuroks.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                        <Pin className="w-4 h-4 text-blue-500" />
                                                        Puroks ({barangayPuroks.length})
                                                    </h5>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {barangayPuroks.map((purok) => (
                                                        <button
                                                            key={purok.id}
                                                            onClick={() => handlePurokSelect(purok, barangay)}
                                                            className={`
                                                                p-3 rounded-lg border text-left transition-all hover:shadow-sm
                                                                ${selectedLocation?.purok === purok.name && selectedLocation?.barangay === barangay.name
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/20 shadow-sm' 
                                                                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <div className={`
                                                                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                                                        ${selectedLocation?.purok === purok.name && selectedLocation?.barangay === barangay.name
                                                                            ? 'bg-blue-100 dark:bg-blue-500/20' 
                                                                            : 'bg-gray-100 dark:bg-gray-800'
                                                                        }
                                                                    `}>
                                                                        <Pin className={`
                                                                            w-4 h-4
                                                                            ${selectedLocation?.purok === purok.name && selectedLocation?.barangay === barangay.name
                                                                                ? 'text-blue-500' 
                                                                                : 'text-gray-600 dark:text-gray-400'
                                                                            }
                                                                        `} />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {purok.name}
                                                                    </span>
                                                                </div>
                                                                {selectedLocation?.purok === purok.name && selectedLocation?.barangay === barangay.name && (
                                                                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Landmarks Section */}
                                        {barangayLandmarks.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                        <LandmarkIcon className="w-4 h-4 text-emerald-500" />
                                                        Popular Landmarks ({Object.values(groupedLandmarks[barangay.id] || {}).flat().length})
                                                    </h5>
                                                </div>
                                                <div className="space-y-3">
                                                    {barangayLandmarks.map(([purok, landmarks]) => (
                                                        <div key={`${barangay.id}-${purok}`} className="space-y-2">
                                                            {purok !== 'General' && (
                                                                <h6 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                                                                    {purok}
                                                                </h6>
                                                            )}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                {landmarks.map((landmark) => {
                                                                    const Icon = landmark.icon;
                                                                    const isSelected = selectedLocation?.name === landmark.name;
                                                                    
                                                                    return (
                                                                        <button
                                                                            key={`${barangay.id}-${purok}-${landmark.name}`}
                                                                            onClick={() => handleLandmarkSelect(landmark)}
                                                                            className={`
                                                                                p-3 rounded-lg border text-left transition-all hover:shadow-sm
                                                                                ${isSelected
                                                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-sm' 
                                                                                    : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                                                }
                                                                            `}
                                                                        >
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                                    <div className={`
                                                                                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                                                                        ${isSelected
                                                                                            ? 'bg-emerald-100 dark:bg-emerald-500/20' 
                                                                                            : 'bg-gray-100 dark:bg-gray-800'
                                                                                        }
                                                                                    `}>
                                                                                        <Icon className={`
                                                                                            w-4 h-4
                                                                                            ${isSelected
                                                                                                ? 'text-emerald-500' 
                                                                                                : 'text-gray-600 dark:text-gray-400'
                                                                                            }
                                                                                        `} />
                                                                                    </div>
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
                                                                                            {landmark.name}
                                                                                        </span>
                                                                                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate block capitalize">
                                                                                            {landmark.type}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                {isSelected && (
                                                                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Custom Destination Section */}
                                        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-purple-500" />
                                                    Custom Destination
                                                </h5>
                                            </div>
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="E.g., House 123, School name, Building name..."
                                                    value={customDestinations[barangay.id] || ''}
                                                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 h-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setCustomDestinations(prev => ({ ...prev, [barangay.id]: value }));
                                                        
                                                        if (value.trim()) {
                                                            const location: LocationData = {
                                                                lat: barangay.lat,
                                                                lng: barangay.lng,
                                                                address: `${value.trim()}, ${barangay.name}, Hinobaan, Negros Occidental`,
                                                                name: value.trim(),
                                                                barangay: barangay.name,
                                                                type: 'custom'
                                                            };
                                                            setAdditionalAddressDetails('');
                                                            setBaseAddress(`${barangay.name}, Hinobaan, Negros Occidental`);
                                                            onLocationSelect(location);
                                                        } else {
                                                            // If input is cleared, restore barangay selection
                                                            handleBarangaySelect(barangay);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-500 px-1">
                                                    Enter a custom address within {barangay.name} (house, school, building, etc.)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
};

// Step 2: Location Selection Component (List View Only)
interface Step2LocationProps {
    formData: RideFormData;
    setFormData: (data: RideFormData) => void;
    userLocation: LocationData | null;
    savedPlaces?: SavedPlace[];
}

const Step2Location = ({ 
    formData, 
    setFormData, 
    userLocation,
    savedPlaces = []
}: Step2LocationProps) => {
    const getPlaceIcon = (type: string) => {
        switch (type) {
            case 'home':
                return Home;
            case 'school':
                return School;
            case 'work':
                return Building;
            default:
                return MapPin;
        }
    };

    const handleSavedPlaceSelect = (place: SavedPlace) => {
        // Convert saved place to LocationData format
        if (place.latitude && place.longitude) {
            const locationData: LocationData = {
                lat: place.latitude,
                lng: place.longitude,
                address: place.address,
                name: place.name,
                barangay: place.barangay || undefined,
                purok: place.purok || undefined,
                type: place.type,
            };
            setFormData({ ...formData, destination: locationData });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Location</h3>
                <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                                <Navigation2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {userLocation?.address || 'Getting your location...'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Your pickup location
                                </p>
                            </div>
                            <Badge className="bg-emerald-500 text-white text-xs sm:text-sm whitespace-nowrap">
                                Auto-detected
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-6" />

            {/* Quick Select Saved Places */}
            {savedPlaces.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Quick Select
                        </h3>
                        <Badge variant="outline" className="text-xs">
                            {savedPlaces.length} saved
                        </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {savedPlaces.map((place) => {
                            const IconComponent = getPlaceIcon(place.type);
                            const isSelected = formData.destination?.address === place.address;
                            
                            return (
                                <Button
                                    key={place.id}
                                    variant="outline"
                                    onClick={() => handleSavedPlaceSelect(place)}
                                    className={`h-auto p-3 flex flex-col items-start gap-2 transition-all ${
                                        isSelected 
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20' 
                                            : 'hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <div className={`p-1.5 rounded-lg ${
                                            isSelected 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                            <IconComponent className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-sm font-semibold truncate ${
                                            isSelected ? 'text-emerald-600 dark:text-emerald-400' : ''
                                        }`}>
                                            {place.name}
                                        </span>
                                    </div>
                                    <p className="text-xs text-left text-muted-foreground line-clamp-2 w-full">
                                        {place.address}
                                    </p>
                                    {isSelected && (
                                        <Badge className="bg-emerald-500 text-white text-xs w-full justify-center">
                                            Selected
                                        </Badge>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            <Separator className="my-6" />

            <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Destination</h3>
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                        Service Area: All 13 Barangays
                    </Badge>
                </div>

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                            Hinobaan Destination Selector
                        </CardTitle>
                       <CardDescription className="text-xs sm:text-sm">
                            Browse through Hinobaan's 13 barangays, puroks, and landmarks to select your destination
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-4 sm:p-6">
                            <LocationSelector 
                                onLocationSelect={(location) => setFormData({ ...formData, destination: location })}
                                currentLocation={userLocation}
                                selectedLocation={formData.destination}
                                userLocation={userLocation}
                            />
                        </div>
                    </CardContent>
                </Card>

                {formData.destination && (
                    <Card className="mt-6 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                                    <TargetIcon className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                        {formData.destination.address}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                                            {formData.destination.type === 'landmark' ? '🏛️ Landmark' : 
                                             formData.destination.type === 'barangay' ? '📍 Barangay' : 
                                             formData.destination.type === 'purok' ? '📌 Purok' : '🏠 Address'}
                                        </Badge>
                                        {formData.destination.purok && (
                                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                                {formData.destination.purok}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            {formData.destination.barangay}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFormData({ ...formData, destination: null });
                                    }}
                                    className="shrink-0"
                                >
                                    Change
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

// Step Navigation Component
interface StepNavigationProps {
    currentStep: number;
    onStepChange: (step: number) => void;
}

const StepNavigation = ({ currentStep, onStepChange }: StepNavigationProps) => {
    const steps = [
        { number: 1, label: 'Ride Details', icon: FileText },
        { number: 2, label: 'Location', icon: MapPin },
        { number: 3, label: 'Confirmation', icon: CheckCircle },
        { number: 4, label: 'Payment', icon: CreditCard }
    ];

    // Mobile version - simpler
    if (window.innerWidth < 640) {
        return (
            <div className="mb-4 sm:mb-5">
                <div className="flex items-center justify-between px-1">
                    {steps.map((step) => {
                        const isActive = step.number === currentStep;
                        const isCompleted = step.number < currentStep;
                        
                        return (
                            <div key={step.number} className="flex flex-col items-center flex-1">
                                <button
                                    onClick={() => (isCompleted || isActive) && onStepChange(step.number)}
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                                        ${isCompleted ? 'bg-emerald-500 text-white shadow-sm' : 
                                          isActive ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/30 shadow-md' : 
                                          'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}
                                    `}
                                >
                                    {isCompleted ? '✓' : step.number}
                                </button>
                                <span className={`
                                    text-[10px] mt-1 font-medium text-center leading-tight
                                    ${isActive || isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}
                                `}>
                                    {step.label.split(' ')[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Desktop version
    return (
        <div className="mb-5 sm:mb-6">
            <div className="flex items-center justify-between px-2">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.number === currentStep;
                    const isCompleted = step.number < currentStep;
                    
                    return (
                        <div key={step.number} className="flex items-center flex-1">
                            <button
                                onClick={() => (isCompleted || isActive) && onStepChange(step.number)}
                                className={`flex flex-col items-center flex-1 transition-all ${isCompleted ? 'cursor-pointer hover:opacity-90' : isActive ? '' : 'opacity-60'}`}
                                disabled={!isCompleted && !isActive}
                            >
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                                    ${isCompleted ? 'bg-emerald-500 text-white shadow-sm' : 
                                      isActive ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/20 shadow-md' : 
                                      'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}
                                `}>
                                    {isCompleted ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>
                                <span className={`
                                    text-xs sm:text-sm font-semibold
                                    ${isActive || isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}
                                `}>
                                    {step.label}
                                </span>
                            </button>
                            
                            {index < steps.length - 1 && (
                                <div className={`
                                    h-0.5 mx-3 flex-1 transition-all
                                    ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}
                                `} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Main BookRide Component
export default function BookRide() {
     
    const { auth, activeBooking, savedPlaces = [] } = usePage<
        SharedData & { activeBooking?: { status?: string; review?: unknown }; savedPlaces?: SavedPlace[] }
    >().props;

    const user = auth.user as UserData;
    
    // State for wizard
    const [currentStep, setCurrentStep] = useState(() => {
        // If there's an active booking that is not completed (or completed without review), go directly to step 4
        // Otherwise, start from step 1 for a new booking
        if (activeBooking && activeBooking.status !== 'completed') {
            return 4;
        }
        // If activeBooking is completed, only go to step 4 if it hasn't been reviewed yet
        if (activeBooking && activeBooking.status === 'completed' && !activeBooking.review) {
            return 4;
        }
        return 1;
    });
    const [formData, setFormData] = useState<RideFormData>({
        rideType: 'regular',
        passengerName: user?.name || '',
        passengerPhone: user?.phone || '',
        passengerCount: 1,
        specialInstructions: '',
        emergencyContactName: user?.emergency_contact?.name || '',
        emergencyContactPhone: user?.emergency_contact?.phone || '',
        emergencyContactRelationship: user?.emergency_contact?.relationship || '',
        destination: null
    });
    const [userLocation, setUserLocation] = useState<LocationData | null>(null);
    // Kept for future error handling
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [locationError, setLocationError] = useState<string | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [shouldCheckProfile, setShouldCheckProfile] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    // Kept for future location permission handling
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [locationAccessDenied, setLocationAccessDenied] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [useSimulatedLocation, setUseSimulatedLocation] = useState(false);

    // Get passenger info status
    const getPassengerInfoStatus = () => {
        const emergencyContact = user?.emergency_contact || {};
        const hasEmergencyName = !!emergencyContact.name;
        const hasEmergencyPhone = !!emergencyContact.phone;
        
        const hasPhone = !!user?.phone;
        const hasAddress = !!user?.address;
        const hasEmergencyContact = hasEmergencyName && hasEmergencyPhone;
        const isComplete = hasPhone && hasAddress && hasEmergencyContact;

        return {
            hasPhone,
            hasAddress,
            hasEmergencyContact,
            isComplete,
            missingFields: [] as string[]
        };
    };

    const infoStatus = getPassengerInfoStatus();

    // Check profile completion
    useEffect(() => {
        if (infoStatus.isComplete && shouldCheckProfile) {
            const timer = setTimeout(() => {
                setShouldCheckProfile(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [infoStatus.isComplete, shouldCheckProfile]);

    // Get user location
    useEffect(() => {
        if (infoStatus.isComplete) {
            const getLocation = async () => {
                setIsGettingLocation(true);
                setLocationError(null);
                setLocationAccessDenied(false);

                // For testing, use simulated location in Hinobaan
                const simulateLocation = useSimulatedLocation || false;
                
                if (simulateLocation) {
                    const simulatedLocation: LocationData = {
                        lat: 9.5989,
                        lng: 122.4676,
                        address: "Barangay I (Poblacion), Hinobaan, Negros Occidental",
                        barangay: 'Barangay I (Poblacion)'
                    };
                    
                    setUserLocation(simulatedLocation);
                    setIsGettingLocation(false);
                    return;
                }

                if (!navigator.geolocation) {
                    const fallbackLocation: LocationData = {
                        lat: HINOBAAN_BOUNDARY.center[0],
                        lng: HINOBAAN_BOUNDARY.center[1],
                        address: "Barangay I (Poblacion), Hinobaan, Negros Occidental",
                        barangay: 'Barangay I (Poblacion)'
                    };
                    
                    setUserLocation(fallbackLocation);
                    setLocationError("Geolocation not supported. Using central Hinobaan location.");
                    setIsGettingLocation(false);
                    return;
                }

                const options = {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                };

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        
                        const clampedLat = Math.max(HINOBAAN_BOUNDARY.bounds.south, 
                            Math.min(HINOBAAN_BOUNDARY.bounds.north, latitude));
                        const clampedLng = Math.max(HINOBAAN_BOUNDARY.bounds.west, 
                            Math.min(HINOBAAN_BOUNDARY.bounds.east, longitude));
                        
                        const isWithinHinobaan = checkIfInHinobaan(latitude, longitude);
                        const barangayName = getNearestBarangayName(clampedLat, clampedLng);
                        
                        let address;
                        if (isWithinHinobaan) {
                            address = `${barangayName}, Hinobaan, Negros Occidental`;
                        } else {
                            address = `${barangayName}, Hinobaan, Negros Occidental`;
                            setLocationError(`Your location has been adjusted to stay within Hinobaan municipality. Using nearest barangay: ${barangayName}`);
                        }
                        
                        setUserLocation({
                            lat: clampedLat,
                            lng: clampedLng,
                            address,
                            barangay: barangayName
                        });
                        
                        setIsGettingLocation(false);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        
                        const fallbackLocation: LocationData = {
                            lat: HINOBAAN_BOUNDARY.center[0],
                            lng: HINOBAAN_BOUNDARY.center[1],
                            address: "Barangay I (Poblacion), Hinobaan, Negros Occidental",
                            barangay: 'Barangay I (Poblacion)'
                        };
                        
                        setUserLocation(fallbackLocation);
                        setLocationError("Using default Hinobaan location. You can manually select your location.");
                        setIsGettingLocation(false);
                    },
                    options
                );
            };

            getLocation();
        }
    }, [infoStatus.isComplete, useSimulatedLocation]);

    // Calculate route when destination changes
    useEffect(() => {
        if (userLocation && formData.destination) {
            const distanceKm = calculateHinobaanDistance(
                userLocation.lat, 
                userLocation.lng, 
                formData.destination.lat, 
                formData.destination.lng
            );
            
            const durationMinutes = calculateHinobaanTravelTime(distanceKm);
            
            const { fare, totalFare } = calculateHinobaanFare(
                distanceKm,
                formData.rideType,
                formData.passengerCount
            );
            
            const calculateETA = (durationMinutes: number) => {
                const now = new Date();
                now.setMinutes(now.getMinutes() + durationMinutes + 5);
                return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRouteInfo({
                distance: `${distanceKm.toFixed(1)} km`,
                duration: `${durationMinutes} mins`,
                fare: `₱${fare}.00`,
                totalFare: `₱${totalFare}.00`,
                estimatedArrival: calculateETA(durationMinutes)
            });
        }
         
    }, [userLocation, formData.destination, formData.rideType, formData.passengerCount]);

    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // handleBookRide is now handled in BookingConfirmation component

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Book a Ride', href: '/BookRide' }
    ];

    // Show profile restriction screen if profile is not complete
    if (!infoStatus.isComplete) {
        return (
            <PassengerLayout breadcrumbs={breadcrumbs}>
                <Head title="Complete Your Profile" />
                <ProfileRestrictionScreen 
                    infoStatus={infoStatus} 
                    onProfileCompleted={() => setShouldCheckProfile(true)}
                />
            </PassengerLayout>
        );
    }

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1RideDetails 
                        formData={formData}
                        setFormData={setFormData}
                        user={user}
                    />
                );
            case 2:
                return (
                    <Step2Location 
                        formData={formData}
                        setFormData={setFormData}
                        userLocation={userLocation}
                        savedPlaces={savedPlaces}
                    />
                );
            case 3:
                return (
                    <div className="space-y-6">
                        {/* Route Map */}
                        <RouteMap 
                            pickupLocation={userLocation}
                            destination={formData.destination}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <Card className="col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                                        Ride Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Ride Type</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                            {RIDE_TYPES.find(r => r.id === formData.rideType)?.name || 'Regular Ride'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Passengers</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                            {formData.passengerCount} {formData.passengerCount === 1 ? 'person' : 'people'}
                                        </span>
                                    </div>
                                    {formData.specialInstructions && (
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Special Instructions:</span>
                                            <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                                                {formData.specialInstructions}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                                        Route Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xs sm:text-sm font-bold">
                                                A
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Pickup Location</p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {userLocation?.address || 'Loading...'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0 text-xs sm:text-sm font-bold">
                                                B
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Destination</p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {formData.destination?.address || 'Not selected'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {routeInfo && (
                            <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <RouteIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                                        Route Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                                        <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <Route className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Distance</span>
                                            </div>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.distance}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Within Hinobaan</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Duration</span>
                                            </div>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.duration}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Approximate travel time</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <Car className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Base Fare</span>
                                            </div>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.fare}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">For first 5km</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                                                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Total Fare</span>
                                            </div>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.totalFare}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">For {formData.passengerCount} {formData.passengerCount === 1 ? 'person' : 'people'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Estimated Arrival</p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Driver will arrive by:</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg sm:text-xl font-bold text-emerald-500">{routeInfo.estimatedArrival}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                );
            case 4:
                return (
                    <BookingConfirmation
                        formData={formData}
                        userLocation={userLocation}
                        routeInfo={routeInfo}
                        onBookingComplete={() => {
                            // This is now handled by the buttons in BookingConfirmation
                            // Keep for backward compatibility but buttons handle navigation
                        }}
                        onCancel={() => {
                            // Reset booking form to start fresh
                            // Clear localStorage
                            localStorage.removeItem('activeBookingId');
                            localStorage.removeItem('activeBookingStatus');
                            setCurrentStep(1);
                            setFormData({
                                rideType: 'regular',
                                passengerName: user?.name || '',
                                passengerPhone: user?.phone || '',
                                passengerCount: 1,
                                specialInstructions: '',
                                emergencyContactName: user?.emergency_contact?.name || '',
                                emergencyContactPhone: user?.emergency_contact?.phone || '',
                                emergencyContactRelationship: user?.emergency_contact?.relationship || '',
                                destination: null
                            });
                            setRouteInfo(null);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    // Check if step is valid
    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return true; // Only requires ride type and passenger count
            case 2:
                return formData.destination !== null;
            case 3:
                return routeInfo !== null;
            case 4:
                return true;
            default:
                return false;
        }
    };

    return (
        <PassengerLayout breadcrumbs={breadcrumbs}>
            <Head title="Book a Ride - Hinobaan Tricycle Service" />
            
            <div className="flex h-full flex-1 flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Header Banner */}
                <Card className="border-0 shadow-sm bg-linear-to-r from-emerald-500 to-emerald-600 mb-4 sm:mb-6 overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold text-white mb-0.5">Book a Tricycle Ride</h1>
                                    <p className="text-white/95 text-xs sm:text-sm">
                                        Affordable rides within Hinobaan's 13 barangays
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-white/25 backdrop-blur-md text-white border-0 text-xs font-semibold px-2.5 py-1">
                                Step {currentStep} of 4
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Wizard Navigation */}
                <StepNavigation 
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                />

                {/* Main Content */}
                <Card className="flex-1 mb-4 sm:mb-6 border-0 shadow-sm">
                    <CardContent className="p-4 sm:p-5">
                        {isGettingLocation ? (
                            <div className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-spin shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-blue-800 dark:text-blue-400 text-sm sm:text-base">Getting Your Location</h4>
                                        <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            Please wait while we detect your location within Hinobaan...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {renderStepContent()}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div>
                        {currentStep > 1 && currentStep < 4 && (
                            <Button
                                variant="outline"
                                onClick={handlePrevStep}
                                className="border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 font-semibold text-sm h-9 sm:h-10 px-4 rounded-lg transition-all"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1.5" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {currentStep < 4 ? (
                            <Button
                                onClick={handleNextStep}
                                disabled={!isStepValid()}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm h-9 sm:h-10 px-5 rounded-lg shadow-sm hover:shadow-md transition-all"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4 ml-1.5" />
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}