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
    Map,
    Compass,
    User as UserIcon,
    LocateFixed,
    RouteIcon,
    Info,
    Calendar,
    Target,
    Zap,
    AlertCircle,
    Phone as PhoneIcon,
    Home,
    Contact,
    X
} from 'lucide-react';
import { type SharedData, type BreadcrumbItem } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// All barangays in Hinobaan municipality
const HINOBAAN_BARANGAYS = {
    Talacagay: { lat: 9.6100, lng: 122.4800, name: "Talacagay" },
    Culipapa: { lat: 9.5800, lng: 122.4600, name: "Culipapa" },
    Damutan: { lat: 9.6000, lng: 122.4500, name: "Damutan" },
    Poblacion: { lat: 9.5931, lng: 122.4697, name: "Poblacion" },
    Alim: { lat: 9.6010, lng: 122.4615, name: "Alim" },
    Bacuyangan: { lat: 9.5850, lng: 122.4760, name: "Bacuyangan" },
    SanRafael: { lat: 9.5900, lng: 122.4620, name: "San Rafael" },
    Bito_on: { lat: 9.5950, lng: 122.4800, name: "Bito-on" },
    Dawis: { lat: 9.5880, lng: 122.4720, name: "Dawis" }
};

// Profile Restriction Component
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center shrink-0">
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
                                <Shield className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                                <span>Emergency assistance and quick response</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                                <span>Accurate pickup locations and navigation</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <PhoneIcon className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                                <span>Driver communication and ride updates</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Contact className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                                <span>Emergency contact notifications</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}

