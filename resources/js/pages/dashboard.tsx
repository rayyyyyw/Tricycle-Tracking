import { useState, useCallback, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { 
    Car, 
    DollarSign,
    CheckCircle2,
    Download,
    Navigation,
    Calendar,
    Maximize2,
    Minimize2,
    Layers,
    Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import FleetMap, { type FleetMapHandle } from '@/components/map/fleet-map';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Optimized Map Control Component
const MapControls = ({ 
    view, 
    onViewChange, 
    isFullscreen, 
    onToggleFullscreen,
    onCenter
}: { 
    view: 'standard' | 'satellite'; 
    onViewChange: (v: 'standard' | 'satellite') => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onCenter?: () => void;
}) => (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
        <div className="flex bg-muted rounded-lg p-0.5">
            <Button
                variant={view === 'standard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('standard')}
                className="h-7 px-2 text-xs"
            >
                <Layers className="w-3 h-3 mr-1.5" />
                Map
            </Button>
            <Button
                variant={view === 'satellite' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('satellite')}
                className="h-7 px-2 text-xs"
            >
                <Layers className="w-3 h-3 mr-1.5" />
                Satellite
            </Button>
        </div>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={onCenter}>
            <Target className="w-3 h-3" />
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
                    <Minimize2 className="w-3 h-3" />
                    Exit
                </>
            ) : (
                <>
                    <Maximize2 className="w-3 h-3" />
                    Fullscreen
                </>
            )}
        </Button>
    </div>
);

// Optimized Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: { value: string; isPositive: boolean };
}) => (
    <Card className="border shadow-sm hover:shadow transition-shadow bg-card min-w-0">
        <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1 truncate">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-lg font-bold text-foreground truncate">{value}</p>
                        {trend && (
                            <Badge variant="outline" className={cn(
                                "text-xs px-1.5 py-0",
                                trend.isPositive 
                                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
                                    : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                            )}>
                                {trend.isPositive ? '↑' : '↓'} {trend.value}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className={cn("p-2 rounded-lg ml-2 shrink-0", color)}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
        </CardContent>
    </Card>
);

// Optimized Fleet Status Item Component
const FleetStatusItem = ({ status, count, color, percentage }: {
    status: string;
    count: number;
    color: string;
    percentage: number;
}) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full shrink-0", color)}></div>
                <span className="text-foreground truncate">{status}</span>
            </div>
            <span className="font-semibold text-foreground text-nowrap">{count} ({percentage}%)</span>
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
    destination: { lat: number; lng: number; address: string; barangay: string };
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
    activeBookings = []
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
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-3 sm:px-4 shrink-0">
                <div className="flex h-12 sm:h-14 items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">Hinobaan Map</h2>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                {onlineDrivers.length} online • {activeBookings.length} rides • Hinoba-an
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <div className="flex bg-muted rounded-lg p-0.5">
                            <Button
                                variant={view === 'standard' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onViewChange('standard')}
                                className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                            >
                                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                                <span className="hidden sm:inline">Map</span>
                            </Button>
                            <Button
                                variant={view === 'satellite' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onViewChange('satellite')}
                                className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                            >
                                <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                                <span className="hidden sm:inline">Satellite</span>
                            </Button>
                        </div>
                        <Button onClick={onClose} className="h-7 sm:h-8 gap-1.5 text-xs px-2 sm:px-3">
                            <Minimize2 className="w-3.5 h-3.5" />
                            Exit Fullscreen
                        </Button>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
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
        popularRoutes = []
    } = pageProps;
    const onlineDrivers: Driver[] = Array.isArray(pageProps.onlineDrivers) ? (pageProps.onlineDrivers as Driver[]) : [];
    const activeBookings: ActiveBooking[] = Array.isArray(pageProps.activeBookings) ? (pageProps.activeBookings as ActiveBooking[]) : [];
    
    const fleetMapRef = useRef<FleetMapHandle>(null);
    const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    const dashboardData = {
        totalTricycles: stats?.totalTricycles || 0,
        activeTricycles: stats?.activeTricycles || 0,
        todayRevenue: stats?.todayRevenue || 0,
        satisfactionRate: typeof stats?.satisfactionRate === 'number' 
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

            <div className={cn(
                "flex flex-1 flex-col gap-3 sm:gap-4 min-h-0 overflow-auto transition-opacity",
                isMapFullscreen ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3 shrink-0">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">Hinobaan Fleet Dashboard</h1>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">Hinoba-an, Negros Occidental</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="h-8 sm:h-7 gap-1.5 text-xs flex-1 sm:flex-initial">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Today</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 sm:h-7 gap-1.5 text-xs flex-1 sm:flex-initial">
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Export</span>
                        </Button>
                    </div>
                </div>

                {/* Stat Cards - responsive grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 shrink-0">
                    <StatCard
                        title="Today's Revenue"
                        value={`₱${dashboardData.todayRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                        trend={stats?.revenueGrowth !== undefined ? { 
                            value: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%`, 
                            isPositive: stats.revenueGrowth >= 0 
                        } : undefined}
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
                <div className="flex flex-col flex-1 min-h-0">
                    <Card className="border shadow-sm bg-card overflow-hidden">
                        <div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px]">
                            <FleetMap 
                                ref={fleetMapRef}
                                activeTricycles={dashboardData.activeTricycles}
                                view={mapView}
                                onlineDrivers={onlineDrivers}
                                activeBookings={activeBookings}
                            />
                            {/* Unified overlay: title + controls in one bar */}
                            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-2 px-2 sm:px-3 py-2 bg-background/90 dark:bg-background/95 backdrop-blur-sm border-b border-border/50">
                                <span className="text-sm font-semibold text-foreground truncate">Hinobaan Map</span>
                                <MapControls 
                                    view={mapView} 
                                    onViewChange={setMapView}
                                    isFullscreen={isMapFullscreen}
                                    onToggleFullscreen={() => setIsMapFullscreen(true)}
                                    onCenter={handleCenterMap}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Hourly Activity Chart */}
                {hourlyBookings.length > 0 && (
                    <Card className="border shadow-sm bg-card shrink-0">
                        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-4">
                            <CardTitle className="text-sm font-semibold text-foreground">Today's Hourly Activity</CardTitle>
                            <CardDescription className="text-xs">Booking requests by hour</CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 overflow-x-auto">
                            <div className="flex items-end gap-0.5 sm:gap-1 h-24 sm:h-32 min-w-[320px]">
                                {Array.from({ length: 24 }, (_, hour) => {
                                    const hourData = hourlyBookings.find(h => h.hour === hour);
                                    const count = hourData?.count || 0;
                                    const maxCount = Math.max(...hourlyBookings.map(h => h.count), 1);
                                    const height = (count / maxCount) * 100;
                                    
                                    return (
                                        <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                                            <div 
                                                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative group"
                                                style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                                                title={`${hour}:00 - ${count} bookings`}
                                            >
                                                {count > 0 && (
                                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {count}
                                                    </span>
                                                )}
                                            </div>
                                            {hour % 3 === 0 && (
                                                <span className="text-[9px] text-muted-foreground">{hour}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 shrink-0">
                    {/* Fleet Distribution Card */}
                    <Card className="border shadow-sm bg-card min-w-0">
                        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
                            <CardTitle className="text-sm font-semibold text-foreground">Fleet Distribution</CardTitle>
                            <CardDescription className="text-xs">Current status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                            <div className="space-y-3">
                                {fleetStatus.map((item, index) => (
                                    <FleetStatusItem key={index} {...item} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Popular Routes Card */}
                    <Card className="border shadow-sm bg-card min-w-0">
                        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
                            <CardTitle className="text-sm font-semibold text-foreground">Popular Routes</CardTitle>
                            <CardDescription className="text-xs">Top routes this week</CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                                {popularRoutes.length > 0 ? popularRoutes.map((route, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded transition-colors">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                                            </div>
                                            <span className="text-xs font-medium text-foreground truncate">{route.route}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs shrink-0">{route.count}</Badge>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity Card */}
                    <Card className="border shadow-sm bg-card min-w-0 md:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-4">
                            <CardTitle className="text-sm font-semibold text-foreground">Recent Activity</CardTitle>
                            <CardDescription className="text-xs">Latest bookings & updates</CardDescription>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                                {recentActivities.length > 0 ? recentActivities.slice(0, 8).map((activity, index) => (
                                    <div key={index} className="flex items-start gap-2 p-1.5 hover:bg-muted/30 rounded transition-colors">
                                        <div className={cn(
                                            "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                                            activity.status === 'active' ? 'bg-green-500' : 
                                            activity.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                                            {activity.route && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 truncate mt-0.5">
                                                    {activity.route}
                                                </p>
                                            )}
                                            {activity.fare && (
                                                <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-0.5">
                                                    ₱{activity.fare}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{activity.time}</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
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