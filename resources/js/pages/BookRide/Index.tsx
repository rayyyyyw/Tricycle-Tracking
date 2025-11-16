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
    LocateFixed,
    Crosshair,
    AlertCircle,
    XCircle,
    Info,
    Phone as PhoneIcon,
    Home,
    Contact,
    RefreshCw,
    AlertTriangle,
    X
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState, useEffect } from 'react';

// Mock locations data
const mockLocations = [
    {
        id: 1,
        name: "Main Gate",
        address: "University Main Gate, Taft Avenue, Manila",
        lat: 14.6780,
        lng: 120.9730
    },
    {
        id: 2,
        name: "Library",
        address: "University Library, Taft Avenue, Manila",
        lat: 14.6790,
        lng: 120.9740
    },
    {
        id: 3,
        name: "Student Center",
        address: "Student Center Building, Taft Avenue, Manila",
        lat: 14.6770,
        lng: 120.9720
    },
    {
        id: 4,
        name: "Science Building",
        address: "Science Complex, Taft Avenue, Manila",
        lat: 14.6800,
        lng: 120.9750
    }
];

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

    return (
        <PassengerLayout>
            <Head title="Complete Your Profile" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Missing Fields Prompt */}
                {showMissingFieldsPrompt && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Profile Incomplete
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Please complete all required information
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMissingFieldsPrompt(false)}
                                    className="ml-auto h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
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

                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                You need to complete all required information in your profile settings to book rides.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowMissingFieldsPrompt(false)}
                                >
                                    Cancel
                                </Button>
                                <Link href="/PassengerSide/settings">
                                    <Button 
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        Go to Settings
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold mb-1">Profile Incomplete</h1>
                            <p className="opacity-90 text-sm">
                                Complete your profile to unlock ride booking features. {getMissingFieldsText()} required for your safety.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress & Requirements Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-3">
                            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                                <Shield className="w-5 h-5 text-blue-500" />
                                Required Information
                            </CardTitle>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
                                <div className="text-xs text-gray-500">Complete</div>
                            </div>
                        </div>
                        <CardDescription className="text-sm">
                            Complete these safety requirements to start booking rides
                        </CardDescription>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                        {/* Phone Number */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            infoStatus.hasPhone 
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                                : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    infoStatus.hasPhone ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {infoStatus.hasPhone ? <CheckCircle className="w-5 h-5" /> : <PhoneIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone Number</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        For driver communication and ride notifications
                                    </p>
                                </div>
                            </div>
                            <Badge 
                                variant={infoStatus.hasPhone ? "default" : "secondary"}
                                className={`text-sm px-3 py-1 ${
                                    infoStatus.hasPhone 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                }`}
                            >
                                {infoStatus.hasPhone ? "✓ Completed" : "Required"}
                            </Badge>
                        </div>

                        {/* Home Address */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            infoStatus.hasAddress 
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                                : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    infoStatus.hasAddress ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {infoStatus.hasAddress ? <CheckCircle className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Home Address</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        For accurate pickup locations and emergency situations
                                    </p>
                                </div>
                            </div>
                            <Badge 
                                variant={infoStatus.hasAddress ? "default" : "secondary"}
                                className={`text-sm px-3 py-1 ${
                                    infoStatus.hasAddress 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                }`}
                            >
                                {infoStatus.hasAddress ? "✓ Completed" : "Required"}
                            </Badge>
                        </div>

                        {/* Emergency Contact */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            infoStatus.hasEmergencyContact 
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                                : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    infoStatus.hasEmergencyContact ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {infoStatus.hasEmergencyContact ? <CheckCircle className="w-5 h-5" /> : <Contact className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Emergency Contact</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        For safety notifications and emergency situations
                                    </p>
                                </div>
                            </div>
                            <Badge 
                                variant={infoStatus.hasEmergencyContact ? "default" : "secondary"}
                                className={`text-sm px-3 py-1 ${
                                    infoStatus.hasEmergencyContact 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                }`}
                            >
                                {infoStatus.hasEmergencyContact ? "✓ Completed" : "Required"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg flex-1"
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
                        className="flex-1"
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
 <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
    <CardContent className="p-5">
        <div className="text-center">
            <div className="flex justify-center mb-3">
                <Info className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-base mb-4">Why this information is important?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Emergency assistance and quick response</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Accurate pickup locations and navigation</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Driver communication and ride updates</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <Contact className="w-4 h-4 text-blue-600 flex-shrink-0" />
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

export default function BookRide() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    
    // State to track if we should re-check the profile status
    const [shouldCheckProfile, setShouldCheckProfile] = useState(false);
    
    const getPassengerInfoStatus = (): PassengerInfoStatus => {
        const missingFields = [];
        
        if (!user?.phone) missingFields.push('phone number');
        if (!user?.address) missingFields.push('home address');
        
        const hasEmergencyName = !!user?.emergency_name;
        const hasEmergencyPhone = !!user?.emergency_phone;
        
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

    // Reset the check flag when profile becomes complete
    useEffect(() => {
        if (infoStatus.isComplete && shouldCheckProfile) {
            setShouldCheckProfile(false);
        }
    }, [infoStatus.isComplete, shouldCheckProfile]);

    // If information is incomplete, show the restriction screen
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
    const [mapCenter, setMapCenter] = useState({ lat: 14.6780, lng: 120.9730 });
    const [selectedPickupPin, setSelectedPickupPin] = useState<number | null>(null);
    const [selectedDestinationPin, setSelectedDestinationPin] = useState<number | null>(null);
    const [isSelectingPickup, setIsSelectingPickup] = useState(false);
    const [isSelectingDestination, setIsSelectingDestination] = useState(false);

    // Handler functions now properly defined with the mock data
    const handlePickupPinClick = (location: typeof mockLocations[0]) => {
        setPickupLocation(location.address);
        setSelectedPickupPin(location.id);
        setIsSelectingPickup(false);
        setMapCenter({ lat: location.lat, lng: location.lng });
    };

    const handleDestinationPinClick = (location: typeof mockLocations[0]) => {
        setDestination(location.address);
        setSelectedDestinationPin(location.id);
        setIsSelectingDestination(false);
        setMapCenter({ lat: location.lat, lng: location.lng });
    };

    const startPickupSelection = () => {
        setIsSelectingPickup(true);
        setIsSelectingDestination(false);
    };

    const startDestinationSelection = () => {
        setIsSelectingDestination(true);
        setIsSelectingPickup(false);
    };

    const clearSelection = (type: 'pickup' | 'destination') => {
        if (type === 'pickup') {
            setPickupLocation('');
            setSelectedPickupPin(null);
            setIsSelectingPickup(false);
        } else {
            setDestination('');
            setSelectedDestinationPin(null);
            setIsSelectingDestination(false);
        }
    };

    const handleBookRide = () => {
        if (selectedTricycle) {
            const selected = availableTricycles.find(t => t.id === selectedTricycle);
            alert(`Ride booked with ${selected?.driverName}! ETA: ${selected?.eta}`);
        }
    };

    // Mock map component with location pins
    const Map = () => (
        <div className="relative w-full h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                {/* Simple grid lines to represent a map */}
                <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 10}%` }}></div>
                    ))}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 10}%` }}></div>
                    ))}
                </div>
            </div>

            {/* Location Pins */}
            {mockLocations.map((location) => (
                <div
                    key={location.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all ${
                        selectedPickupPin === location.id 
                            ? 'scale-125 z-20' 
                            : selectedDestinationPin === location.id 
                                ? 'scale-125 z-20' 
                                : 'z-10'
                    }`}
                    style={{
                        left: `${((location.lng - 120.97) / 0.01) * 10}%`,
                        top: `${((location.lat - 14.675) / 0.01) * 10}%`,
                    }}
                    onClick={() => {
                        if (isSelectingPickup) {
                            handlePickupPinClick(location);
                        } else if (isSelectingDestination) {
                            handleDestinationPinClick(location);
                        }
                    }}
                >
                    {/* Pickup Pin */}
                    {selectedPickupPin === location.id && (
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <MapPin className="w-3 h-3 text-white" />
                            </div>
                            <div className="mt-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                Pickup
                            </div>
                        </div>
                    )}
                    
                    {/* Destination Pin */}
                    {selectedDestinationPin === location.id && (
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <Navigation className="w-3 h-3 text-white" />
                            </div>
                            <div className="mt-1 bg-green-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                Destination
                            </div>
                        </div>
                    )}
                    
                    {/* Regular Pin */}
                    {selectedPickupPin !== location.id && selectedDestinationPin !== location.id && (
                        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                            isSelectingPickup || isSelectingDestination 
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer' 
                                : 'bg-gray-300'
                        }`}></div>
                    )}
                </div>
            ))}

            {/* Selection Mode Indicator */}
            {(isSelectingPickup || isSelectingDestination) && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Crosshair className="w-4 h-4" />
                        {isSelectingPickup ? 'Click on map to set pickup location' : 'Click on map to set destination'}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsSelectingPickup(false);
                                setIsSelectingDestination(false);
                            }}
                            className="h-6 w-6 p-0"
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    // If information is complete, show the normal BookRide page
    return (
        <PassengerLayout>
            <Head title="Book a Ride" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Success Banner */}
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold mb-1">Profile Complete!</h1>
                            <p className="opacity-90 text-sm">
                                Your profile is fully set up. You can now book rides safely and efficiently.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book a Ride</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                            Select locations on the map or enter addresses manually
                        </p>
                    </div>
                    {/* Success Badge showing profile is complete */}
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                            Profile Complete • {availableTricycles.length} tricycles available
                        </span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Side - Map & Booking Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Interactive Map */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-gray-900 dark:text-white">Select Locations</CardTitle>
                                <CardDescription className="text-sm">
                                    Click on the map to set pickup and destination points
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Map />
                            </CardContent>
                        </Card>

                        {/* Booking Form */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-gray-900 dark:text-white">Ride Details</CardTitle>
                                <CardDescription className="text-sm">
                                    Or enter locations manually below
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
                                            placeholder="Enter pickup location or click on map"
                                            value={pickupLocation}
                                            onChange={(e) => setPickupLocation(e.target.value)}
                                            className="flex-1 border-gray-300 dark:border-gray-600 focus:border-blue-500 text-sm"
                                        />
                                        <Button
                                            variant={isSelectingPickup ? "default" : "outline"}
                                            onClick={startPickupSelection}
                                            className={`whitespace-nowrap ${
                                                isSelectingPickup ? "bg-blue-600 text-white" : "border-gray-300"
                                            }`}
                                            size="sm"
                                        >
                                            <Crosshair className="w-4 h-4" />
                                        </Button>
                                        {pickupLocation && (
                                            <Button
                                                variant="outline"
                                                onClick={() => clearSelection('pickup')}
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
                                            placeholder="Enter destination or click on map"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                            className="flex-1 border-gray-300 dark:border-gray-600 focus:border-green-500 text-sm"
                                        />
                                        <Button
                                            variant={isSelectingDestination ? "default" : "outline"}
                                            onClick={startDestinationSelection}
                                            className={`whitespace-nowrap ${
                                                isSelectingDestination ? "bg-green-600 text-white" : "border-gray-300"
                                            }`}
                                            size="sm"
                                        >
                                            <Crosshair className="w-4 h-4" />
                                        </Button>
                                        {destination && (
                                            <Button
                                                variant="outline"
                                                onClick={() => clearSelection('destination')}
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
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedTricycle(tricycle.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Car className="w-8 h-8 text-gray-600" />
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
                                                <Users className="w-4 h-4 text-gray-500" />
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
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm">{pickupLocation || 'Select pickup location'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                        <Navigation className="w-4 h-4 text-green-500" />
                                        <span className="text-sm">{destination || 'Select destination'}</span>
                                    </div>
                                </div>
                                
                                {selectedTricycle && (
                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-300 text-sm">Fare</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.price}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600 dark:text-gray-300 text-sm">ETA</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.eta}
                                            </span>
                                        </div>
                                        <Button 
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={handleBookRide}
                                        >
                                            Confirm Booking
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
        </PassengerLayout>
    );
}