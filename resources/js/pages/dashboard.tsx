import FleetMap, { type FleetMapHandle } from '@/components/map/fleet-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Car,
    CheckCircle2,
    DollarSign,
    Download,
    Layers,
    Maximize2,
    Minimize2,
    Navigation,
    RefreshCw,
    Target,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const DASHBOARD_URL = '/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: DASHBOARD_URL,
    },
];

// Optimized Map Control Component
const MapControls = ({
    view,
    onViewChange,
    isFullscreen,
    onToggleFullscreen,
    onCenter,
}: {
    view: 'standard' | 'satellite';
    onViewChange: (v: 'standard' | 'satellite') => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onCenter?: () => void;
}) => (
    <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:gap-2">
        <div className="flex rounded-lg bg-muted p-0.5">
            <Button
                variant={view === 'standard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('standard')}
                className="h-7 px-2 text-xs"
            >
                <Layers className="mr-1.5 h-3 w-3" />
                Map
            </Button>
            <Button
                variant={view === 'satellite' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('satellite')}
                className="h-7 px-2 text-xs"
            >
                <Layers className="mr-1.5 h-3 w-3" />
                Satellite
            </Button>
        </div>
        <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={onCenter}
        >
            <Target className="h-3 w-3" />
            Center
        </Button>
        <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={onToggleFullscreen}
        >
            {isFullscreen ? (
                <>
                    <Minimize2 className="h-3 w-3" />
                    Exit
                </>
            ) : (
                <>
                    <Maximize2 className="h-3 w-3" />
                    Fullscreen
                </>
            )}
        </Button>
    </div>
);

// Optimized Stat Card Component
const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
}: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: { value: string; isPositive: boolean };
}) => (
    <Card className="min-w-0 border bg-card shadow-sm transition-shadow hover:shadow">
        <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <p className="mb-1 truncate text-xs font-medium text-muted-foreground">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="truncate text-lg font-bold text-foreground">
                            {value}
                        </p>
                        {trend && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    'px-1.5 py-0 text-xs',
                                    trend.isPositive
                                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
                                )}
                            >
                                {trend.isPositive ? '↑' : '↓'} {trend.value}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className={cn('ml-2 shrink-0 rounded-lg p-2', color)}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </CardContent>
    </Card>
);

// Optimized Fleet Status Item Component
const FleetStatusItem = ({
    status,
    count,
    color,
    percentage,
}: {
    status: string;
    count: number;
    color: string;
    percentage: number;
}) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <div
                    className={cn('h-2 w-2 shrink-0 rounded-full', color)}
                ></div>
                <span className="truncate text-foreground">{status}</span>
            </div>
            <span className="font-semibold text-nowrap text-foreground">
                {count} ({percentage}%)
            </span>
        </div>
        <Progress value={percentage} className="h-1.5" />
    </div>
);

interface Driver {
    id: number;
    name: string;
    lat: number;
    lng: number;
    status: string;
    vehicle_type?: string;
    vehicle_plate?: string;
    barangay?: string;
}

interface ActiveBooking {
    id: number;
    booking_id: string;
    passenger_name: string;
    driver_name: string;
    pickup: { lat: number; lng: number; address: string; barangay: string };
    destination: {
        lat: number;
        lng: number;
        address: string;
        barangay: string;
    };
    status: string;
}

