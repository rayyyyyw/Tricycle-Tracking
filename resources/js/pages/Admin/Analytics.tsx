import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    Car,
    DollarSign,
    Download,
    Filter,
    Route,
    Star,
    Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface AnalyticsProps {
    period: string;
    from?: string;
    to?: string;
    periodDays?: number | null;
    revenue: {
        total: number;
        average_per_ride: number;
        daily: Record<string, { revenue: number; rides: number }>;
        by_type: Array<{
            type: string;
            revenue: number;
            count: number;
            percentage: number;
        }>;
    };
    bookings: {
        total: number;
        completed: number;
        cancelled: number;
        pending: number;
        completion_rate: number;
        cancellation_rate: number;
        avg_distance_km: number;
        avg_duration_minutes: number;
    };
    drivers: {
        top_earners: Array<{
            id: number;
            name: string;
            completed_rides: number;
            revenue: number;
            avg_rating: number;
            reviews_count: number;
        }>;
        total_active: number;
        total_drivers: number;
    };
    passengers: {
        total: number;
        active: number;
        top_passengers: Array<{
            id: number;
            name: string;
            total_rides: number;
            total_spent: number;
        }>;
    };
    peakHours: Array<{ hour: number; bookings: number; label: string }>;
    popularRoutes: Array<{
        route: string;
        count: number;
        avg_fare: number;
        total_revenue: number;
    }>;
    growth: {
        ride_growth_percent: number;
        revenue_growth_percent: number;
        this_month_rides: number;
        last_month_rides: number;
        this_month_revenue: number;
        last_month_revenue: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Analytics', href: '/admin/analytics' },
];

const defaultRevenue = {
    total: 0,
    average_per_ride: 0,
    daily: {} as Record<string, { revenue: number; rides: number }>,
    by_type: [],
};
const defaultBookings = {
    total: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    completion_rate: 0,
    cancellation_rate: 0,
    avg_distance_km: 0,
    avg_duration_minutes: 0,
};
const defaultDrivers = { top_earners: [], total_active: 0, total_drivers: 0 };
const defaultPassengers = { total: 0, active: 0, top_passengers: [] };
const defaultGrowth = {
    ride_growth_percent: 0,
    revenue_growth_percent: 0,
    this_month_rides: 0,
    last_month_rides: 0,
    this_month_revenue: 0,
    last_month_revenue: 0,
};

const PRESETS = [7, 30, 90] as const;

export default function Analytics() {
    const props = usePage().props as unknown as AnalyticsProps;
    const period = props.period ?? '30';
    const from = props.from ?? '';
    const to = props.to ?? '';
    const periodDays = props.periodDays ?? 30;

    const [customFrom, setCustomFrom] = useState(from || '');
    const [customTo, setCustomTo] = useState(to || '');
    const [showCustomRange, setShowCustomRange] = useState(!!(from && to));

    const applyPreset = useCallback(
        (days: number) => {
            setShowCustomRange(false);
            router.get('/admin/analytics', { period: String(days) }, { preserveState: false });
        },
        [],
    );
    const applyCustomRange = useCallback(() => {
        if (!customFrom || !customTo) return;
        router.get('/admin/analytics', { from: customFrom, to: customTo }, { preserveState: false });
    }, [customFrom, customTo]);

    const exportUrl =
        from && to
            ? `/admin/analytics/export?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
            : `/admin/analytics/export?period=${periodDays}`;

    const revenue = props.revenue ?? defaultRevenue;
    const bookings = props.bookings ?? defaultBookings;
    const drivers = props.drivers ?? defaultDrivers;
    const passengers = props.passengers ?? defaultPassengers;
    const peakHours = Array.isArray(props.peakHours) ? props.peakHours : [];
    const popularRoutes = Array.isArray(props.popularRoutes)
        ? props.popularRoutes
        : [];
    const growth = props.growth ?? defaultGrowth;

    const formatCurrency = (amount: number) =>
        `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics & Reports" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                                Analytics & Reports
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {from && to
                                    ? `Range: ${period}`
                                    : `Last ${period} days`}
                            </p>
                        </div>
                        <a
                            href={exportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </a>
                    </div>

                    {/* Date filter */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Filter className="h-4 w-4" />
                                Filter by date
                            </CardTitle>
                            <CardDescription>
                                Preset range or pick a custom from/to date
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-end gap-3">
                            <div className="flex flex-wrap gap-2">
                                {PRESETS.map((days) => (
                                    <Button
                                        key={days}
                                        variant={
                                            !showCustomRange && periodDays === days
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => applyPreset(days)}
                                    >
                                        Last {days} days
                                    </Button>
                                ))}
                                <Button
                                    variant={showCustomRange ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setShowCustomRange(true)}
                                >
                                    Custom range
                                </Button>
                            </div>
                            {showCustomRange && (
                                <>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <label className="text-sm text-muted-foreground">
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            value={customFrom}
                                            onChange={(e) =>
                                                setCustomFrom(e.target.value)
                                            }
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                        <label className="text-sm text-muted-foreground">
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={customTo}
                                            onChange={(e) =>
                                                setCustomTo(e.target.value)
                                            }
                                            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={applyCustomRange}
                                        disabled={!customFrom || !customTo}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Apply
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Growth Metrics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Monthly Growth
                            </CardTitle>
                            <CardDescription>
                                Comparing this month vs last month
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Rides
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {growth.this_month_rides}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {growth.ride_growth_percent >= 0 ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                                        )}
                                        <span
                                            className={`text-sm font-semibold ${growth.ride_growth_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {Math.abs(
                                                growth.ride_growth_percent,
                                            )}
                                            %
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            vs last month
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Revenue
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(
                                            growth.this_month_revenue,
                                        )}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {growth.revenue_growth_percent >= 0 ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                                        )}
                                        <span
                                            className={`text-sm font-semibold ${growth.revenue_growth_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {Math.abs(
                                                growth.revenue_growth_percent,
                                            )}
                                            %
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            vs last month
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                Revenue Summary
                            </CardTitle>
                            <CardDescription>
                                Total revenue breakdown
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Revenue
                                    </p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {formatCurrency(revenue.total)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Average per Ride
                                    </p>
                                    <p className="text-xl font-semibold">
                                        {formatCurrency(
                                            revenue.average_per_ride,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Booking & Performance Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            Booking Statistics
                        </CardTitle>
                        <CardDescription>
                            Performance metrics for the period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Total Bookings
                                </p>
                                <p className="text-2xl font-bold">
                                    {bookings.total}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Completed
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {bookings.completed}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {bookings.completion_rate}% rate
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Avg Distance
                                </p>
                                <p className="text-2xl font-bold">
                                    {bookings.avg_distance_km} km
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                    Avg Duration
                                </p>
                                <p className="text-2xl font-bold">
                                    {bookings.avg_duration_minutes} min
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Peak Hours Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            Peak Hours Analysis
                        </CardTitle>
                        <CardDescription>
                            Booking distribution by hour
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-40 items-end gap-1">
                            {Array.from({ length: 24 }, (_, hour) => {
                                const hourData = peakHours.find(
                                    (h) => h.hour === hour,
                                );
                                const count = hourData?.bookings ?? 0;
                                const counts = peakHours.map(
                                    (h) => h?.bookings ?? 0,
                                );
                                const maxCount =
                                    counts.length > 0
                                        ? Math.max(...counts, 1)
                                        : 1;
                                const height = (count / maxCount) * 100;

                                return (
                                    <div
                                        key={hour}
                                        className="group flex flex-1 flex-col items-center gap-1"
                                    >
                                        <div
                                            className="relative w-full cursor-pointer rounded-t bg-linear-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500"
                                            style={{
                                                height: `${height}%`,
                                                minHeight:
                                                    count > 0 ? '8px' : '0',
                                            }}
                                            title={`${hour}:00 - ${count} bookings`}
                                        >
                                            {count > 0 && (
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-blue-600 px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                        {hour % 4 === 0 && (
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {hour}:00
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Driver & Passenger Analytics */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Top Drivers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5 text-blue-600" />
                                Top Performing Drivers
                            </CardTitle>
                            <CardDescription>
                                {drivers.total_active} of{' '}
                                {drivers.total_drivers} drivers active
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {drivers.top_earners.map((driver, index) => (
                                    <div
                                        key={driver.id}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-sm font-bold text-white">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {driver.name}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>
                                                        {driver.completed_rides}{' '}
                                                        rides
                                                    </span>
                                                    {driver.avg_rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span>
                                                                {
                                                                    driver.avg_rating
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                {formatCurrency(driver.revenue)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {drivers.top_earners.length === 0 && (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No driver data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Passengers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                Top Passengers
                            </CardTitle>
                            <CardDescription>
                                {passengers.active} of {passengers.total}{' '}
                                passengers active
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {passengers.top_passengers.map(
                                    (passenger, index) => (
                                        <div
                                            key={passenger.id}
                                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {passenger.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {passenger.total_rides}{' '}
                                                        rides
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">
                                                    {formatCurrency(
                                                        passenger.total_spent,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                                {passengers.top_passengers.length === 0 && (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No passenger data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Popular Routes Detailed */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Route className="h-5 w-5 text-blue-600" />
                            Most Popular Routes
                        </CardTitle>
                        <CardDescription>
                            Top 10 routes by frequency and revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {popularRoutes.map((route, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {route.route}
                                        </p>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{route.count} trips</span>
                                            <span>•</span>
                                            <span>
                                                Avg:{' '}
                                                {formatCurrency(route.avg_fare)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-bold text-green-600">
                                            {formatCurrency(
                                                route.total_revenue,
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            total
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
