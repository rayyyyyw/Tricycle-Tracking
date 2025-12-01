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
    Filter,
    Maximize2,
    Minimize2,
    Navigation,
    Calendar,
    BarChart3,
    Map
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FleetMap from '@/components/map/fleet-map';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');

    // Enhanced mock data for Hinobaan
    const dashboardData = {
        totalTricycles: 24,
        activeTricycles: 18,
        totalDrivers: 22,
        activeDrivers: 20,
        totalPassengers: 156,
        newPassengers: 12,
        todayTrips: 47,
        completedTrips: 42,
        totalRevenue: 12540,
        todayRevenue: 1840,
        systemStatus: 'online',
        utilizationRate: 75,
        avgRating: 4.8
    };

    const recentActivities = [
        { id: 1, driver: 'Juan Dela Cruz', action: 'Started trip from Poblacion to Bacuyangan', time: '2 mins ago', status: 'active' },
        { id: 2, driver: 'Maria Santos', action: 'Completed trip to Alim', time: '5 mins ago', status: 'completed' },
        { id: 3, driver: 'Pedro Reyes', action: 'Went offline near Dawis', time: '12 mins ago', status: 'offline' },
        { id: 4, driver: 'Ana Lopez', action: 'Started trip to Bito-on', time: '15 mins ago', status: 'active' },
        { id: 5, passenger: 'Michael Tan', action: 'New registration from San Rafael', time: '20 mins ago', status: 'success' },
    ];

    const tricycleStatus = [
        { status: 'Active', count: 18, color: 'bg-green-500', percentage: 75 },
        { status: 'Maintenance', count: 3, color: 'bg-yellow-500', percentage: 12.5 },
        { status: 'Offline', count: 3, color: 'bg-red-500', percentage: 12.5 },
    ];

    const performanceMetrics = [
        { label: 'On-time Rate', value: '94%', trend: 'up', change: '+2%' },
        { label: 'Customer Rating', value: '4.8/5', trend: 'up', change: '+0.1' },
        { label: 'Trip Completion', value: '98%', trend: 'stable', change: '0%' },
        { label: 'Response Time', value: '2.3min', trend: 'down', change: '-0.5min' },
    ];

    const quickStats = [
        { label: 'Active Trips', value: '8', icon: Navigation, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Requests', value: '3', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Issues Reported', value: '1', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Satisfaction Rate', value: '96%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const revenueData = [
        { day: 'Mon', amount: 1800 },
        { day: 'Tue', amount: 2200 },
        { day: 'Wed', amount: 1900 },
        { day: 'Thu', amount: 2400 },
        { day: 'Fri', amount: 2100 },
        { day: 'Sat', amount: 2800 },
        { day: 'Sun', amount: 1250 },
    ];

    // Hinobaan-specific areas
    const hinobaanAreas = [
        { name: 'Poblacion', trips: 24, revenue: 3200 },
        { name: 'Alim', trips: 18, revenue: 2450 },
        { name: 'Bacuyangan', trips: 15, revenue: 2100 },
        { name: 'San Rafael', trips: 12, revenue: 1800 },
        { name: 'Bito-on', trips: 10, revenue: 1500 },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Hinobaan Tricycle Fleet" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Hinobaan Fleet Dashboard</h1>
                        <p className="text-sm text-muted-foreground mt-1">Monitoring tricycle operations in Hinobaan, Negros Occidental</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9">
                            <Calendar className="w-4 h-4 mr-2" />
                            Today
                        </Button>
                        <Button variant="outline" size="sm" className="h-9">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickStats.map((stat, index) => (
                        <Card key={index} className="border shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Revenue & Fleet Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">Daily Revenue</CardTitle>
                                            <CardDescription>Today: ₱{dashboardData.todayRevenue.toLocaleString()}</CardDescription>
                                        </div>
                                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₱{dashboardData.totalRevenue.toLocaleString()}</div>
                                    <div className="flex items-center text-xs text-green-600 mt-1">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        +12.5% from last week
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">Weekly progress</span>
                                            <span>65%</span>
                                        </div>
                                        <Progress value={65} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">Fleet Status</CardTitle>
                                            <CardDescription>{dashboardData.activeTricycles} active</CardDescription>
                                        </div>
                                        <Car className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {tricycleStatus.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                                    <span className="text-sm">{item.status}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">{item.count}</span>
                                                    <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Chart */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">Weekly Revenue</CardTitle>
                                        <CardDescription>By area in Hinobaan</CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8">
                                                <Filter className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>This Week</DropdownMenuItem>
                                            <DropdownMenuItem>This Month</DropdownMenuItem>
                                            <DropdownMenuItem>This Quarter</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-40 flex items-end justify-between gap-1">
                                    {revenueData.map((day, index) => (
                                        <div key={index} className="flex flex-col items-center flex-1 group">
                                            <div 
                                                className="w-full max-w-8 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer group-hover:opacity-80"
                                                style={{ height: `${(day.amount / 3000) * 100}%` }}
                                            ></div>
                                            <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                                            <span className="text-xs font-medium hidden group-hover:block">₱{day.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {performanceMetrics.map((metric, index) => (
                                        <div key={index} className="text-center space-y-1">
                                            <div className={`text-xl font-bold ${
                                                metric.trend === 'up' ? 'text-green-600' : 
                                                metric.trend === 'down' ? 'text-red-600' : 'text-foreground'
                                            }`}>
                                                {metric.value}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {metric.label}
                                            </div>
                                            <div className={`text-xs ${
                                                metric.trend === 'up' ? 'text-green-600' : 
                                                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                            }`}>
                                                {metric.change}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* System Status */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">System Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium">All Systems Operational</span>
                                    </div>
                                    <Badge variant="outline" className="bg-green-100 text-green-800">
                                        Online
                                    </Badge>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">GPS Accuracy</span>
                                        <span className="font-medium">High</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Signal Strength</span>
                                        <span className="font-medium">Excellent</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Updated</span>
                                        <span className="font-medium">Just now</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Recent Activity</CardTitle>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                                        View All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-2 text-sm">
                                            <div className={`mt-1 w-1.5 h-1.5 rounded-full ${
                                                activity.status === 'active' ? 'bg-green-500' : 
                                                activity.status === 'completed' ? 'bg-blue-500' : 
                                                activity.status === 'success' ? 'bg-green-500' : 'bg-gray-500'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">
                                                    {activity.driver || activity.passenger}
                                                </p>
                                                <p className="text-muted-foreground text-xs truncate">
                                                    {activity.action}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {activity.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Areas */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Top Areas</CardTitle>
                                <CardDescription>By trip volume</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {hinobaanAreas.map((area, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{area.name}</p>
                                                    <p className="text-xs text-muted-foreground">{area.trips} trips</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-sm">₱{area.revenue}</p>
                                                <p className="text-xs text-green-600">+{Math.floor(Math.random() * 20) + 5}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map Card */}
                        <Card className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">Live Fleet Map</CardTitle>
                                        <CardDescription>Hinobaan, Negros Occidental</CardDescription>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        onClick={() => setIsMapExpanded(true)}
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <FleetMap activeTricycles={dashboardData.activeTricycles} />
                                <div className="p-3 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Map className="w-4 h-4 text-muted-foreground" />
                                            <span>8 tricycles visible</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="h-auto p-0"
                                            onClick={() => setIsMapExpanded(true)}
                                        >
                                            Expand view
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Expanded Map Modal */}
            <Dialog open={isMapExpanded} onOpenChange={setIsMapExpanded}>
                <DialogContent className="max-w-7xl h-[85vh] p-0">
                    <DialogHeader className="p-6 pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl">Hinobaan Fleet Tracking</DialogTitle>
                                <DialogDescription>
                                    Real-time location tracking of tricycles in Hinobaan, Negros Occidental
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            {mapView === 'standard' ? 'Standard View' : 'Satellite View'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setMapView('standard')}>
                                            Standard Map
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setMapView('satellite')}>
                                            Satellite View
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" size="sm" onClick={() => setIsMapExpanded(false)}>
                                    <Minimize2 className="w-4 h-4 mr-2" />
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 p-6 pt-0">
                        <div className="w-full h-full rounded-lg overflow-hidden border shadow-sm">
                            <FleetMap isExpanded={true} activeTricycles={dashboardData.activeTricycles} />
                            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-medium">Active Tricycles</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span className="font-medium">Maintenance</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                        <span className="font-medium">Offline</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm">
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Center Map
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}