// Optimized Fullscreen Map Component
const FullscreenMap = ({
    isFullscreen,
    onClose,
    view,
    onViewChange,
    activeTricycles,
    onlineDrivers = [],
    activeBookings = [],
}: {
    isFullscreen: boolean;
    onClose: () => void;
    view: 'standard' | 'satellite';
    onViewChange: (v: 'standard' | 'satellite') => void;
    activeTricycles: number;
    onlineDrivers?: Driver[];
    activeBookings?: ActiveBooking[];
}) => {
    if (!isFullscreen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
            {/* Header */}
            <div className="shrink-0 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-4">
                <div className="flex h-12 items-center gap-2 sm:h-14">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Navigation className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-foreground sm:text-lg">
                                Hinobaan Map
                            </h2>
                            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                                {onlineDrivers.length} online •{' '}
                                {activeBookings.length} rides • Hinoba-an
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <div className="flex rounded-lg bg-muted p-0.5">
                            <Button
                                variant={
                                    view === 'standard' ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => onViewChange('standard')}
                                className="h-7 px-2 text-xs sm:h-8 sm:px-3"
                            >
                                <Layers className="h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                                <span className="hidden sm:inline">Map</span>
                            </Button>
                            <Button
                                variant={
                                    view === 'satellite' ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => onViewChange('satellite')}
                                className="h-7 px-2 text-xs sm:h-8 sm:px-3"
                            >
                                <Layers className="h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                                <span className="hidden sm:inline">
                                    Satellite
                                </span>
                            </Button>
                        </div>
                        <Button
                            onClick={onClose}
                            className="h-7 gap-1.5 px-2 text-xs sm:h-8 sm:px-3"
                        >
                            <Minimize2 className="h-3.5 w-3.5" />
                            Exit Fullscreen
                        </Button>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative flex-1">
                <FleetMap
                    activeTricycles={activeTricycles}
                    view={view}
                    onlineDrivers={onlineDrivers}
                    activeBookings={activeBookings}
                />
            </div>
        </div>
    );
};

interface DashboardProps {
    [key: string]: unknown;
    stats?: {
        todayRevenue: number;
        revenueGrowth: number;
        activeTrips: number;
        totalTricycles: number;
        activeTricycles: number;
        satisfactionRate: number;
        totalDrivers?: number;
        onlineDrivers?: number;
        totalPassengers?: number;
        activePassengers?: number;
        totalBookings?: number;
        completedToday?: number;
    };
    fleetStatus?: Array<{
        status: string;
        count: number;
        color: string;
        percentage: number;
    }>;
    recentActivities?: Array<{
        driver: string;
        action: string;
        time: string;
        status: string;
        route?: string;
        fare?: number;
    }>;
    onlineDrivers?: Driver[];
    activeBookings?: ActiveBooking[];
    hourlyBookings?: Array<{ hour: number; count: number }>;
    popularRoutes?: Array<{ route: string; count: number }>;
}

