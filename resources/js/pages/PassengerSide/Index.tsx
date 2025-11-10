import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    MapPin, 
    Clock, 
    Star, 
    ArrowUpRight, 
    Calendar,
    Navigation,
    Wallet
} from 'lucide-react';
import { type SharedData } from '@/types';

export default function Index() {
    const { auth } = usePage<SharedData>().props;

    return (
        <PassengerLayout>
            <Head title="Dashboard" />
            
            {/* Dashboard Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Welcome back, {auth.user.name}!</h1>
                <p className="text-muted-foreground mt-2">Here's your travel overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                        <Navigation className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-gray-500">+12% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱1,240</div>
                        <p className="text-xs text-gray-500">+₱320 this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.8</div>
                        <p className="text-xs text-gray-500">Based on 18 reviews</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                        <Clock className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18h</div>
                        <p className="text-xs text-gray-500">Compared to walking</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Rides */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Rides</CardTitle>
                        <CardDescription>Your last 5 tricycle rides</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { from: 'SM City', to: 'Home', date: 'Today, 3:30 PM', price: '₱45', status: 'Completed' },
                                { from: 'University', to: 'Mall', date: 'Yesterday, 2:15 PM', price: '₱35', status: 'Completed' },
                                { from: 'Market', to: 'Office', date: 'Dec 12, 8:30 AM', price: '₱50', status: 'Completed' },
                                { from: 'Home', to: 'Hospital', date: 'Dec 10, 10:00 AM', price: '₱60', status: 'Completed' },
                                { from: 'Park', to: 'Restaurant', date: 'Dec 8, 6:45 PM', price: '₱40', status: 'Completed' },
                            ].map((ride, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium">{ride.from} → {ride.to}</p>
                                            <p className="text-sm text-gray-500">{ride.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{ride.price}</p>
                                        <p className="text-sm text-green-600">{ride.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & Upcoming */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start" variant="outline">
                                <MapPin className="mr-2 h-4 w-4" />
                                Book New Ride
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Wallet className="mr-2 h-4 w-4" />
                                Add Wallet Funds
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Calendar className="mr-2 h-4 w-4" />
                                Ride History
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <Star className="mr-2 h-4 w-4" />
                                Rate Drivers
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Favorite Drivers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Favorite Drivers</CardTitle>
                            <CardDescription>Your top rated drivers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { name: 'Kuya Juan', rating: 4.9, rides: 12 },
                                    { name: 'Kuya Pedro', rating: 4.8, rides: 8 },
                                    { name: 'Kuya Miguel', rating: 4.7, rides: 5 },
                                ].map((driver, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{driver.name}</p>
                                            <div className="flex items-center space-x-1">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm text-gray-600">{driver.rating}</span>
                                                <span className="text-sm text-gray-500">({driver.rides} rides)</span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PassengerLayout>
    );
}