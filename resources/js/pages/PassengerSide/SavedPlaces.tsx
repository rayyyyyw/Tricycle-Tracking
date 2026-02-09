import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PassengerLayout from '@/layouts/PassengerLayout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Clock,
    Edit,
    Heart,
    Home,
    MapPin,
    Navigation,
    Plus,
    School,
    Star,
    Trash2,
    User,
} from 'lucide-react';

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
    const { savedPlaces, favoriteDrivers, recentPlaces } =
        usePage<PageProps>().props;

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
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        Saved Places & Favorites
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Quick access to your frequently visited places and
                        favorite drivers
                    </p>
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
                                <CardDescription>
                                    Your favorite destinations for faster
                                    booking
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Place
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {savedPlaces.length > 0 ? (
                            <div className="space-y-3">
                                {savedPlaces.map((place) => {
                                    const IconComponent = getPlaceIcon(
                                        place.type,
                                    );
                                    return (
                                        <div
                                            key={place.id}
                                            className="group flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="flex flex-1 items-center gap-3">
                                                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                                                    <IconComponent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">
                                                            {place.name}
                                                        </p>
                                                        {place.is_primary && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                Primary
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {place.address}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <MapPin className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-sm text-muted-foreground">
                                    No saved places yet
                                </p>
                                <Button className="mt-4" variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
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
                                <CardDescription>
                                    Drivers you trust and prefer to ride with
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {favoriteDrivers.length > 0 ? (
                            <div className="space-y-3">
                                {favoriteDrivers.map((driver) => (
                                    <div
                                        key={driver.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-rose-100 p-2 dark:bg-rose-900/30">
                                                <User className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {driver.name}
                                                    </p>
                                                    {driver.rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium">
                                                                {driver.rating}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span>
                                                        {driver.vehicle_type} •{' '}
                                                        {driver.plate_number}
                                                    </span>
                                                    <span>
                                                        {driver.total_rides}{' '}
                                                        rides together
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
                                        >
                                            <Navigation className="mr-2 h-4 w-4" />
                                            Request Ride
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Heart className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-sm text-muted-foreground">
                                    No favorite drivers yet
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Complete rides and save your favorite
                                    drivers for quick booking
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
                        <CardDescription>
                            Places you've recently visited
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentPlaces.length > 0 ? (
                            <div className="space-y-3">
                                {recentPlaces.map((place) => (
                                    <div
                                        key={place.id}
                                        className="group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex flex-1 items-center gap-3">
                                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {place.address}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {place.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <Plus className="mr-1 h-4 w-4" />
                                            Save
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-sm text-muted-foreground">
                                    No recent places
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}