export default function Dashboard() {
    const pageProps = usePage<DashboardProps>().props;
    const {
        stats,
        fleetStatus: propFleetStatus,
        recentActivities: propRecentActivities,
        hourlyBookings = [],
        popularRoutes = [],
    } = pageProps;
    const onlineDrivers: Driver[] = Array.isArray(pageProps.onlineDrivers)
        ? (pageProps.onlineDrivers as Driver[])
        : [];
    const activeBookings: ActiveBooking[] = Array.isArray(
        pageProps.activeBookings,
    )
        ? (pageProps.activeBookings as ActiveBooking[])
        : [];

    const fleetMapRef = useRef<FleetMapHandle>(null);
    const [mapView, setMapView] = useState<'standard' | 'satellite'>(
        'standard',
    );
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    const dashboardData = {
        totalTricycles: stats?.totalTricycles || 0,
        activeTricycles: stats?.activeTricycles || 0,
        todayRevenue: stats?.todayRevenue || 0,
        satisfactionRate:
            typeof stats?.satisfactionRate === 'number'
                ? `${stats.satisfactionRate}%`
                : stats?.satisfactionRate || '0%',
        activeTrips: stats?.activeTrips || 0,
    };

    const fleetStatus = propFleetStatus || [
        { status: 'Online', count: 0, color: 'bg-green-500', percentage: 0 },
        { status: 'Offline', count: 0, color: 'bg-gray-500', percentage: 0 },
    ];

    const recentActivities = propRecentActivities || [];

    const handleCenterMap = useCallback(() => {
        fleetMapRef.current?.centerMap();
    }, []);

    // Auto-refresh dashboard every 60s when tab is visible
    const REFRESH_INTERVAL_MS = 60000;
    const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());
    const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60);

    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                router.reload({ preserveState: true });
                setLastRefreshed(new Date());
                setSecondsUntilRefresh(60);
            }
        }, REFRESH_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    // Countdown for next auto-refresh (when tab is visible)
    useEffect(() => {
        const tick = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            setSecondsUntilRefresh((prev) => (prev <= 1 ? 60 : prev - 1));
        }, 1000);
        return () => clearInterval(tick);
    }, [lastRefreshed]);

    const handleRefresh = useCallback(() => {
        router.reload({ preserveState: true });
        setLastRefreshed(new Date());
        setSecondsUntilRefresh(60);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Hinobaan Tricycle Fleet" />

            {/* Fullscreen Map Overlay */}
            <FullscreenMap
                isFullscreen={isMapFullscreen}
                onClose={() => setIsMapFullscreen(false)}
                view={mapView}
                onViewChange={setMapView}
                activeTricycles={dashboardData.activeTricycles}
                onlineDrivers={onlineDrivers}
                activeBookings={activeBookings}
            />

            <div
                className={cn(
                    'flex min-h-0 flex-1 flex-col gap-3 overflow-auto transition-opacity sm:gap-4',
                    isMapFullscreen
                        ? 'pointer-events-none opacity-0'
                        : 'opacity-100',
                )}
            >
                {/* Header */}
                <div className="flex shrink-0 flex-col items-start justify-between gap-2 sm:flex-row sm:gap-3">
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                            Hinobaan Fleet Dashboard
                        </h1>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            Hinoba-an, Negros Occidental
                        </p>
                    </div>
                    <div className="flex w-full shrink-0 flex-wrap items-center gap-1.5 sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 flex-1 gap-1.5 text-xs sm:h-7 sm:flex-initial"
                        >
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Today</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs sm:h-7"
                            onClick={handleRefresh}
                            title="Refresh dashboard"
                        >
                            <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden xs:inline">Refresh</span>
                        </Button>
                        <span className="text-[10px] text-muted-foreground sm:text-xs">
                            Auto-refresh in {secondsUntilRefresh}s
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 flex-1 gap-1.5 text-xs sm:h-7 sm:flex-initial"
                        >
                            <Download className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Export</span>
                        </Button>
                    </div>
                </div>

                {/* Stat Cards - responsive grid */}
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
                    <StatCard
                        title="Today's Revenue"
                        value={`₱${dashboardData.todayRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                        trend={
                            stats?.revenueGrowth !== undefined
                                ? {
                                      value: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%`,
                                      isPositive: stats.revenueGrowth >= 0,
                                  }
                                : undefined
                        }
                    />
                    <StatCard
                        title="Active Trips"
                        value={dashboardData.activeTrips.toString()}
                        icon={Navigation}
                        color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    />
                    <StatCard
                        title="Online Drivers"
                        value={`${stats?.onlineDrivers || 0}/${stats?.totalDrivers || 0}`}
                        icon={Car}
                        color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    />
                    <StatCard
                        title="Completed Today"
                        value={(stats?.completedToday || 0).toString()}
                        icon={CheckCircle2}
                        color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        title="Satisfaction Rate"
                        value={dashboardData.satisfactionRate}
                        icon={CheckCircle2}
                        color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    />
                </div>

                {/* Map - Hinobaan (unified single block) */}
                <div className="flex min-h-0 flex-1 flex-col">
                    <Card className="overflow-hidden border bg-card shadow-sm">
                        <div className="relative h-[280px] w-full sm:h-[360px] md:h-[420px]">
                            <FleetMap
                                ref={fleetMapRef}
                                activeTricycles={dashboardData.activeTricycles}
                                view={mapView}
                                onlineDrivers={onlineDrivers}
                                activeBookings={activeBookings}
                            />
                            {/* Unified overlay: title + controls in one bar */}
                            <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between gap-2 border-b border-border/50 bg-background/90 px-2 py-2 backdrop-blur-sm sm:px-3 dark:bg-background/95">
                                <span className="truncate text-sm font-semibold text-foreground">
                                    Hinobaan Map
                                </span>
                                <MapControls
                                    view={mapView}
                                    onViewChange={setMapView}
                                    isFullscreen={isMapFullscreen}
                                    onToggleFullscreen={() =>
                                        setIsMapFullscreen(true)
                                    }
                                    onCenter={handleCenterMap}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Hourly Activity Chart */}
                {hourlyBookings.length > 0 && (
                    <Card className="shrink-0 border bg-card shadow-sm">
                        <CardHeader className="px-3 pt-3 pb-2 sm:px-6 sm:pt-4 sm:pb-3">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Today's Hourly Activity
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Booking requests by hour
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto px-3 pb-3 sm:px-6 sm:pb-6">
                            <div className="flex h-24 min-w-[320px] items-end gap-0.5 sm:h-32 sm:gap-1">
                                {Array.from({ length: 24 }, (_, hour) => {
                                    const hourData = hourlyBookings.find(
                                        (h) => h.hour === hour,
                                    );
                                    const count = hourData?.count || 0;
                                    const maxCount = Math.max(
                                        ...hourlyBookings.map((h) => h.count),
                                        1,
                                    );
                                    const height = (count / maxCount) * 100;

                                    return (
                                        <div
                                            key={hour}
                                            className="flex flex-1 flex-col items-center gap-1"
                                        >
                                            <div
                                                className="group relative w-full cursor-pointer rounded-t bg-blue-500 transition-colors hover:bg-blue-600"
                                                style={{
                                                    height: `${height}%`,
                                                    minHeight:
                                                        count > 0 ? '4px' : '0',
                                                }}
                                                title={`${hour}:00 - ${count} bookings`}
                                            >
                                                {count > 0 && (
                                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                                                        {count}
                                                    </span>
                                                )}
                                            </div>
                                            {hour % 3 === 0 && (
                                                <span className="text-[9px] text-muted-foreground">
                                                    {hour}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analytics Grid */}
                <div className="grid shrink-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Fleet Distribution Card */}
                    <Card className="min-w-0 border bg-card shadow-sm">
                        <CardHeader className="px-3 pt-3 pb-2 sm:px-6 sm:pt-4">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Fleet Distribution
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Current status breakdown
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                            <div className="space-y-3">
                                {fleetStatus.map((item, index) => (
                                    <FleetStatusItem key={index} {...item} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Popular Routes Card */}
                    <Card className="min-w-0 border bg-card shadow-sm">
                        <CardHeader className="px-3 pt-3 pb-2 sm:px-6 sm:pt-4">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Popular Routes
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Top routes this week
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                            <div className="max-h-48 space-y-2 overflow-y-auto sm:max-h-64">
                                {popularRoutes.length > 0 ? (
                                    popularRoutes.map((route, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded p-2 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <span className="truncate text-xs font-medium text-foreground">
                                                    {route.route}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0 text-xs"
                                            >
                                                {route.count}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center text-sm text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity Card */}
                    <Card className="min-w-0 border bg-card shadow-sm md:col-span-2 lg:col-span-1">
                        <CardHeader className="px-3 pt-3 pb-2 sm:px-6 sm:pt-4">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Recent Activity
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Latest bookings & updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                            <div className="max-h-48 space-y-2 overflow-y-auto sm:max-h-64">
                                {recentActivities.length > 0 ? (
                                    recentActivities
                                        .slice(0, 8)
                                        .map((activity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2 rounded p-1.5 transition-colors hover:bg-muted/30"
                                            >
                                                <div
                                                    className={cn(
                                                        'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                                                        activity.status ===
                                                            'active'
                                                            ? 'bg-green-500'
                                                            : activity.status ===
                                                                'completed'
                                                              ? 'bg-blue-500'
                                                              : 'bg-red-500',
                                                    )}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {activity.action}
                                                    </p>
                                                    {activity.route && (
                                                        <p className="mt-0.5 truncate text-xs text-blue-600 dark:text-blue-400">
                                                            {activity.route}
                                                        </p>
                                                    )}
                                                    {activity.fare && (
                                                        <p className="mt-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                                            ₱{activity.fare}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="shrink-0 text-[10px] whitespace-nowrap text-muted-foreground">
                                                    {activity.time}
                                                </span>
                                            </div>
                                        ))
                                ) : (
                                    <div className="py-4 text-center text-sm text-muted-foreground">
                                        No recent activity
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
