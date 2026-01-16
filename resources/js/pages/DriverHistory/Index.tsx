import DriverLayout from '@/layouts/DriverLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Calendar,
    Star,
    Clock,
    DollarSign,
    Car,
    History,
    Users,
    Phone,
} from 'lucide-react';
import { type SharedData } from '@/types';
import RatingDisplay from '@/components/RatingDisplay';

interface CompletedBooking {
    id: number;
    booking_id: string;
    passenger: {
        id: number;
        name: string;
        phone: string;
        avatar: string | null;
    } | null;
    pickup_address: string;
    destination_address: string;
    total_fare: number | string;
    completed_at: string;
    review: {
        id: number;
        rating: number;
        comment: string | null;
    } | null;
}

interface RideHistoryProps {
    completedBookings: CompletedBooking[];
}

export default function RideHistory() {
    const { completedBookings } = usePage<SharedData & RideHistoryProps>().props;

    const totalRides = completedBookings.length;
    const ratedRides = completedBookings.filter(b => b.review).length;
    const totalEarnings = completedBookings.reduce((sum, b) => {
        const fare = typeof b.total_fare === 'number' ? b.total_fare : parseFloat(b.total_fare || '0');
        return sum + fare;
    }, 0);
    const averageRating = ratedRides > 0
        ? completedBookings
            .filter(b => b.review)
            .reduce((sum, b) => sum + (b.review?.rating || 0), 0) / ratedRides
        : 0;

    return (
        <DriverLayout>
            <Head title="Ride History" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Ride History</h1>
                <p className="text-muted-foreground mt-2">Overview of your completed rides</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                        <Car className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRides}</div>
                        <p className="text-xs text-muted-foreground">All completed trips</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            ₱{totalEarnings.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">From all rides</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">{ratedRides} rated rides</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. per Ride</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            ₱{totalRides > 0 ? (totalEarnings / totalRides).toFixed(2) : '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">Per completed ride</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ride List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Completed Rides</h2>
                {completedBookings.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {completedBookings.map((booking) => (
                            <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {booking.pickup_address} → {booking.destination_address}
                                        </CardTitle>
                                        <Badge variant="secondary" className="text-xs font-mono">
                                            {booking.booking_id}
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 text-xs mt-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(booking.completed_at).toLocaleString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {booking.passenger?.avatar ? (
                                                <img 
                                                    src={booking.passenger.avatar} 
                                                    alt={booking.passenger.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                                                    <Users className="w-5 h-5 text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {booking.passenger?.name || 'N/A'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Phone className="w-3 h-3" />
                                                    <a 
                                                        href={`tel:${booking.passenger?.phone || ''}`}
                                                        className="hover:underline"
                                                    >
                                                        {booking.passenger?.phone || 'N/A'}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                ₱{parseFloat(booking.total_fare as string).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Earned</p>
                                        </div>
                                    </div>

                                    {booking.review ? (
                                        <div className="space-y-2 p-3 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-700">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                                    Passenger Rating
                                                </p>
                                            </div>
                                            <RatingDisplay rating={booking.review.rating} size="sm" />
                                            {booking.review.comment && (
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2 italic">
                                                    "{booking.review.comment}"
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">
                                                    No rating yet
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                                <History className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Rides Yet</h3>
                            <p className="text-muted-foreground">Complete your first ride to see it here!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DriverLayout>
    );
}
