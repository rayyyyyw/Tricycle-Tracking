import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
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
    XCircle,
    MoreVertical,
    Navigation,
    Calendar,
    BarChart3,
    Download,
    Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    // Enhanced mock data
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
        { id: 1, driver: 'Juan Dela Cruz', action: 'Started trip', time: '2 mins ago', status: 'active', type: 'trip' },
        { id: 2, driver: 'Maria Santos', action: 'Completed trip', time: '5 mins ago', status: 'completed', type: 'trip' },
        { id: 3, driver: 'Pedro Reyes', action: 'Went offline', time: '12 mins ago', status: 'offline', type: 'status' },
        { id: 4, driver: 'Ana Lopez', action: 'Started trip', time: '15 mins ago', status: 'active', type: 'trip' },
        { id: 5, passenger: 'Michael Tan', action: 'New registration', time: '20 mins ago', status: 'success', type: 'registration' },
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
        { label: 'Active Trips', value: '8', icon: Navigation, color: 'text-blue-600' },
        { label: 'Pending Requests', value: '3', icon: Clock, color: 'text-orange-600' },
        { label: 'Issues Reported', value: '1', icon: AlertCircle, color: 'text-red-600' },
        { label: 'Satisfaction Rate', value: '96%', icon: CheckCircle2, color: 'text-green-600' },
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
                        <p className="text-muted-foreground mt-1">Real-time monitoring of your tricycle fleet and operations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Today
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickStats.map((stat, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg bg-muted`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Key Metrics */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Total Revenue Card */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Revenue
                                    </CardTitle>
                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">₱{dashboardData.totalRevenue.toLocaleString()}</div>
                                    <div className="flex items-center text-xs text-green-600 mt-1">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        +12.5% from last month
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                            <span>Today</span>
                                            <span>₱{dashboardData.todayRevenue.toLocaleString()}</span>
                                        </div>
                                        <Progress value={65} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Trips Card */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Active Trips
                                    </CardTitle>
                                    <Car className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{dashboardData.todayTrips}</div>
                                    <div className="flex items-center text-xs text-green-600 mt-1">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        {dashboardData.completedTrips} completed today
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Success Rate</span>
                                            <span className="text-foreground font-medium">89%</span>
                                        </div>
                                        <Progress value={89} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fleet Utilization */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Fleet Utilization
                                    </CardTitle>
                                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{dashboardData.utilizationRate}%</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {dashboardData.activeTricycles} of {dashboardData.totalTricycles} tricycles active
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Capacity</span>
                                            <span className="text-foreground font-medium">18/24</span>
                                        </div>
                                        <Progress value={dashboardData.utilizationRate} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Driver Performance */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Driver Performance
                                    </CardTitle>
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{dashboardData.avgRating}/5</div>
                                    <div className="flex items-center text-xs text-green-600 mt-1">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        Average rating
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Active Drivers</span>
                                            <span className="text-foreground font-medium">{dashboardData.activeDrivers}/{dashboardData.totalDrivers}</span>
                                        </div>
                                        <Progress value={(dashboardData.activeDrivers / dashboardData.totalDrivers) * 100} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Chart */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-foreground">Revenue Overview</CardTitle>
                                    <CardDescription>Weekly revenue performance</CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Filter className="w-4 h-4 mr-2" />
                                            This Week
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>This Week</DropdownMenuItem>
                                        <DropdownMenuItem>This Month</DropdownMenuItem>
                                        <DropdownMenuItem>This Quarter</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-end justify-between gap-2">
                                    {revenueData.map((day, index) => (
                                        <div key={index} className="flex flex-col items-center flex-1">
                                            <div 
                                                className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer"
                                                style={{ height: `${(day.amount / 3000) * 100}%` }}
                                            ></div>
                                            <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                                            <span className="text-xs font-medium text-foreground">₱{day.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Status & Activity */}
                    <div className="space-y-6">
                        {/* System Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-foreground">System Status</CardTitle>
                                <CardDescription>Current system health</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="font-medium text-foreground">All Systems Operational</span>
                                    </div>
                                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                        Online
                                    </Badge>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">API Response Time</span>
                                        <span className="text-foreground font-medium">124ms</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Uptime</span>
                                        <span className="text-foreground font-medium">99.9%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Active Connections</span>
                                        <span className="text-foreground font-medium">247</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tricycle Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-foreground">Fleet Status</CardTitle>
                                <CardDescription>Tricycle availability</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tricycleStatus.map((item, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                                <span className="text-sm font-medium text-foreground">{item.status}</span>
                                            </div>
                                            <span className="text-sm font-bold text-foreground">{item.count}</span>
                                        </div>
                                        <Progress value={item.percentage} className="h-1" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-foreground">Recent Activity</CardTitle>
                                <Button variant="ghost" size="sm">View All</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${
                                                activity.status === 'active' || activity.status === 'success' ? 'bg-green-500' : 
                                                activity.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {activity.driver || activity.passenger}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
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
                    </div>
                </div>

                {/* Performance Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Performance Metrics</CardTitle>
                        <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {performanceMetrics.map((metric, index) => (
                                <div key={index} className="text-center">
                                    <div className={`text-2xl font-bold text-foreground mb-2`}>
                                        {metric.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-1">
                                        {metric.label}
                                    </div>
                                    <div className={`text-xs ${
                                        metric.trend === 'up' ? 'text-green-600' : 
                                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        {metric.change} from last week
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Live Map Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Live Fleet Map</CardTitle>
                        <CardDescription>Real-time tricycle locations and activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-foreground font-medium mb-2">Live GPS Tracking Active</p>
                                <p className="text-muted-foreground text-sm">
                                    Tracking {dashboardData.activeTricycles} tricycles in real-time
                                </p>
                                <Button className="mt-4">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Open Full Map
                                </Button>
                            </div>
                            
                            {/* Simulated moving dots for live effect */}
                            <div className="absolute top-4 right-4 flex gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}