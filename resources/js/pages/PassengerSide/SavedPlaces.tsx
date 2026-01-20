import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Home, 
    School, 
    Briefcase, 
    MapPin, 
    Plus, 
    Edit,
    Trash2,
    Star,
    User,
    Clock,
    Heart,
    Navigation
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState } from 'react';

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

interface FavoriteDriver {
    id: number;
    name: string;
    avatar: string | null;
    rating: number;
    total_rides: number;
    vehicle_type: string;
    plate_number: string;
}

interface RecentPlace {
    id: number;
    address: string;
    latitude: number | null;
    longitude: number | null;
    timestamp: string;
}

interface PageProps extends SharedData {
    savedPlaces: SavedPlace[];
    favoriteDrivers: FavoriteDriver[];
    recentPlaces: RecentPlace[];
}

export default function SavedPlaces() {
    const { auth, savedPlaces, favoriteDrivers, recentPlaces } = usePage<PageProps>().props;
    const [loading, setLoading] = useState(false);

    const getPlaceIcon = (type: string) => {
        switch (type) {
            case 'home':
                return Home;
            case 'school':
                return School;
            case 'work':
                return Briefcase;
            default:
                return MapPin;
        }
    };

    return (
        <PassengerLayout>
            <Head title="Saved Places & Favorites" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Saved Places & Favorites</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quick access to your frequently visited places and favorite drivers</p>
                </div>

                {/* Saved Places */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                    Saved Places
                                </CardTitle>
                                <CardDescription>Your favorite destinations for faster booking</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Place
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {savedPlaces.length > 0 ? (
                            <div className="space-y-3">
                                {savedPlaces.map((place) => {
                                    const IconComponent = place.icon;
                                    return (
                                        <div
                                            key={place.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                    <IconComponent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{place.name}</p>
                                                        {place.is_primary && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Primary
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">{place.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No saved places yet</p>
                                <Button className="mt-4" variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Place
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Favorite Drivers */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-rose-600" />
                                    Favorite Drivers
                                </CardTitle>
                                <CardDescription>Drivers you trust and prefer to ride with</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {favoriteDrivers.length > 0 ? (
                            <div className="space-y-3">
                                {favoriteDrivers.map((driver) => (
                                    <div
                                        key={driver.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                                                <User className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{driver.name}</p>
                                                    {driver.rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium">{driver.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span>{driver.vehicle_type} • {driver.plate_number}</span>
                                                    <span>{driver.total_rides} rides together</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                                            <Navigation className="h-4 w-4 mr-2" />
                                            Request Ride
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No favorite drivers yet</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Complete rides and save your favorite drivers for quick booking
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Places */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Recent Places
                        </CardTitle>
                        <CardDescription>Places you've recently visited</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentPlaces.length > 0 ? (
                            <div className="space-y-3">
                                {recentPlaces.map((place) => (
                                    <div
                                        key={place.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{place.address}</p>
                                                <p className="text-xs text-muted-foreground">{place.timestamp}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Save
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No recent places</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}
