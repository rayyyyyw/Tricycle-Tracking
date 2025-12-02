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
    Star,
    Car,
    Shield,
    CheckCircle,
    Search,
    Calendar,
    Users,
    AlertCircle,
    XCircle,
    Info,
    Phone as PhoneIcon,
    Home,
    Contact,
    RefreshCw,
    AlertTriangle,
    X,
    Sparkles,
    Route,
    Maximize2,
    Navigation as NavigationIcon
} from 'lucide-react';
import { type SharedData, type BreadcrumbItem } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Custom Map Component with OSRM routing
const InteractiveMap = ({ 
    pickupLocation, 
    destination, 
    onPickupSelect, 
    onDestinationSelect,
    onRouteCalculated 
}: { 
    pickupLocation: string;
    destination: string;
    onPickupSelect: (location: any) => void;
    onDestinationSelect: (location: any) => void;
    onRouteCalculated: (route: any) => void;
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletRef = useRef<any>(null);
    const routingControlRef = useRef<any>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // Mock Hinobaan locations
    const hinobaanLocations = [
        {
            id: 1,
            name: "Poblacion Center",
            address: "Poblacion, Hinobaan, Negros Occidental",
            lat: 9.5931,
            lng: 122.4697
        },
        {
            id: 2,
            name: "Alim Public Market",
            address: "Alim, Hinobaan, Negros Occidental",
            lat: 9.6010,
            lng: 122.4615
        },
        {
            id: 3,
            name: "Bacuyangan Elementary School",
            address: "Bacuyangan, Hinobaan, Negros Occidental",
            lat: 9.5850,
            lng: 122.4760
        },
        {
            id: 4,
            name: "San Rafael Beach",
            address: "San Rafael, Hinobaan, Negros Occidental",
            lat: 9.5900,
            lng: 122.4620
        },
        {
            id: 5,
            name: "Bito-on Barangay Hall",
            address: "Bito-on, Hinobaan, Negros Occidental",
            lat: 9.5950,
            lng: 122.4800
        },
        {
            id: 6,
            name: "Dawis Crossing",
            address: "Dawis, Hinobaan, Negros Occidental",
            lat: 9.5880,
            lng: 122.4720
        }
    ];

    useEffect(() => {
        if (!mapRef.current || typeof window === 'undefined') return;

        const initializeMap = async () => {
            // Dynamically import leaflet
            const L = await import('leaflet');
            await import('leaflet/dist/leaflet.css');

            // Dynamically import leaflet-routing-machine
            const Lrm = await import('leaflet-routing-machine');
            await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');

            // Fix leaflet icon URLs
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            // Create map instance centered on Hinobaan
            const map = L.default.map(mapRef.current!).setView([9.5931, 122.4697], 13);
            leafletRef.current = map;

            // Add OpenStreetMap tile layer
            L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            // Add custom markers for Hinobaan locations
            hinobaanLocations.forEach((location) => {
                const customIcon = L.default.divIcon({
                    html: `
                        <div style="position: relative;">
                            <div style="
                                width: 32px;
                                height: 32px;
                                border-radius: 50%;
                                background-color: #3b82f6;
                                border: 3px solid white;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                                cursor: pointer;
                            ">
                                <svg style="width: 16px; height: 16px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div style="
                                position: absolute;
                                bottom: -20px;
                                left: 50%;
                                transform: translateX(-50%);
                                background-color: #1e40af;
                                color: white;
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 10px;
                                font-weight: 600;
                                white-space: nowrap;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            ">${location.name}</div>
                        </div>
                    `,
                    className: 'custom-location-marker',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                });

                const marker = L.default.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);
                
                marker.on('click', () => {
                    // Create a popup with location details and selection buttons
                    const popupContent = `
                        <div style="padding: 12px; min-width: 220px;">
                            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1f2937;">
                                ${location.name}
                            </div>
                            <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">
                                ${location.address}
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="window.pickupSelected(${JSON.stringify(location).replace(/"/g, '&quot;')})" 
                                    style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; flex: 1;">
                                    Set as Pickup
                                </button>
                                <button onclick="window.destinationSelected(${JSON.stringify(location).replace(/"/g, '&quot;')})" 
                                    style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; flex: 1;">
                                    Set as Destination
                                </button>
                            </div>
                        </div>
                    `;

                    // Bind popup with custom content
                    marker.bindPopup(popupContent).openPopup();
                });
            });

            // Add functions to window for popup buttons
            (window as any).pickupSelected = (location: any) => {
                onPickupSelect(location);
                if (leafletRef.current) {
                    leafletRef.current.closePopup();
                }
            };

            (window as any).destinationSelected = (location: any) => {
                onDestinationSelect(location);
                if (leafletRef.current) {
                    leafletRef.current.closePopup();
                }
            };

            // Add legend
            const legend = (L.default as any).control({ position: 'bottomright' });
            legend.onAdd = () => {
                const div = (L.default as any).DomUtil.create('div', 'leaflet-control leaflet-control-custom');
                div.innerHTML = `
                    <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 12px;">
                        <div style="font-weight: bold; margin-bottom: 5px;">Click on any marker to:</div>
                        <div style="display: flex; align-items: center; margin-bottom: 3px;">
                            <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; margin-right: 8px;"></div>
                            <span>Set as Pickup</span>
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 3px;">
                            <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 8px;"></div>
                            <span>Set as Destination</span>
                        </div>
                    </div>
                `;
                return div;
            };
            legend.addTo(map);

            setIsMapReady(true);
        };

        initializeMap();

        return () => {
            if (leafletRef.current) {
                leafletRef.current.remove();
                leafletRef.current = null;
            }
            // Cleanup window functions
            delete (window as any).pickupSelected;
            delete (window as any).destinationSelected;
        };
    }, []);

    // Function to calculate route between pickup and destination
    const calculateRoute = async (pickup: any, destination: any) => {
        if (!leafletRef.current || !pickup || !destination) return;

        const L = await import('leaflet');
        const Lrm = await import('leaflet-routing-machine');

        // Remove existing route if any
        if (routingControlRef.current) {
            leafletRef.current.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        // Create routing control
        routingControlRef.current = (Lrm as any).default.Routing.control({
            waypoints: [
                L.default.latLng(pickup.lat, pickup.lng),
                L.default.latLng(destination.lat, destination.lng)
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#3b82f6', weight: 5, opacity: 0.7 }]
            },
            createMarker: () => null, // Don't create default markers
            router: new (Lrm as any).default.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            })
        }).addTo(leafletRef.current);

        // Get route information
        routingControlRef.current.on('routesfound', (e: any) => {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const route = routes[0];
                const distanceKm = (route.summary.totalDistance / 1000).toFixed(1);
                const timeMinutes = Math.round(route.summary.totalTime / 60);
                
                onRouteCalculated({
                    distance: `${distanceKm} km`,
                    time: `${timeMinutes} mins`,
                    coordinates: route.coordinates
                });

                // Zoom to fit the route
                leafletRef.current.fitBounds(routes[0].coordinates);
            }
        });
    };

    // Calculate route when both pickup and destination are set
    useEffect(() => {
        if (isMapReady && pickupLocation && destination) {
            const pickupLoc = hinobaanLocations.find(loc => 
                loc.address === pickupLocation || loc.name === pickupLocation
            );
            const destLoc = hinobaanLocations.find(loc => 
                loc.address === destination || loc.name === destination
            );

            if (pickupLoc && destLoc) {
                calculateRoute(pickupLoc, destLoc);
            }
        }
    }, [pickupLocation, destination, isMapReady]);

    return (
        <div className="relative w-full h-full">
            <div 
                ref={mapRef}
                className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-900"
            />
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2 text-sm">
                    <Route className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Click any location marker to set pickup/destination</span>
                </div>
            </div>
        </div>
    );
};

