import DriverLayout from '@/layouts/DriverLayout';
import { Head, usePage, router } from '@inertiajs/react';
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
    MapPin,
    Phone,
    CheckCircle,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import BookingController from '@/actions/App/Http/Controllers/BookingController';
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
    const [acceptingBookingId, setAcceptingBookingId] = useState<number | null>(null);
    
    // Use real stats from backend, fallback to defaults if not available
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

    const quickActions = [
        { icon: <Navigation className="w-5 h-5" />, label: 'Go Online', color: 'bg-emerald-600 hover:bg-emerald-700' },
        { icon: <DollarSign className="w-5 h-5" />, label: 'View Earnings', color: 'bg-blue-600 hover:bg-blue-700' },
        { icon: <Clock className="w-5 h-5" />, label: 'Ride History', color: 'bg-purple-600 hover:bg-purple-700' },
        { icon: <Users className="w-5 h-5" />, label: 'Support', color: 'bg-orange-600 hover:bg-orange-700' },
    ];

    // Helper to get CSRF token
    const getCsrfToken = () => {
        // Try meta tag first
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (metaToken) {
            return metaToken;
        }
        
        // Fallback to cookie
        const name = 'XSRF-TOKEN';
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) {
                return decodeURIComponent(value);
            }
        }
        return '';
    };

    const handleAcceptBooking = async (bookingId: number) => {
        setAcceptingBookingId(bookingId);
        try {
            const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const cookieToken = getCsrfToken();
            // Kept for future API calls
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _csrfToken = metaToken || cookieToken;
            
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            };
            
            if (metaToken) {
                headers['X-CSRF-TOKEN'] = metaToken;
            } else {
                headers['X-XSRF-TOKEN'] = cookieToken;
            }
            
            const response = await fetch(BookingController.accept.url({ booking: bookingId }), {
                method: 'POST',
                headers,
                credentials: 'same-origin',
            });

            if (response.ok) {
                // Reload the page to refresh bookings
                router.reload();
            } else {
                console.error('Failed to accept booking');
            }
        } catch (error) {
            console.error('Error accepting booking:', error);
        } finally {
            setAcceptingBookingId(null);
        }
    };

    // Kept for future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };


    return (
        <DriverLayout>
            <Head title="Driver Dashboard" />
            
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Welcome back! Ready to start driving?
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified Driver
                        </Badge>
                        {newBookingsCount > 0 && (
                            <Link href="/driver/bookings">
                                <Button variant="default" size="sm" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse">
                                    <Bell className="w-4 h-4" />
                                    New Bookings
                                    <Badge variant="secondary" className="ml-1 bg-white text-emerald-600">
                                        {newBookingsCount}
                                    </Badge>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Pending Bookings Section - Always show full details */}
                {pendingBookings && pendingBookings.length > 0 && (
                    <Card className="border-emerald-500/30 bg-linear-to-br from-emerald-50/80 to-emerald-100/40 dark:from-emerald-500/10 dark:to-emerald-600/5 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                                        <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            New Booking Requests
                                            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-emerald-500 rounded-full animate-bounce">
                                                {pendingBookings.length}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="text-sm mt-1">
                                            {pendingBookings.length === 1 
                                                ? '1 booking waiting for your acceptance' 
                                                : `${pendingBookings.length} bookings waiting for acceptance`}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link href="/driver/bookings">
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        View All Bookings
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                            {pendingBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="group relative p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-400 dark:hover:border-emerald-500"
                                >
                                    {/* Pulse indicator for new bookings */}
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
                                    
                                    <div className="flex items-center gap-3">
                                        {/* Passenger Avatar */}
                                        <div className="shrink-0">
                                            {booking.passenger.avatar ? (
                                                <img 
                                                    src={booking.passenger.avatar} 
                                                    alt={booking.passenger.name}
                                                    className="w-10 h-10 rounded-full border-2 border-emerald-300 dark:border-emerald-500/40 object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Booking Info - Compact */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                    {booking.passenger.name}
                                                </h3>
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono h-4">
                                                    {booking.booking_id}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300">
                                                    {booking.ride_type?.toUpperCase() || 'REGULAR'}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-emerald-600" />
                                                    <span className="truncate max-w-[120px]">{booking.pickup.address}</span>
                                                </div>
                                                <ArrowRight className="w-3 h-3 shrink-0" />
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-blue-600" />
                                                    <span className="truncate max-w-[120px]">{booking.destination.address}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons - Compact */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                onClick={() => handleAcceptBooking(booking.id)}
                                                disabled={acceptingBookingId === booking.id}
                                                size="sm"
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs font-semibold disabled:opacity-50"
                                            >
                                                {acceptingBookingId === booking.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                        Accept
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-2 border"
                                                onClick={() => window.open(`tel:${booking.passenger.phone}`)}
                                                title="Call passenger"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Earnings */}
                    <Card className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            {stats.earningsGrowth !== 0 && (
                                <div className={`flex items-center text-xs mt-1 ${
                                    stats.earningsGrowth > 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                    {stats.earningsGrowth > 0 ? (
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 mr-1" />
                                    )}
                                    {stats.earningsGrowth > 0 ? '+' : ''}{stats.earningsGrowth}% from last week
                                </div>
                            )}
                            {stats.completedRides > 0 && (
                                <Progress value={Math.min((stats.completedRides / 100) * 100, 100)} className="mt-2" />
                            )}
                        </CardContent>
                    </Card>

                    {/* Completed Rides */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
                            <Car className="w-4 h-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completedRides}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.weeklyRides} this week
                                {stats.ridesGrowth !== 0 && (
                                    <span className={`ml-1 ${stats.ridesGrowth > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        ({stats.ridesGrowth > 0 ? '+' : ''}{stats.ridesGrowth}%)
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Rating */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rating</CardTitle>
                            <Star className="w-4 h-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold">
                                    {stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
                                </div>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${
                                                star <= Math.floor(stats.rating)
                                                    ? 'text-yellow-500 fill-yellow-500'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Based on {stats.ratedRides} {stats.ratedRides === 1 ? 'rating' : 'ratings'}
                            </p>
                        </CardContent>
                    </Card>

                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Quick Actions & Performance */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Frequently used actions and shortcuts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {quickActions.map((action, index) => (
                                        <Button
                                            key={index}
                                            className={`h-20 flex flex-col gap-2 ${action.color} text-white transition-all hover:scale-105`}
                                        >
                                            {action.icon}
                                            <span className="text-sm">{action.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>
                                    Your driving performance overview
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Acceptance Rate</span>
                                    <span className="text-sm font-bold text-emerald-600">98%</span>
                                </div>
                                <Progress value={98} className="w-full" />

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Cancellation Rate</span>
                                    <span className="text-sm font-bold text-orange-600">0%</span>
                                </div>
                                <Progress value={0} className="w-full" />

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">On-time Arrival</span>
                                    <span className="text-sm font-bold text-blue-600">94%</span>
                                </div>
                                <Progress value={94} className="w-full" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Recent Activity & Achievements */}
                    <div className="space-y-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Your latest rides and updates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activity.type === 'ride' ? 'bg-blue-100 text-blue-600' :
                                            activity.type === 'rating' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {activity.type === 'ride' && <Car className="w-4 h-4" />}
                                            {activity.type === 'rating' && <Star className="w-4 h-4" />}
                                            {activity.type === 'earning' && <DollarSign className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                        {activity.amount && (
                                            <div className="text-sm font-bold text-emerald-600">
                                                +₱{activity.amount}
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                        No recent activity
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Achievements</CardTitle>
                                <CardDescription>
                                    Your driver milestones
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-medium">50 Rides</p>
                                        <p className="text-xs text-muted-foreground">Complete 50 rides</p>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto">2 more</Badge>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                                    <Star className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-medium">5-Star Rating</p>
                                        <p className="text-xs text-muted-foreground">Maintain 5.0 for a week</p>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto">In Progress</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Section - Weekly Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Overview</CardTitle>
                        <CardDescription>
                            Your performance for the current week
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">{stats.weeklyRides}</div>
                                <div className="text-sm text-muted-foreground">Rides</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">₱2,845</div>
                                <div className="text-sm text-muted-foreground">Earnings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">18.5h</div>
                                <div className="text-sm text-muted-foreground">Online Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">4.9</div>
                                <div className="text-sm text-muted-foreground">Avg. Rating</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DriverLayout>
    );
}