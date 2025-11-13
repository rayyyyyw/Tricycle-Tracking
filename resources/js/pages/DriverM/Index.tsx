import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Driver Management',
        href: '/DriverM',
    },
];

// Mock data - replace with actual data from your backend
const drivers = [
    {
        id: 1,
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@example.com',
        phone: '+63 912 345 6789',
        licenseNumber: 'DL123456789',
        status: 'active',
        tricycleAssigned: 'TRIC-001',
        joinDate: '2024-01-15',
    },
    {
        id: 2,
        name: 'Maria Santos',
        email: 'maria.santos@example.com',
        phone: '+63 917 654 3210',
        licenseNumber: 'DL987654321',
        status: 'active',
        tricycleAssigned: 'TRIC-002',
        joinDate: '2024-02-20',
    },
    {
        id: 3,
        name: 'Pedro Reyes',
        email: 'pedro.reyes@example.com',
        phone: '+63 918 777 8888',
        licenseNumber: 'DL456789123',
        status: 'inactive',
        tricycleAssigned: 'None',
        joinDate: '2024-03-10',
    },
    {
        id: 4,
        name: 'Ana Lopez',
        email: 'ana.lopez@example.com',
        phone: '+63 919 555 6666',
        licenseNumber: 'DL789123456',
        status: 'active',
        tricycleAssigned: 'TRIC-003',
        joinDate: '2024-01-25',
    },
];

export default function DriverManagement() {
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
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Driver
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
                                    <p className="text-2xl font-bold">24</p>
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
                                    <p className="text-2xl font-bold">18</p>
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
                                    <p className="text-2xl font-bold">6</p>
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
                                    <p className="text-2xl font-bold">15</p>
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
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search drivers..."
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
                        {/* Drivers Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Driver Name</TableHead>
                                        <TableHead>Contact Info</TableHead>
                                        <TableHead>License Number</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tricycle Assigned</TableHead>
                                        <TableHead>Join Date</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.map((driver) => (
                                        <TableRow key={driver.id}>
                                            <TableCell>
                                                <div className="font-medium">{driver.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{driver.email}</div>
                                                    <div className="text-muted-foreground">{driver.phone}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {driver.licenseNumber}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={driver.status === 'active' ? 'default' : 'secondary'}
                                                    className={
                                                        driver.status === 'active' 
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                                                    }
                                                >
                                                    {driver.status === 'active' ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`font-medium ${
                                                    driver.tricycleAssigned === 'None' 
                                                        ? 'text-muted-foreground' 
                                                        : 'text-green-600'
                                                }`}>
                                                    {driver.tricycleAssigned}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(driver.joinDate).toLocaleDateString()}
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
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Driver
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            {driver.status === 'active' ? (
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
                                                        <DropdownMenuItem className="text-red-600">
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
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing 1 to 4 of 24 drivers
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
                            <Button variant="outline" className="h-auto py-4 justify-start">
                                <div className="text-left">
                                    <div className="font-semibold">Generate Reports</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Driver performance and activity reports
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
        </AppLayout>
    );
}