import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import DriverLayout from '@/layouts/DriverLayout';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Bell,
    Camera,
    Car,
    Clock,
    DollarSign,
    Navigation,
    Shield,
    Star,
    TrendingDown,
    TrendingUp,
    User,
    Users,
} from 'lucide-react';
import { useEffect } from 'react';

interface PendingBooking {
    id: number;
    booking_id: string;
    passenger: {
        id: number;
        name: string;
        phone: string;
        avatar: string | null;
    };
    pickup: {
        lat: number;
        lng: number;
        address: string;
        barangay: string | null;
        purok: string | null;
    };
    destination: {
        lat: number;
        lng: number;
        address: string;
        barangay: string | null;
        purok: string | null;
    };
    ride_type: string;
    fare_type?: 'regular' | 'discounted';
    passenger_count: number;
    distance: string | null;
    duration: string | null;
    fare: number;
    total_fare: number | string;
    estimated_arrival: string | null;
    special_instructions: string | null;
    emergency_contact: {
        name: string | null;
        phone: string | null;
        relationship: string | null;
    };
    created_at: string;
}

interface DriverDashboardProps extends SharedData {
    profileComplete?: boolean;
    pendingBookings?: PendingBooking[];
    newBookingsCount?: number;
    stats?: {
        totalEarnings: number;
        completedRides: number;
        rating: number;
        weeklyRides: number;
        ridesGrowth: number;
        earningsGrowth: number;
        ratedRides: number;
    };
    recentActivity?: Array<{
        id: number;
        type: string;
        description: string;
        time: string;
        amount: number | null;
    }>;
}

