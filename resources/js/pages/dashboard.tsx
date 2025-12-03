import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    TrendingUp, 
    Users, 
    Car, 
    DollarSign, 
    MapPin, 
    Clock, 
    AlertCircle,
    CheckCircle2,
    Download,
    Navigation,
    Calendar,
    Activity,
    BarChart3,
    Radio
} from 'lucide-react';
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

// Fixed Map Control Component with proper types
const MapControls = ({ view, onViewChange }: { view: 'standard' | 'satellite'; onViewChange: (v: 'standard' | 'satellite') => void }) => (
    <div className="flex items-center gap-2">
        <div className="flex bg-muted rounded-lg p-1">
            <Button
                variant={view === 'standard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('standard')}
                className="h-8 px-3"
            >
                Map
            </Button>
            <Button
                variant={view === 'satellite' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('satellite')}
                className="h-8 px-3"
            >
                Satellite
            </Button>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
            <Navigation className="w-4 h-4" />
            Center
        </Button>
    </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string;
    value: string;
    icon: any;
    color: string;
    trend?: { value: string; isPositive: boolean };
}) => (
    <Card className="border shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                        {trend && (
                            <Badge variant="outline" className={cn(
                                "text-xs",
                                trend.isPositive 
                                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
                                    : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                            )}>
                                {trend.isPositive ? '↑' : '↓'} {trend.value}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className={cn("p-3 rounded-lg", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </CardContent>
    </Card>
);

// System Status Component
const SystemStatus = () => (
    <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                    <p className="font-medium text-sm text-foreground">All Systems Operational</p>
                    <p className="text-xs text-muted-foreground">Last checked: Just now</p>
                </div>
            </div>
            <Badge className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-800">
                Online
            </Badge>
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">GPS Accuracy</span>
                <span className="font-semibold text-foreground">High</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Signal Strength</span>
                <span className="font-semibold text-foreground">Excellent</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Update Interval</span>
                <span className="font-semibold text-foreground">30 seconds</span>
            </div>
        </div>
    </div>
);

// Fleet Status Item Component
const FleetStatusItem = ({ status, count, color, percentage }: {
    status: string;
    count: number;
    color: string;
    percentage: number;
}) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", color)}></div>
                <span className="text-foreground">{status}</span>
            </div>
            <span className="font-semibold text-foreground">{count} ({percentage}%)</span>
        </div>
        <Progress value={percentage} className="h-2" />
    </div>
);

// Map Status Summary Component
const MapStatusSummary = ({ activeTricycles, totalTricycles }: { activeTricycles: number; totalTricycles: number }) => (
    <div className="h-full flex flex-col">
        <div className="flex-1">
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">Live Tracking Status</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-lg font-bold text-foreground">{activeTricycles}</div>
                            <div className="text-xs text-muted-foreground mt-1">Active Now</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-lg font-bold text-foreground">{totalTricycles - activeTricycles}</div>
                            <div className="text-xs text-muted-foreground mt-1">Offline</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">Vehicle Status</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-foreground">Moving</span>
                            </div>
                            <span className="font-semibold text-foreground">12</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-foreground">Stopped</span>
                            </div>
                            <span className="font-semibold text-foreground">6</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-foreground">Low Battery</span>
                            </div>
                            <span className="font-semibold text-foreground">3</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">Coverage Areas</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Poblacion</span>
                            <span className="font-semibold text-foreground">8 vehicles</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Alim</span>
                            <span className="font-semibold text-foreground">5 vehicles</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Bacuyangan</span>
                            <span className="font-semibold text-foreground">3 vehicles</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
                <Radio className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Live data streaming</span>
                <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');

    const dashboardData = {
        totalTricycles: 24,
        activeTricycles: 18,
        totalDrivers: 22,
        activeDrivers: 20,
        todayTrips: 47,
        completedTrips: 42,
        todayRevenue: 1840,
        totalRevenue: 12540,
        activeTrips: 8,
        pendingRequests: 3,
        issuesReported: 1,
        satisfactionRate: '96%',
        avgRating: 4.8,
        utilizationRate: 75
    };

    const fleetStatus = [
        { status: 'Active', count: 18, color: 'bg-green-500', percentage: 75 },
        { status: 'Maintenance', count: 3, color: 'bg-yellow-500', percentage: 12.5 },
        { status: 'Offline', count: 3, color: 'bg-red-500', percentage: 12.5 },
    ];

    const topAreas = [
        { name: 'Poblacion', trips: 24, revenue: 3200, trend: '+12%' },
        { name: 'Alim', trips: 18, revenue: 2450, trend: '+8%' },
        { name: 'Bacuyangan', trips: 15, revenue: 2100, trend: '+15%' },
    ];

    const performanceMetrics = [
        { label: 'On-time Rate', value: '94%', trend: 'up' },
        { label: 'Customer Rating', value: '4.8/5', trend: 'up' },
        { label: 'Trip Completion', value: '98%', trend: 'stable' },
        { label: 'Response Time', value: '2.3min', trend: 'down' },
    ];

    const recentActivities = [
        { driver: 'Juan Dela Cruz', action: 'Started trip from Poblacion to Bacuyangan', time: '2 mins ago', status: 'active' },
        { driver: 'Maria Santos', action: 'Completed trip to Alim', time: '5 mins ago', status: 'completed' },
        { driver: 'Pedro Reyes', action: 'Reported vehicle issue near Dawis', time: '12 mins ago', status: 'issue' },
        { driver: 'Ana Lopez', action: 'Started trip to Bito-on', time: '15 mins ago', status: 'active' },
        { passenger: 'Michael Tan', action: 'New passenger registration completed', time: '20 mins ago', status: 'success' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Hinobaan Tricycle Fleet" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Hinobaan Fleet Dashboard</h1>
                        <p className="text-sm text-muted-foreground mt-1">Real-time monitoring and management system</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2">
                            <Calendar className="w-4 h-4" />
                            Today
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Top 4 Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Today's Revenue"
                        value={`₱${dashboardData.todayRevenue.toLocaleString()}`}
                        icon={DollarSign}
                        color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                        trend={{ value: '+12.5%', isPositive: true }}
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

                {/* Main Content Area: Map (75%) + Summary (25%) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                    {/* Map Card - Takes 3 columns (75%) - Made Bigger */}
                    <div className="lg:col-span-3 flex flex-col min-h-0">
                        <Card className="h-full border shadow-sm bg-card flex flex-col overflow-hidden">
                            <CardHeader className="pb-3 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg text-foreground">Live Fleet Tracking</CardTitle>
                                        <CardDescription>Real-time GPS monitoring across Hinobaan</CardDescription>
                                    </div>
                                    <MapControls view={mapView} onViewChange={setMapView} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 min-h-0">
                                <div className="w-full h-full">
                                    <FleetMap 
                                        activeTricycles={dashboardData.activeTricycles}
                                        view={mapView}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Map Status Summary Card - Takes 1 column (25%) */}
                    <div className="flex flex-col min-h-0">
                        <Card className="h-full border shadow-sm bg-card">
                            <CardHeader>
                                <CardTitle className="text-base text-foreground">Map Status</CardTitle>
                                <CardDescription>Live tracking overview</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col h-full">
                                <MapStatusSummary 
                                    activeTricycles={dashboardData.activeTricycles}
                                    totalTricycles={dashboardData.totalTricycles}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* System Status Card */}
                    <Card className="border shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">System Status</CardTitle>
                            <CardDescription>Current operational status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SystemStatus />
                        </CardContent>
                    </Card>

                    {/* Fleet Distribution Card */}
                    <Card className="border shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Fleet Distribution</CardTitle>
                            <CardDescription>Current status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {fleetStatus.map((item, index) => (
                                    <FleetStatusItem key={index} {...item} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border shadow-sm bg-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-foreground">Recent Activity</CardTitle>
                                <Tabs defaultValue="all" className="w-auto">
                                    <TabsList className="h-8 bg-muted">
                                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                        <TabsTrigger value="trips" className="text-xs">Trips</TabsTrigger>
                                        <TabsTrigger value="issues" className="text-xs">Issues</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                        <div className={cn(
                                            "mt-1.5 w-2 h-2 rounded-full",
                                            activity.status === 'active' ? 'bg-green-500' : 
                                            activity.status === 'completed' ? 'bg-blue-500' : 
                                            activity.status === 'issue' ? 'bg-red-500' : 'bg-green-500'
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-foreground">
                                                {activity.driver || activity.passenger}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{activity.action}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}