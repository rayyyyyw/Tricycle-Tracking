import RatingDisplay from '@/components/RatingDisplay';
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
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Calendar,
    Car,
    Clock,
    History,
    MapPin,
    Navigation,
    Star,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect } from 'react';

interface RecentRide {
    id: number;
    booking_id: string;
    pickup_address: string;
    destination_address: string;
    total_fare: number;
    completed_at: string;
}

interface FavoriteDriver {
    id: number;
    name: string;
    avatar: string | null;
    rides: number;
    rating: number;
}

interface OnlineDriver {
    id: number;
    name: string;
    avatar: string | null;
    vehicle_plate: string;
    vehicle_type: string;
    is_online: boolean;
    has_active_booking: boolean;
}

interface ActiveBooking {
    id: number;
    booking_id: string;
    status: 'pending' | 'accepted' | 'in_progress';
    pickup_address: string;
    destination_address: string;
    driver_name: string | null;
    total_fare: number;
}

interface DashboardProps {
    stats: {
        totalRides: number;
        totalSpent: number;
        averageRating: number;
        totalTimeSaved: number;
        ridesGrowth: number;
        spendingGrowth: number;
        reviewedRides: number;
    };
    recentRides: RecentRide[];
    favoriteDrivers: FavoriteDriver[];
    onlineDrivers: OnlineDriver[];
    activeBooking?: ActiveBooking | null;
}

