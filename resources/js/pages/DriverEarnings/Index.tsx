import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import DriverLayout from '@/layouts/DriverLayout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Calendar,
    Car,
    Clock,
    DollarSign,
    Star,
    TrendingUp,
} from 'lucide-react';

interface EarningsData {
    totalEarnings: number;
    todayEarnings: number;
    weekEarnings: number;
    monthEarnings: number;
    totalRides: number;
    averageRating: number;
    ratedRides: number;
    earnings: Array<{
        id: number;
        booking_id: string;
        passenger_name: string;
        total_fare: number;
        completed_at: string;
        review?: {
            rating: number;
        } | null;
    }>;
}

interface EarningsProps {
    earningsData: EarningsData;
}

export default function Earnings() {
    const { earningsData } = usePage<SharedData & EarningsProps>().props;

    const formatCurrency = (amount: number) => {
        return `₱${amount.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <DriverLayout>
            <Head title="Earnings" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
                <p className="mt-2 text-muted-foreground">
                    Track your earnings and performance
                </p>
            </div>

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {/* Total Earnings */}
                <Card className="border-emerald-200 dark:border-emerald-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Earnings
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(earningsData.totalEarnings)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>

                {/* Today's Earnings */}
                <Card className="border-blue-200 dark:border-blue-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(earningsData.todayEarnings)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            From completed rides
                        </p>
                    </CardContent>
                </Card>

                {/* This Week */}
                <Card className="border-purple-200 dark:border-purple-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            This Week
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(earningsData.weekEarnings)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Last 7 days
                        </p>
                    </CardContent>
                </Card>

                {/* This Month */}
                <Card className="border-orange-200 dark:border-orange-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            This Month
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(earningsData.monthEarnings)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Current month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Row */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Rides
                        </CardTitle>
                        <Car className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {earningsData.totalRides}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Completed trips
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Average Rating
                        </CardTitle>
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {earningsData.averageRating > 0
                                ? earningsData.averageRating.toFixed(1)
                                : 'N/A'}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {earningsData.ratedRides} rated rides
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. per Ride
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {earningsData.totalRides > 0
                                ? formatCurrency(
                                      earningsData.totalEarnings /
                                          earningsData.totalRides,
                                  )
                                : formatCurrency(0)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Per completed ride
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Earnings List */}
            <Card>
                <CardHeader>
                    <CardTitle>Earnings History</CardTitle>
                    <CardDescription>
                        Your completed rides and earnings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {earningsData.earnings.length > 0 ? (
                        <div className="space-y-3">
                            {earningsData.earnings.map((earning) => (
                                <div
                                    key={earning.id}
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                            <Car className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                                                    {earning.passenger_name}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className="h-4 px-1.5 py-0 font-mono text-[9px]"
                                                >
                                                    {earning.booking_id}
                                                </Badge>
                                                {earning.review && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {
                                                                earning.review
                                                                    .rating
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {formatDate(
                                                            earning.completed_at,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {formatTime(
                                                            earning.completed_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 shrink-0 text-right">
                                        <div className="text-lg font-bold text-emerald-600 sm:text-xl dark:text-emerald-400">
                                            {formatCurrency(earning.total_fare)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Earned
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                <DollarSign className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                No Earnings Yet
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Complete rides to start earning!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </DriverLayout>
    );
}
