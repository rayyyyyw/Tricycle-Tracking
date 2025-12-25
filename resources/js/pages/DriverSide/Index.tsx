import DriverLayout from '@/layouts/DriverLayout';
import { Head } from '@inertiajs/react';
import { 
    TrendingUp, 
    Car, 
    Star, 
    Clock, 
    DollarSign, 
    Users, 
    Award,
    Shield,
    Bell,
    Navigation
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
    // Mock data - replace with actual data from your backend
    const stats = {
        totalEarnings: 12540.75,
        completedRides: 47,
        rating: 4.8,
        weeklyRides: 12,
        activeHours: 36,
        cancellationRate: 2.1
    };

    const recentActivity = [
        { id: 1, type: 'ride', description: 'Completed ride to City Center', time: '2 hours ago', amount: 245.50 },
        { id: 2, type: 'rating', description: 'Received 5-star rating', time: '4 hours ago', amount: null },
        { id: 3, type: 'earning', description: 'Weekly bonus added', time: '1 day ago', amount: 500.00 },
    ];

    const quickActions = [
        { icon: <Navigation className="w-5 h-5" />, label: 'Go Online', color: 'bg-emerald-600 hover:bg-emerald-700' },
        { icon: <DollarSign className="w-5 h-5" />, label: 'View Earnings', color: 'bg-blue-600 hover:bg-blue-700' },
        { icon: <Clock className="w-5 h-5" />, label: 'Ride History', color: 'bg-purple-600 hover:bg-purple-700' },
        { icon: <Users className="w-5 h-5" />, label: 'Support', color: 'bg-orange-600 hover:bg-orange-700' },
    ];

    return (
        <DriverLayout>
            <Head title="Driver Dashboard" />
            
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Welcome back! Ready to start driving?
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified Driver
                        </Badge>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Notifications
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Earnings */}
                    <Card className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{stats.totalEarnings.toLocaleString()}</div>
                            <div className="flex items-center text-xs text-emerald-600 mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +12% from last week
                            </div>
                            <Progress value={65} className="mt-2" />
                        </CardContent>
                    </Card>

                    {/* Completed Rides */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
                            <Car className="w-4 h-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completedRides}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                +{stats.weeklyRides} this week
                            </p>
                        </CardContent>
                    </Card>

                    {/* Rating */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rating</CardTitle>
                            <Star className="w-4 h-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold">{stats.rating}</div>
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${
                                                star <= Math.floor(stats.rating)
                                                    ? 'text-yellow-500 fill-yellow-500'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Based on 38 reviews
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Hours */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Hours</CardTitle>
                            <Clock className="w-4 h-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeHours}h</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                This month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Quick Actions & Performance */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Frequently used actions and shortcuts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {quickActions.map((action, index) => (
                                        <Button
                                            key={index}
                                            className={`h-20 flex flex-col gap-2 ${action.color} text-white transition-all hover:scale-105`}
                                        >
                                            {action.icon}
                                            <span className="text-sm">{action.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>
                                    Your driving performance overview
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Acceptance Rate</span>
                                    <span className="text-sm font-bold text-emerald-600">98%</span>
                                </div>
                                <Progress value={98} className="w-full" />

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Cancellation Rate</span>
                                    <span className="text-sm font-bold text-orange-600">{stats.cancellationRate}%</span>
                                </div>
                                <Progress value={stats.cancellationRate} className="w-full" />

                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">On-time Arrival</span>
                                    <span className="text-sm font-bold text-blue-600">94%</span>
                                </div>
                                <Progress value={94} className="w-full" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Recent Activity & Achievements */}
                    <div className="space-y-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Your latest rides and updates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            activity.type === 'ride' ? 'bg-blue-100 text-blue-600' :
                                            activity.type === 'rating' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {activity.type === 'ride' && <Car className="w-4 h-4" />}
                                            {activity.type === 'rating' && <Star className="w-4 h-4" />}
                                            {activity.type === 'earning' && <DollarSign className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                        {activity.amount && (
                                            <div className="text-sm font-bold text-emerald-600">
                                                +₱{activity.amount}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Achievements</CardTitle>
                                <CardDescription>
                                    Your driver milestones
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-medium">50 Rides</p>
                                        <p className="text-xs text-muted-foreground">Complete 50 rides</p>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto">2 more</Badge>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                                    <Star className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-medium">5-Star Rating</p>
                                        <p className="text-xs text-muted-foreground">Maintain 5.0 for a week</p>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto">In Progress</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Section - Weekly Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Overview</CardTitle>
                        <CardDescription>
                            Your performance for the current week
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">{stats.weeklyRides}</div>
                                <div className="text-sm text-muted-foreground">Rides</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">₱2,845</div>
                                <div className="text-sm text-muted-foreground">Earnings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">18.5h</div>
                                <div className="text-sm text-muted-foreground">Online Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">4.9</div>
                                <div className="text-sm text-muted-foreground">Avg. Rating</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DriverLayout>
    );
}