// How-to Guide Component
const HowToGuide = () => (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-500" />
                        How to Book a Ride in Hinobaan
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        Quick guide to request your tricycle ride in 4 easy steps
                    </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Quick Guide
                </Badge>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3">
                            <span className="text-white font-bold text-lg">1</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Fill Your Details</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter your name and phone number in the form
                        </p>
                    </div>
                </div>
                
                <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3">
                            <span className="text-white font-bold text-lg">2</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Select Destination</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click on map to choose destination within Hinobaan
                        </p>
                    </div>
                </div>
                
                <div className="bg-linear-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mb-3">
                            <span className="text-white font-bold text-lg">3</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Calculate Route</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get route from your location to destination
                        </p>
                    </div>
                </div>
                
                <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mb-3">
                            <span className="text-white font-bold text-lg">4</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Confirm Booking</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Review summary and confirm your ride booking
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Service available within Hinobaan municipality</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span>Click anywhere on map to select destination</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

// Location Display Component
const LocationDisplay = ({ 
    type, 
    location, 
    label,
    icon: Icon 
}: { 
    type: 'pickup' | 'destination';
    location: any;
    label: string;
    icon: React.ComponentType<any>;
}) => (
    <div className="space-y-2">
        <Label className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {label}
        </Label>
        <div className={`p-3 rounded-lg border ${
            location ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
        }`}>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
                {location?.address || `Click on map to select ${type}`}
            </p>
            {location && (
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Coordinates: {location.lat?.toFixed(6)}, {location.lng?.toFixed(6)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                        {getNearestBarangayName(location.lat, location.lng)}
                    </Badge>
                </div>
            )}
        </div>
    </div>
);

// Get nearest barangay name
const getNearestBarangayName = (lat: number, lng: number): string => {
    let nearest = '';
    let minDistance = Infinity;

    Object.entries(HINOBAAN_BARANGAYS).forEach(([key, coords]) => {
        const distance = Math.sqrt(
            Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = coords.name;
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
const RideRequestMap = ({ 
    pickupLocation,
    destination,
    userLocation,
    routeData,
    onLocationSelect
}: { 
    pickupLocation: any;
    destination: any;
    userLocation: { lat: number; lng: number; address: string } | null;
    routeData: any;
    onLocationSelect: (type: 'pickup' | 'destination', location: any) => void;
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletRef = useRef<any>(null);
    const routeLayerRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    const initializeMap = useCallback(async () => {
        if (!mapRef.current || typeof window === 'undefined') return;

        try {
            const L = await import('leaflet');
            await import('leaflet/dist/leaflet.css');

            // Fix leaflet icon URLs
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            // Create map instance centered on Hinobaan
            const map = L.map(mapRef.current!).setView(HINOBAAN_BOUNDARY.center, 13);
            leafletRef.current = map;

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Create a layer group for markers
            markersLayerRef.current = L.layerGroup().addTo(map);

            // Draw municipality boundary polygon
            const boundaryCoordinates: [number, number][] = [
                [HINOBAAN_BOUNDARY.bounds.north, HINOBAAN_BOUNDARY.bounds.west],
                [HINOBAAN_BOUNDARY.bounds.north, HINOBAAN_BOUNDARY.bounds.east],
                [HINOBAAN_BOUNDARY.bounds.south, HINOBAAN_BOUNDARY.bounds.east],
                [HINOBAAN_BOUNDARY.bounds.south, HINOBAAN_BOUNDARY.bounds.west]
            ];

            const boundaryPolygon = L.polygon(boundaryCoordinates, {
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5',
                className: 'hinobaan-boundary'
            }).addTo(map);

            // Add boundary label
            const boundaryCenter = boundaryPolygon.getBounds().getCenter();
            L.marker(boundaryCenter, {
                icon: L.divIcon({
                    html: `
                        <div style="
                            background: rgba(59, 130, 246, 0.9);
                            color: white;
                            padding: 6px 12px;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            white-space: nowrap;
                        ">Hinobaan Municipality</div>
                    `,
                    className: 'boundary-label',
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                })
            }).addTo(map);

            // Add user location marker (ALWAYS add this first)
            if (userLocation) {
                const userIcon = L.divIcon({
                    html: `
                        <div style="position: relative;">
                            <div style="
                                width: 36px;
                                height: 36px;
                                border-radius: 50%;
                                background: radial-gradient(circle, #ef4444, #dc2626);
                                border: 3px solid white;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                                animation: pulse 2s infinite;
                            ">
                                <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div style="
                                position: absolute;
                                bottom: -28px;
                                left: 50%;
                                transform: translateX(-50%);
                                background-color: #dc2626;
                                color: white;
                                padding: 4px 8px;
                                border-radius: 4px;
                                font-size: 10px;
                                font-weight: 600;
                                white-space: nowrap;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            ">Your Location</div>
                        </div>
                    `,
                    className: 'user-location-marker',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                });

                const userMarker = L.marker([userLocation.lat, userLocation.lng], { 
                    icon: userIcon,
                    draggable: false
                }).addTo(markersLayerRef.current);
                
                userMarker.bindPopup(`<b>Your Current Location</b><br>${userLocation.address}`);
            }

            // Add click event to map for selecting destination
            map.on('click', async (e: any) => {
                const { lat, lng } = e.latlng;
                
                // Check if within Hinobaan boundary
                if (!boundaryPolygon.getBounds().contains(e.latlng)) {
                    alert('Sorry! Our service is only available within Hinobaan municipality');
                    return;
                }

                // Get nearest barangay
                const barangay = getNearestBarangayName(lat, lng);
                const address = `Near ${barangay}, Hinobaan, Negros Occidental`;

                const location = {
                    lat,
                    lng,
                    address,
                    name: `Destination in ${barangay}`,
                    barangay
                };

                // Show selection popup
                showSelectionPopup(lat, lng, location);
            });

            // Disable default double-click zoom
            map.doubleClickZoom.disable();

            setIsMapReady(true);
            setMapError(null);

        } catch (error) {
            console.error('Map initialization error:', error);
            setMapError('Failed to load map. Please check your internet connection.');
        }
    }, [userLocation]);

    const showSelectionPopup = (lat: number, lng: number, location: any) => {
        const L = leafletRef.current;
        if (!L) return;

        const popupContent = `
            <div style="padding: 16px; min-width: 280px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <div style="width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center;">
                        <svg style="width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                        </svg>
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 14px; color: #1f2937;">Select Destination</div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${location.address}</div>
                        <div style="font-size: 11px; color: #8b5cf6; margin-top: 2px; font-weight: 500;">
                            ${location.barangay} • Hinobaan
                        </div>
                    </div>
                </div>
                <button onclick="window.handleMapLocationSelect('destination', ${JSON.stringify(location).replace(/"/g, '&quot;')})" 
                    style="background: #10b981; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;" 
                    onmouseover="this.style.background='#059669'" 
                    onmouseout="this.style.background='#10b981'">
                    <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                    </svg>
                    Select This Destination
                </button>
                <div style="font-size: 11px; color: #9ca3af; text-align: center; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                    Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </div>
            </div>
        `;

        // Add functions to window
        (window as any).handleMapLocationSelect = (type: 'pickup' | 'destination', loc: any) => {
            onLocationSelect(type, loc);
            if (leafletRef.current) {
                leafletRef.current.closePopup();
            }
        };

        L.popup()
            .setLatLng([lat, lng])
            .setContent(popupContent)
            .openOn(leafletRef.current);
    };

    // Draw route on map
    const drawRoute = useCallback(async () => {
        if (!leafletRef.current || !isMapReady || !pickupLocation || !destination) return;

        const L = await import('leaflet');
        
        // Clear previous route
        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
        }

        // Clear existing markers (keep user location)
        if (markersLayerRef.current) {
            markersLayerRef.current.clearLayers();
            
            // Re-add user location marker
            if (userLocation) {
                const userIcon = L.divIcon({
                    html: `
                        <div style="position: relative;">
                            <div style="
                                width: 36px;
                                height: 36px;
                                border-radius: 50%;
                                background: radial-gradient(circle, #ef4444, #dc2626);
                                border: 3px solid white;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                                animation: pulse 2s infinite;
                            ">
                                <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    `,
                    className: 'user-location-marker',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                });

                L.marker([userLocation.lat, userLocation.lng], { 
                    icon: userIcon,
                    draggable: false
                }).addTo(markersLayerRef.current);
            }
        }

        // Add destination marker
        if (destination && destination.lat && destination.lng) {
            const endIcon = L.divIcon({
                html: `
                    <div style="position: relative;">
                        <div style="
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #10b981, #059669);
                            border: 3px solid white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                        ">
                            <svg style="width: 16px; height: 16px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div style="
                            position: absolute;
                            bottom: -24px;
                            left: 50%;
                            transform: translateX(-50%);
                            background-color: #059669;
                            color: white;
                            padding: 3px 8px;
                            border-radius: 4px;
                            font-size: 10px;
                            font-weight: 600;
                            white-space: nowrap;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        ">Destination</div>
                    </div>
                `,
                className: 'destination-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            L.marker([destination.lat, destination.lng], { icon: endIcon })
                .addTo(markersLayerRef.current)
                .bindPopup(`<b>Destination</b><br>${destination.address}`);
        }

        try {
            // Fetch route from OSRM API
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${userLocation?.lng},${userLocation?.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
            );
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                    
                    // Create polyline for route
                    const routeLine = L.polyline(coordinates, {
                        color: '#3b82f6',
                        weight: 5,
                        opacity: 0.7,
                        dashArray: '10, 10'
                    }).addTo(leafletRef.current);

                    routeLayerRef.current = routeLine;

                    // Fit map to show route and markers
                    const bounds = L.latLngBounds(coordinates);
                    if (userLocation) {
                        bounds.extend([userLocation.lat, userLocation.lng]);
                    }
                    if (destination) {
                        bounds.extend([destination.lat, destination.lng]);
                    }
                    leafletRef.current.fitBounds(bounds.pad(0.1));
                }
            }
        } catch (error) {
            console.error('Error drawing route:', error);
            // Fallback to straight line
            const routeLine = L.polyline([
                [userLocation?.lat, userLocation?.lng],
                [destination.lat, destination.lng]
            ], {
                color: '#3b82f6',
                weight: 5,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(leafletRef.current);

            routeLayerRef.current = routeLine;
        }
    }, [pickupLocation, destination, userLocation, isMapReady]);

    useEffect(() => {
        initializeMap();
    }, []);

    useEffect(() => {
        if (isMapReady && destination) {
            drawRoute();
        }
    }, [destination, isMapReady, drawRoute]);

    return (
        <div className="relative w-full h-full">
            {mapError ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <div className="text-center p-6">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Map Loading Failed</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{mapError}</p>
                        <Button onClick={initializeMap} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry Loading Map
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div 
                        ref={mapRef}
                        className="w-full h-full rounded-lg bg-gray-100 dark:bg-gray-900"
                    />
                    
                    {/* Map Instructions */}
                    <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg max-w-xs">
                        <div className="flex items-center gap-2 mb-2">
                            <LocateFixed className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Click to Select Destination</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Click anywhere within Hinobaan to select your destination
                        </p>
                    </div>

                    {/* Map Legend */}
                    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">Your Location</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">Destination</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-1 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">Route</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Stat Card Component for Ride Summary
const StatCard = ({ label, value, icon: Icon, color }: { 
    label: string; 
    value: string; 
    icon: React.ComponentType<any>;
    color: 'blue' | 'green' | 'amber' | 'purple';
}) => {
    const colorClasses = {
        blue: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400',
        green: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800 text-green-600 dark:text-green-400',
        amber: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400',
        purple: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400'
    };

    return (
        <div className={`bg-linear-to-br ${colorClasses[color]} p-4 rounded-lg border`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
};

// Main BookRide Component
export default function BookRide() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    
    const [shouldCheckProfile, setShouldCheckProfile] = useState(false);
    const [destination, setDestination] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [routeData, setRouteData] = useState<any>(null);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [rideSummary, setRideSummary] = useState<any>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);

    // Form state
    const [passengerName, setPassengerName] = useState(user?.name || '');
    const [passengerPhone, setPassengerPhone] = useState(user?.phone || '');
    const [passengerCount, setPassengerCount] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState('');

    // Get passenger info status
    const getPassengerInfoStatus = () => {
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

    // Get user's current location (only if profile is complete)
    useEffect(() => {
        if (infoStatus.isComplete) {
            const getLocation = async () => {
                setLocationLoading(true);
                setLocationError(null);
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            
                            // Check if within Hinobaan
                            const isWithinHinobaan = checkIfInHinobaan(latitude, longitude);

                            let address;
                            let barangayName;
                            
                            if (isWithinHinobaan) {
                                barangayName = getNearestBarangayName(latitude, longitude);
                                address = `${barangayName}, Hinobaan, Negros Occidental`;
                            } else {
                                // Use approximate Hinobaan center
                                address = "Hinobaan, Negros Occidental";
                                barangayName = getNearestBarangayName(HINOBAAN_BOUNDARY.center[0], HINOBAAN_BOUNDARY.center[1]);
                                setLocationError("You appear to be outside Hinobaan. Using approximate location for booking.");
                            }

                            const location = {
                                lat: isWithinHinobaan ? latitude : HINOBAAN_BOUNDARY.center[0],
                                lng: isWithinHinobaan ? longitude : HINOBAAN_BOUNDARY.center[1],
                                address,
                                name: 'Your Current Location',
                                barangay: barangayName
                            };

                            setUserLocation(location);
                            setLocationLoading(false);
                        },
                        (error) => {
                            console.error('Geolocation error:', error);
                            // Fallback to approximate Hinobaan center
                            const fallbackLocation = {
                                lat: HINOBAAN_BOUNDARY.center[0],
                                lng: HINOBAAN_BOUNDARY.center[1],
                                address: "Hinobaan, Negros Occidental",
                                name: 'Hinobaan Center',
                                barangay: 'Central Area'
                            };
                            
                            setUserLocation(fallbackLocation);
                            setLocationError("Using approximate Hinobaan location. Please select exact pickup point on map.");
                            setLocationLoading(false);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        }
                    );
                } else {
                    // Browser doesn't support geolocation
                    const fallbackLocation = {
                        lat: HINOBAAN_BOUNDARY.center[0],
                        lng: HINOBAAN_BOUNDARY.center[1],
                        address: "Hinobaan, Negros Occidental",
                        name: 'Hinobaan Center',
                        barangay: 'Central Area'
                    };
                    
                    setUserLocation(fallbackLocation);
                    setLocationError("Geolocation not supported. Please select pickup point on map.");
                    setLocationLoading(false);
                }
            };

            getLocation();
        }
    }, [infoStatus.isComplete]);

    const handleLocationSelect = (type: 'pickup' | 'destination', location: any) => {
        if (type === 'destination') {
            setDestination(location);
            // Automatically calculate route when destination is selected
            if (userLocation) {
                calculateRoute();
            }
        }
    };

    const calculateRoute = async () => {
        if (!userLocation || !destination) {
            alert('Please select a destination on the map');
            return;
        }

        setIsCalculatingRoute(true);

        try {
            // Use OSRM API for routing
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
            );
            
            if (!response.ok) throw new Error('Route calculation failed');
            
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const distanceKm = (route.distance / 1000).toFixed(1);
                const durationMinutes = Math.round(route.duration / 60);
                
                // Extract coordinates for map display
                const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                
                setRouteData({
                    distance: `${distanceKm} km`,
                    duration: `${durationMinutes} mins`,
                    coordinates: coordinates,
                    routeData: route
                });
                
                // Calculate fare (simplified calculation)
                const baseFare = 30; // Base fare in PHP
                const perKmRate = 10; // Per km rate
                const fare = Math.round(baseFare + (parseFloat(distanceKm) * perKmRate));
                
                setRideSummary({
                    distance: `${distanceKm} km`,
                    duration: `${durationMinutes} mins`,
                    fare: `₱${fare}.00`,
                    pickup: userLocation.address,
                    destination: destination.address,
                    passengerCount,
                    estimatedArrival: calculateETA(durationMinutes)
                });
            }
        } catch (error) {
            console.error('Error calculating route:', error);
            alert('Failed to calculate route. Please try again.');
        } finally {
            setIsCalculatingRoute(false);
        }
    };

    const calculateETA = (durationMinutes: number) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + durationMinutes + 5); // Add 5 minutes for driver arrival
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleBookRide = () => {
        if (!passengerName.trim() || !passengerPhone.trim()) {
            alert('Please enter your name and phone number');
            return;
        }

        if (!destination) {
            alert('Please select a destination on the map');
            return;
        }

        if (!rideSummary) {
            alert('Please calculate the route first');
            return;
        }

        // In a real app, this would send to your backend
        const bookingData = {
            passengerName,
            passengerPhone,
            pickupLocation: userLocation,
            destination,
            passengerCount,
            specialInstructions,
            rideSummary
        };

        console.log('Booking Data:', bookingData);
        alert(`Ride booked successfully!\n\nDriver will contact you at ${passengerPhone}\n\nFare: ${rideSummary.fare}\nETA: ${rideSummary.estimatedArrival}\n\nFrom: ${userLocation?.address}\nTo: ${destination.address}`);
        
        // Reset form
        setDestination(null);
        setRouteData(null);
        setRideSummary(null);
        setPassengerCount(1);
        setSpecialInstructions('');
    };

    const handleReset = () => {
        setDestination(null);
        setRouteData(null);
        setRideSummary(null);
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

    return (
        <PassengerLayout breadcrumbs={breadcrumbs}>
            <Head title="Book a Ride - Hinobaan Tricycle Service" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Banner */}
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Car className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-2">Book a Tricycle Ride in Hinobaan</h1>
                                <p className="opacity-90 text-sm">
                                    Click anywhere on the map to select your destination
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-2">
                                {locationLoading ? 'Getting Location...' : 'Location Ready'}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm opacity-90">
                                <Shield className="w-4 h-4" />
                                <span>Service Area: Hinobaan Municipality</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How-to Guide */}
                <HowToGuide />

                {locationError && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                            <div>
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Location Notice</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{locationError}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Card - Passenger Form */}
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        <UserIcon className="w-5 h-5 text-blue-500" />
                                        Passenger Information
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                        Enter your details for the ride booking
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    Required
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Passenger Name */}
                            <div className="space-y-2">
                                <Label htmlFor="passengerName" className="text-gray-700 dark:text-gray-300 text-sm">
                                    Full Name *
                                </Label>
                                <Input
                                    id="passengerName"
                                    placeholder="Enter your full name"
                                    value={passengerName}
                                    onChange={(e) => setPassengerName(e.target.value)}
                                    className="border-gray-300 dark:border-gray-600"
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="passengerPhone" className="text-gray-700 dark:text-gray-300 text-sm">
                                    Phone Number *
                                </Label>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600">
                                        <span className="text-gray-600 dark:text-gray-400">+63</span>
                                    </div>
                                    <Input
                                        id="passengerPhone"
                                        placeholder="912 345 6789"
                                        value={passengerPhone}
                                        onChange={(e) => setPassengerPhone(e.target.value)}
                                        className="border-gray-300 dark:border-gray-600 rounded-l-none"
                                    />
                                </div>
                            </div>

                            {/* Passengers Count */}
                            <div className="space-y-2">
                                <Label htmlFor="passengerCount" className="text-gray-700 dark:text-gray-300 text-sm">
                                    Number of Passengers
                                </Label>
                                <Select value={passengerCount.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                                    <SelectTrigger className="border-gray-300 dark:border-gray-600">
                                        <SelectValue placeholder="Select number of passengers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3].map((num) => (
                                            <SelectItem key={num} value={num.toString()}>
                                                {num} {num === 1 ? 'passenger' : 'passengers'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Tricycles can accommodate up to 3 passengers
                                </p>
                            </div>

                            {/* Location Selection */}
                            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                                <LocationDisplay 
                                    type="pickup"
                                    location={userLocation}
                                    label="Your Current Location"
                                    icon={MapPin}
                                />

                                <LocationDisplay 
                                    type="destination"
                                    location={destination}
                                    label="Destination"
                                    icon={Navigation}
                                />

                                <Button
                                    onClick={calculateRoute}
                                    disabled={!destination || isCalculatingRoute}
                                    className="w-full gap-2"
                                >
                                    {isCalculatingRoute ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Calculating Route...
                                        </>
                                    ) : (
                                        <>
                                            <RouteIcon className="w-4 h-4" />
                                            Calculate Route & Fare
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Special Instructions */}
                            <div className="space-y-2">
                                <Label htmlFor="instructions" className="text-gray-700 dark:text-gray-300 text-sm">
                                    Special Instructions (Optional)
                                </Label>
                                <Textarea
                                    id="instructions"
                                    placeholder="Any special instructions for the driver..."
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    className="border-gray-300 dark:border-gray-600 min-h-[100px]"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    E.g., waiting at specific landmark, need assistance with luggage, etc.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Card - Map */}
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        <Map className="w-5 h-5 text-green-500" />
                                        Hinobaan Municipality Map
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                        Click anywhere on map to select your destination
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                    Live Map
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 h-[500px]">
                            <RideRequestMap
                                pickupLocation={userLocation}
                                destination={destination}
                                userLocation={userLocation}
                                routeData={routeData}
                                onLocationSelect={handleLocationSelect}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Ride Summary */}
                {rideSummary && (
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Ride Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <StatCard 
                                    label="Distance" 
                                    value={rideSummary.distance} 
                                    icon={Route}
                                    color="blue"
                                />
                                <StatCard 
                                    label="Duration" 
                                    value={rideSummary.duration} 
                                    icon={Clock}
                                    color="green"
                                />
                                <StatCard 
                                    label="Passengers" 
                                    value={`${rideSummary.passengerCount} ${rideSummary.passengerCount === 1 ? 'person' : 'people'}`}
                                    icon={Users}
                                    color="amber"
                                />
                                <StatCard 
                                    label="Fare" 
                                    value={rideSummary.fare} 
                                    icon={Car}
                                    color="purple"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Route Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold">A</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Your Location</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{rideSummary.pickup}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold">B</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Destination</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{rideSummary.destination}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-green-500" />
                                        Estimated Timeline
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Arrival</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{rideSummary.estimatedArrival}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Ride Time</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{rideSummary.duration}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Service Area</span>
                                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                                                Hinobaan Municipality
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={handleBookRide}
                                        className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                                        size="lg"
                                    >
                                        <Car className="w-5 h-5" />
                                        Confirm & Book Ride
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-gray-300 dark:border-gray-600"
                                        size="lg"
                                        onClick={handleReset}
                                    >
                                        Clear & Start Over
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Service Information */}
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            Service Information & Safety
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Service Area</h4>
                                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Entire Hinobaan Municipality</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>All 13 Barangays Covered</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>24/7 Service Available</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Fare Guide</h4>
                                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex justify-between">
                                        <span>Base Fare:</span>
                                        <span className="font-medium">₱30.00</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Per Kilometer:</span>
                                        <span className="font-medium">₱10.00/km</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Max Passengers:</span>
                                        <span className="font-medium">3 persons</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Safety Tips</h4>
                                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>Verify driver identification</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>Share ride details with trusted contacts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>Wear seatbelt when available</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}