export default function Dashboard() {
    const {
        profileComplete = true,
        pendingBookings = [],
        newBookingsCount = 0,
        stats: propStats,
        recentActivity: propRecentActivity = [],
    } = usePage<DriverDashboardProps>().props;

    const stats = {
        totalEarnings: propStats?.totalEarnings || 0,
        completedRides: propStats?.completedRides || 0,
        rating: propStats?.rating || 0,
        weeklyRides: propStats?.weeklyRides || 0,
        ridesGrowth: propStats?.ridesGrowth || 0,
        earningsGrowth: propStats?.earningsGrowth || 0,
        ratedRides: propStats?.ratedRides || 0,
    };

    const recentActivity = propRecentActivity;

    // Auto-refresh pending bookings so new requests appear and cancelled/no-longer-pending ones disappear
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({
                    only: ['pendingBookings', 'newBookingsCount', 'auth'],
                    preserveScroll: true,
                });
            }
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    if (!profileComplete) {
        return (
            <DriverLayout>
                <Head title="Complete Your Profile" />
                <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                    <Card className="border-amber-500/30 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/10">
                        <CardContent className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                                <User className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Complete Your Profile
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Add a profile picture and your details so
                                    passengers can recognize you. You'll get
                                    access to the full dashboard once your
                                    profile is complete.
                                </p>
                                <Link href="/DriverSide/Profile">
                                    <Button className="mt-4 gap-2 bg-amber-500 text-white hover:bg-amber-600">
                                        <Camera className="h-4 w-4" />
                                        Complete Profile Now
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DriverLayout>
        );
    }

    return (
        <DriverLayout>
            <Head title="Driver Dashboard" />

            <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                            Driver Dashboard
                        </h1>
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            Welcome back! Ready to start driving?
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="gap-1 text-xs">
                            <Shield className="h-3 w-3" />
                            Verified Driver
                        </Badge>
                        {newBookingsCount > 0 && (
                            <Link href="/driver/bookings">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 animate-pulse gap-1.5 bg-emerald-500 text-xs text-white hover:bg-emerald-600"
                                >
                                    <Bell className="h-3.5 w-3.5" />
                                    New Bookings
                                    <Badge
                                        variant="secondary"
                                        className="h-4 bg-white px-1.5 text-[10px] text-emerald-600"
                                    >
                                        {newBookingsCount}
                                    </Badge>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Pending Bookings */}
                {pendingBookings && pendingBookings.length > 0 && (
                    <Card className="border-emerald-500/30 bg-linear-to-br from-emerald-50/80 to-emerald-100/40 dark:from-emerald-500/10 dark:to-emerald-600/5">
                        <CardHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                    <div className="shrink-0 rounded-lg bg-emerald-500/10 p-1.5 sm:p-2 dark:bg-emerald-500/20">
                                        <Bell className="h-5 w-5 animate-pulse text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                                            New Booking Requests
                                            <span className="inline-flex h-5 w-5 shrink-0 animate-bounce items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                                                {pendingBookings.length}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="mt-0.5 text-xs sm:text-sm">
                                            {pendingBookings.length === 1
                                                ? '1 booking waiting'
                                                : `${pendingBookings.length} bookings waiting`}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link
                                    href="/driver/bookings"
                                    className="shrink-0"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-xs"
                                    >
                                        View All
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[400px] space-y-2 overflow-y-auto px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
                            {pendingBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="group relative rounded-lg border border-emerald-200 bg-white p-2.5 transition-colors hover:border-emerald-400 sm:p-3 dark:border-emerald-500/30 dark:bg-gray-800 dark:hover:border-emerald-500"
                                >
                                    <div className="absolute -top-0.5 -right-0.5 h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                                    <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {booking.passenger.avatar ? (
                                            <img
                                                src={booking.passenger.avatar}
                                                alt={booking.passenger.name}
                                                className="h-9 w-9 shrink-0 rounded-full border border-emerald-300 object-cover dark:border-emerald-500/40"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/20">
                                                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                    {booking.passenger.name}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className="h-4 px-1.5 py-0 font-mono text-[9px]"
                                                >
                                                    {booking.booking_id}
                                                </Badge>
                                            </div>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                                                <Badge
                                                    variant="outline"
                                                    className="h-4 border-blue-200 bg-blue-50 px-1.5 py-0 text-[9px] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                                                >
                                                    {booking.ride_type?.toUpperCase() ||
                                                        'REGULAR'}
                                                </Badge>
                                                {booking.fare_type && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`h-4 px-1.5 py-0 text-[9px] ${
                                                            booking.fare_type ===
                                                            'discounted'
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                                                                : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {booking.fare_type ===
                                                        'discounted'
                                                            ? 'SC/PWD'
                                                            : 'Regular'}
                                                    </Badge>
                                                )}
                                                <span className="max-w-[100px] truncate sm:max-w-[140px]">
                                                    {booking.pickup.address}
                                                </span>
                                                <ArrowRight className="hidden h-3 w-3 shrink-0 sm:inline" />
                                                <span className="hidden max-w-[100px] truncate sm:inline sm:max-w-[140px]">
                                                    {
                                                        booking.destination
                                                            .address
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-1 sm:px-4 sm:pt-4">
                            <CardTitle className="text-xs font-medium sm:text-sm">
                                Total Earnings
                            </CardTitle>
                            <DollarSign className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                            <div className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                                ₱
                                {stats.totalEarnings.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </div>
                            {stats.earningsGrowth !== 0 && (
                                <div
                                    className={`mt-1 flex items-center gap-1 text-[10px] sm:text-xs ${stats.earningsGrowth > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                                >
                                    {stats.earningsGrowth > 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    <span>
                                        {stats.earningsGrowth > 0 ? '+' : ''}
                                        {stats.earningsGrowth}% from last week
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-1 sm:px-4 sm:pt-4">
                            <CardTitle className="text-xs font-medium sm:text-sm">
                                Completed Rides
                            </CardTitle>
                            <Car className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                            <div className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                                {stats.completedRides}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                                {stats.weeklyRides} this week
                                {stats.ridesGrowth !== 0 && (
                                    <span
                                        className={
                                            stats.ridesGrowth > 0
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }
                                    >
                                        {' '}
                                        ({stats.ridesGrowth > 0 ? '+' : ''}
                                        {stats.ridesGrowth}%)
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 dark:border-yellow-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-1 sm:px-4 sm:pt-4">
                            <CardTitle className="text-xs font-medium sm:text-sm">
                                Rating
                            </CardTitle>
                            <Star className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
                        </CardHeader>
                        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                                    {stats.rating > 0
                                        ? stats.rating.toFixed(1)
                                        : 'N/A'}
                                </span>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${star <= Math.floor(stats.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                                {stats.ratedRides}{' '}
                                {stats.ratedRides === 1 ? 'rating' : 'ratings'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 dark:border-purple-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-1 sm:px-4 sm:pt-4">
                            <CardTitle className="text-xs font-medium sm:text-sm">
                                This Week
                            </CardTitle>
                            <Clock className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                            <div className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                                {stats.weeklyRides}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                                rides
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                    <div className="space-y-4 sm:space-y-6 lg:col-span-2">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
                                <CardTitle className="text-lg sm:text-xl">
                                    Quick Actions
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Shortcuts to frequently used pages
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
                                <Link href="/driver/bookings" className="block">
                                    <Button
                                        variant="outline"
                                        className="h-9 w-full justify-start text-sm"
                                    >
                                        <Navigation className="mr-2 h-4 w-4 shrink-0" />
                                        Bookings
                                    </Button>
                                </Link>
                                <Link href="/driver/earnings" className="block">
                                    <Button
                                        variant="outline"
                                        className="h-9 w-full justify-start text-sm"
                                    >
                                        <DollarSign className="mr-2 h-4 w-4 shrink-0" />
                                        Earnings
                                    </Button>
                                </Link>
                                <Link
                                    href="/driver/ride-history"
                                    className="block"
                                >
                                    <Button
                                        variant="outline"
                                        className="h-9 w-full justify-start text-sm"
                                    >
                                        <Clock className="mr-2 h-4 w-4 shrink-0" />
                                        Ride History
                                    </Button>
                                </Link>
                                <Link href="/driver/support" className="block">
                                    <Button
                                        variant="outline"
                                        className="h-9 w-full justify-start text-sm"
                                    >
                                        <Users className="mr-2 h-4 w-4 shrink-0" />
                                        Support
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
                                <CardTitle className="text-lg sm:text-xl">
                                    Performance
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Your driving metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-medium sm:text-sm">
                                        Acceptance Rate
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 sm:text-sm dark:text-emerald-400">
                                        98%
                                    </span>
                                </div>
                                <Progress value={98} className="h-1.5" />
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-medium sm:text-sm">
                                        Cancellation Rate
                                    </span>
                                    <span className="text-xs font-bold text-orange-600 sm:text-sm dark:text-orange-400">
                                        0%
                                    </span>
                                </div>
                                <Progress value={0} className="h-1.5" />
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-medium sm:text-sm">
                                        On-time Arrival
                                    </span>
                                    <span className="text-xs font-bold text-blue-600 sm:text-sm dark:text-blue-400">
                                        94%
                                    </span>
                                </div>
                                <Progress value={94} className="h-1.5" />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
                                <CardTitle className="text-lg sm:text-xl">
                                    Recent Activity
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Latest rides and updates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
                                {recentActivity.length > 0 ? (
                                    <div className="space-y-2">
                                        {recentActivity.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-start gap-2 rounded-lg border border-gray-200 p-2.5 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                                            >
                                                <div
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                                        activity.type === 'ride'
                                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                                                            : activity.type ===
                                                                'rating'
                                                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                    }`}
                                                >
                                                    {activity.type ===
                                                        'ride' && (
                                                        <Car className="h-3.5 w-3.5" />
                                                    )}
                                                    {activity.type ===
                                                        'rating' && (
                                                        <Star className="h-3.5 w-3.5" />
                                                    )}
                                                    {activity.type ===
                                                        'earning' && (
                                                        <DollarSign className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                                                        {activity.description}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                                                        {activity.time}
                                                    </p>
                                                </div>
                                                {activity.amount != null && (
                                                    <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                        +₱{activity.amount}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-xs text-muted-foreground sm:text-sm">
                                        No recent activity
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card>
                            <CardHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6">
                                <CardTitle className="text-lg sm:text-xl">
                                    Achievements
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Driver milestones
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
                                <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/50">
                                    <Award className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium sm:text-sm">
                                            50 Rides
                                        </p>
                                        <p className="text-[10px] text-muted-foreground sm:text-xs">
                                            Complete 50 rides
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="shrink-0 px-1.5 py-0 text-[10px]"
                                    >
                                        2 more
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/50">
                                    <Star className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium sm:text-sm">
                                            5-Star Rating
                                        </p>
                                        <p className="text-[10px] text-muted-foreground sm:text-xs">
                                            Maintain 5.0 for a week
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="shrink-0 px-1.5 py-0 text-[10px]"
                                    >
                                        In progress
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
