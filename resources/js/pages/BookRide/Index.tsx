import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage, Link } from '@inertiajs/react';
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
    Contact
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState } from 'react';

// ADDED: Mock locations data
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

// ADDED: Available tricycles data
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
function ProfileRestrictionScreen({ infoStatus }: { infoStatus: PassengerInfoStatus }) {
    return (
        <PassengerLayout>
            <Head title="Complete Your Profile" />
            
            <div className="flex h-full flex-1 flex-col gap-8 p-6">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <AlertCircle className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Complete Your Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                        For your safety and better service experience, we need to verify your information before you can book rides.
                    </p>
                </div>

                {/* Requirements Card */}
                <Card className="max-w-4xl mx-auto border-0 shadow-lg">
                    <CardHeader className="text-center pb-8">
                        <CardTitle className="text-2xl flex items-center justify-center gap-3 text-gray-900 dark:text-white">
                            <Shield className="w-6 h-6 text-blue-500" />
                            Required Information
                        </CardTitle>
                        <CardDescription className="text-base">
                            Complete these safety requirements to start booking rides
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Phone Number */}
                        <div className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                            infoStatus.hasPhone 
                                ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                                : 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    infoStatus.hasPhone ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {infoStatus.hasPhone ? <CheckCircle className="w-6 h-6" /> : <PhoneIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Phone Number</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
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
                        <div className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                            infoStatus.hasAddress 
                                ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                                : 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    infoStatus.hasAddress ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {infoStatus.hasAddress ? <CheckCircle className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Home Address</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
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
                        <div className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                            infoStatus.hasEmergencyContact 
                                ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' 
                                : 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    infoStatus.hasEmergencyContact ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {infoStatus.hasEmergencyContact ? <CheckCircle className="w-6 h-6" /> : <Contact className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Emergency Contact</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
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
                <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/PassengerSide/settings">
                        <Button 
                            size="lg" 
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                        >
                            <User className="w-5 h-5 mr-2" />
                            Complete Profile Now
                        </Button>
                    </Link>
                    <Link href="/passenger/dashboard">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors dark:border-gray-700 dark:bg-gradient-to-r dark:from-slate-800 dark:to-indigo-900 dark:hover:from-indigo-800 dark:hover:to-indigo-700 dark:text-gray-100"
                        >
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Safety Notice */}
                <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                            <Info className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg mb-3">Why this information is important?</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 dark:text-blue-200">
                                    <div className="flex items-start gap-2">
                                        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Emergency assistance and quick response</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Accurate pickup locations and navigation</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <PhoneIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Driver communication and ride updates</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Contact className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>Emergency contact notifications</span>
                                    </div>
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
    
    const getPassengerInfoStatus = (): PassengerInfoStatus => {
        const missingFields = [];
        
        if (!user.phone) missingFields.push('phone number');
        if (!user.address) missingFields.push('home address');
        
        const hasEmergencyName = !!user.emergency_name;
        const hasEmergencyPhone = !!user.emergency_phone;
        
        if (!hasEmergencyName || !hasEmergencyPhone) {
            missingFields.push('emergency contact');
        }

        const hasPhone = !!user.phone;
        const hasAddress = !!user.address;
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

    // If information is incomplete, show the restriction screen
    if (!infoStatus.isComplete) {
        return <ProfileRestrictionScreen infoStatus={infoStatus} />;
    }

    const [pickupLocation, setPickupLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedTricycle, setSelectedTricycle] = useState<number | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: 14.6780, lng: 120.9730 });
    const [selectedPickupPin, setSelectedPickupPin] = useState<number | null>(null);
    const [selectedDestinationPin, setSelectedDestinationPin] = useState<number | null>(null);
    const [isSelectingPickup, setIsSelectingPickup] = useState(false);
    const [isSelectingDestination, setIsSelectingDestination] = useState(false);

    // FIXED: Handler functions now properly defined with the mock data
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
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
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
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book a Ride</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            Select locations on the map or enter addresses manually
                        </p>
                    </div>
                    {/* FIXED: Now using the availableTricycles array */}
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                            {availableTricycles.length} tricycles available
                        </span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Side - Map & Booking Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Interactive Map */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl text-gray-900 dark:text-white">Select Locations</CardTitle>
                                <CardDescription>
                                    Click on the map to set pickup and destination points
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Map />
                            </CardContent>
                        </Card>

                        {/* Booking Form */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl text-gray-900 dark:text-white">Ride Details</CardTitle>
                                <CardDescription>
                                    Or enter locations manually below
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Pickup Location */}
                                <div className="space-y-3">
                                    <Label htmlFor="pickup" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Pickup Location
                                    </Label>
                                    <div className="flex gap-3">
                                        <Input
                                            id="pickup"
                                            placeholder="Enter pickup location or click on map"
                                            value={pickupLocation}
                                            onChange={(e) => setPickupLocation(e.target.value)}
                                            className="flex-1 border-gray-300 dark:border-gray-600 focus:border-blue-500"
                                        />
                                        <Button
                                            variant={isSelectingPickup ? "default" : "outline"}
                                            onClick={startPickupSelection}
                                            className={`whitespace-nowrap ${
                                                isSelectingPickup ? "bg-blue-600 text-white" : "border-gray-300"
                                            }`}
                                        >
                                            <Crosshair className="w-4 h-4" />
                                        </Button>
                                        {pickupLocation && (
                                            <Button
                                                variant="outline"
                                                onClick={() => clearSelection('pickup')}
                                                className="border-gray-300"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Destination */}
                                <div className="space-y-3">
                                    <Label htmlFor="destination" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Navigation className="w-4 h-4 text-green-500" />
                                        Destination
                                    </Label>
                                    <div className="flex gap-3">
                                        <Input
                                            id="destination"
                                            placeholder="Enter destination or click on map"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                            className="flex-1 border-gray-300 dark:border-gray-600 focus:border-green-500"
                                        />
                                        <Button
                                            variant={isSelectingDestination ? "default" : "outline"}
                                            onClick={startDestinationSelection}
                                            className={`whitespace-nowrap ${
                                                isSelectingDestination ? "bg-green-600 text-white" : "border-gray-300"
                                            }`}
                                        >
                                            <Crosshair className="w-4 h-4" />
                                        </Button>
                                        {destination && (
                                            <Button
                                                variant="outline"
                                                onClick={() => clearSelection('destination')}
                                                className="border-gray-300"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button 
                                        variant="outline" 
                                        className="flex items-center gap-2 border-gray-300"
                                        disabled={!pickupLocation || !destination}
                                    >
                                        <Search className="w-4 h-4" />
                                        Search Rides
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex items-center gap-2 border-gray-300"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Schedule Ride
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Available Tricycles */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl text-gray-900 dark:text-white">
                                    Available Tricycles
                                </CardTitle>
                                <CardDescription>
                                    Select a tricycle for your ride
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {tricycle.driverName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {tricycle.plateNumber} • {tricycle.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {tricycle.price}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    ETA: {tricycle.eta}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <span className="text-sm">{tricycle.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">Up to {tricycle.capacity} passengers</span>
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
                            <CardHeader>
                                <CardTitle className="text-xl text-gray-900 dark:text-white">
                                    Ride Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm">{pickupLocation || 'Select pickup location'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Navigation className="w-4 h-4 text-green-500" />
                                        <span className="text-sm">{destination || 'Select destination'}</span>
                                    </div>
                                </div>
                                
                                {selectedTricycle && (
                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-300">Fare</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.price}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600 dark:text-gray-300">ETA</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.eta}
                                            </span>
                                        </div>
                                        <Button 
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Shield className="w-5 h-5 text-blue-500" />
                                    Safety First
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
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