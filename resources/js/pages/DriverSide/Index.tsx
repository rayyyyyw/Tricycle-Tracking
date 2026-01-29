import DriverLayout from '@/layouts/DriverLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { 
    TrendingUp,
    TrendingDown,
    Car, 
    Star, 
    Clock, 
    DollarSign, 
    Users, 
    Award,
    Shield,
    Bell,
    Navigation,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type SharedData } from '@/types';

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
        pendingBookings = [], 
        newBookingsCount = 0,
        stats: propStats,
        recentActivity: propRecentActivity = []
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

    return (
        <DriverLayout>
            <Head title="Driver Dashboard" />
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Welcome back! Ready to start driving?</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs gap-1">
                            <Shield className="w-3 h-3" />
                            Verified Driver
                        </Badge>
                        {newBookingsCount > 0 && (
                            <Link href="/driver/bookings">
                                <Button variant="default" size="sm" className="h-8 text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse">
                                    <Bell className="w-3.5 h-3.5" />
                                    New Bookings
                                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-white text-emerald-600">
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
                        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <div className="p-1.5 sm:p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg shrink-0">
                                        <Bell className="w-5 h-5 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            New Booking Requests
                                            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-emerald-500 rounded-full animate-bounce shrink-0">
                                                {pendingBookings.length}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="text-xs sm:text-sm mt-0.5">
                                            {pendingBookings.length === 1 ? '1 booking waiting' : `${pendingBookings.length} bookings waiting`}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link href="/driver/bookings" className="shrink-0">
                                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                                        View All
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-2 max-h-[400px] overflow-y-auto">
                            {pendingBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="group relative p-2.5 sm:p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
                                >
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {booking.passenger.avatar ? (
                                            <img src={booking.passenger.avatar} alt={booking.passenger.name} className="w-9 h-9 rounded-full border border-emerald-300 dark:border-emerald-500/40 object-cover shrink-0" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center shrink-0">
                                                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{booking.passenger.name}</h3>
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono h-4">{booking.booking_id}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground flex-wrap mt-0.5">
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300">
                                                    {booking.ride_type?.toUpperCase() || 'REGULAR'}
                                                </Badge>
                                                <span className="truncate max-w-[100px] sm:max-w-[140px]">{booking.pickup.address}</span>
                                                <ArrowRight className="w-3 h-3 shrink-0 hidden sm:inline" />
                                                <span className="truncate max-w-[100px] sm:max-w-[140px] hidden sm:inline">{booking.destination.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 sm:pt-4 px-3 sm:px-4">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Earnings</CardTitle>
                            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </CardHeader>
                        <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">₱{stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            {stats.earningsGrowth !== 0 && (
                                <div className={`flex items-center gap-1 text-[10px] sm:text-xs mt-1 ${stats.earningsGrowth > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {stats.earningsGrowth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    <span>{stats.earningsGrowth > 0 ? '+' : ''}{stats.earningsGrowth}% from last week</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 sm:pt-4 px-3 sm:px-4">
                            <CardTitle className="text-xs sm:text-sm font-medium">Completed Rides</CardTitle>
                            <Car className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        </CardHeader>
                        <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.completedRides}</div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                                {stats.weeklyRides} this week
                                {stats.ridesGrowth !== 0 && (
                                    <span className={stats.ridesGrowth > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}> ({stats.ridesGrowth > 0 ? '+' : ''}{stats.ridesGrowth}%)</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 dark:border-yellow-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 sm:pt-4 px-3 sm:px-4">
                            <CardTitle className="text-xs sm:text-sm font-medium">Rating</CardTitle>
                            <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                        </CardHeader>
                        <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}</span>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${star <= Math.floor(stats.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stats.ratedRides} {stats.ratedRides === 1 ? 'rating' : 'ratings'}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 dark:border-purple-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 sm:pt-4 px-3 sm:px-4">
                            <CardTitle className="text-xs sm:text-sm font-medium">This Week</CardTitle>
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        </CardHeader>
                        <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.weeklyRides}</div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">rides</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Shortcuts to frequently used pages</CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-2">
                                <Link href="/driver/bookings" className="block">
                                    <Button variant="outline" className="w-full justify-start h-9 text-sm">
                                        <Navigation className="w-4 h-4 mr-2 shrink-0" />
                                        Bookings
                                    </Button>
                                </Link>
                                <Link href="/driver/earnings" className="block">
                                    <Button variant="outline" className="w-full justify-start h-9 text-sm">
                                        <DollarSign className="w-4 h-4 mr-2 shrink-0" />
                                        Earnings
                                    </Button>
                                </Link>
                                <Link href="/driver/ride-history" className="block">
                                    <Button variant="outline" className="w-full justify-start h-9 text-sm">
                                        <Clock className="w-4 h-4 mr-2 shrink-0" />
                                        Ride History
                                    </Button>
                                </Link>
                                <Link href="/driver/support" className="block">
                                    <Button variant="outline" className="w-full justify-start h-9 text-sm">
                                        <Users className="w-4 h-4 mr-2 shrink-0" />
                                        Support
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="text-lg sm:text-xl">Performance</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Your driving metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-3">
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-xs sm:text-sm font-medium">Acceptance Rate</span>
                                    <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">98%</span>
                                </div>
                                <Progress value={98} className="h-1.5" />
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-xs sm:text-sm font-medium">Cancellation Rate</span>
                                    <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400">0%</span>
                                </div>
                                <Progress value={0} className="h-1.5" />
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-xs sm:text-sm font-medium">On-time Arrival</span>
                                    <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">94%</span>
                                </div>
                                <Progress value={94} className="h-1.5" />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Latest rides and updates</CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                                {recentActivity.length > 0 ? (
                                    <div className="space-y-2">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                                    activity.type === 'ride' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                                                    activity.type === 'rating' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400' :
                                                    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    {activity.type === 'ride' && <Car className="w-3.5 h-3.5" />}
                                                    {activity.type === 'rating' && <Star className="w-3.5 h-3.5" />}
                                                    {activity.type === 'earning' && <DollarSign className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{activity.description}</p>
                                                    <p className="text-[10px] sm:text-xs text-muted-foreground">{activity.time}</p>
                                                </div>
                                                {activity.amount != null && (
                                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">+₱{activity.amount}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-xs sm:text-sm text-muted-foreground">No recent activity</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card>
                            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="text-lg sm:text-xl">Achievements</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Driver milestones</CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-2">
                                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium">50 Rides</p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">Complete 50 rides</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">2 more</Badge>
                                </div>
                                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium">5-Star Rating</p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">Maintain 5.0 for a week</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">In progress</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}