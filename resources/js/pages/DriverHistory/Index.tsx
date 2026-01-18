import DriverLayout from '@/layouts/DriverLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
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
    ArrowRight,
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    };

    return (
        <DriverLayout>
            <Head title="Ride History" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Ride History</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overview of your completed rides</p>
                </div>

                {/* Compact Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Total Rides</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{totalRides}</p>
                                </div>
                                <Car className="h-5 w-5 text-blue-500 opacity-60" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ₱{totalEarnings.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="h-5 w-5 text-emerald-500 opacity-60" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Avg. Rating</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                                    </p>
                                </div>
                                <Star className="h-5 w-5 text-yellow-500 opacity-60 fill-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 dark:border-purple-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Avg. per Ride</p>
                                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                        ₱{totalRides > 0 ? (totalEarnings / totalRides).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <DollarSign className="h-5 w-5 text-purple-500 opacity-60" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Compact Ride List */}
                {completedBookings.length > 0 ? (
                    <div className="space-y-2">
                        {completedBookings.map((booking) => (
                            <Card 
                                key={booking.id} 
                                className="hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700"
                            >
                                <CardContent className="p-3 sm:p-4">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        {/* Passenger Avatar */}
                                        <div className="shrink-0">
                                            {booking.passenger?.avatar ? (
                                                <img 
                                                    src={booking.passenger.avatar} 
                                                    alt={booking.passenger.name}
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-emerald-200 dark:border-emerald-700"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700 flex items-center justify-center">
                                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                                                            {booking.passenger?.name || 'N/A'}
                                                        </p>
                                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono h-4">
                                                            {booking.booking_id}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{formatDate(booking.completed_at)}</span>
                                                        {booking.passenger?.phone && (
                                                            <>
                                                                <span className="mx-1">•</span>
                                                                <Phone className="w-3 h-3" />
                                                                <a 
                                                                    href={`tel:${booking.passenger.phone}`}
                                                                    className="hover:underline"
                                                                >
                                                                    {booking.passenger.phone}
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                        ₱{parseFloat(booking.total_fare as string).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Route */}
                                            <div className="flex items-start gap-2 mb-2 text-xs sm:text-sm">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-900 dark:text-white truncate font-medium">
                                                        {booking.pickup_address}
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mx-1" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-900 dark:text-white truncate font-medium">
                                                        {booking.destination_address}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Rating Section */}
                                            {booking.review ? (
                                                <div className="flex items-center gap-2 p-2 bg-yellow-50/50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500 shrink-0" />
                                                    <RatingDisplay rating={booking.review.rating} size="sm" />
                                                    {booking.review.comment && (
                                                        <p className="text-xs text-yellow-700 dark:text-yellow-400 truncate flex-1 min-w-0">
                                                            "{booking.review.comment}"
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">No rating yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="p-8 sm:p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                                <History className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 dark:text-gray-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Rides Yet</h3>
                            <p className="text-sm text-muted-foreground">Complete your first ride to see it here!</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DriverLayout>
    );
}
