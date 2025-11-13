import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, UserCheck, UserX, Mail, Phone, Star, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Passenger Management',
        href: '/PassengerM',
    },
];

// Mock data - replace with actual data from your backend
const passengers = [
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
    }
];

export default function PassengerManagement() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passenger Management" />
            
            {/* Main container with same spacing as dashboard */}
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Passenger Management</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage and monitor your passenger accounts
                        </p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Passenger
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Passengers</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active This Month</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">892</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Rating</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">4.7</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₱124,580</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-gray-900 dark:text-white">Passenger List</CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-400">
                                    Manage and monitor all registered passengers
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search passengers..."
                                        className="pl-10 w-full sm:w-64 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Passengers Table */}
                        <div className="rounded-md border border-gray-200 dark:border-gray-700">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">Passenger Name</TableHead>
                                        <TableHead className="hidden sm:table-cell text-gray-900 dark:text-white">Contact Info</TableHead>
                                        <TableHead className="hidden md:table-cell text-gray-900 dark:text-white">Total Rides</TableHead>
                                        <TableHead className="hidden md:table-cell text-gray-900 dark:text-white">Total Spent</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                        <TableHead className="hidden lg:table-cell text-gray-900 dark:text-white">Join Date</TableHead>
                                        <TableHead className="w-20 text-gray-900 dark:text-white">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {passengers.map((passenger) => (
                                        <TableRow key={passenger.id} className="border-gray-200 dark:border-gray-700">
                                            <TableCell>
                                                <div className="font-medium text-gray-900 dark:text-white">{passenger.name}</div>
                                                <div className="sm:hidden text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {passenger.email}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Phone className="w-3 h-3" />
                                                        {passenger.phone}
                                                    </div>
                                                </div>
                                                <div className="sm:hidden flex items-center gap-4 mt-2 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{passenger.totalRides}</span> rides
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-green-600 dark:text-green-400">₱{passenger.totalSpent}</span> spent
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-gray-900 dark:text-white">{passenger.rating}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                                        <Mail className="w-3 h-3" />
                                                        {passenger.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                                                        <Phone className="w-3 h-3" />
                                                        {passenger.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-center font-medium text-gray-900 dark:text-white">
                                                    {passenger.totalRides}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-center font-medium text-green-600 dark:text-green-400">
                                                    ₱{passenger.totalSpent}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={passenger.status === 'active' ? 'default' : 'secondary'}
                                                    className={
                                                        passenger.status === 'active' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900' 
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900'
                                                    }
                                                >
                                                    {passenger.status === 'active' ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <div className="md:hidden flex items-center gap-2 mt-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{passenger.rating}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(passenger.joinDate).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                                        <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Passenger
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            {passenger.status === 'active' ? (
                                                                <>
                                                                    <UserX className="w-4 h-4 mr-2" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing 1 to 4 of 1,247 passengers
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" disabled className="border-gray-300 dark:border-gray-600">
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600">
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Common passenger management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-auto py-4 justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 dark:text-white">Bulk Import</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Import multiple passengers via CSV
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 dark:text-white">Generate Reports</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Passenger activity and spending reports
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900 dark:text-white">Send Notifications</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Broadcast messages to passengers
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}