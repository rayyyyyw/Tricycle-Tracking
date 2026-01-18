import { useState, useCallback } from 'react';
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
    Radio,
    Maximize2,
    Minimize2,
    Layers,
    Map,
    Target,
    Trash2,
    Route} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FleetMap from '@/components/map/fleet-map';
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
    onToggleFullscreen 
}: { 
    view: 'standard' | 'satellite'; 
    onViewChange: (v: 'standard' | 'satellite') => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}) => (
    <div className="flex flex-wrap items-center gap-2">
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
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
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
    <Card className="border shadow-sm hover:shadow transition-shadow bg-card">
        <CardContent className="p-4">
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

// Optimized System Status Component
const SystemStatus = () => (
    <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">All Systems Operational</p>
                    <p className="text-xs text-muted-foreground truncate">Last checked: Just now</p>
                </div>
            </div>
            <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-800 text-xs">
                Online
            </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">GPS Accuracy</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">High</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">Signal Strength</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">Excellent</div>
            </div>
        </div>
    </div>
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

// Optimized Map Status Summary Component
interface MapStatusSummaryProps {
    activeTricycles: number;
    totalTricycles: number;
    customMarkersCount: number;
    routeDistance?: string;
    routeDuration?: string;
    onCalculateRoute: () => void;
    onClearMarkers: () => void;
    onClearRoute: () => void;
}

const MapStatusSummary = ({ 
    activeTricycles, 
    totalTricycles,
    customMarkersCount = 0,
    routeDistance,
    routeDuration,
    onCalculateRoute,
    onClearMarkers,
    onClearRoute
}: MapStatusSummaryProps) => (
    <div className="h-full flex flex-col gap-3">
        {/* Live Tracking Status */}
        <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">Live Tracking</h3>
            <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                    <div className="text-base font-bold text-foreground">{activeTricycles}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Active Now</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    <div className="text-base font-bold text-foreground">{totalTricycles - activeTricycles}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Offline</div>
                </div>
            </div>
        </div>

        {/* Map Controls */}
        <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground">Map Controls</h3>
            <div className="space-y-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start gap-2 h-8"
                    onClick={onCalculateRoute}
                >
                    <Route className="w-3.5 h-3.5" />
                    <span className="text-xs">Calculate Route</span>
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start gap-1.5 h-8"
                        onClick={onClearMarkers}
                        disabled={customMarkersCount === 0}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-xs">Markers ({customMarkersCount})</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start gap-1.5 h-8"
                        onClick={onClearRoute}
                        disabled={!routeDistance && !routeDuration}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-xs">Clear Route</span>
                    </Button>
                </div>
            </div>
        </div>

        {/* Route Information */}
        {(routeDistance || routeDuration) && (
            <div>
                <h3 className="text-sm font-semibold mb-2 text-foreground">Route Info</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                        <div className="text-xs text-muted-foreground">Distance</div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">{routeDistance}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-0.5">{routeDuration}</div>
                    </div>
                </div>
            </div>
        )}

        {/* How to Use */}
        <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2 text-foreground">How to Use</h3>
            <div className="space-y-1.5">
                <div className="flex items-start gap-1.5 text-xs">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-medium">1</span>
                    </div>
                    <span className="text-muted-foreground">Click on map to add marker</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-medium">2</span>
                    </div>
                    <span className="text-muted-foreground">Click "Calculate Route"</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-medium">3</span>
                    </div>
                    <span className="text-muted-foreground">Blue line shows road path</span>
                </div>
            </div>
        </div>

        {/* Live Status */}
        <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs">
                <Radio className="w-3.5 h-3.5 text-green-500" />
                <span className="text-muted-foreground">Live streaming</span>
                <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

// Optimized Fullscreen Map Component
const FullscreenMap = ({ 
    isFullscreen, 
    onClose,
    view,
    onViewChange,
    activeTricycles 
}: { 
    isFullscreen: boolean;
    onClose: () => void;
    view: 'standard' | 'satellite';
    onViewChange: (v: 'standard' | 'satellite') => void;
    activeTricycles: number;
}) => {
    if (!isFullscreen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
                <div className="flex h-14 items-center">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-primary" />
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-foreground truncate">Live Fleet Tracking</h2>
                            <p className="text-xs text-muted-foreground truncate">
                                {activeTricycles} vehicles active • Hinoba-an, Negros Occidental
                            </p>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="flex bg-muted rounded-lg p-0.5">
                            <Button
                                variant={view === 'standard' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onViewChange('standard')}
                                className="h-8 px-3 text-xs"
                            >
                                <Layers className="w-3.5 h-3.5 mr-1.5" />
                                Map
                            </Button>
                            <Button
                                variant={view === 'satellite' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => onViewChange('satellite')}
                                className="h-8 px-3 text-xs"
                            >
                                <Layers className="w-3.5 h-3.5 mr-1.5" />
                                Satellite
                            </Button>
                        </div>
                        <Button onClick={onClose} className="h-8 gap-1.5 text-xs">
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
                />
            </div>
        </div>
    );
};

interface DashboardProps {
    stats?: {
        todayRevenue: number;
        revenueGrowth: number;
        activeTrips: number;
        totalTricycles: number;
        activeTricycles: number;
        satisfactionRate: string;
        totalDrivers?: number;
        activeDrivers?: number;
        totalPassengers?: number;
        activePassengers?: number;
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
    }>;
}

export default function Dashboard() {
    const { stats, fleetStatus: propFleetStatus, recentActivities: propRecentActivities } = usePage<DashboardProps>().props;
    const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [customMarkersCount, setCustomMarkersCount] = useState(0);
    const [routeDistance, setRouteDistance] = useState<string>('');
    const [routeDuration, setRouteDuration] = useState<string>('');

    const dashboardData = {
        totalTricycles: stats?.totalTricycles || 0,
        activeTricycles: stats?.activeTricycles || 0,
        todayRevenue: stats?.todayRevenue || 0,
        satisfactionRate: stats?.satisfactionRate || '0%',
        activeTrips: stats?.activeTrips || 0,
    };

    const fleetStatus = propFleetStatus || [
        { status: 'Active', count: 0, color: 'bg-green-500', percentage: 0 },
        { status: 'Offline', count: 0, color: 'bg-red-500', percentage: 0 },
    ];

    const recentActivities = propRecentActivities || [];

    const handleMarkerAdd = useCallback((count: number) => {
        setCustomMarkersCount(count);
    }, []);

    const handleRouteCalculated = useCallback((distance: string, duration: string) => {
        setRouteDistance(distance);
        setRouteDuration(duration);
    }, []);

    const handleCalculateRoute = useCallback(() => {
        // This function is called when "Calculate Route" button is clicked
        // Add route calculation logic here
        console.log('Calculate route triggered');
    }, []);

    const handleClearMarkers = useCallback(() => {
        setCustomMarkersCount(0);
        // Add marker clearing logic here
        console.log('Clear markers triggered');
    }, []);

    const handleClearRoute = useCallback(() => {
        setRouteDistance('');
        setRouteDuration('');
        // Add route clearing logic here
        console.log('Clear route triggered');
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
            />

            <div className={cn(
                "flex h-full flex-1 flex-col gap-4 p-4 md:p-5 transition-opacity",
                isMapFullscreen ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
                {/* Header - Optimized */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">Hinobaan Fleet Dashboard</h1>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">Real-time monitoring system • Hinoba-an, Negros Occidental</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            Today
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Top Cards - Optimized */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                        title="Fleet Status"
                        value={`${dashboardData.activeTricycles}/${dashboardData.totalTricycles}`}
                        icon={Car}
                        color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    />
                    <StatCard
                        title="Satisfaction Rate"
                        value={dashboardData.satisfactionRate}
                        icon={CheckCircle2}
                        color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    />
                </div>

                {/* Main Content Area - Optimized */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
                    {/* Map Card - Takes 3 columns */}
                    <div className="lg:col-span-3 flex flex-col min-h-0">
                        <Card className="h-full border shadow-sm bg-card flex flex-col overflow-hidden">
                            <CardHeader className="pb-2 shrink-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <CardTitle className="text-base text-foreground truncate">Live Fleet Tracking</CardTitle>
                                        <CardDescription className="truncate">Real-time GPS monitoring across Hinobaan</CardDescription>
                                    </div>
                                    <MapControls 
                                        view={mapView} 
                                        onViewChange={setMapView}
                                        isFullscreen={isMapFullscreen}
                                        onToggleFullscreen={() => setIsMapFullscreen(true)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 min-h-0">
                                <div className="w-full h-full relative">
                                    <FleetMap 
                                        activeTricycles={dashboardData.activeTricycles}
                                        view={mapView}
                                        onMarkerAdd={handleMarkerAdd}
                                        onRouteCalculated={handleRouteCalculated}
                                    />
                                    <div className="absolute bottom-3 right-3 z-10">
                                        <Badge className="bg-background/90 backdrop-blur-sm border text-foreground hover:bg-background/90 text-xs px-2 py-1">
                                            <Map className="w-3 h-3 mr-1" />
                                            {dashboardData.activeTricycles} active
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Map Status Summary Card - Takes 1 column */}
                    <div className="flex flex-col min-h-0">
                        <Card className="h-full border shadow-sm bg-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground">Map Status & Controls</CardTitle>
                                <CardDescription className="text-xs">Live tracking overview</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col h-full">
                                <MapStatusSummary 
                                    activeTricycles={dashboardData.activeTricycles}
                                    totalTricycles={dashboardData.totalTricycles}
                                    customMarkersCount={customMarkersCount}
                                    routeDistance={routeDistance}
                                    routeDuration={routeDuration}
                                    onCalculateRoute={handleCalculateRoute}
                                    onClearMarkers={handleClearMarkers}
                                    onClearRoute={handleClearRoute}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Row - Optimized */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* System Status Card */}
                    <Card className="border shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-foreground">System Status</CardTitle>
                            <CardDescription className="text-xs">Operational status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SystemStatus />
                        </CardContent>
                    </Card>

                    {/* Fleet Distribution Card */}
                    <Card className="border shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-foreground">Fleet Distribution</CardTitle>
                            <CardDescription className="text-xs">Current status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {fleetStatus.map((item, index) => (
                                    <FleetStatusItem key={index} {...item} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity Card */}
                    <Card className="border shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground">Recent Activity</CardTitle>
                                <Tabs defaultValue="all" className="w-auto">
                                    <TabsList className="h-7 bg-muted">
                                        <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
                                        <TabsTrigger value="trips" className="text-xs px-2">Trips</TabsTrigger>
                                        <TabsTrigger value="issues" className="text-xs px-2">Issues</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-2 p-1.5 hover:bg-muted/30 rounded transition-colors">
                                        <div className={cn(
                                            "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                                            activity.status === 'active' ? 'bg-green-500' : 
                                            activity.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-xs text-foreground truncate">
                                                {activity.driver}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
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