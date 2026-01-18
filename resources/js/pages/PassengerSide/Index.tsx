import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Clock, 
    Star, 
    ArrowUpRight, 
    Calendar,
    Navigation,
    Wallet,
    History,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { type SharedData } from '@/types';
import RatingDisplay from '@/components/RatingDisplay';

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
}

export default function Index() {
    const { auth, stats, recentRides = [], favoriteDrivers = [] } = usePage<SharedData & DashboardProps>().props;

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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {auth.user.name}!
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Here's your travel overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Rides</CardTitle>
                        <Navigation className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalRides || 0}</div>
                        {stats?.ridesGrowth !== undefined && stats.ridesGrowth !== 0 && (
                            <div className={`flex items-center gap-1 text-[10px] sm:text-xs mt-1 ${
                                stats.ridesGrowth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                                {stats.ridesGrowth > 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                <span>{Math.abs(stats.ridesGrowth)}% from last month</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Spent</CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            ₱{(stats?.totalSpent || 0).toFixed(2)}
                        </div>
                        {stats?.spendingGrowth !== undefined && stats.spendingGrowth !== 0 && (
                            <div className={`flex items-center gap-1 text-[10px] sm:text-xs mt-1 ${
                                stats.spendingGrowth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                                {stats.spendingGrowth > 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                <span>{Math.abs(stats.spendingGrowth)}% from last month</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                        <CardTitle className="text-xs sm:text-sm font-medium">Avg. Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {stats?.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            {stats?.reviewedRides || 0} reviewed rides
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
                        <CardTitle className="text-xs sm:text-sm font-medium">Time Saved</CardTitle>
                        <Clock className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {formatTimeSaved(stats?.totalTimeSaved || 0)}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Compared to walking</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Recent Rides */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg sm:text-xl">Recent Rides</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Your last 5 tricycle rides</CardDescription>
                            </div>
                            {recentRides && recentRides.length > 0 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => router.visit('/passenger/ride-history')}
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
                                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                        onClick={() => router.visit('/passenger/ride-history')}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                                                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {ride.pickup_address} → {ride.destination_address}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">{formatDate(ride.completed_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">
                                                ₱{ride.total_fare.toFixed(2)}
                                            </p>
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 mt-1">
                                                {ride.booking_id}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No rides yet</p>
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

                {/* Quick Actions & Favorite Drivers */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
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
                                onClick={() => router.visit('/passenger/ride-history')}
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
                                onClick={() => router.visit('/PassengerSide/profile')}
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
                                <CardTitle className="text-lg sm:text-xl">Favorite Drivers</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Your top rated drivers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {favoriteDrivers.map((driver) => (
                                        <div 
                                            key={driver.id} 
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {driver.avatar ? (
                                                    <img 
                                                        src={driver.avatar} 
                                                        alt={driver.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200 dark:border-emerald-700 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700 flex items-center justify-center shrink-0">
                                                        <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {driver.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <RatingDisplay rating={driver.rating} size="sm" />
                                                        <span className="text-xs text-muted-foreground">
                                                            ({driver.rides} {driver.rides === 1 ? 'ride' : 'rides'})
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
