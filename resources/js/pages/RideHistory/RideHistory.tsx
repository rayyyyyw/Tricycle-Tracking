import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Calendar,
    Star,
    MessageSquare,
    Clock,
    DollarSign,
    Car,
    History
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState } from 'react';
import RatingModal from '@/components/RatingModal';
import RatingDisplay from '@/components/RatingDisplay';

interface CompletedBooking {
    id: number;
    booking_id: string;
    driver: {
        id: number;
        name: string;
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
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [selectedDriverName, setSelectedDriverName] = useState<string | null>(null);

    const handleRateRide = (bookingId: number, driverName: string) => {
        setSelectedBookingId(bookingId);
        setSelectedDriverName(driverName);
        setShowRatingModal(true);
    };

    const totalRides = completedBookings.length;
    const ratedRides = completedBookings.filter(b => b.review).length;
    const pendingReviews = totalRides - ratedRides;

    return (
        <PassengerLayout>
            <Head title="Ride History" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Your Ride History</h1>
                <p className="text-muted-foreground mt-2">Overview of your past rides and reviews</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                        <CardTitle className="text-sm font-medium">Rated Rides</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ratedRides}</div>
                        <p className="text-xs text-muted-foreground">Trips you've reviewed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReviews}</div>
                        <p className="text-xs text-muted-foreground">Rides awaiting your feedback</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ride List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Your Completed Rides</h2>
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
                                            {booking.driver?.avatar ? (
                                                <img 
                                                    src={booking.driver.avatar} 
                                                    alt={booking.driver.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                    <Car className="w-4 h-4 text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {booking.driver?.name || 'N/A'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Driver</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                ₱{parseFloat(booking.total_fare as string).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Total Fare</p>
                                        </div>
                                    </div>

                                    {booking.review ? (
                                        <div className="space-y-2 p-3 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-700">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                                    Your Rating
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
                                        <Button 
                                            variant="outline" 
                                            className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                                            onClick={() => handleRateRide(booking.id, booking.driver?.name || 'Driver')}
                                        >
                                            <Star className="h-4 w-4 mr-2" />
                                            Rate This Ride
                                        </Button>
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
                            <p className="text-muted-foreground">Book your first ride to see it here!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {selectedBookingId && (
                <RatingModal
                    bookingId={selectedBookingId}
                    isOpen={showRatingModal}
                    onClose={() => {
                        setShowRatingModal(false);
                        router.reload({ only: ['completedBookings'] });
                    }}
                    hasReviewed={false}
                    driverName={selectedDriverName || 'Driver'}
                />
            )}
        </PassengerLayout>
    );
}
