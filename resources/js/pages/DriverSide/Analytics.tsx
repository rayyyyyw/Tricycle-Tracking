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
    Award,
    BarChart3,
    Calendar,
    Car,
    DollarSign,
    Star,
} from 'lucide-react';

interface AnalyticsProps {
    analytics: {
        totalEarnings: number;
        totalRides: number;
        todayEarnings: number;
        weekEarnings: number;
        monthEarnings: number;
        averageRating: number;
        ratedRides: number;
        dailyEarnings: Array<{
            date: string;
            day: string;
            earnings: number;
        }>;
        dailyRides: Array<{
            date: string;
            day: string;
            rides: number;
        }>;
        topDays: Array<{
            date: string;
            day: string;
            earnings: number;
        }>;
    };
}

export default function Analytics() {
    const { analytics } = usePage<SharedData & AnalyticsProps>().props;

    const maxEarnings = Math.max(
        ...(analytics?.dailyEarnings || []).map((d) => d.earnings),
        1,
    );
    const maxRides = Math.max(
        ...(analytics?.dailyRides || []).map((d) => d.rides),
        1,
    );

    return (
        <DriverLayout>
            <Head title="Analytics" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        Analytics
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Track your performance and earnings
                    </p>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Earnings
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₱
                                {(analytics?.totalEarnings || 0).toLocaleString(
                                    undefined,
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    },
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                All time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rides
                            </CardTitle>
                            <Car className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analytics?.totalRides || 0}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Completed rides
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg. Rating
                            </CardTitle>
                            <Star className="h-4 w-4 fill-yellow-600 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {analytics?.averageRating > 0
                                    ? analytics.averageRating.toFixed(1)
                                    : 'N/A'}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {analytics?.ratedRides || 0}{' '}
                                {analytics?.ratedRides === 1
                                    ? 'rating'
                                    : 'ratings'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                This Month
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₱
                                {(analytics?.monthEarnings || 0).toLocaleString(
                                    undefined,
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    },
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Monthly earnings
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Earnings Breakdown */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                ₱{(analytics?.todayEarnings || 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">This Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                ₱{(analytics?.weekEarnings || 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                ₱{(analytics?.monthEarnings || 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Earnings Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Earnings (Last 7 Days)
                            </CardTitle>
                            <CardDescription>
                                Daily earnings breakdown
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics?.dailyEarnings &&
                                analytics.dailyEarnings.length > 0 ? (
                                    analytics.dailyEarnings.map(
                                        (day, index) => (
                                            <div
                                                key={index}
                                                className="space-y-1"
                                            >
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">
                                                        {day.day}
                                                    </span>
                                                    <span className="font-semibold text-emerald-600">
                                                        ₱
                                                        {day.earnings.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className="h-2 rounded-full bg-emerald-600 transition-all"
                                                        style={{
                                                            width: `${(day.earnings / maxEarnings) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No earnings data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rides Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Rides (Last 7 Days)
                            </CardTitle>
                            <CardDescription>
                                Daily rides completed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {analytics?.dailyRides &&
                                analytics.dailyRides.length > 0 ? (
                                    analytics.dailyRides.map((day, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">
                                                    {day.day}
                                                </span>
                                                <span className="font-semibold text-blue-600">
                                                    {day.rides}{' '}
                                                    {day.rides === 1
                                                        ? 'ride'
                                                        : 'rides'}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-2 rounded-full bg-blue-600 transition-all"
                                                    style={{
                                                        width: `${(day.rides / maxRides) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No rides data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Performing Days */}
                {analytics?.topDays && analytics.topDays.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Top Performing Days
                            </CardTitle>
                            <CardDescription>
                                Your best earning days this week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analytics.topDays.map((day, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                    index === 0
                                                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                                                        : index === 1
                                                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                                                          : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                                                }`}
                                            >
                                                {index === 0
                                                    ? '🥇'
                                                    : index === 1
                                                      ? '🥈'
                                                      : '🥉'}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {day.day}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        day.date,
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-emerald-600">
                                            ₱{day.earnings.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DriverLayout>
    );
}
