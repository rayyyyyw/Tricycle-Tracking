import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PassengerLayout from '@/layouts/PassengerLayout';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Clock,
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
    barangay?: string | null;
    purok?: string | null;
    timestamp: string;
}

interface BarangayOption {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

interface PageProps extends SharedData {
    savedPlaces: SavedPlace[];
    favoriteDrivers: FavoriteDriver[];
    driversFromRides: FavoriteDriver[];
    recentPlaces: RecentPlace[];
    barangays: BarangayOption[];
}

const PLACE_TYPES = [
    { value: 'home', label: 'Home', icon: 'Home' },
    { value: 'school', label: 'School', icon: 'School' },
    { value: 'work', label: 'Work', icon: 'Briefcase' },
    { value: 'other', label: 'Other', icon: 'MapPin' },
] as const;

export default function SavedPlaces() {
    const { savedPlaces, favoriteDrivers, driversFromRides = [], recentPlaces, barangays = [] } =
        usePage<PageProps>().props;

    const [addPlaceOpen, setAddPlaceOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);
    const [placeForm, setPlaceForm] = useState({
        type: 'home' as 'home' | 'school' | 'work' | 'other',
        name: '',
        barangay_id: '',
        address: '',
        purok: '',
        is_primary: false,
    });

    const openAddPlace = (fromRecent?: RecentPlace) => {
        const barangayId = fromRecent?.barangay
            ? barangays.find((b) => b.name === fromRecent.barangay)?.id ?? ''
            : '';
        setPlaceForm({
            type: 'other',
            name: fromRecent?.address?.split(',')[0]?.trim() || '',
            barangay_id: barangayId,
            address: fromRecent?.address || '',
            purok: fromRecent?.purok || '',
            is_primary: false,
        });
        setEditingPlace(null);
        setAddPlaceOpen(true);
    };

    const openEditPlace = (place: SavedPlace) => {
        setEditingPlace(place);
        const barangayId = place.barangay ? barangays.find((b) => b.name === place.barangay)?.id ?? '' : '';
        setPlaceForm({
            type: (place.type as 'home' | 'school' | 'work' | 'other') || 'other',
            name: place.name,
            barangay_id: barangayId,
            address: place.address,
            purok: place.purok || '',
            is_primary: place.is_primary,
        });
        setAddPlaceOpen(true);
    };

    const closePlaceDialog = () => {
        setAddPlaceOpen(false);
        setEditingPlace(null);
    };

    const submitPlace = (e: React.FormEvent) => {
        e.preventDefault();
        if (!placeForm.barangay_id) return;
        if (editingPlace) {
            router.put(`/passenger/saved-places/${editingPlace.id}`, {
                ...placeForm,
                is_primary: placeForm.is_primary,
            });
        } else {
            router.post('/passenger/saved-places', {
                ...placeForm,
                is_primary: placeForm.is_primary,
            });
        }
        closePlaceDialog();
    };

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

            <div className="space-y-6 px-3 py-4 sm:px-0 sm:py-0">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl dark:text-white">
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
                            <Button variant="outline" size="sm" onClick={() => openAddPlace()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Place
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {savedPlaces.length > 0 ? (
                            <div className="space-y-3">
                                {savedPlaces.map((place) => {
                                    const IconComponent = getPlaceIcon(place.type);
                                    const designationLabel = place.type === 'home' ? 'Home' : place.type === 'school' ? 'School' : place.type === 'work' ? 'Work' : 'Other';
                                    return (
                                        <div
                                            key={place.id}
                                            className="group flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20 sm:flex-row sm:items-center"
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                                    <IconComponent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-foreground">
                                                        {place.name}
                                                    </p>
                                                    <p className="mt-0.5 text-sm text-muted-foreground wrap-break-word">
                                                        {place.address}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                        <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                            {designationLabel}
                                                        </span>
                                                        {place.purok && (
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                                {place.purok}
                                                            </span>
                                                        )}
                                                        {place.barangay && (
                                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                                {place.barangay}
                                                            </span>
                                                        )}
                                                        {place.is_primary && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Primary
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1 border-t border-emerald-200 pt-3 dark:border-emerald-800 sm:border-t-0 sm:pt-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-foreground"
                                                    onClick={() => openEditPlace(place)}
                                                >
                                                    Change
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Remove this saved place?')) {
                                                            router.delete(`/passenger/saved-places/${place.id}`);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                                <Button className="mt-4" variant="outline" onClick={() => openAddPlace()}>
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
                                        className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            {driver.avatar ? (
                                                <img
                                                    src={driver.avatar}
                                                    alt={driver.name}
                                                    className="h-12 w-12 shrink-0 rounded-full border-2 border-border object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                                                    <User className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">
                                                        {driver.name}
                                                    </p>
                                                    {driver.rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium">
                                                                {driver.rating}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
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
                                        <div className="flex shrink-0 items-center gap-2 sm:shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 sm:flex-none"
                                                onClick={() => router.visit('/BookRide')}
                                            >
                                                <Navigation className="mr-2 h-4 w-4" />
                                                Request Ride
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 text-muted-foreground hover:text-red-600"
                                                onClick={() => {
                                                    if (confirm('Remove this driver from favorites?')) {
                                                        router.delete(`/passenger/favorite-drivers/${driver.id}`);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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

                {/* Drivers from your rides - add to favorites */}
                {driversFromRides.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Drivers from your rides
                            </CardTitle>
                            <CardDescription>
                                Add drivers you’ve ridden with to your favorites for quick booking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {driversFromRides.map((driver) => (
                                    <div
                                        key={driver.id}
                                        className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            {driver.avatar ? (
                                                <img
                                                    src={driver.avatar}
                                                    alt={driver.name}
                                                    className="h-12 w-12 shrink-0 rounded-full border-2 border-border object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium">{driver.name}</p>
                                                    {driver.rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm font-medium">{driver.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                                                    <span>{driver.vehicle_type} • {driver.plate_number}</span>
                                                    <span>{driver.total_rides} rides together</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => router.post(`/passenger/favorite-drivers/${driver.id}`)}
                                            className="w-full shrink-0 sm:w-auto bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
                                        >
                                            <Heart className="mr-2 h-4 w-4" />
                                            Add to favorites
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                        className="group flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                                            <div className="shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-foreground wrap-break-word">
                                                    {place.address}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {place.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full shrink-0 sm:w-auto opacity-100 transition-opacity group-hover:opacity-100 sm:opacity-0"
                                            onClick={() => openAddPlace(place)}
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

            {/* Add / Edit Saved Place dialog */}
            <Dialog open={addPlaceOpen} onOpenChange={(open) => !open && closePlaceDialog()}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-md p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{editingPlace ? 'Edit place' : 'Add saved place'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitPlace}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Label</Label>
                                <Select
                                    value={placeForm.type}
                                    onValueChange={(v) => setPlaceForm((f) => ({ ...f, type: v as typeof f.type }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLACE_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="place-name">Name (e.g. Home, School)</Label>
                                <Input
                                    id="place-name"
                                    value={placeForm.name}
                                    onChange={(e) => setPlaceForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="My home"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Barangay (13 barangays)</Label>
                                <Select
                                    value={placeForm.barangay_id}
                                    onValueChange={(v) => setPlaceForm((f) => ({ ...f, barangay_id: v }))}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select barangay" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {barangays.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="place-address">Address (optional)</Label>
                                <Input
                                    id="place-address"
                                    value={placeForm.address}
                                    onChange={(e) => setPlaceForm((f) => ({ ...f, address: e.target.value }))}
                                    placeholder="Street, purok, or landmark"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="place-purok">Purok (optional)</Label>
                                <Input
                                    id="place-purok"
                                    value={placeForm.purok}
                                    onChange={(e) => setPlaceForm((f) => ({ ...f, purok: e.target.value }))}
                                    placeholder="e.g. Purok 1"
                                />
                            </div>
                            {!editingPlace && (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="place-primary"
                                        checked={placeForm.is_primary}
                                        onCheckedChange={(checked) => setPlaceForm((f) => ({ ...f, is_primary: !!checked }))}
                                    />
                                    <Label htmlFor="place-primary" className="font-normal cursor-pointer">
                                        Set as primary address
                                    </Label>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closePlaceDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!placeForm.barangay_id || !placeForm.name.trim()}>
                                {editingPlace ? 'Update' : 'Save place'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PassengerLayout>
    );
}
