import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Navigation, 
    Clock,
    User,
    Car,
    Shield,
    CheckCircle,
    Users,
    RefreshCw,
    AlertTriangle,
    Sparkles,
    Route,
    Map as MapIcon,
    User as UserIcon,
    LocateFixed,
    Info,
    Calendar,
    Target,
    Zap,
    AlertCircle,
    Phone as PhoneIcon,
    Home,
    Contact,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Navigation2,
    Target as TargetIcon,
    FileText,
    CreditCard,
    Check,
    Route as RouteIcon,
    BarChart,
    Truck,
    Award,
    PhoneCall,
    MessageSquare,
    Star,
    Search,
    Pin,
    Compass as CompassIcon,
    PlusCircle,
    MinusCircle,
    Eye,
    EyeOff,
    Briefcase,
    School,
    Hospital,
    ShoppingBag,
    Church,
    Building,
    Trees as Park,
    Coffee,
    Store,
    Building2,
    Landmark,
    PiggyBank,
    Hotel
} from 'lucide-react';
import { type SharedData, type BreadcrumbItem } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define Hinobaan municipality boundary coordinates
const HINOBAAN_BOUNDARY = {
    center: [9.5931, 122.4697] as [number, number],
    bounds: {
        north: 9.6500,
        south: 9.5300,
        east: 122.5200,
        west: 122.4200
    }
};

// All barangays in Hinobaan municipality with popular places
const HINOBAAN_BARANGAYS = [
    { 
        id: 'talacagay', 
        name: 'Talacagay', 
        lat: 9.6100, 
        lng: 122.4800,
        popularPlaces: [
            { name: 'Talacagay Elementary School', type: 'school', icon: School },
            { name: 'Talacagay Barangay Hall', type: 'government', icon: Building },
            { name: 'Local Sari-sari Stores', type: 'store', icon: Store }
        ]
    },
    { 
        id: 'culipapa', 
        name: 'Culipapa', 
        lat: 9.5800, 
        lng: 122.4600,
        popularPlaces: [
            { name: 'Culipapa Beach Area', type: 'park', icon: Park },
            { name: 'Culipapa Health Center', type: 'hospital', icon: Hospital },
            { name: 'Fishing Port', type: 'landmark', icon: Landmark }
        ]
    },
    { 
        id: 'damutan', 
        name: 'Damutan', 
        lat: 9.6000, 
        lng: 122.4500,
        popularPlaces: [
            { name: 'Damutan Elementary School', type: 'school', icon: School },
            { name: 'Agricultural Area', type: 'landmark', icon: Landmark },
            { name: 'Local Market', type: 'store', icon: ShoppingBag }
        ]
    },
    { 
        id: 'poblacion', 
        name: 'Poblacion', 
        lat: 9.5931, 
        lng: 122.4697,
        popularPlaces: [
            { name: 'Hinobaan Municipal Hall', type: 'government', icon: Building },
            { name: 'Public Market', type: 'store', icon: ShoppingBag },
            { name: 'St. Joseph Parish Church', type: 'church', icon: Church },
            { name: 'Hinobaan National High School', type: 'school', icon: School },
            { name: 'Rural Health Unit', type: 'hospital', icon: Hospital },
            { name: 'Police Station', type: 'government', icon: Shield },
            { name: 'Bank/ATM Centers', type: 'bank', icon: PiggyBank },
            { name: 'Local Eateries', type: 'coffee', icon: Coffee }
        ]
    },
    { 
        id: 'alim', 
        name: 'Alim', 
        lat: 9.6010, 
        lng: 122.4615,
        popularPlaces: [
            { name: 'Alim Elementary School', type: 'school', icon: School },
            { name: 'Farm Areas', type: 'landmark', icon: Landmark },
            { name: 'Local Stores', type: 'store', icon: Store }
        ]
    },
    { 
        id: 'bacuyangan', 
        name: 'Bacuyangan', 
        lat: 9.5850, 
        lng: 122.4760,
        popularPlaces: [
            { name: 'Bacuyangan Elementary School', type: 'school', icon: School },
            { name: 'Coastal Area', type: 'park', icon: Park },
            { name: 'Barangay Health Station', type: 'hospital', icon: Hospital }
        ]
    },
    { 
        id: 'sanrafael', 
        name: 'San Rafael', 
        lat: 9.5900, 
        lng: 122.4620,
        popularPlaces: [
            { name: 'San Rafael Chapel', type: 'church', icon: Church },
            { name: 'Agricultural Lands', type: 'landmark', icon: Landmark },
            { name: 'Local Stores', type: 'store', icon: Store }
        ]
    },
    { 
        id: 'bitoon', 
        name: 'Bito-on', 
        lat: 9.5950, 
        lng: 122.4800,
        popularPlaces: [
            { name: 'Bito-on Elementary School', type: 'school', icon: School },
            { name: 'Beach Resort Area', type: 'park', icon: Park },
            { name: 'Tourist Spots', type: 'landmark', icon: Landmark }
        ]
    },
    { 
        id: 'dawis', 
        name: 'Dawis', 
        lat: 9.5880, 
        lng: 122.4720,
        popularPlaces: [
            { name: 'Dawis Elementary School', type: 'school', icon: School },
            { name: 'Coastal Road', type: 'landmark', icon: Route },
            { name: 'Local Stores', type: 'store', icon: Store }
        ]
    }
];

// Popular landmarks in Hinobaan
const POPULAR_LANDMARKS = [
    { name: 'Hinobaan Municipal Hall', type: 'government', icon: Building, lat: 9.5935, lng: 122.4695, barangay: 'Poblacion' },
    { name: 'Public Market', type: 'store', icon: ShoppingBag, lat: 9.5928, lng: 122.4702, barangay: 'Poblacion' },
    { name: 'St. Joseph Parish Church', type: 'church', icon: Church, lat: 9.5938, lng: 122.4690, barangay: 'Poblacion' },
    { name: 'Hinobaan National High School', type: 'school', icon: School, lat: 9.5942, lng: 122.4685, barangay: 'Poblacion' },
    { name: 'Rural Health Unit', type: 'hospital', icon: Hospital, lat: 9.5930, lng: 122.4705, barangay: 'Poblacion' },
    { name: 'Police Station', type: 'government', icon: Shield, lat: 9.5925, lng: 122.4698, barangay: 'Poblacion' },
    { name: 'Talacagay Elementary School', type: 'school', icon: School, lat: 9.6102, lng: 122.4803, barangay: 'Talacagay' },
    { name: 'Culipapa Beach', type: 'park', icon: Park, lat: 9.5795, lng: 122.4610, barangay: 'Culipapa' },
    { name: 'Bacuyangan Coastal Area', type: 'park', icon: Park, lat: 9.5848, lng: 122.4765, barangay: 'Bacuyangan' },
];

