import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage } from '@inertiajs/react';
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
    Crosshair
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState, useEffect } from 'react';

// Mock map locations data
const mockLocations = [
    { id: 1, name: 'SM City Mall', lat: 14.5995, lng: 120.9842, address: 'Esmalife Bldg, Mac Arthur Hwy, Valenzuela, 1440 Metro Manila' },
    { id: 2, name: 'Valenzuela City Hall', lat: 14.6780, lng: 120.9730, address: 'Maysan Road, Valenzuela, Metro Manila' },
    { id: 3, name: 'Polo National High School', lat: 14.6810, lng: 120.9690, address: 'Polo, Valenzuela City, Metro Manila' },
    { id: 4, name: 'Valenzuela People\'s Park', lat: 14.6830, lng: 120.9750, address: 'Arkong Bato, Valenzuela City' },
    { id: 5, name: 'Fatima University', lat: 14.6920, lng: 120.9660, address: '120 MacArthur Hwy, Valenzuela, 1440 Metro Manila' },
];

export default function BookRide() {
    const { auth } = usePage<SharedData>().props;
    const [pickupLocation, setPickupLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedTricycle, setSelectedTricycle] = useState<number | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: 14.6780, lng: 120.9730 }); // Valenzuela center
    const [selectedPickupPin, setSelectedPickupPin] = useState<number | null>(null);
    const [selectedDestinationPin, setSelectedDestinationPin] = useState<number | null>(null);
    const [isSelectingPickup, setIsSelectingPickup] = useState(false);
    const [isSelectingDestination, setIsSelectingDestination] = useState(false);

    // Mock data for available tricycles
    const availableTricycles = [
        {
            id: 1,
            driverName: 'Kuya Juan',
            plateNumber: 'TRIC-001',
            distance: '0.8 km away',
            eta: '3 mins',
            price: '₱45',
            rating: 4.9,
            totalRides: 1247,
            features: ['AC', 'GPS', 'Safe Driver'],
            vehicleType: 'Standard Tricycle',
            currentLocation: { lat: 14.6800, lng: 120.9740 }
        },
        {
            id: 2,
            driverName: 'Kuya Pedro',
            plateNumber: 'TRIC-002',
            distance: '1.2 km away',
            eta: '5 mins',
            price: '₱40',
            rating: 4.8,
            totalRides: 892,
            features: ['GPS', 'Comfortable'],
            vehicleType: 'Standard Tricycle',
            currentLocation: { lat: 14.6760, lng: 120.9710 }
        },
        {
            id: 3,
            driverName: 'Kuya Miguel',
            plateNumber: 'TRIC-003',
            distance: '0.5 km away',
            eta: '2 mins',
            price: '₱50',
            rating: 4.7,
            totalRides: 1563,
            features: ['AC', 'GPS', 'Premium', 'Safe Driver'],
            vehicleType: 'Premium Tricycle',
            currentLocation: { lat: 14.6790, lng: 120.9750 }
        }
    ];

    // Handle map pin click for pickup
    const handlePickupPinClick = (location: typeof mockLocations[0]) => {
        setPickupLocation(location.address);
        setSelectedPickupPin(location.id);
        setIsSelectingPickup(false);
        setMapCenter({ lat: location.lat, lng: location.lng });
    };

    // Handle map pin click for destination
    const handleDestinationPinClick = (location: typeof mockLocations[0]) => {
        setDestination(location.address);
        setSelectedDestinationPin(location.id);
        setIsSelectingDestination(false);
        setMapCenter({ lat: location.lat, lng: location.lng });
    };

    // Start pickup selection mode
    const startPickupSelection = () => {
        setIsSelectingPickup(true);
        setIsSelectingDestination(false);
    };

    // Start destination selection mode
    const startDestinationSelection = () => {
        setIsSelectingDestination(true);
        setIsSelectingPickup(false);
    };

    // Clear selections
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

    // Mock map component
    const Map = () => (
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-gray-200 overflow-hidden">
            {/* Map Background with Grid */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="absolute w-full h-px bg-gray-400 top-0" style={{ top: `${i * 10}%` }} />
                    ))}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="absolute h-full w-px bg-gray-400 left-0" style={{ left: `${i * 10}%` }} />
                    ))}
                </div>
                
                {/* Roads */}
                <div className="absolute w-1/2 h-2 bg-gray-400 top-1/2 left-1/4 transform -translate-y-1/2 opacity-30" />
                <div className="absolute h-1/2 w-2 bg-gray-400 left-1/2 top-1/4 transform -translate-x-1/2 opacity-30" />
            </div>

            {/* Location Pins */}
            {mockLocations.map((location) => (
                <button
                    key={location.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                        (isSelectingPickup || isSelectingDestination) 
                            ? 'cursor-pointer hover:scale-110' 
                            : 'cursor-default'
                    } ${
                        selectedPickupPin === location.id 
                            ? 'text-blue-600 scale-110' 
                            : selectedDestinationPin === location.id 
                                ? 'text-green-600 scale-110' 
                                : 'text-gray-600'
                    }`}
                    style={{
                        left: `${((location.lng - 120.96) / 0.03) * 100}%`,
                        top: `${((14.70 - location.lat) / 0.03) * 100}%`,
                    }}
                    onClick={() => {
                        if (isSelectingPickup) {
                            handlePickupPinClick(location);
                        } else if (isSelectingDestination) {
                            handleDestinationPinClick(location);
                        }
                    }}
                >
                    <div className="relative">
                        <MapPin className="w-6 h-6 fill-current" />
                        {(isSelectingPickup || isSelectingDestination) && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {isSelectingPickup ? 'Set as Pickup' : 'Set as Destination'}
                            </div>
                        )}
                    </div>
                </button>
            ))}

            {/* Tricycle Markers */}
            {availableTricycles.map((tricycle) => (
                <div
                    key={tricycle.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: `${((tricycle.currentLocation.lng - 120.96) / 0.03) * 100}%`,
                        top: `${((14.70 - tricycle.currentLocation.lat) / 0.03) * 100}%`,
                    }}
                >
                    <Car className="w-5 h-5 text-orange-500" />
                </div>
            ))}

            {/* Selection Mode Indicator */}
            {(isSelectingPickup || isSelectingDestination) && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                    <div className="flex items-center gap-2">
                        <Crosshair className="w-4 h-4" />
                        <span>
                            {isSelectingPickup ? 'Click on map to set pickup location' : 'Click on map to set destination'}
                        </span>
                    </div>
                </div>
            )}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="bg-white shadow-sm"
                    onClick={() => setMapCenter({ lat: 14.6780, lng: 120.9730 })}
                >
                    <LocateFixed className="w-4 h-4" />
                </Button>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>Pickup</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>Destination</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Car className="w-4 h-4 text-orange-500" />
                        <span>Available Tricycles</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <PassengerLayout>
            <Head title="Book a Ride" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Book a Ride</h1>
                        <p className="text-muted-foreground mt-2">
                            Select locations on the map or enter addresses manually
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-3 py-2 rounded-lg">
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Select Locations</CardTitle>
                                <CardDescription>
                                    Click on the map to set pickup and destination points
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Map />
                            </CardContent>
                        </Card>

                        {/* Booking Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ride Details</CardTitle>
                                <CardDescription>
                                    Or enter locations manually below
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Pickup Location */}
                                <div className="space-y-2">
                                    <Label htmlFor="pickup" className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Pickup Location
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="pickup"
                                            placeholder="Enter pickup location or click on map"
                                            value={pickupLocation}
                                            onChange={(e) => setPickupLocation(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant={isSelectingPickup ? "default" : "outline"}
                                            onClick={startPickupSelection}
                                            className={isSelectingPickup ? "bg-blue-600 text-white" : ""}
                                        >
                                            <Crosshair className="w-4 h-4" />
                                        </Button>
                                        {pickupLocation && (
                                            <Button
                                                variant="outline"
                                                onClick={() => clearSelection('pickup')}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Destination */}
                                <div className="space-y-2">
                                    <Label htmlFor="destination" className="flex items-center gap-2">
                                        <Navigation className="w-4 h-4 text-green-500" />
                                        Destination
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="destination"
                                            placeholder="Enter destination or click on map"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant={isSelectingDestination ? "default" : "outline"}
                                            onClick={startDestinationSelection}
                                            className={isSelectingDestination ? "bg-green-600 text-white" : ""}
                                        >
                                            <Crosshair className="w-4 h-4" />
                                        </Button>
                                        {destination && (
                                            <Button
                                                variant="outline"
                                                onClick={() => clearSelection('destination')}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button 
                                        variant="outline" 
                                        className="flex items-center gap-2"
                                        disabled={!pickupLocation || !destination}
                                    >
                                        <Search className="w-4 h-4" />
                                        Search Rides
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="flex items-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Schedule Ride
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Available Tricycles - Same as before */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Tricycles</CardTitle>
                                <CardDescription>
                                    Choose your preferred tricycle and driver
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {availableTricycles.map((tricycle) => (
                                        <Card 
                                            key={tricycle.id}
                                            className={`cursor-pointer transition-all border-2 ${
                                                selectedTricycle === tricycle.id 
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                            onClick={() => setSelectedTricycle(tricycle.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4 flex-1">
                                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-lg">{tricycle.driverName}</h3>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {tricycle.vehicleType}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {tricycle.plateNumber} • {tricycle.distance}
                                                            </p>
                                                            
                                                            <div className="flex flex-wrap gap-1 mb-3">
                                                                {tricycle.features.map((feature, index) => (
                                                                    <Badge 
                                                                        key={index} 
                                                                        variant="outline" 
                                                                        className="text-xs flex items-center gap-1"
                                                                    >
                                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                                        {feature}
                                                                    </Badge>
                                                                ))}
                                                            </div>

                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                    <span>{tricycle.rating}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="w-3 h-3" />
                                                                    <span>{tricycle.totalRides} rides</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                                                            {tricycle.price}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{tricycle.eta}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedTricycle === tricycle.id && (
                                                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                                                <Shield className="w-4 h-4" />
                                                                <span>Selected for booking</span>
                                                            </div>
                                                            <Button 
                                                                size="sm" 
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={handleBookRide}
                                                            >
                                                                Confirm Ride
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side - Ride Summary & Info */}
                    <div className="space-y-6">
                        {/* Ride Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ride Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedTricycle && pickupLocation && destination ? (
                                    <>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-sm text-muted-foreground">From</Label>
                                                <p className="font-medium text-sm">{pickupLocation}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm text-muted-foreground">To</Label>
                                                <p className="font-medium text-sm">{destination}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-sm text-muted-foreground">Driver</span>
                                            <span className="font-medium">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.driverName}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Vehicle</span>
                                            <span className="font-medium">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.plateNumber}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Estimated Time</span>
                                            <span className="font-medium">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.eta}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-t pt-2">
                                            <span className="text-sm font-medium">Total Fare</span>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.price}
                                            </span>
                                        </div>
                                        <div className="pt-2">
                                            <Button 
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                onClick={handleBookRide}
                                            >
                                                <Car className="w-4 h-4 mr-2" />
                                                Book This Ride
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>Select locations and a tricycle to see ride details</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Safety Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    Safety First
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">Verified drivers</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">Real-time GPS tracking</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">24/7 customer support</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">Emergency contact sharing</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}