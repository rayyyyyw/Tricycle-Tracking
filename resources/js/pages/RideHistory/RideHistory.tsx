import RatingDisplay from '@/components/RatingDisplay';
import RatingModal from '@/components/RatingModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PassengerLayout from '@/layouts/PassengerLayout';
import { buildReceiptHtml, openReceiptInNewWindow } from '@/lib/receiptHtml';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    Car,
    Clock,
    Download,
    History,
    MapPin,
    Star,
    User,
} from 'lucide-react';
import { useState } from 'react';

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
    const { completedBookings = [] } = usePage<SharedData & RideHistoryProps>()
        .props;
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
        null,
    );
    const [selectedDriverName, setSelectedDriverName] = useState<string | null>(
        null,
    );

    const handleRateRide = (bookingId: number, driverName: string) => {
        setSelectedBookingId(bookingId);
        setSelectedDriverName(driverName);
        setShowRatingModal(true);
    };

    const handleDownloadReceipt = (booking: CompletedBooking) => {
        const logoUrl = `${window.location.origin}/logos/tlogo.png`;
        const html = buildReceiptHtml({
            variant: 'passenger',
            booking: {
                booking_id: booking.booking_id,
                pickup_address: booking.pickup_address,
                destination_address: booking.destination_address,
                total_fare: booking.total_fare,
                completed_at: booking.completed_at,
                review: booking.review,
            },
            otherPartyName: booking.driver?.name || 'N/A',
            logoUrl,
        });
        openReceiptInNewWindow(html);
    };

    const totalRides = completedBookings.length;
    const ratedRides = completedBookings.filter((b) => b.review).length;
    const pendingReviews = totalRides - ratedRides;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year:
                date.getFullYear() !== now.getFullYear()
                    ? 'numeric'
                    : undefined,
        });
    };

    return (
        <PassengerLayout>
            <Head title="Ride History" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        Ride History
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Overview of your past rides and reviews
                    </p>
                </div>

                {/* Compact Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-xs text-muted-foreground">
                                        Total Rides
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {totalRides}
                                    </p>
                                </div>
                                <Car className="h-5 w-5 text-emerald-500 opacity-60" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-xs text-muted-foreground">
                                        Rated
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {ratedRides}
                                    </p>
                                </div>
                                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500 opacity-60" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 dark:border-orange-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="mb-1 text-xs text-muted-foreground">
                                        Pending
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {pendingReviews}
                                    </p>
                                </div>
                                <Clock className="h-5 w-5 text-orange-500 opacity-60" />
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
                                className="border-gray-200 transition-all duration-200 hover:shadow-md dark:border-gray-700"
                            >
                                <CardContent className="p-3 sm:p-4">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        {/* Driver Avatar */}
                                        <div className="shrink-0">
                                            {booking.driver?.avatar ? (
                                                <img
                                                    src={booking.driver.avatar}
                                                    alt={booking.driver.name}
                                                    className="h-10 w-10 rounded-full border-2 border-emerald-200 object-cover sm:h-12 sm:w-12 dark:border-emerald-700"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-100 sm:h-12 sm:w-12 dark:border-emerald-700 dark:bg-emerald-900/30">
                                                    <User className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6 dark:text-emerald-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Main Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                                                            {booking.driver
                                                                ?.name || 'N/A'}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className="h-4 px-1.5 py-0 font-mono text-[9px]"
                                                        >
                                                            {booking.booking_id}
                                                        </Badge>
                                                    </div>
                                                    <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>
                                                            {formatDate(
                                                                booking.completed_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className="text-base font-bold text-emerald-600 sm:text-lg dark:text-emerald-400">
                                                        ₱
                                                        {parseFloat(
                                                            booking.total_fare as string,
                                                        ).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Route */}
                                            <div className="mb-2 flex items-start gap-2 text-xs sm:text-sm">
                                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-gray-900 dark:text-white">
                                                        {booking.pickup_address}
                                                    </p>
                                                </div>
                                                <ArrowRight className="mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-gray-900 dark:text-white">
                                                        {
                                                            booking.destination_address
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Rating & Actions Section */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {booking.review ? (
                                                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded border border-yellow-200 bg-yellow-50/50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                                                        <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-500 text-yellow-500" />
                                                        <RatingDisplay
                                                            rating={
                                                                booking.review
                                                                    .rating
                                                            }
                                                            size="sm"
                                                        />
                                                        {booking.review
                                                            .comment && (
                                                            <p className="min-w-0 flex-1 truncate text-xs text-yellow-700 dark:text-yellow-400">
                                                                "
                                                                {
                                                                    booking
                                                                        .review
                                                                        .comment
                                                                }
                                                                "
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                                                        onClick={() =>
                                                            handleRateRide(
                                                                booking.id,
                                                                booking.driver
                                                                    ?.name ||
                                                                    'Driver',
                                                            )
                                                        }
                                                    >
                                                        <Star className="mr-1.5 h-3 w-3" />
                                                        Rate This Ride
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={() =>
                                                        handleDownloadReceipt(
                                                            booking,
                                                        )
                                                    }
                                                >
                                                    <Download className="mr-1.5 h-3 w-3" />
                                                    Receipt
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="p-8 text-center sm:p-12">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 sm:h-20 sm:w-20 dark:bg-gray-700">
                                <History className="h-8 w-8 text-gray-600 sm:h-10 sm:w-10 dark:text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
                                No Rides Yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Book your first ride to see it here!
                            </p>
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
