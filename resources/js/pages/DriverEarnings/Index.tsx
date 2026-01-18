import DriverLayout from '@/layouts/DriverLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Car,
    Star,
    Clock,
    MapPin,
    Users,
} from 'lucide-react';
import { type SharedData } from '@/types';

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
                <p className="text-muted-foreground mt-2">Track your earnings and performance</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                {/* Total Earnings */}
                <Card className="border-emerald-200 dark:border-emerald-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(earningsData.totalEarnings)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>

                {/* Today's Earnings */}
                <Card className="border-blue-200 dark:border-blue-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(earningsData.todayEarnings)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">From completed rides</p>
                    </CardContent>
                </Card>

                {/* This Week */}
                <Card className="border-purple-200 dark:border-purple-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Week</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(earningsData.weekEarnings)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                    </CardContent>
                </Card>

                {/* This Month */}
                <Card className="border-orange-200 dark:border-orange-500/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(earningsData.monthEarnings)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Current month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                        <Car className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{earningsData.totalRides}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed trips</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {earningsData.averageRating > 0 ? earningsData.averageRating.toFixed(1) : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {earningsData.ratedRides} rated rides
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. per Ride</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {earningsData.totalRides > 0 
                                ? formatCurrency(earningsData.totalEarnings / earningsData.totalRides)
                                : formatCurrency(0)
                            }
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Per completed ride</p>
                    </CardContent>
                </Card>
            </div>

            {/* Earnings List */}
            <Card>
                <CardHeader>
                    <CardTitle>Earnings History</CardTitle>
                    <CardDescription>Your completed rides and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                    {earningsData.earnings.length > 0 ? (
                        <div className="space-y-3">
                            {earningsData.earnings.map((earning) => (
                                <div
                                    key={earning.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                                                    {earning.passenger_name}
                                                </h3>
                                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono h-4">
                                                    {earning.booking_id}
                                                </Badge>
                                                {earning.review && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {earning.review.rating}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatDate(earning.completed_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatTime(earning.completed_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(earning.total_fare)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Earned</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                                <DollarSign className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Earnings Yet</h3>
                            <p className="text-sm text-muted-foreground">Complete rides to start earning!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </DriverLayout>
    );
}
