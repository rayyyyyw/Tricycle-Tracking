import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    Search, Plus, Filter, MoreVertical, UserCheck, UserX, 
    Mail, Phone, Car, Calendar, MapPin, ShieldAlert, Eye, X, CarFront, 
    BadgeCheck, AlertCircle, CheckCircle, Building, Hash, Palette,
    FileText
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    vehicle_plate_number: string;
    vehicle_model: string;
    vehicle_year: string;
    vehicle_color: string;
    address: string;
    avatar?: string;
    status: 'active' | 'inactive' | 'suspended';
    tricycleAssigned: string;
    joinDate: string;
    vehicle_type?: string;
    license_expiry?: string;
}

interface PageProps {
    drivers: Driver[];
    statistics: {
        total: number;
        active: number;
        inactive: number;
        available: number;
        pending_applications: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Driver Management',
        href: '/DriverM',
    },
];

export default function DriverManagement({ drivers = [], statistics }: PageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    // Filter drivers based on search and filters
    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = 
            driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.vehicle_plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.vehicle_model.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const navigateToApplications = () => {
        router.visit('/DriverM/Application');
    };

    const handleStatusUpdate = async (driverId: number, status: Driver['status']) => {
        setIsUpdating(driverId);
        try {
            await router.put(`/drivers/${driverId}/status`, { status });
            router.reload();
        } catch (error) {
            console.error('Failed to update driver status:', error);
            alert('Failed to update driver status. Please try again.');
        } finally {
            setIsUpdating(null);
        }
    };

    const handleViewDriver = (driver: Driver) => {
        setSelectedDriver(driver);
    };

    const getStatusBadge = (status: Driver['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><UserX className="w-3 h-3 mr-1" /> Inactive</Badge>;
            case 'suspended':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" /> Suspended</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Driver Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Driver Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your tricycle drivers and their assignments
                        </p>
                    </div>
                    <div className="flex gap-2">
                       <Button onClick={navigateToApplications}>
                            <FileText className="w-4 h-4 mr-2" />
                            View Applications 
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
                                    <p className="text-2xl font-bold">{statistics?.total || drivers.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Drivers</p>
                                    <p className="text-2xl font-bold">{statistics?.active || drivers.filter(d => d.status === 'active').length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Inactive Drivers</p>
                                    <p className="text-2xl font-bold">{statistics?.inactive || drivers.filter(d => d.status === 'inactive').length}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <UserX className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Available Today</p>
                                    <p className="text-2xl font-bold">{statistics?.available || drivers.filter(d => d.status === 'active').length}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-yellow-600" />
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
                                <CardTitle>Driver List</CardTitle>
                                <CardDescription>
                                    Manage and monitor all registered tricycle drivers
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search drivers..."
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
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Drivers Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[220px]">Driver Information</TableHead>
                                        <TableHead className="w-[150px]">Email</TableHead>
                                        <TableHead className="w-[120px]">Phone</TableHead>
                                        <TableHead className="w-[200px]">Address</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="w-[120px]">Join Date</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDrivers.length > 0 ? (
                                        filteredDrivers.map((driver) => (
                                            <TableRow key={driver.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-12 h-12">
                                                            <AvatarImage src={driver.avatar} alt={driver.name} />
                                                            <AvatarFallback className="text-base bg-primary/10 text-primary">
                                                                {getInitials(driver.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{driver.name}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        <span className="truncate text-sm">
                                                            {driver.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                                        <span className="truncate text-sm">
                                                            {driver.phone}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                                        <span className="text-sm line-clamp-2">
                                                            {driver.address}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(driver.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="w-4 h-4 shrink-0" />
                                                        {formatDate(driver.joinDate)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DriverActions 
                                                        driver={driver}
                                                        onStatusUpdate={handleStatusUpdate}
                                                        onView={handleViewDriver}
                                                        isUpdating={isUpdating === driver.id}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="text-muted-foreground mb-2">
                                                    {drivers.length === 0 ? (
                                                        <div className="space-y-2">
                                                            <UserX className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">No drivers found</p>
                                                            <p className="text-sm">Approved drivers will appear here.</p>
                                                            <Button 
                                                                variant="outline" 
                                                                className="mt-2"
                                                                onClick={navigateToApplications}
                                                            >
                                                                View Pending Applications
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">No drivers match your search</p>
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
                                Showing {filteredDrivers.length} of {drivers.length} drivers
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
                            Common driver management tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-auto py-4 justify-start">
                                <div className="text-left">
                                    <div className="font-semibold">Bulk Import</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Import multiple drivers via CSV
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 justify-start" onClick={navigateToApplications}>
                                <div className="text-left">
                                    <div className="font-semibold">View Applications</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Review pending driver applications
                                    </div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 justify-start">
                                <div className="text-left">
                                    <div className="font-semibold">License Expiry</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Check upcoming license expirations
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Driver Details Modal */}
            {selectedDriver && (
                <DriverDetailsModal 
                    driver={selectedDriver} 
                    onClose={() => setSelectedDriver(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </AppLayout>
    );
}

// Driver Actions Component
function DriverActions({ 
    driver, 
    onStatusUpdate, 
    onView,
    isUpdating
}: { 
    driver: Driver;
    onStatusUpdate: (id: number, status: Driver['status']) => void;
    onView: (driver: Driver) => void;
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
                <DropdownMenuItem onClick={() => onView(driver)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                </DropdownMenuItem>
                <div className="h-px bg-gray-200 my-1" />
                {driver.status === 'active' && (
                    <DropdownMenuItem 
                        onClick={() => onStatusUpdate(driver.id, 'inactive')}
                        disabled={isUpdating}
                    >
                        <UserX className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Deactivating...' : 'Deactivate'}
                    </DropdownMenuItem>
                )}
                {driver.status === 'inactive' && (
                    <DropdownMenuItem 
                        onClick={() => onStatusUpdate(driver.id, 'active')}
                        disabled={isUpdating}
                    >
                        <UserCheck className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Activating...' : 'Activate'}
                    </DropdownMenuItem>
                )}
                {driver.status === 'suspended' && (
                    <DropdownMenuItem 
                        onClick={() => onStatusUpdate(driver.id, 'active')}
                        disabled={isUpdating}
                    >
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        {isUpdating ? 'Unsuspending...' : 'Unsuspend'}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Driver Details Modal Component - Optimized
function DriverDetailsModal({ 
    driver, 
    onClose,
    onStatusUpdate
}: { 
    driver: Driver;
    onClose: () => void;
    onStatusUpdate: (id: number, status: Driver['status']) => void;
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

    const getStatusBadge = (status: Driver['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
            case 'inactive':
                return <Badge className="bg-gray-100 text-gray-800"><UserX className="w-3 h-3 mr-1" /> Inactive</Badge>;
            case 'suspended':
                return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" /> Suspended</Badge>;
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
                            <DialogTitle className="text-2xl">Driver Details</DialogTitle>
                            <DialogDescription>
                                Complete information for {driver.name}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Driver Profile Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={driver.avatar} alt={driver.name} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {getInitials(driver.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h3 className="text-2xl font-bold">{driver.name}</h3>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(driver.status)}
                                    <Badge variant="outline" className={
                                        driver.tricycleAssigned === 'None' 
                                            ? 'text-muted-foreground' 
                                            : 'text-green-600'
                                    }>
                                        {driver.tricycleAssigned}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-muted-foreground">Joined {formatDate(driver.joinDate)}</p>
                        </div>
                    </div>

                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="personal">Personal Info</TabsTrigger>
                            <TabsTrigger value="vehicle">Vehicle Details</TabsTrigger>
                        </TabsList>

                        {/* Personal Information Tab */}
                        <TabsContent value="personal" className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Contact Information
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                Email Address
                                            </div>
                                            <p className="font-medium">{driver.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="w-4 h-4" />
                                                Phone Number
                                            </div>
                                            <p className="font-medium">{driver.phone}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                Address
                                            </div>
                                            <p className="font-medium">{driver.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5" />
                                        Account Information
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Driver Status</div>
                                            <div className="mt-1">{getStatusBadge(driver.status)}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Tricycle Assigned</div>
                                            <div className="font-medium">{driver.tricycleAssigned}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Join Date</div>
                                            <div className="font-medium">{formatDate(driver.joinDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Vehicle Details Tab */}
                        <TabsContent value="vehicle" className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* License Details */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <BadgeCheck className="w-5 h-5" />
                                        License Details
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Hash className="w-4 h-4" />
                                                License Number
                                            </div>
                                            <code className="font-mono bg-muted px-3 py-2 rounded text-sm block mt-1">
                                                {driver.licenseNumber}
                                            </code>
                                        </div>
                                        {driver.license_expiry && (
                                            <div className="space-y-1">
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    License Expiry
                                                </div>
                                                <div className="font-medium mt-1">{formatDate(driver.license_expiry)}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Vehicle Details */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        <CarFront className="w-5 h-5" />
                                        Vehicle Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Car className="w-4 h-4" />
                                                Plate Number
                                            </div>
                                            <div className="font-medium mt-1">{driver.vehicle_plate_number}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Model</div>
                                            <div className="font-medium mt-1">{driver.vehicle_model}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Year</div>
                                            <div className="font-medium mt-1">{driver.vehicle_year}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Palette className="w-4 h-4" />
                                                Color
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div 
                                                    className="w-5 h-5 rounded-full border"
                                                    style={{ backgroundColor: driver.vehicle_color.toLowerCase() }}
                                                />
                                                <span className="font-medium">{driver.vehicle_color}</span>
                                            </div>
                                        </div>
                                        {driver.vehicle_type && (
                                            <div className="space-y-1 col-span-2">
                                                <div className="text-sm text-muted-foreground">Vehicle Type</div>
                                                <div className="font-medium mt-1">{driver.vehicle_type}</div>
                                            </div>
                                        )}
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
                        {driver.status === 'active' ? (
                            <Button 
                                variant="outline" 
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                    onStatusUpdate(driver.id, 'inactive');
                                    onClose();
                                }}
                            >
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate Driver
                            </Button>
                        ) : (
                            <Button 
                                className="flex-1"
                                onClick={() => {
                                    onStatusUpdate(driver.id, 'active');
                                    onClose();
                                }}
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate Driver
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}