// Ride types
const RIDE_TYPES = [
    { id: 'regular', name: 'Regular Ride', icon: Car, description: 'Standard tricycle ride', baseFare: 30 },
    { id: 'express', name: 'Express Ride', icon: Zap, description: 'Direct route, no stops', baseFare: 40 },
    { id: 'group', name: 'Group Ride', icon: Users, description: 'For 3+ passengers', baseFare: 50 },
    { id: 'night', name: 'Night Ride', icon: Shield, description: 'After 8 PM service', baseFare: 40 }
];

// Get nearest barangay name
const getNearestBarangayName = (lat: number, lng: number): string => {
    let nearest = '';
    let minDistance = Infinity;

    HINOBAAN_BARANGAYS.forEach((barangay) => {
        const distance = Math.sqrt(
            Math.pow(lat - barangay.lat, 2) + Math.pow(lng - barangay.lng, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = barangay.name;
        }
    });

    return nearest || 'Hinobaan Area';
};

// Check if point is within Hinobaan bounds
const checkIfInHinobaan = (lat: number, lng: number): boolean => {
    return (
        lat >= HINOBAAN_BOUNDARY.bounds.south &&
        lat <= HINOBAAN_BOUNDARY.bounds.north &&
        lng >= HINOBAAN_BOUNDARY.bounds.west &&
        lng <= HINOBAAN_BOUNDARY.bounds.east
    );
};

// Interactive Map Component
const InteractiveMap = ({ 
    userLocation, 
    destination, 
    onLocationSelect,
    selectedBarangay
}: { 
    userLocation: any;
    destination: any;
    onLocationSelect: (location: any) => void;
    selectedBarangay: string;
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    // Load Leaflet dynamically
    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window === 'undefined') return;
            
            try {
                await import('leaflet/dist/leaflet.css');
                setLeafletLoaded(true);
            } catch (error) {
                console.error('Failed to load Leaflet CSS:', error);
                setMapError('Failed to load map resources');
            }
        };
        loadLeaflet();
    }, []);

    const initializeMap = useCallback(async () => {
        if (!mapRef.current || typeof window === 'undefined' || !leafletLoaded) return;

        try {
            const L = await import('leaflet');

            // Fix leaflet icon URLs
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            // Check if map container already has a map instance
            if ((mapRef.current as any)._leaflet_id) {
                console.log('Map already exists, reusing');
                setIsMapReady(true);
                return;
            }

            // Create map instance centered on Hinobaan
            const map = L.map(mapRef.current!, {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                preferCanvas: true,
                attributionControl: false,
                zoomSnap: 0.5,
                zoomDelta: 0.5
            }).setView(HINOBAAN_BOUNDARY.center, 13);
            
            leafletRef.current = map;

            // Add attribution control
            L.control.attribution({ position: 'bottomright' }).addTo(map);

            // Check if dark mode is active
            const isDarkMode = document.documentElement.classList.contains('dark');
            
            // Add tile layer based on dark mode
            const tileLayer = L.tileLayer(
                isDarkMode 
                    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    attribution: isDarkMode 
                        ? '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 18,
                }
            ).addTo(map);

            // Create layer groups
            markersLayerRef.current = L.layerGroup().addTo(map);

            // Draw municipality boundary polygon
            const boundaryCoordinates: [number, number][] = [
                [HINOBAAN_BOUNDARY.bounds.north, HINOBAAN_BOUNDARY.bounds.west],
                [HINOBAAN_BOUNDARY.bounds.north, HINOBAAN_BOUNDARY.bounds.east],
                [HINOBAAN_BOUNDARY.bounds.south, HINOBAAN_BOUNDARY.bounds.east],
                [HINOBAAN_BOUNDARY.bounds.south, HINOBAAN_BOUNDARY.bounds.west],
                [HINOBAAN_BOUNDARY.bounds.north, HINOBAAN_BOUNDARY.bounds.west]
            ];

            L.polygon(boundaryCoordinates, {
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.05,
                weight: 2,
                dashArray: '5, 5',
                className: 'hinobaan-boundary'
            }).addTo(map);

            // Add user location marker if available
            if (userLocation) {
                const userIcon = L.divIcon({
                    html: `
                        <div class="relative">
                            <div class="relative w-8 h-8">
                                <div class="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                                <div class="absolute inset-1 rounded-full bg-emerald-500/40 animate-pulse"></div>
                                <div class="absolute inset-2 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    `,
                    className: 'user-location-marker',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                L.marker([userLocation.lat, userLocation.lng], { 
                    icon: userIcon,
                    draggable: false,
                    zIndexOffset: 1000
                }).addTo(markersLayerRef.current)
                .bindTooltip('You are here', { 
                    permanent: true, 
                    direction: 'top',
                    className: 'custom-tooltip'
                });
            }

            // Add popular landmarks
            POPULAR_LANDMARKS.forEach((landmark) => {
                const landmarkIcon = L.divIcon({
                    html: `
                        <div class="relative">
                            <div class="w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-lg">
                                <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </div>
                        </div>
                    `,
                    className: 'landmark-marker',
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                });

                L.marker([landmark.lat, landmark.lng], { 
                    icon: landmarkIcon,
                    zIndexOffset: 500
                }).addTo(markersLayerRef.current)
                .bindPopup(`
                    <div style="padding: 8px; min-width: 200px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <div style="width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center;">
                                <svg style="width: 12px; height: 12px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </div>
                            <div>
                                <div style="font-weight: 600; font-size: 14px; color: #1f2937;">${landmark.name}</div>
                                <div style="font-size: 12px; color: #6b7280;">${landmark.barangay}</div>
                            </div>
                        </div>
                        <button onclick="window.handleMapLocationSelect(${JSON.stringify({
                            lat: landmark.lat,
                            lng: landmark.lng,
                            address: `${landmark.name}, ${landmark.barangay}, Hinobaan`,
                            name: landmark.name,
                            barangay: landmark.barangay
                        }).replace(/"/g, '&quot;')})" 
                            style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; width: 100%; margin-top: 8px; transition: all 0.2s;" 
                            onmouseover="this.style.background='#059669'" 
                            onmouseout="this.style.background='#10b981'">
                            Select This Location
                        </button>
                    </div>
                `);
            });

            // Add barangay markers
            HINOBAAN_BARANGAYS.forEach((barangay) => {
                const isSelected = selectedBarangay === barangay.id;
                const barangayIcon = L.divIcon({
                    html: `
                        <div class="relative">
                            <div class="w-8 h-8 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-gray-600'} border-2 border-white flex items-center justify-center shadow-lg">
                                <span class="text-xs font-bold text-white">${barangay.name.charAt(0)}</span>
                            </div>
                            ${isSelected ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>' : ''}
                        </div>
                    `,
                    className: 'barangay-marker',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                L.marker([barangay.lat, barangay.lng], { 
                    icon: barangayIcon,
                    zIndexOffset: isSelected ? 100 : 0
                }).addTo(markersLayerRef.current)
                .bindPopup(`
                    <div style="padding: 8px; min-width: 220px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center;">
                                <svg style="width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <div>
                                <div style="font-weight: 600; font-size: 14px; color: #1f2937;">${barangay.name}</div>
                                <div style="font-size: 12px; color: #6b7280;">Barangay, Hinobaan</div>
                            </div>
                        </div>
                        <div style="font-size: 12px; color: #4b5563; margin-bottom: 8px;">
                            Popular places:
                            <ul style="margin-top: 4px; padding-left: 16px;">
                                ${barangay.popularPlaces.slice(0, 3).map(place => 
                                    `<li style="margin-bottom: 2px;">• ${place.name}</li>`
                                ).join('')}
                            </ul>
                        </div>
                        <button onclick="window.handleMapLocationSelect(${JSON.stringify({
                            lat: barangay.lat,
                            lng: barangay.lng,
                            address: `${barangay.name}, Hinobaan, Negros Occidental`,
                            name: barangay.name,
                            barangay: barangay.name
                        }).replace(/"/g, '&quot;')})" 
                            style="background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; width: 100%; transition: all 0.2s;" 
                            onmouseover="this.style.background='#059669'" 
                            onmouseout="this.style.background='#10b981'">
                            Select This Barangay
                        </button>
                    </div>
                `);
            });

            // Add destination marker if available
            if (destination && destination.lat && destination.lng) {
                const destIcon = L.divIcon({
                    html: `
                        <div class="relative">
                            <div class="relative w-8 h-8">
                                <div class="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white animate-pulse"></div>
                                <div class="absolute inset-2 rounded-full bg-white flex items-center justify-center shadow-lg">
                                    <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <circle cx="12" cy="12" r="6"></circle>
                                        <circle cx="12" cy="12" r="2"></circle>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    `,
                    className: 'destination-marker',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                L.marker([destination.lat, destination.lng], { 
                    icon: destIcon,
                    zIndexOffset: 2000
                }).addTo(markersLayerRef.current)
                .bindTooltip('Selected Destination', { 
                    permanent: true, 
                    direction: 'top',
                    className: 'custom-tooltip'
                });
            }

            // Add click event to map for selecting destination
            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                
                // Check if within Hinobaan boundary
                const bounds = L.latLngBounds([
                    [HINOBAAN_BOUNDARY.bounds.south, HINOBAAN_BOUNDARY.bounds.west],
                    [HINOBAAN_BOUNDARY.bounds.north, HINOBAAN_BOUNDARY.bounds.east]
                ]);
                
                if (!bounds.contains(e.latlng)) {
                    alert('Sorry! Our service is only available within Hinobaan municipality');
                    return;
                }

                // Get nearest barangay
                const barangay = getNearestBarangayName(lat, lng);
                const address = `${barangay}, Hinobaan, Negros Occidental`;

                const location = {
                    lat,
                    lng,
                    address,
                    name: `Location in ${barangay}`,
                    barangay
                };

                // Store location in a variable accessible to the popup
                const handleLocationSelection = () => {
                    onLocationSelect(location);
                    map.closePopup();
                };

                // Create popup content
                const popupContent = L.DomUtil.create('div', 'location-popup');
                popupContent.innerHTML = `
                    <div style="padding: 12px; min-width: 250px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <div style="width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center;">
                                <svg style="width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </div>
                            <div>
                                <div style="font-weight: 600; font-size: 14px; color: #1f2937;">Select Location</div>
                                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${address}</div>
                                <div style="font-size: 11px; color: #10b981; margin-top: 2px; font-weight: 500;">
                                    ${barangay} • Hinobaan
                                </div>
                            </div>
                        </div>
                        <button id="select-location-btn" 
                            style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                            <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                            </svg>
                            Select This Location
                        </button>
                        <div style="font-size: 11px; color: #9ca3af; text-align: center; padding-top: 8px; border-top: 1px solid #e5e7eb; margin-top: 8px;">
                            Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
                        </div>
                    </div>
                `;

                // Add event listener to the button
                setTimeout(() => {
                    const button = popupContent.querySelector('#select-location-btn');
                    if (button) {
                        button.addEventListener('click', handleLocationSelection);
                    }
                }, 100);

                // Define global handler for popup button
                (window as any).handleMapLocationSelect = (location: any) => {
                    onLocationSelect(location);
                    if (leafletRef.current) {
                        leafletRef.current.closePopup();
                    }
                };

                L.popup()
                    .setLatLng([lat, lng])
                    .setContent(popupContent)
                    .openOn(map);
            });

            // Fit bounds to show Hinobaan
            const bounds = L.latLngBounds([
                [HINOBAAN_BOUNDARY.bounds.south, HINOBAAN_BOUNDARY.bounds.west],
                [HINOBAAN_BOUNDARY.bounds.north, HINOBAAN_BOUNDARY.bounds.east]
            ]);
            map.fitBounds(bounds.pad(0.1));

            setIsMapReady(true);
            setMapError(null);

        } catch (error) {
            console.error('Map initialization error:', error);
            setMapError('Failed to initialize map. Please check your internet connection.');
        }
    }, [userLocation, destination, onLocationSelect, selectedBarangay, leafletLoaded]);

    // Initialize map on mount
    useEffect(() => {
        if (leafletLoaded && mapRef.current) {
            initializeMap();
        }

        // Cleanup function
        return () => {
            if (leafletRef.current) {
                leafletRef.current.remove();
                leafletRef.current = null;
            }
        };
    }, [initializeMap, leafletLoaded]);

    return (
        <div className="relative w-full h-full">
            {mapError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <div className="text-center p-6">
                        <AlertCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Map Loading Failed</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{mapError}</p>
                        <Button 
                            onClick={() => {
                                if (leafletRef.current) {
                                    leafletRef.current.remove();
                                    leafletRef.current = null;
                                }
                                setIsMapReady(false);
                                setMapError(null);
                                initializeMap();
                            }} 
                            variant="outline"
                            className="border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry Loading Map
                        </Button>
                    </div>
                </div>
            ) : !leafletLoaded ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <div className="text-center p-6">
                        <Loader2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Map...</h3>
                        <p className="text-gray-600 dark:text-gray-400">Please wait while we load the map</p>
                    </div>
                </div>
            ) : (
                <>
                    <div 
                        ref={mapRef}
                        className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-900"
                    />
                    
                    {/* Map Instructions */}
                    <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 rounded-lg p-3 shadow-lg max-w-xs border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <LocateFixed className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Interactive Map</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Click anywhere or select landmarks to set destination
                        </p>
                    </div>

                    {/* Map Legend */}
                    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-lg p-3 shadow-lg border border-emerald-500/20">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">Your Location</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">Barangay Center</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">Landmarks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-white border border-emerald-500"></div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">Destination</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Profile Restriction Component (Standalone)
function ProfileRestrictionScreen({ infoStatus, onProfileCompleted }: { infoStatus: any; onProfileCompleted: () => void }) {
    const [isChecking, setIsChecking] = useState(false);
    const [showMissingFieldsPrompt, setShowMissingFieldsPrompt] = useState(false);

    const handleRefreshCheck = () => {
        setIsChecking(true);
        router.reload({ only: ['auth'] });
        setTimeout(() => {
            setIsChecking(false);
            onProfileCompleted();
        }, 1000);
    };

    const handleCompleteProfileClick = () => {
        if (!infoStatus.isComplete) {
            setShowMissingFieldsPrompt(true);
        }
    };

    const getMissingFieldsText = () => {
        const missing = [];
        if (!infoStatus.hasPhone) missing.push('Phone Number');
        if (!infoStatus.hasAddress) missing.push('Home Address');
        if (!infoStatus.hasEmergencyContact) missing.push('Emergency Contact');
        return missing.join(', ');
    };

    const completionPercentage = Math.round(([infoStatus.hasPhone, infoStatus.hasAddress, infoStatus.hasEmergencyContact].filter(Boolean).length / 3) * 100);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Book a Ride', href: '/BookRide' }
    ];

    return (
        <PassengerLayout breadcrumbs={breadcrumbs}>
            <Head title="Complete Your Profile" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Missing Fields Prompt */}
                {showMissingFieldsPrompt && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-emerald-500/20 p-6 w-full max-w-md shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Profile Incomplete
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Please complete all required information
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMissingFieldsPrompt(false)}
                                    className="ml-auto h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2">
                                    Missing Information:
                                </p>
                                <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                                    {!infoStatus.hasPhone && (
                                        <li className="flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            Phone Number
                                        </li>
                                    )}
                                    {!infoStatus.hasAddress && (
                                        <li className="flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            Home Address
                                        </li>
                                    )}
                                    {!infoStatus.hasEmergencyContact && (
                                        <li className="flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            Emergency Contact
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                You need to complete all required information in your profile to book rides.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowMissingFieldsPrompt(false)}
                                    className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </Button>
                                <Link href="/PassengerSide/profile">
                                    <Button 
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        Go to Profile
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Banner */}
                <Card className="border-emerald-500/20 bg-linear-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Finish setting up your profile to start booking rides. {getMissingFieldsText()} required for your safety.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress & Requirements Card */}
                <Card className="border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-emerald-500" />
                                    Profile Completion
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Complete these requirements to unlock ride booking
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-emerald-500">{completionPercentage}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                            </div>
                        </div>
                        
                        <Progress value={completionPercentage} className="h-2 mb-6 bg-gray-200 dark:bg-gray-800" />
                        
                        <div className="space-y-4">
                            {/* Phone Number */}
                            <div className={`flex items-center justify-between p-4 rounded-lg border ${
                                infoStatus.hasPhone 
                                    ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' 
                                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        infoStatus.hasPhone 
                                            ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20' 
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        {infoStatus.hasPhone ? <CheckCircle className="w-5 h-5" /> : <PhoneIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Phone Number</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            For driver communication and ride notifications
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    infoStatus.hasPhone 
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                    {infoStatus.hasPhone ? "Completed" : "Required"}
                                </div>
                            </div>

                            {/* Home Address */}
                            <div className={`flex items-center justify-between p-4 rounded-lg border ${
                                infoStatus.hasAddress 
                                    ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' 
                                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        infoStatus.hasAddress 
                                            ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20' 
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        {infoStatus.hasAddress ? <CheckCircle className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Home Address</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            For accurate pickup locations and emergency situations
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    infoStatus.hasAddress 
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                    {infoStatus.hasAddress ? "Completed" : "Required"}
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className={`flex items-center justify-between p-4 rounded-lg border ${
                                infoStatus.hasEmergencyContact 
                                    ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' 
                                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        infoStatus.hasEmergencyContact 
                                            ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20' 
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        {infoStatus.hasEmergencyContact ? <CheckCircle className="w-5 h-5" /> : <Contact className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Emergency Contact</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            For safety notifications and emergency situations
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    infoStatus.hasEmergencyContact 
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                    {infoStatus.hasEmergencyContact ? "Completed" : "Required"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                        size="lg"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                        onClick={handleCompleteProfileClick}
                    >
                        <User className="w-4 h-4 mr-2" />
                        Complete Profile Now
                    </Button>
                    
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleRefreshCheck}
                        disabled={isChecking}
                        className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {isChecking ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                I've Completed My Profile
                            </>
                        )}
                    </Button>
                </div>

                {/* Safety Notice */}
                <Card className="border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <Shield className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 text-base mb-4">Safety First</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-emerald-800 dark:text-emerald-300">
                                <div className="flex items-center justify-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Emergency assistance and quick response</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Accurate pickup locations and navigation</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <PhoneIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Driver communication and ride updates</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <Contact className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Emergency contact notifications</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}

// Step Navigation Component
const StepNavigation = ({ currentStep, totalSteps, onStepChange }: { 
    currentStep: number; 
    totalSteps: number; 
    onStepChange: (step: number) => void;
}) => {
    const steps = [
        { number: 1, label: 'Ride Details', icon: FileText },
        { number: 2, label: 'Location', icon: MapPin },
        { number: 3, label: 'Confirmation', icon: CheckCircle },
        { number: 4, label: 'Payment', icon: CreditCard }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.number === currentStep;
                    const isCompleted = step.number < currentStep;
                    
                    return (
                        <div key={step.number} className="flex items-center">
                            <button
                                onClick={() => onStepChange(step.number)}
                                className={`flex flex-col items-center ${isCompleted ? 'cursor-pointer' : isActive ? '' : 'opacity-50'}`}
                                disabled={!isCompleted && !isActive}
                            >
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                                    ${isCompleted ? 'bg-emerald-500 text-white' : 
                                      isActive ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20' : 
                                      'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}
                                `}>
                                    {isCompleted ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <Icon className="w-6 h-6" />
                                    )}
                                </div>
                                <span className={`
                                    text-sm font-medium
                                    ${isActive || isCompleted ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'}
                                `}>
                                    {step.label}
                                </span>
                            </button>
                            
                            {index < steps.length - 1 && (
                                <div className={`
                                    w-16 h-1 mx-2
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

// Step 1: Ride Details Component
const Step1RideDetails = ({ 
    formData, 
    setFormData, 
    user 
}: { 
    formData: any; 
    setFormData: (data: any) => void;
    user: any;
}) => {
    const [passengers, setPassengers] = useState(formData.passengerCount || 1);
    const [showEmergencyContact, setShowEmergencyContact] = useState(false);
    
    // Auto-fill emergency contact from user profile
    useEffect(() => {
        if (user?.emergency_contact?.name && user?.emergency_contact?.phone) {
            setFormData({
                ...formData,
                emergencyContactName: user.emergency_contact.name,
                emergencyContactPhone: user.emergency_contact.phone,
                emergencyContactRelationship: user.emergency_contact.relationship || 'Family'
            });
        }
    }, [user]);

    const handlePassengerChange = (type: 'increment' | 'decrement') => {
        const newCount = type === 'increment' 
            ? Math.min(passengers + 1, 6)
            : Math.max(passengers - 1, 1);
        
        setPassengers(newCount);
        setFormData({ ...formData, passengerCount: newCount });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Ride Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RIDE_TYPES.map((ride) => {
                        const Icon = ride.icon;
                        const isSelected = formData.rideType === ride.id;
                        
                        return (
                            <button
                                key={ride.id}
                                onClick={() => setFormData({ ...formData, rideType: ride.id })}
                                className={`
                                    p-4 rounded-lg border-2 text-left transition-all duration-200
                                    ${isSelected 
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20' 
                                        : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-500' : 'text-gray-600 dark:text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{ride.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ride.description}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm font-medium text-emerald-500">
                                                Base fare: ₱{ride.baseFare}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Separator className="my-6" />

            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Passenger Information</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="passengerName" className="text-gray-700 dark:text-gray-300">
                                Full Name *
                            </Label>
                            <Input
                                id="passengerName"
                                value={formData.passengerName || user?.name || ''}
                                onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                                placeholder="Enter your full name"
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="passengerPhone" className="text-gray-700 dark:text-gray-300">
                                Phone Number *
                            </Label>
                            <div className="flex">
                                <div className="flex items-center justify-center w-12 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-md">
                                    <span className="text-gray-600 dark:text-gray-400">+63</span>
                                </div>
                                <Input
                                    id="passengerPhone"
                                    value={formData.passengerPhone || user?.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                                    placeholder="912 345 6789"
                                    className="rounded-l-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Number of Passengers</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePassengerChange('decrement')}
                                    className="h-10 w-10 border-gray-300 dark:border-gray-700"
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
                                    className="h-10 w-10 border-gray-300 dark:border-gray-700"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {passengers === 1 ? '1 passenger' : `${passengers} passengers`}
                                <span className="block text-xs text-gray-500 dark:text-gray-500">
                                    Max 6 passengers per ride
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specialInstructions" className="text-gray-700 dark:text-gray-300">
                            Special Instructions (Optional)
                        </Label>
                        <Textarea
                            id="specialInstructions"
                            value={formData.specialInstructions || ''}
                            onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                            placeholder="Any special requests or instructions for the driver..."
                            className="min-h-[100px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            E.g., waiting at specific landmark, need assistance with luggage, etc.
                        </p>
                    </div>

                    {/* Emergency Contact Section */}
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    Emergency Contact (Optional)
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    We'll notify them about your ride status for safety
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEmergencyContact(!showEmergencyContact)}
                                className="h-8"
                            >
                                {showEmergencyContact ? (
                                    <>
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Hide
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4 mr-2" />
                                        {formData.emergencyContactName ? 'Edit' : 'Add'}
                                    </>
                                )}
                            </Button>
                        </div>

                        {showEmergencyContact && (
                            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emergencyContactName" className="text-gray-700 dark:text-gray-300">
                                            Contact Name
                                        </Label>
                                        <Input
                                            id="emergencyContactName"
                                            value={formData.emergencyContactName || ''}
                                            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                            placeholder="Full name of emergency contact"
                                            className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emergencyContactPhone" className="text-gray-700 dark:text-gray-300">
                                            Contact Phone
                                        </Label>
                                        <div className="flex">
                                            <div className="flex items-center justify-center w-12 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-300 dark:border-gray-700 rounded-l-md">
                                                <span className="text-gray-600 dark:text-gray-400">+63</span>
                                            </div>
                                            <Input
                                                id="emergencyContactPhone"
                                                value={formData.emergencyContactPhone || ''}
                                                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                                placeholder="912 345 6789"
                                                className="rounded-l-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContactRelationship" className="text-gray-700 dark:text-gray-300">
                                        Relationship
                                    </Label>
                                    <Select 
                                        value={formData.emergencyContactRelationship || 'Family'}
                                        onValueChange={(value) => setFormData({ ...formData, emergencyContactRelationship: value })}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                                            <SelectValue placeholder="Select relationship" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Family">Family</SelectItem>
                                            <SelectItem value="Friend">Friend</SelectItem>
                                            <SelectItem value="Spouse">Spouse</SelectItem>
                                            <SelectItem value="Parent">Parent</SelectItem>
                                            <SelectItem value="Sibling">Sibling</SelectItem>
                                            <SelectItem value="Relative">Relative</SelectItem>
                                            <SelectItem value="Colleague">Colleague</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {user?.emergency_contact?.name && (
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded border border-emerald-200 dark:border-emerald-500/20">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Auto-filled from your profile</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 2: Location Selection Component
const Step2Location = ({ 
    formData, 
    setFormData, 
    userLocation 
}: { 
    formData: any; 
    setFormData: (data: any) => void;
    userLocation: any;
}) => {
    const [selectedBarangay, setSelectedBarangay] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLandmark, setSelectedLandmark] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'barangays' | 'landmarks'>('barangays');

    const filteredBarangays = HINOBAAN_BARANGAYS.filter(barangay =>
        barangay.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLandmarks = POPULAR_LANDMARKS.filter(landmark =>
        landmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        landmark.barangay.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBarangaySelect = (barangay: typeof HINOBAAN_BARANGAYS[0]) => {
        setSelectedBarangay(barangay.id);
        setSelectedLandmark('');
        setFormData({
            ...formData,
            destination: {
                lat: barangay.lat,
                lng: barangay.lng,
                address: `${barangay.name}, Hinobaan, Negros Occidental`,
                name: barangay.name,
                barangay: barangay.name,
                type: 'barangay'
            }
        });
    };

    const handleLandmarkSelect = (landmark: typeof POPULAR_LANDMARKS[0]) => {
        setSelectedLandmark(landmark.name);
        setSelectedBarangay('');
        setFormData({
            ...formData,
            destination: {
                lat: landmark.lat,
                lng: landmark.lng,
                address: `${landmark.name}, ${landmark.barangay}, Hinobaan, Negros Occidental`,
                name: landmark.name,
                barangay: landmark.barangay,
                type: 'landmark'
            }
        });
    };

    const handleMapLocationSelect = (location: any) => {
        if (location.name && POPULAR_LANDMARKS.some(lm => lm.name === location.name)) {
            setSelectedLandmark(location.name);
            setSelectedBarangay('');
        } else {
            const barangay = HINOBAAN_BARANGAYS.find(b => b.name === location.barangay);
            if (barangay) {
                setSelectedBarangay(barangay.id);
                setSelectedLandmark('');
            }
        }
        setFormData({
            ...formData,
            destination: location
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Location</h3>
                <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <Navigation2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {userLocation?.address || 'Getting your location...'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Your pickup location
                                </p>
                            </div>
                            <Badge className="bg-emerald-500 text-white">
                                Auto-detected
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-6" />

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Destination</h3>
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {HINOBAAN_BARANGAYS.length} barangays • {POPULAR_LANDMARKS.length} landmarks
                    </Badge>
                </div>

                {/* Interactive Map Section */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-emerald-500" />
                            Hinobaan Interactive Map
                        </CardTitle>
                        <CardDescription>
                            Click anywhere on the map or select landmarks to set your destination
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[400px]">
                            <InteractiveMap
                                userLocation={userLocation}
                                destination={formData.destination}
                                onLocationSelect={handleMapLocationSelect}
                                selectedBarangay={selectedBarangay}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search for barangay or landmark..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        />
                    </div>
                </div>

                {/* Tabs for Barangays and Landmarks */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="barangays" className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Barangays
                        </TabsTrigger>
                        <TabsTrigger value="landmarks" className="flex items-center gap-2">
                            <Landmark className="w-4 h-4" />
                            Landmarks
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="barangays" className="mt-4">
                        <ScrollArea className="h-[300px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-4">
                                {filteredBarangays.map((barangay) => {
                                    const isSelected = selectedBarangay === barangay.id;
                                    const isCurrentLocation = userLocation?.barangay === barangay.name;
                                    
                                    return (
                                        <button
                                            key={barangay.id}
                                            onClick={() => handleBarangaySelect(barangay)}
                                            className={`
                                                p-4 rounded-lg border text-left transition-all duration-200
                                                ${isSelected 
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/20' 
                                                    : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                }
                                                ${isCurrentLocation ? 'opacity-60 cursor-not-allowed' : ''}
                                            `}
                                            disabled={isCurrentLocation}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`
                                                    p-2 rounded-lg
                                                    ${isSelected 
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/20' 
                                                        : 'bg-gray-100 dark:bg-gray-800'
                                                    }
                                                `}>
                                                    <Pin className={`w-4 h-4 ${isSelected ? 'text-emerald-500' : 'text-gray-600 dark:text-gray-400'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{barangay.name}</h4>
                                                        {isSelected && (
                                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                        Hinobaan, Negros Occidental
                                                    </p>
                                                    <div className="mt-2">
                                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Popular places:</p>
                                                        <ul className="text-xs text-gray-500 dark:text-gray-500 mt-1 space-y-1">
                                                            {barangay.popularPlaces.slice(0, 2).map((place, idx) => (
                                                                <li key={idx} className="flex items-center gap-1">
                                                                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                                                                    {place.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    {isCurrentLocation && (
                                                        <Badge variant="outline" className="mt-2 text-xs bg-gray-100 dark:bg-gray-800">
                                                            Your current location
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="landmarks" className="mt-4">
                        <ScrollArea className="h-[300px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
                                {filteredLandmarks.map((landmark) => {
                                    const Icon = landmark.icon;
                                    const isSelected = selectedLandmark === landmark.name;
                                    
                                    return (
                                        <button
                                            key={landmark.name}
                                            onClick={() => handleLandmarkSelect(landmark)}
                                            className={`
                                                p-4 rounded-lg border text-left transition-all duration-200
                                                ${isSelected 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/20' 
                                                    : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                }
                                            `}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`
                                                    p-2 rounded-lg
                                                    ${isSelected 
                                                        ? 'bg-blue-100 dark:bg-blue-500/20' 
                                                        : 'bg-gray-100 dark:bg-gray-800'
                                                    }
                                                `}>
                                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{landmark.name}</h4>
                                                        {isSelected && (
                                                            <CheckCircle className="w-4 h-4 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800">
                                                            {landmark.barangay}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                                            {landmark.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                                        Quick access to popular destination
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                {formData.destination && (
                    <Card className="mt-6 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <TargetIcon className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formData.destination.address}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Selected destination
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                            {formData.destination.type === 'landmark' ? 'Landmark' : 'Barangay'}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedBarangay('');
                                        setSelectedLandmark('');
                                        setFormData({ ...formData, destination: null });
                                    }}
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

// Step 3: Confirmation Component
const Step3Confirmation = ({ 
    formData, 
    userLocation,
    calculateRoute 
}: { 
    formData: any; 
    userLocation: any;
    calculateRoute: () => Promise<void>;
}) => {
    const [isCalculating, setIsCalculating] = useState(false);
    const [routeInfo, setRouteInfo] = useState<any>(null);

    const selectedRideType = RIDE_TYPES.find(r => r.id === formData.rideType);

    const handleCalculateRoute = async () => {
        if (!userLocation || !formData.destination) return;
        
        setIsCalculating(true);
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${formData.destination.lng},${formData.destination.lat}?overview=full&geometries=geojson`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const distanceKm = (route.distance / 1000).toFixed(1);
                    const durationMinutes = Math.round(route.duration / 60);
                    
                    // Calculate fare
                    const baseFare = selectedRideType?.baseFare || 30;
                    const perKmRate = 10;
                    const fare = Math.round(baseFare + (parseFloat(distanceKm) * perKmRate));
                    const totalFare = fare * formData.passengerCount;
                    
                    setRouteInfo({
                        distance: `${distanceKm} km`,
                        duration: `${durationMinutes} mins`,
                        fare: `₱${fare}.00`,
                        totalFare: `₱${totalFare}.00`,
                        estimatedArrival: calculateETA(durationMinutes)
                    });
                }
            }
        } catch (error) {
            console.error('Error calculating route:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const calculateETA = (durationMinutes: number) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + durationMinutes + 5);
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (userLocation && formData.destination) {
            handleCalculateRoute();
        }
    }, [userLocation, formData.destination]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-500" />
                            Ride Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Ride Type</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {selectedRideType?.name}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Passengers</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formData.passengerCount} {formData.passengerCount === 1 ? 'person' : 'people'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Passenger Name</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formData.passengerName}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Contact Number</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                +63 {formData.passengerPhone}
                            </span>
                        </div>
                        {formData.emergencyContactName && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Shield className="w-4 h-4 text-emerald-500" />
                                        <span>Emergency Contact</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formData.emergencyContactName}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            +63 {formData.emergencyContactPhone}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Relationship</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formData.emergencyContactRelationship}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-emerald-500" />
                            Route Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold">A</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Pickup Location</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {userLocation?.address || 'Loading...'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-white text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold">B</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Destination</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {formData.destination?.address || 'Not selected'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {routeInfo ? (
                <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RouteIcon className="w-5 h-5 text-emerald-500" />
                            Route Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Route className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Distance</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.distance}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.duration}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Car className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Fare</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.fare}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.totalFare}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Estimated Arrival</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Driver will arrive by:</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-emerald-500">{routeInfo.estimatedArrival}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : isCalculating ? (
                <Card>
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Calculating Route...
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Finding the best route and calculating fare
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Route className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Route Information
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Complete the previous steps to calculate route and fare
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// Step 4: Payment Component
const Step4Payment = ({ formData, routeInfo, onBookRide }: { 
    formData: any; 
    routeInfo: any;
    onBookRide: () => void;
}) => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isBooking, setIsBooking] = useState(false);

    const handleBookRide = async () => {
        setIsBooking(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            onBookRide();
        } catch (error) {
            console.error('Booking error:', error);
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-500" />
                            Payment Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                            <div className={`
                                flex items-center space-x-2 p-4 rounded-lg border cursor-pointer
                                ${paymentMethod === 'cash' 
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                                    : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                                }
                            `}>
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash" className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Cash Payment</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Pay directly to the driver
                                            </p>
                                        </div>
                                        <div className="text-2xl font-bold text-emerald-500">
                                            {routeInfo?.totalFare || '₱0.00'}
                                        </div>
                                    </div>
                                </Label>
                            </div>
                            <div className={`
                                flex items-center space-x-2 p-4 rounded-lg border cursor-pointer
                                ${paymentMethod === 'gcash' 
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                                    : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                                }
                            `}>
                                <RadioGroupItem value="gcash" id="gcash" />
                                <Label htmlFor="gcash" className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">GCash</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Pay via GCash mobile wallet
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                            Coming Soon
                                        </Badge>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Safety & Terms
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Safety First</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Your safety is our priority. All drivers are verified and trained.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Terms & Conditions</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    By booking this ride, you agree to our terms of service.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <PhoneCall className="w-5 h-5 text-emerald-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">24/7 Support</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Contact us anytime for assistance: +63 912 345 6789
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-emerald-500/20 bg-linear-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Ready to Book Your Ride?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Confirm your booking and your driver will be notified immediately.
                            </p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-3xl font-bold text-emerald-500 mb-2">
                                {routeInfo?.totalFare || '₱0.00'}
                            </div>
                            <Button
                                size="lg"
                                onClick={handleBookRide}
                                disabled={!routeInfo || isBooking}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Booking...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Confirm & Book Ride
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Main BookRide Component
export default function BookRide() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    
    // State for wizard
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        rideType: 'regular',
        passengerName: user?.name || '',
        passengerPhone: user?.phone || '',
        passengerCount: 1,
        specialInstructions: '',
        emergencyContactName: user?.emergency_contact?.name || '',
        emergencyContactPhone: user?.emergency_contact?.phone || '',
        emergencyContactRelationship: user?.emergency_contact?.relationship || 'Family',
        destination: null as any
    });
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string; barangay: string } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [routeInfo, setRouteInfo] = useState<any>(null);
    const [shouldCheckProfile, setShouldCheckProfile] = useState(false);

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

    useEffect(() => {
        if (infoStatus.isComplete && shouldCheckProfile) {
            setShouldCheckProfile(false);
        }
    }, [infoStatus.isComplete, shouldCheckProfile]);

    // Get user's current location
    useEffect(() => {
        if (infoStatus.isComplete) {
            const getLocation = () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            
                            const isWithinHinobaan = checkIfInHinobaan(latitude, longitude);
                            const barangayName = getNearestBarangayName(latitude, longitude);
                            const address = isWithinHinobaan 
                                ? `${barangayName}, Hinobaan, Negros Occidental`
                                : "Hinobaan, Negros Occidental";

                            setUserLocation({
                                lat: isWithinHinobaan ? latitude : HINOBAAN_BOUNDARY.center[0],
                                lng: isWithinHinobaan ? longitude : HINOBAAN_BOUNDARY.center[1],
                                address,
                                barangay: barangayName
                            });

                            if (!isWithinHinobaan) {
                                setLocationError("You appear to be outside Hinobaan. Using approximate location.");
                            }
                        },
                        (error) => {
                            console.error('Geolocation error:', error);
                            const fallbackLocation = {
                                lat: HINOBAAN_BOUNDARY.center[0],
                                lng: HINOBAAN_BOUNDARY.center[1],
                                address: "Hinobaan, Negros Occidental",
                                barangay: 'Central Area'
                            };
                            
                            setUserLocation(fallbackLocation);
                            setLocationError("Using approximate Hinobaan location.");
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        }
                    );
                } else {
                    const fallbackLocation = {
                        lat: HINOBAAN_BOUNDARY.center[0],
                        lng: HINOBAAN_BOUNDARY.center[1],
                        address: "Hinobaan, Negros Occidental",
                        barangay: 'Central Area'
                    };
                    
                    setUserLocation(fallbackLocation);
                    setLocationError("Geolocation not supported.");
                }
            };

            getLocation();
        }
    }, [infoStatus.isComplete]);

    // Calculate route when destination changes
    useEffect(() => {
        if (userLocation && formData.destination) {
            const calculateRoute = async () => {
                try {
                    const response = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${formData.destination.lng},${formData.destination.lat}?overview=full&geometries=geojson`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.routes && data.routes.length > 0) {
                            const route = data.routes[0];
                            const distanceKm = (route.distance / 1000).toFixed(1);
                            const durationMinutes = Math.round(route.duration / 60);
                            
                            const selectedRideType = RIDE_TYPES.find(r => r.id === formData.rideType);
                            const baseFare = selectedRideType?.baseFare || 30;
                            const perKmRate = 10;
                            const fare = Math.round(baseFare + (parseFloat(distanceKm) * perKmRate));
                            const totalFare = fare * formData.passengerCount;
                            
                            const calculateETA = (durationMinutes: number) => {
                                const now = new Date();
                                now.setMinutes(now.getMinutes() + durationMinutes + 5);
                                return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            };

                            setRouteInfo({
                                distance: `${distanceKm} km`,
                                duration: `${durationMinutes} mins`,
                                fare: `₱${fare}.00`,
                                totalFare: `₱${totalFare}.00`,
                                estimatedArrival: calculateETA(durationMinutes)
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error calculating route:', error);
                }
            };

            calculateRoute();
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

    const handleBookRide = () => {
        if (!formData.passengerName.trim() || !formData.passengerPhone.trim()) {
            alert('Please enter your name and phone number');
            return;
        }

        if (!formData.destination) {
            alert('Please select a destination');
            return;
        }

        const bookingData = {
            ...formData,
            pickupLocation: userLocation,
            routeInfo
        };

        console.log('Booking Data:', bookingData);
        
        alert(`Ride booked successfully!\n\nDriver will contact you at ${formData.passengerPhone}\n\nFare: ${routeInfo?.totalFare}\nETA: ${routeInfo?.estimatedArrival}\n\nFrom: ${userLocation?.address}\nTo: ${formData.destination.address}`);
        
        // Reset form
        setCurrentStep(1);
        setFormData({
            rideType: 'regular',
            passengerName: user?.name || '',
            passengerPhone: user?.phone || '',
            passengerCount: 1,
            specialInstructions: '',
            emergencyContactName: user?.emergency_contact?.name || '',
            emergencyContactPhone: user?.emergency_contact?.phone || '',
            emergencyContactRelationship: user?.emergency_contact?.relationship || 'Family',
            destination: null
        });
        setRouteInfo(null);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Book a Ride', href: '/BookRide' }
    ];

    // Show profile restriction screen if profile is not complete
    if (!infoStatus.isComplete) {
        return (
            <ProfileRestrictionScreen 
                infoStatus={infoStatus} 
                onProfileCompleted={() => setShouldCheckProfile(true)}
            />
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
                    />
                );
            case 3:
                return (
                    <Step3Confirmation 
                        formData={formData}
                        userLocation={userLocation}
                        calculateRoute={async () => {}}
                    />
                );
            case 4:
                return (
                    <Step4Payment 
                        formData={formData}
                        routeInfo={routeInfo}
                        onBookRide={handleBookRide}
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
                return formData.passengerName.trim() && formData.passengerPhone.trim();
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
            
            <div className="flex h-full flex-1 flex-col p-6">
                {/* Header Banner */}
                <Card className="border-emerald-500/20 bg-linear-to-r from-emerald-500 to-emerald-600 mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <Car className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-2">Book a Tricycle Ride</h1>
                                    <p className="text-white/90">
                                        Quick and easy booking in 4 simple steps
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                                Step {currentStep} of 4
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Wizard Navigation */}
                <StepNavigation 
                    currentStep={currentStep}
                    totalSteps={4}
                    onStepChange={setCurrentStep}
                />

                {/* Main Content */}
                <Card className="flex-1 mb-6">
                    <CardContent className="p-6">
                        {locationError && (
                            <div className="mb-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-amber-800 dark:text-amber-400">Location Notice</h4>
                                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{locationError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {renderStepContent()}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                    <div>
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onClick={handlePrevStep}
                                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {currentStep < 4 ? (
                            <Button
                                onClick={handleNextStep}
                                disabled={!isStepValid()}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}