// Large Map Modal Component
const LargeMapModal = ({ 
    isOpen, 
    onClose, 
    pickupLocation, 
    destination, 
    onPickupSelect, 
    onDestinationSelect,
    onRouteCalculated 
}: { 
    isOpen: boolean;
    onClose: () => void;
    pickupLocation: string;
    destination: string;
    onPickupSelect: (location: any) => void;
    onDestinationSelect: (location: any) => void;
    onRouteCalculated: (route: any) => void;
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-full h-[85vh] p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b bg-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-foreground">Interactive Hinobaan Map</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Click on any location marker to set pickup or destination
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={onClose}
                            className="gap-2"
                        >
                            <X className="w-4 h-4" />
                            Close
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 p-6 pt-0"> {/* FIXED: Changed "pt -0" to "pt-0" */}
                    <div className="w-full h-full rounded-lg overflow-hidden border shadow-sm">
                        <div className="w-full h-full">
                            <InteractiveMap 
                                pickupLocation={pickupLocation}
                                destination={destination}
                                onPickupSelect={(location) => {
                                    onPickupSelect(location);
                                    onClose();
                                }}
                                onDestinationSelect={(location) => {
                                    onDestinationSelect(location);
                                    onClose();
                                }}
                                onRouteCalculated={onRouteCalculated}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Available tricycles data
const availableTricycles = [
    {
        id: 1,
        driverName: "Juan Dela Cruz",
        plateNumber: "TRC-123",
        rating: 4.8,
        eta: "5 mins",
        price: "₱50.00",
        capacity: 3,
        type: "Regular"
    },
    {
        id: 2,
        driverName: "Maria Santos",
        plateNumber: "TRC-456",
        rating: 4.9,
        eta: "3 mins",
        price: "₱55.00",
        capacity: 3,
        type: "Regular"
    },
    {
        id: 3,
        driverName: "Pedro Reyes",
        plateNumber: "TRC-789",
        rating: 4.7,
        eta: "7 mins",
        price: "₱48.00",
        capacity: 3,
        type: "Regular"
    }
];

interface PassengerInfoStatus {
    hasPhone: boolean;
    hasAddress: boolean;
    hasEmergencyContact: boolean;
    isComplete: boolean;
    missingFields: string[];
}

// Profile Restriction Component
function ProfileRestrictionScreen({ infoStatus, onProfileCompleted }: { infoStatus: PassengerInfoStatus; onProfileCompleted: () => void }) {
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
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
                            
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                    Missing Information:
                                </p>
                                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
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
                                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Link href="/PassengerSide/profile">
                                    <Button 
                                        className="bg-green-600 hover:bg-green-700 text-white"
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
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Finish setting up your profile to start booking rides. {getMissingFieldsText()} required for your safety.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress & Requirements Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                                Profile Completion
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Complete these requirements to unlock ride booking
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completionPercentage}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                        <div 
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Phone Number */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            infoStatus.hasPhone 
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' 
                                : 'border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    infoStatus.hasPhone 
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
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
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {infoStatus.hasPhone ? "Completed" : "Required"}
                            </div>
                        </div>

                        {/* Home Address */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            infoStatus.hasAddress 
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' 
                                : 'border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    infoStatus.hasAddress 
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
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
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {infoStatus.hasAddress ? "Completed" : "Required"}
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            infoStatus.hasEmergencyContact 
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' 
                                : 'border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    infoStatus.hasEmergencyContact 
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
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
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {infoStatus.hasEmergencyContact ? "Completed" : "Required"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm flex-1"
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
                        className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        {isChecking ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 max-w-2xl mx-auto">
                    <div className="text-center">
                        <div className="flex justify-center mb-3">
                            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 text-base mb-4">Safety First</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800 dark:text-green-200">
                            <div className="flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <span>Emergency assistance and quick response</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <span>Accurate pickup locations and navigation</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <PhoneIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <span>Driver communication and ride updates</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Contact className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <span>Emergency contact notifications</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}

export default function BookRide() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    
    const [shouldCheckProfile, setShouldCheckProfile] = useState(false);
    const [isLargeMapOpen, setIsLargeMapOpen] = useState(false);
    
    const getPassengerInfoStatus = (): PassengerInfoStatus => {
        const missingFields = [];
        
        if (!user?.phone) missingFields.push('phone number');
        if (!user?.address) missingFields.push('home address');
        
        const emergencyContact = user?.emergency_contact || {};
        const hasEmergencyName = !!emergencyContact.name;
        const hasEmergencyPhone = !!emergencyContact.phone;
        
        if (!hasEmergencyName || !hasEmergencyPhone) {
            missingFields.push('emergency contact');
        }

        const hasPhone = !!user?.phone;
        const hasAddress = !!user?.address;
        const hasEmergencyContact = hasEmergencyName && hasEmergencyPhone;
        const isComplete = hasPhone && hasAddress && hasEmergencyContact;

        return {
            hasPhone,
            hasAddress,
            hasEmergencyContact,
            isComplete,
            missingFields
        };
    };

    const infoStatus = getPassengerInfoStatus();

    useEffect(() => {
        if (infoStatus.isComplete && shouldCheckProfile) {
            setShouldCheckProfile(false);
        }
    }, [infoStatus.isComplete, shouldCheckProfile]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Book a Ride', href: '/BookRide' }
    ];

    if (!infoStatus.isComplete) {
        return (
            <ProfileRestrictionScreen 
                infoStatus={infoStatus} 
                onProfileCompleted={() => setShouldCheckProfile(true)}
            />
        );
    }

    const [pickupLocation, setPickupLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedTricycle, setSelectedTricycle] = useState<number | null>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; time: string; coordinates: any[] } | null>(null);

    const handlePickupSelect = (location: any) => {
        setPickupLocation(location.address);
    };

    const handleDestinationSelect = (location: any) => {
        setDestination(location.address);
    };

    const handleRouteCalculated = (route: any) => {
        setRouteInfo(route);
    };

    const handleBookRide = () => {
        if (selectedTricycle && pickupLocation && destination) {
            const selected = availableTricycles.find(t => t.id === selectedTricycle);
            alert(`Ride booked with ${selected?.driverName}!\nFrom: ${pickupLocation}\nTo: ${destination}\nFare: ${selected?.price}\nETA: ${selected?.eta}`);
        }
    };

    const clearPickup = () => {
        setPickupLocation('');
        setRouteInfo(null);
    };

    const clearDestination = () => {
        setDestination('');
        setRouteInfo(null);
    };

    return (
        <PassengerLayout breadcrumbs={breadcrumbs}>
            <Head title="Book a Ride" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Success Banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold mb-1">Ready to Ride!</h1>
                            <p className="opacity-90 text-sm">
                                Your profile is complete. Start booking rides safely and efficiently.
                            </p>
                        </div>
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                            Profile Complete
                        </Badge>
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book a Ride</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                            Click on the interactive map to select pickup and destination locations
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                            Profile Complete • {availableTricycles.length} tricycles available
                        </span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Side - Map & Booking Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Interactive Map Card */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg text-gray-900 dark:text-white">Hinobaan Interactive Map</CardTitle>
                                        <CardDescription className="text-sm">
                                            Click on any location marker to set pickup and destination
                                        </CardDescription>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setIsLargeMapOpen(true)}
                                        className="gap-2"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                        Expand Map
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 h-96">
                                <InteractiveMap 
                                    pickupLocation={pickupLocation}
                                    destination={destination}
                                    onPickupSelect={handlePickupSelect}
                                    onDestinationSelect={handleDestinationSelect}
                                    onRouteCalculated={handleRouteCalculated}
                                />
                            </CardContent>
                        </Card>

                        {/* Route Information */}
                        {routeInfo && (
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        <Route className="w-5 h-5 text-blue-500" />
                                        Route Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <NavigationIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Distance</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.distance}</p>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Time</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{routeInfo.time}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Booking Form */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-gray-900 dark:text-white">Ride Details</CardTitle>
                                <CardDescription className="text-sm">
                                    Selected locations from the map
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {/* Pickup Location */}
                                <div className="space-y-2">
                                    <Label htmlFor="pickup" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Pickup Location
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="pickup"
                                            placeholder="Click on map to select pickup location"
                                            value={pickupLocation}
                                            readOnly
                                            className="flex-1 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm"
                                        />
                                        {pickupLocation && (
                                            <Button
                                                variant="outline"
                                                onClick={clearPickup}
                                                className="border-gray-300"
                                                size="sm"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Destination */}
                                <div className="space-y-2">
                                    <Label htmlFor="destination" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                        <Navigation className="w-4 h-4 text-green-500" />
                                        Destination
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="destination"
                                            placeholder="Click on map to select destination"
                                            value={destination}
                                            readOnly
                                            className="flex-1 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm"
                                        />
                                        {destination && (
                                            <Button
                                                variant="outline"
                                                onClick={clearDestination}
                                                className="border-gray-300"
                                                size="sm"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button 
                                        variant="outline" 
                                        className="flex items-center gap-2 border-gray-300 text-sm"
                                        disabled={!pickupLocation || !destination}
                                        size="sm"
                                        onClick={() => {
                                            // Trigger route calculation by selecting available tricycles
                                            if (pickupLocation && destination) {
                                                alert(`Searching for tricycles from ${pickupLocation} to ${destination}`);
                                            }
                                        }}
                                    >
                                        <Search className="w-4 h-4" />
                                        Search Rides
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex items-center gap-2 border-gray-300 text-sm"
                                        size="sm"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Schedule Ride
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Available Tricycles */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-gray-900 dark:text-white">
                                    Available Tricycles
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Select a tricycle for your ride
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {availableTricycles.map((tricycle) => (
                                    <div
                                        key={tricycle.id}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            selectedTricycle === tricycle.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                        }`}
                                        onClick={() => setSelectedTricycle(tricycle.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Car className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {tricycle.driverName}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                                        {tricycle.plateNumber} • {tricycle.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {tricycle.price}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                                    ETA: {tricycle.eta}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <span className="text-xs">{tricycle.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-xs">Up to {tricycle.capacity} passengers</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side - Ride Summary & Info */}
                    <div className="space-y-6">
                        {/* Ride Summary */}
                        <Card className="border-0 shadow-lg sticky top-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-gray-900 dark:text-white">
                                    Ride Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                        <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white mb-1">Pickup:</p>
                                            <p className="text-sm">{pickupLocation || 'Click on map to select'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                        <Navigation className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white mb-1">Destination:</p>
                                            <p className="text-sm">{destination || 'Click on map to select'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {routeInfo && (
                                    <div className="pt-4 border-t dark:border-gray-700 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-300 text-sm">Distance</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {routeInfo.distance}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-300 text-sm">Estimated Time</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {routeInfo.time}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {selectedTricycle && (
                                    <div className="pt-4 border-t dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-300 text-sm">Fare</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.price}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600 dark:text-gray-300 text-sm">Driver ETA</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.eta}
                                            </span>
                                        </div>
                                        <Button 
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={handleBookRide}
                                            disabled={!pickupLocation || !destination}
                                        >
                                            {!pickupLocation || !destination ? 'Select Locations First' : 'Confirm Booking'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Safety Info */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-sm">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    Safety First
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                <p>• Verify driver and vehicle details</p>
                                <p>• Share ride details with emergency contact</p>
                                <p>• Wear your seatbelt properly</p>
                                <p>• Sit properly inside the tricycle</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Large Map Modal */}
            <LargeMapModal 
                isOpen={isLargeMapOpen}
                onClose={() => setIsLargeMapOpen(false)}
                pickupLocation={pickupLocation}
                destination={destination}
                onPickupSelect={handlePickupSelect}
                onDestinationSelect={handleDestinationSelect}
                onRouteCalculated={handleRouteCalculated}
            />
        </PassengerLayout>
    );
}