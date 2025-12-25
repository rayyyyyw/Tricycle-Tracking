import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, MoreVertical, UserCheck, UserX, Mail, Phone, Star, Calendar, Eye, MapPin, FileText, User, AlertCircle, CheckCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    avatar_url?: string;
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isUpdating, setIsUpdating] = useState<number | null>(null);

    // Use the actual passenger data passed from backend
    const passengerUsers: PassengerUser[] = passengers;

    // Filter passengers based on search and filters
    const filteredPassengers = passengerUsers.filter(passenger => {
        const matchesSearch = 
            passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.address?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || passenger.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

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
    };

    const handleStatusUpdate = async (passengerId: number, status: PassengerUser['status']) => {
        setIsUpdating(passengerId);
        try {
            // Use the same pattern as driver management - just toggle status
            await router.post(`/passengers/${passengerId}/toggle-status`);
            router.reload();
        } catch (error) {
            console.error('Failed to update passenger status:', error);
        } finally {
            setIsUpdating(null);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const getStatusBadge = (status: PassengerUser['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                </Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300">
                    <UserX className="w-3 h-3 mr-1" /> Inactive
                </Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
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
                            Manage and monitor your passenger accounts
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
                                    <User className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search passengers..."
                                        className="pl-10 w-full sm:w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px]">
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Passengers Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[220px]">Passenger Information</TableHead>
                                        <TableHead className="w-[150px]">Email</TableHead>
                                        <TableHead className="w-[120px]">Phone</TableHead>
                                        <TableHead className="w-[200px]">Address</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="w-[120px]">Join Date</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPassengers.length > 0 ? (
                                        filteredPassengers.map((passenger) => (
                                            <TableRow key={passenger.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-12 h-12">
                                                            <AvatarImage 
                                                                src={passenger.avatar_url} 
                                                                alt={passenger.name}
                                                            />
                                                            <AvatarFallback className="text-base bg-primary/10 text-primary">
                                                                {getInitials(passenger.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{passenger.name}</div>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                <span>{passenger.rating}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        <span className="truncate text-sm">
                                                            {passenger.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        <span className="truncate text-sm">
                                                            {passenger.phone || 'Not provided'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                                        <span className="text-sm line-clamp-2">
                                                            {passenger.address || 'Not provided'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(passenger.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="w-4 h-4 shrink-0" />
                                                        {formatDate(passenger.joinDate)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <PassengerActions 
                                                        passenger={passenger}
                                                        onStatusUpdate={handleStatusUpdate}
                                                        onView={handleViewDetails}
                                                        isUpdating={isUpdating === passenger.id}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="text-muted-foreground mb-2">
                                                    {passengerUsers.length === 0 ? (
                                                        <div className="space-y-2">
                                                            <UserX className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">No passengers found</p>
                                                            <p className="text-sm">Registered passengers will appear here.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">No passengers match your search</p>
                                                            <p className="text-sm">Try adjusting your search or filter criteria.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {filteredPassengers.length} of {passengerUsers.length} passengers
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

            {/* Passenger Details Modal */}
            {selectedPassenger && (
                <PassengerDetailsModal 
                    passenger={selectedPassenger} 
                    onClose={() => setSelectedPassenger(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </AppLayout>
    );
}

// Passenger Actions Component
function PassengerActions({ 
    passenger, 
    onStatusUpdate, 
    onView,
    isUpdating
}: { 
    passenger: PassengerUser;
    onStatusUpdate: (id: number, status: PassengerUser['status']) => void;
    onView: (passenger: PassengerUser) => void;
    isUpdating: boolean;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isUpdating}>
                    {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                        <MoreVertical className="w-4 h-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(passenger)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                </DropdownMenuItem>
                <div className="h-px bg-gray-200 my-1" />
                {passenger.status === 'active' && (
                    <DropdownMenuItem 
                        onClick={() => onStatusUpdate(passenger.id, 'inactive')}
                        disabled={isUpdating}
                    >
                        <UserX className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Deactivating...' : 'Deactivate'}
                    </DropdownMenuItem>
                )}
                {passenger.status === 'inactive' && (
                    <DropdownMenuItem 
                        onClick={() => onStatusUpdate(passenger.id, 'active')}
                        disabled={isUpdating}
                    >
                        <UserCheck className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Activating...' : 'Activate'}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Passenger Details Modal Component
function PassengerDetailsModal({ 
    passenger, 
    onClose,
    onStatusUpdate
}: { 
    passenger: PassengerUser;
    onClose: () => void;
    onStatusUpdate: (id: number, status: PassengerUser['status']) => void;
}) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const getStatusBadge = (status: PassengerUser['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                </Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300">
                    <UserX className="w-3 h-3 mr-1" /> Inactive
                </Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl">Passenger Details</DialogTitle>
                            <DialogDescription>
                                Complete information for {passenger.name}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Passenger Profile Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b">
                        <Avatar className="w-24 h-24">
                            <AvatarImage 
                                src={passenger.avatar_url} 
                                alt={passenger.name}
                            />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {getInitials(passenger.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h3 className="text-2xl font-bold">{passenger.name}</h3>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(passenger.status)}
                                    <Badge variant="outline" className="text-green-600">
                                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                        {passenger.rating}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-muted-foreground">Joined {formatDate(passenger.joinDate)}</p>
                        </div>
                    </div>

                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="personal">Personal Info</TabsTrigger>
                            <TabsTrigger value="statistics">Ride Statistics</TabsTrigger>
                        </TabsList>

                        {/* Personal Information Tab */}
                        <TabsContent value="personal" className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Contact Information
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                Email Address
                                            </div>
                                            <p className="font-medium">{passenger.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="w-4 h-4" />
                                                Phone Number
                                            </div>
                                            <p className="font-medium">{passenger.phone || 'Not provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                Address
                                            </div>
                                            <p className="font-medium">{passenger.address || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Emergency Contact
                                    </h4>
                                    <div className="space-y-4">
                                        {passenger.emergency_contact ? (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">Contact Name</div>
                                                    <p className="font-medium">{passenger.emergency_contact.name}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">Contact Phone</div>
                                                    <p className="font-medium">{passenger.emergency_contact.phone}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">Relationship</div>
                                                    <p className="font-medium">{passenger.emergency_contact.relationship}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground italic">No emergency contact information provided</p>
                                        )}
                                        <div className="space-y-1 pt-2 border-t">
                                            <div className="text-sm text-muted-foreground">Member Since</div>
                                            <div className="font-medium">{formatDate(passenger.joinDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Ride Statistics Tab */}
                        <TabsContent value="statistics" className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ride Overview */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <Star className="w-5 h-5" />
                                        Ride Overview
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 bg-muted p-4 rounded-lg">
                                            <div className="text-sm text-muted-foreground">Total Rides</div>
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {passenger.totalRides}
                                            </div>
                                        </div>
                                        <div className="space-y-1 bg-muted p-4 rounded-lg">
                                            <div className="text-sm text-muted-foreground">Total Spent</div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                ₱{passenger.totalSpent}
                                            </div>
                                        </div>
                                        <div className="space-y-1 bg-muted p-4 rounded-lg">
                                            <div className="text-sm text-muted-foreground">Avg. Rating</div>
                                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {passenger.rating}
                                            </div>
                                        </div>
                                        <div className="space-y-1 bg-muted p-4 rounded-lg">
                                            <div className="text-sm text-muted-foreground">Status</div>
                                            <div className="mt-1">{getStatusBadge(passenger.status)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Recent Activity
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Last Ride</div>
                                            <div className="font-medium">
                                                {passenger.lastRide ? formatDate(passenger.lastRide) : 'No rides yet'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Average Ride Cost</div>
                                            <div className="font-medium">
                                                ₱{passenger.totalRides > 0 ? (passenger.totalSpent / passenger.totalRides).toFixed(2) : '0.00'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Account Created</div>
                                            <div className="font-medium">{formatDate(passenger.joinDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Close
                        </Button>
                        {passenger.status === 'active' ? (
                            <Button 
                                variant="outline" 
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20 dark:text-red-400"
                                onClick={() => {
                                    onStatusUpdate(passenger.id, 'inactive');
                                    onClose();
                                }}
                            >
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate Passenger
                            </Button>
                        ) : (
                            <Button 
                                className="flex-1"
                                onClick={() => {
                                    onStatusUpdate(passenger.id, 'active');
                                    onClose();
                                }}
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate Passenger
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}