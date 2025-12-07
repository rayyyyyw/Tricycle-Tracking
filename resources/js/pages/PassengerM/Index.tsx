import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, UserCheck, UserX, Mail, Phone, Star, Calendar, Eye, MapPin, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Passenger Management',
        href: '/PassengerM',
    },
];

interface PassengerUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    emergency_contact?: {
        name?: string;
        phone?: string;
        relationship?: string;
    };
    joinDate: string;
    totalRides: number;
    totalSpent: number;
    rating: number;
    status: 'active' | 'inactive';
    lastRide?: string;
}

export default function PassengerManagement() {
    const { auth, passengers = [] } = usePage<SharedData & { passengers: PassengerUser[] }>().props;
    const [selectedPassenger, setSelectedPassenger] = useState<PassengerUser | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    // Use the actual passenger data passed from backend
    const passengerUsers: PassengerUser[] = passengers;

    // Calculate stats from actual data
    const stats = {
        totalPassengers: passengerUsers.length,
        activePassengers: passengerUsers.filter(p => p.status === 'active').length,
        inactivePassengers: passengerUsers.filter(p => p.status === 'inactive').length,
        averageRating: passengerUsers.length > 0 ? passengerUsers.reduce((acc, p) => acc + p.rating, 0) / passengerUsers.length : 0,
        totalRevenue: passengerUsers.reduce((acc, p) => acc + p.totalSpent, 0),
    };

    const handleViewDetails = (passenger: PassengerUser) => {
        setSelectedPassenger(passenger);
        setIsViewDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passenger Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Passenger Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage and monitor your passenger accounts ({passengerUsers.length} passengers found)
                        </p>
                    </div>
                    <Button>
                        <FileText className="w-4 h-4 mr-2" />
                        Manage Passengers
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Passengers</p>
                                    <p className="text-2xl font-bold">{stats.totalPassengers}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Passengers</p>
                                    <p className="text-2xl font-bold">{stats.activePassengers}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Inactive Passengers</p>
                                    <p className="text-2xl font-bold">{stats.inactivePassengers}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                    <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                                    <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle>Passenger List</CardTitle>
                                <CardDescription>
                                    Manage and monitor all registered passengers
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search passengers..."
                                        className="pl-10 w-full sm:w-64"
                                    />
                                </div>
                                <Button variant="outline" size="sm">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Passengers Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Passenger Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Contact Info</TableHead>
                                        <TableHead className="hidden md:table-cell">Total Rides</TableHead>
                                        <TableHead className="hidden md:table-cell">Total Spent</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden lg:table-cell">Join Date</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {passengerUsers.length > 0 ? (
                                        passengerUsers.map((passenger) => (
                                            <TableRow key={passenger.id}>
                                                <TableCell>
                                                    <div className="font-medium">{passenger.name}</div>
                                                    <div className="sm:hidden text-sm text-muted-foreground mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {passenger.email}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Phone className="w-3 h-3" />
                                                            {passenger.phone || 'No phone'}
                                                        </div>
                                                    </div>
                                                    <div className="sm:hidden flex items-center gap-4 mt-2 text-sm">
                                                        <div>
                                                            <span className="font-medium">{passenger.totalRides}</span> rides
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-green-600 dark:text-green-400">₱{passenger.totalSpent}</span> spent
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-medium">{passenger.rating}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-3 h-3" />
                                                            {passenger.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                                            <Phone className="w-3 h-3" />
                                                            {passenger.phone || 'No phone number'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="text-center font-medium">
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
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300'
                                                        }
                                                    >
                                                        {passenger.status === 'active' ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <div className="md:hidden flex items-center gap-2 mt-1">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm text-muted-foreground">{passenger.rating}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(passenger.joinDate).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewDetails(passenger)}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit Passenger
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
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
                                                            <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No passengers found. Register some passengers to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {passengerUsers.length > 0 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing 1 to {passengerUsers.length} of {stats.totalPassengers} passengers
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" disabled>
                                        Previous
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common passenger management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-auto py-4 justify-start">
                                <div className="text-left">
                                    <div className="font-semibold">Bulk Import</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Import multiple passengers via CSV
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 justify-start">
                                <div className="text-left">
                                    <div className="font-semibold">Generate Reports</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Passenger activity and spending reports
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 justify-start">
                                <div className="text-left">
                                    <div className="font-semibold">Send Notifications</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Broadcast messages to passengers
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Passenger Details</DialogTitle>
                        <DialogDescription>
                            Complete information for {selectedPassenger?.name}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedPassenger && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Personal Information</h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        <p className="font-medium">{selectedPassenger.name}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <p className="font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {selectedPassenger.email}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                        <p className="font-medium flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {selectedPassenger.phone || 'Not provided'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Home Address</label>
                                        <p className="font-medium flex items-start gap-2">
                                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span>{selectedPassenger.address || 'Not provided'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact & Additional Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                                
                                {selectedPassenger.emergency_contact ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                                            <p className="font-medium">{selectedPassenger.emergency_contact.name}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {selectedPassenger.emergency_contact.phone}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                                            <p className="font-medium">{selectedPassenger.emergency_contact.relationship}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">No emergency contact information provided</p>
                                )}

                                {/* Ride Statistics */}
                                <div className="pt-4 border-t">
                                    <h3 className="text-lg font-semibold mb-3">Ride Statistics</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedPassenger.totalRides}</div>
                                            <div className="text-sm text-muted-foreground">Total Rides</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">₱{selectedPassenger.totalSpent}</div>
                                            <div className="text-sm text-muted-foreground">Total Spent</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsViewDialogOpen(false)}
                        >
                            Close
                        </Button>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Passenger
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}