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
    DollarSign,
    User,
    Star,
    Car,
    Shield,
    CheckCircle,
    Search,
    Calendar,
    Users
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState } from 'react';

export default function BookRide() {
    const { auth } = usePage<SharedData>().props;
    const [pickupLocation, setPickupLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedTricycle, setSelectedTricycle] = useState<number | null>(null);

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
            vehicleType: 'Standard Tricycle'
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
            vehicleType: 'Standard Tricycle'
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
            vehicleType: 'Premium Tricycle'
        }
    ];

    const handleBookRide = () => {
        if (selectedTricycle) {
            // Here you would typically make an API call to book the ride
            const selected = availableTricycles.find(t => t.id === selectedTricycle);
            alert(`Ride booked with ${selected?.driverName}! ETA: ${selected?.eta}`);
        }
    };

    return (
        <PassengerLayout>
            <Head title="Book a Ride" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Book a Ride</h1>
                        <p className="text-muted-foreground mt-2">
                            Find available tricycles near you
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
                    {/* Left Side - Booking Form & Available Rides */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Booking Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Where to?</CardTitle>
                                <CardDescription>
                                    Enter your pickup and destination locations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pickup" className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Pickup Location
                                    </Label>
                                    <Input
                                        id="pickup"
                                        placeholder="Enter your current location"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="destination" className="flex items-center gap-2">
                                        <Navigation className="w-4 h-4 text-green-500" />
                                        Destination
                                    </Label>
                                    <Input
                                        id="destination"
                                        placeholder="Where do you want to go?"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="pl-10"
                                    />
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

                        {/* Available Tricycles */}
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
                                                        {/* Driver Avatar */}
                                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        
                                                        {/* Driver & Vehicle Info */}
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
                                                            
                                                            {/* Features */}
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

                                                            {/* Stats */}
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

                                                    {/* Price & ETA */}
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
                                {selectedTricycle ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Selected Driver</span>
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
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Fare</span>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {availableTricycles.find(t => t.id === selectedTricycle)?.price}
                                            </span>
                                        </div>
                                        <div className="pt-4 border-t">
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
                                        <p>Select a tricycle to see ride details</p>
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

                        {/* Quick Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ride Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <p>• Confirm pickup location with driver</p>
                                <p>• Have exact change ready</p>
                                <p>• Share ride details with family</p>
                                <p>• Rate your driver after the ride</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}