export default function Index() {
    const {
        auth,
        stats,
        recentRides = [],
        favoriteDrivers = [],
        onlineDrivers = [],
        activeBooking = null,
    } = usePage<SharedData & DashboardProps>().props;

    // Auto-refresh when there's an active ride so the card updates when driver completes or cancels
    const ACTIVE_RIDE_POLL_MS = 5000;
    useEffect(() => {
        if (!activeBooking) return;
        const interval = setInterval(() => {
            if (
                typeof document !== 'undefined' &&
                document.visibilityState === 'visible'
            ) {
                router.reload();
            }
        }, ACTIVE_RIDE_POLL_MS);
        return () => clearInterval(interval);
    }, [activeBooking]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        if (diffInDays === 1) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        }
        if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year:
                date.getFullYear() !== now.getFullYear()
                    ? 'numeric'
                    : undefined,
        });
    };

    const formatTimeSaved = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <PassengerLayout>
            <Head title="Dashboard" />

            {/* Dashboard Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                    Welcome back, {auth.user.name}!
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Here's your travel overview
                </p>
            </div>

            {/* Active Ride card – quick entry back to confirmation/chat */}
            {activeBooking && (
                <Card className="mb-6 border-2 border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-950/20">
                    <CardHeader className="pb-2 sm:pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                    <Car className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="flex flex-wrap items-center gap-2 text-base text-gray-900 sm:text-lg dark:text-white">
                                        You have an active ride
                                        <Badge
                                            variant="secondary"
                                            className={
                                                activeBooking.status ===
                                                'pending'
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200'
                                                    : activeBooking.status ===
                                                        'accepted'
                                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200'
                                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
                                            }
                                        >
                                            {activeBooking.status === 'pending'
                                                ? 'Waiting for driver'
                                                : activeBooking.status ===
                                                    'accepted'
                                                  ? 'Driver accepted'
                                                  : 'In progress'}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs sm:text-sm">
                                        <span className="line-clamp-2 wrap-break-word">
                                            {activeBooking.pickup_address}
                                        </span>
                                        <ArrowRight className="my-1 inline-block h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span className="line-clamp-2 wrap-break-word">
                                            {activeBooking.destination_address}
                                        </span>
                                        {activeBooking.driver_name && (
                                            <span className="mt-1 block text-emerald-700 dark:text-emerald-300">
                                                Driver:{' '}
                                                {activeBooking.driver_name}
                                            </span>
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                                <p className="text-right text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    ₱{activeBooking.total_fare.toFixed(2)}
                                </p>
                                <Button
                                    onClick={() => router.visit('/BookRide')}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                                >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    View ride
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
                        <CardTitle className="text-xs font-medium sm:text-sm">
                            Total Rides
                        </CardTitle>
                        <Navigation className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                        <div className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            {stats?.totalRides || 0}
                        </div>
                        {stats?.ridesGrowth !== undefined &&
                            stats.ridesGrowth !== 0 && (
                                <div
                                    className={`mt-1 flex items-center gap-1 text-[10px] sm:text-xs ${
                                        stats.ridesGrowth > 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}
                                >
                                    {stats.ridesGrowth > 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    <span>
                                        {Math.abs(stats.ridesGrowth)}% from last
                                        month
                                    </span>
                                </div>
                            )}
                    </CardContent>
                </Card>

                <Card className="border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
                        <CardTitle className="text-xs font-medium sm:text-sm">
                            Total Spent
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                        <div className="text-xl font-bold text-emerald-600 sm:text-2xl dark:text-emerald-400">
                            ₱{(stats?.totalSpent || 0).toFixed(2)}
                        </div>
                        {stats?.spendingGrowth !== undefined &&
                            stats.spendingGrowth !== 0 && (
                                <div
                                    className={`mt-1 flex items-center gap-1 text-[10px] sm:text-xs ${
                                        stats.spendingGrowth > 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                    }`}
                                >
                                    {stats.spendingGrowth > 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    <span>
                                        {Math.abs(stats.spendingGrowth)}% from
                                        last month
                                    </span>
                                </div>
                            )}
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
                        <CardTitle className="text-xs font-medium sm:text-sm">
                            Avg. Rating
                        </CardTitle>
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                        <div className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            {stats?.averageRating > 0
                                ? stats.averageRating.toFixed(1)
                                : 'N/A'}
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                            {stats?.reviewedRides || 0} reviewed rides
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-2 sm:px-4 sm:pt-4">
                        <CardTitle className="text-xs font-medium sm:text-sm">
                            Time Saved
                        </CardTitle>
                        <Clock className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                        <div className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            {formatTimeSaved(stats?.totalTimeSaved || 0)}
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                            Compared to walking
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                {/* Recent Rides */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg sm:text-xl">
                                    Recent Rides
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Your last 5 tricycle rides
                                </CardDescription>
                            </div>
                            {recentRides && recentRides.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        router.visit('/passenger/ride-history')
                                    }
                                    className="text-xs"
                                >
                                    View All
                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentRides && recentRides.length > 0 ? (
                            <div className="space-y-2">
                                {recentRides.map((ride) => (
                                    <div
                                        key={ride.id}
                                        className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                                        onClick={() =>
                                            router.visit(
                                                '/passenger/ride-history',
                                            )
                                        }
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div className="shrink-0 rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                                                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                    {ride.pickup_address} →{' '}
                                                    {ride.destination_address}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(
                                                            ride.completed_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-3 shrink-0 text-right">
                                            <p className="text-sm font-semibold text-emerald-600 sm:text-base dark:text-emerald-400">
                                                ₱{ride.total_fare.toFixed(2)}
                                            </p>
                                            <Badge
                                                variant="secondary"
                                                className="mt-1 px-1.5 py-0 text-[9px]"
                                            >
                                                {ride.booking_id}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Navigation className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-sm text-muted-foreground">
                                    No rides yet
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={() => router.visit('/BookRide')}
                                >
                                    Book Your First Ride
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions, Online Drivers & Favorite Drivers */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Drivers available now */}
                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                </span>
                                Drivers available now
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                {onlineDrivers.length > 0
                                    ? `${onlineDrivers.length} driver${onlineDrivers.length === 1 ? '' : 's'} online · Green = available, amber = on a ride`
                                    : 'No drivers online. Check back soon!'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {onlineDrivers.length > 0 ? (
                                <div className="space-y-2">
                                    {onlineDrivers.map((driver) => {
                                        const busy = driver.has_active_booking;
                                        return (
                                            <div
                                                key={driver.id}
                                                className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg border p-2.5 ${
                                                    busy
                                                        ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/30'
                                                        : 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30'
                                                }`}
                                            >
                                                <div className="relative shrink-0">
                                                    {driver.avatar ? (
                                                        <img
                                                            src={driver.avatar}
                                                            alt={driver.name}
                                                            className={`h-10 w-10 rounded-full border-2 object-cover ${
                                                                busy
                                                                    ? 'border-amber-300 dark:border-amber-600'
                                                                    : 'border-emerald-200 dark:border-emerald-700'
                                                            }`}
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                                                busy
                                                                    ? 'border-amber-300 bg-amber-100 dark:border-amber-600 dark:bg-amber-900/50'
                                                                    : 'border-emerald-200 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/50'
                                                            }`}
                                                        >
                                                            <Car
                                                                className={`h-5 w-5 ${busy ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                                            />
                                                        </div>
                                                    )}
                                                    <span
                                                        className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                                                            busy
                                                                ? 'bg-amber-500'
                                                                : 'bg-emerald-500'
                                                        }`}
                                                        title={
                                                            busy
                                                                ? 'On a ride'
                                                                : 'Online'
                                                        }
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                            {driver.name}
                                                        </p>
                                                        <span
                                                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                                                busy
                                                                    ? 'bg-amber-200/80 text-amber-800 dark:bg-amber-500/30 dark:text-amber-200'
                                                                    : 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-200'
                                                            }`}
                                                        >
                                                            {busy
                                                                ? 'On a ride'
                                                                : 'Online'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                        {driver.vehicle_type} ·{' '}
                                                        {driver.vehicle_plate}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <Car className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
                                    <p className="text-xs text-muted-foreground">
                                        No drivers online right now.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() =>
                                            router.visit('/BookRide')
                                        }
                                    >
                                        Book a ride anyway
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg sm:text-xl">
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={() => router.visit('/BookRide')}
                            >
                                <MapPin className="mr-2 h-4 w-4" />
                                Book New Ride
                            </Button>
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={() =>
                                    router.visit('/passenger/ride-history')
                                }
                            >
                                <History className="mr-2 h-4 w-4" />
                                Ride History
                            </Button>
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={() => {
                                    // Find rides without reviews and navigate to ride history
                                    router.visit('/passenger/ride-history');
                                }}
                            >
                                <Star className="mr-2 h-4 w-4" />
                                Rate Drivers
                            </Button>
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                onClick={() =>
                                    router.visit('/PassengerSide/profile')
                                }
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                View Profile
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Favorite Drivers */}
                    {favoriteDrivers && favoriteDrivers.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg sm:text-xl">
                                    Favorite Drivers
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Your top rated drivers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {favoriteDrivers.map((driver) => (
                                        <div
                                            key={driver.id}
                                            className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                {driver.avatar ? (
                                                    <img
                                                        src={driver.avatar}
                                                        alt={driver.name}
                                                        className="h-10 w-10 shrink-0 rounded-full border-2 border-emerald-200 object-cover dark:border-emerald-700"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30">
                                                        <Navigation className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                        {driver.name}
                                                    </p>
                                                    <div className="mt-0.5 flex items-center gap-2">
                                                        <RatingDisplay
                                                            rating={
                                                                driver.rating
                                                            }
                                                            size="sm"
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            ({driver.rides}{' '}
                                                            {driver.rides === 1
                                                                ? 'ride'
                                                                : 'rides'}
                                                            )
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PassengerLayout>
    );
}
