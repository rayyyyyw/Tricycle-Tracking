import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    Search, 
    Filter,
    MoreHorizontal,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Star,
    Wallet
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Passenger Management',
        href: '/PassengerM',
    },
];

// Mock data - replace with actual API call later
const mockPassengers = [
    {
        id: 1,
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '+63 912 345 6789',
        joinDate: '2024-01-15',
        totalRides: 15,
        totalSpent: 2450,
        rating: 4.8,
        status: 'active',
        lastRide: '2024-03-20',
        favoriteDriver: 'Kuya Juan'
    },
    {
        id: 2,
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@email.com',
        phone: '+63 917 654 3210',
        joinDate: '2024-02-03',
        totalRides: 8,
        totalSpent: 1200,
        rating: 4.5,
        status: 'active',
        lastRide: '2024-03-18',
        favoriteDriver: 'Kuya Pedro'
    },
    {
        id: 3,
        name: 'Ana Reyes',
        email: 'ana.reyes@email.com',
        phone: '+63 918 777 8888',
        joinDate: '2024-03-10',
        totalRides: 3,
        totalSpent: 450,
        rating: 4.9,
        status: 'active',
        lastRide: '2024-03-19',
        favoriteDriver: 'Kuya Miguel'
    },
    {
        id: 4,
        name: 'Pedro Bautista',
        email: 'pedro.b@email.com',
        phone: '+63 919 555 6666',
        joinDate: '2024-01-28',
        totalRides: 12,
        totalSpent: 1800,
        rating: 4.2,
        status: 'inactive',
        lastRide: '2024-02-15',
        favoriteDriver: 'Kuya Juan'
    }
];

export default function Index() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passenger Management" />
            
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Passenger Management</h1>
                        <p className="text-gray-600 mt-2">Manage and monitor your passenger accounts</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <Button variant="outline">
                            Export Data
                        </Button>
                        <Button>
                            Add Passenger
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-gray-500">+5 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
                        <MapPin className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-gray-500">75% activity rate</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.7</div>
                        <p className="text-xs text-gray-500">Based on 89 reviews</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Wallet className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱8,240</div>
                        <p className="text-xs text-gray-500">From passenger rides</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search passengers by name, email, or phone..." 
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Passengers List */}
            <Card>
                <CardHeader>
                    <CardTitle>Passenger List</CardTitle>
                    <CardDescription>
                        Manage all registered passengers in your system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockPassengers.map((passenger) => (
                            <div key={passenger.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="font-semibold text-blue-600">
                                            {passenger.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    
                                    {/* Passenger Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-semibold text-gray-900">{passenger.name}</h3>
                                            <Badge variant={passenger.status === 'active' ? 'default' : 'secondary'}>
                                                {passenger.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">
                                                <Mail className="h-3 w-3" />
                                                <span>{passenger.email}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Phone className="h-3 w-3" />
                                                <span>{passenger.phone}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>Joined {passenger.joinDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats and Actions */}
                                <div className="flex items-center space-x-6">
                                    {/* Quick Stats */}
                                    <div className="text-right">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-center">
                                                <div className="font-semibold">{passenger.totalRides}</div>
                                                <div className="text-xs text-gray-500">Rides</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-semibold">₱{passenger.totalSpent}</div>
                                                <div className="text-xs text-gray-500">Spent</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-semibold">{passenger.rating}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">Rating</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}