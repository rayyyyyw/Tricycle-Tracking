import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    BadgeCheck,
    Building,
    Calendar,
    Car,
    CarFront,
    CheckCircle,
    Eye,
    FileText,
    Filter,
    Hash,
    Mail,
    MapPin,
    MoreVertical,
    Palette,
    Phone,
    Search,
    ShieldAlert,
    Star,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const PER_PAGE = 6;

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
    totalRides?: number;
    totalEarned?: number;
    rating?: number | null;
    lastRide?: string | null;
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

export default function DriverManagement({
    drivers = [],
    statistics,
}: PageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [reasonDialog, setReasonDialog] = useState<{
        type: 'deactivate' | 'delete';
        driver: Driver;
        status?: Driver['status'];
    } | null>(null);
    const [reason, setReason] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter drivers based on search and filters
    const filteredDrivers = drivers.filter((driver) => {
        const matchesSearch =
            driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.licenseNumber
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            driver.vehicle_plate_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            driver.vehicle_model
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || driver.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / PER_PAGE));
    const paginatedDrivers = useMemo(
        () =>
            filteredDrivers.slice(
                (currentPage - 1) * PER_PAGE,
                currentPage * PER_PAGE,
            ),
        [filteredDrivers, currentPage],
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const navigateToApplications = () => {
        router.visit('/DriverM/Application');
    };

    const handleStatusUpdate = async (
        driver: Driver,
        status: Driver['status'],
    ) => {
        if (status === 'inactive' || status === 'suspended') {
            setReasonDialog({ type: 'deactivate', driver, status });
            setReason('');
            return;
        }
        setIsUpdating(driver.id);
        try {
            await router.put(`/drivers/${driver.id}/status`, {
                status,
                reason: '',
            });
            router.reload();
        } catch (error) {
            console.error('Failed to update driver status:', error);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleViewDriver = (driver: Driver) => {
        setSelectedDriver(driver);
    };

    const handleDeleteAccount = (driver: Driver) => {
        setReasonDialog({ type: 'delete', driver });
        setReason('');
    };

    const submitReasonDialog = async () => {
        if (!reasonDialog) return;
        const { type, driver, status } = reasonDialog;
        setIsUpdating(driver.id);
        try {
            if (type === 'deactivate' && status) {
                await router.put(`/drivers/${driver.id}/status`, {
                    status,
                    reason,
                });
            } else if (type === 'delete') {
                await router.delete(`/drivers/${driver.id}/account`, {
                    data: { reason },
                });
            }
            setReasonDialog(null);
            setReason('');
            router.reload();
        } catch (error) {
            console.error('Failed:', error);
        } finally {
            setIsUpdating(null);
        }
    };

    const getStatusBadge = (status: Driver['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="mr-1 h-3 w-3" /> Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300">
                        <UserX className="mr-1 h-3 w-3" /> Inactive
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <AlertCircle className="mr-1 h-3 w-3" /> Suspended
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Driver Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Driver Management
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage your tricycle drivers and their assignments
                        </p>
                    </div>
                    <Button
                        onClick={navigateToApplications}
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        View Applications (
                        {statistics?.pending_applications || 0})
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Drivers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {statistics?.total || drivers.length}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <UserCheck className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Active Drivers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {statistics?.active ||
                                            drivers.filter(
                                                (d) => d.status === 'active',
                                            ).length}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                    <UserCheck className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Inactive Drivers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {statistics?.inactive ||
                                            drivers.filter(
                                                (d) => d.status === 'inactive',
                                            ).length}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <UserX className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Available Today
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {statistics?.available ||
                                            drivers.filter(
                                                (d) => d.status === 'active',
                                            ).length}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                                    <UserCheck className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Driver List</CardTitle>
                                <CardDescription>
                                    Manage and monitor all registered tricycle
                                    drivers
                                </CardDescription>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground sm:sr-only">
                                        Search
                                    </label>
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        placeholder="Search drivers..."
                                        className="w-full pl-10"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="w-full sm:w-[140px]">
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground sm:sr-only">
                                        Status
                                    </label>
                                    <Select
                                        value={statusFilter}
                                        onValueChange={setStatusFilter}
                                    >
                                        <SelectTrigger className="w-full">
                                            <Filter className="mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value="suspended">
                                                Suspended
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile: card list */}
                        <div className="space-y-3 md:hidden">
                            {filteredDrivers.length === 0 ? (
                                <div className="rounded-lg border py-12 text-center text-muted-foreground">
                                    {drivers.length === 0 ? (
                                        <>
                                            <UserX className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                                            <p className="font-medium">
                                                No drivers found
                                            </p>
                                            <p className="text-sm">
                                                Approved drivers will appear
                                                here.
                                            </p>
                                            <Button
                                                variant="outline"
                                                className="mt-2"
                                                onClick={navigateToApplications}
                                            >
                                                View Pending Applications
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                                            <p className="font-medium">
                                                No drivers match your search
                                            </p>
                                            <p className="text-sm">
                                                Try adjusting your search or
                                                filter.
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                paginatedDrivers.map((driver) => (
                                    <div
                                        key={driver.id}
                                        className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
                                    >
                                        <Avatar className="h-11 w-11 shrink-0">
                                            <AvatarImage
                                                src={driver.avatar}
                                                alt={driver.name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-sm text-primary">
                                                {getInitials(driver.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {driver.name}
                                            </p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {driver.email}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                {getStatusBadge(driver.status)}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(
                                                        driver.joinDate,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <DriverActions
                                            driver={driver}
                                            onStatusUpdate={handleStatusUpdate}
                                            onView={handleViewDriver}
                                            onDeleteAccount={
                                                handleDeleteAccount
                                            }
                                            isUpdating={
                                                isUpdating === driver.id
                                            }
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop: table */}
                        <div className="hidden overflow-x-auto rounded-md border md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[220px]">
                                            Driver Information
                                        </TableHead>
                                        <TableHead className="w-[150px]">
                                            Email
                                        </TableHead>
                                        <TableHead className="w-[120px]">
                                            Phone
                                        </TableHead>
                                        <TableHead className="w-[200px]">
                                            Address
                                        </TableHead>
                                        <TableHead className="w-[100px]">
                                            Status
                                        </TableHead>
                                        <TableHead className="w-[120px]">
                                            Join Date
                                        </TableHead>
                                        <TableHead className="w-20">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDrivers.length > 0 ? (
                                        paginatedDrivers.map((driver) => (
                                            <TableRow key={driver.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage
                                                                src={
                                                                    driver.avatar
                                                                }
                                                                alt={
                                                                    driver.name
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-primary/10 text-base text-primary">
                                                                {getInitials(
                                                                    driver.name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">
                                                                {driver.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="truncate text-sm">
                                                            {driver.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="truncate text-sm">
                                                            {driver.phone}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="line-clamp-2 text-sm">
                                                            {driver.address}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        driver.status,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 shrink-0" />
                                                        {formatDate(
                                                            driver.joinDate,
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DriverActions
                                                        driver={driver}
                                                        onStatusUpdate={
                                                            handleStatusUpdate
                                                        }
                                                        onView={
                                                            handleViewDriver
                                                        }
                                                        onDeleteAccount={
                                                            handleDeleteAccount
                                                        }
                                                        isUpdating={
                                                            isUpdating ===
                                                            driver.id
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-12 text-center"
                                            >
                                                <div className="mb-2 text-muted-foreground">
                                                    {drivers.length === 0 ? (
                                                        <div className="space-y-2">
                                                            <UserX className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">
                                                                No drivers found
                                                            </p>
                                                            <p className="text-sm">
                                                                Approved drivers
                                                                will appear
                                                                here.
                                                            </p>
                                                            <Button
                                                                variant="outline"
                                                                className="mt-2"
                                                                onClick={
                                                                    navigateToApplications
                                                                }
                                                            >
                                                                View Pending
                                                                Applications
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">
                                                                No drivers match
                                                                your search
                                                            </p>
                                                            <p className="text-sm">
                                                                Try adjusting
                                                                your search or
                                                                filter criteria.
                                                            </p>
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
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-center text-sm text-muted-foreground sm:text-left">
                                {filteredDrivers.length === 0
                                    ? 'Showing 0 of 0 drivers'
                                    : `Showing ${(currentPage - 1) * PER_PAGE + 1} to ${Math.min(currentPage * PER_PAGE, filteredDrivers.length)} of ${filteredDrivers.length} drivers`}
                            </div>
                            <div className="flex justify-center gap-2 sm:justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() =>
                                        setCurrentPage((p) => Math.max(1, p - 1))
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        currentPage >= totalPages ||
                                        filteredDrivers.length === 0
                                    }
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                >
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Button
                                variant="outline"
                                className="h-auto justify-start py-4"
                            >
                                <div className="text-left">
                                    <div className="font-semibold">
                                        Bulk Import
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        Import multiple drivers via CSV
                                    </div>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto justify-start py-4"
                                onClick={navigateToApplications}
                            >
                                <div className="text-left">
                                    <div className="font-semibold">
                                        View Applications
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        Review pending driver applications
                                    </div>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto justify-start py-4"
                            >
                                <div className="text-left">
                                    <div className="font-semibold">
                                        License Expiry
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        Check upcoming license expirations
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reason dialog (deactivate / delete) */}
            {reasonDialog && (
                <Dialog
                    open={!!reasonDialog}
                    onOpenChange={(open) => !open && setReasonDialog(null)}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {reasonDialog.type === 'deactivate'
                                    ? 'Deactivate driver account'
                                    : 'Delete account'}
                            </DialogTitle>
                            <DialogDescription>
                                {reasonDialog.type === 'deactivate'
                                    ? `Provide a reason for deactivating ${reasonDialog.driver.name}. This will be sent to their email.`
                                    : `Provide a reason for permanently deleting ${reasonDialog.driver.name}'s account. This will be sent to their email. This cannot be undone.`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="driver-reason">Reason</Label>
                                <Textarea
                                    id="driver-reason"
                                    placeholder="e.g. Violation of terms, user request..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="min-h-[100px]"
                                    maxLength={1000}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {reason.length}/1000
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setReasonDialog(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={submitReasonDialog}
                                disabled={isUpdating === reasonDialog.driver.id}
                            >
                                {reasonDialog.type === 'deactivate'
                                    ? 'Deactivate'
                                    : 'Delete account'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

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
    onDeleteAccount,
    isUpdating,
}: {
    driver: Driver;
    onStatusUpdate: (driver: Driver, status: Driver['status']) => void;
    onView: (driver: Driver) => void;
    onDeleteAccount: (driver: Driver) => void;
    isUpdating: boolean;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                        <MoreVertical className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(driver)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <div className="my-1 h-px bg-gray-200" />
                {driver.status === 'active' && (
                    <DropdownMenuItem
                        onClick={() => onStatusUpdate(driver, 'inactive')}
                        disabled={isUpdating}
                    >
                        <UserX className="mr-2 h-4 w-4" />
                        {isUpdating ? 'Deactivating...' : 'Deactivate'}
                    </DropdownMenuItem>
                )}
                {driver.status === 'inactive' && (
                    <DropdownMenuItem
                        onClick={() => onStatusUpdate(driver, 'active')}
                        disabled={isUpdating}
                    >
                        <UserCheck className="mr-2 h-4 w-4" />
                        {isUpdating ? 'Activating...' : 'Activate'}
                    </DropdownMenuItem>
                )}
                {driver.status === 'suspended' && (
                    <DropdownMenuItem
                        onClick={() => onStatusUpdate(driver, 'active')}
                        disabled={isUpdating}
                    >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        {isUpdating ? 'Unsuspending...' : 'Unsuspend'}
                    </DropdownMenuItem>
                )}
                <div className="my-1 h-px bg-gray-200" />
                <DropdownMenuItem
                    onClick={() => onDeleteAccount(driver)}
                    disabled={isUpdating}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete account
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Driver Details Modal Component - Optimized
function DriverDetailsModal({
    driver,
    onClose,
    onStatusUpdate,
}: {
    driver: Driver;
    onClose: () => void;
    onStatusUpdate: (driver: Driver, status: Driver['status']) => void;
}) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getStatusBadge = (status: Driver['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" /> Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        <UserX className="mr-1 h-3 w-3" /> Inactive
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge className="bg-red-100 text-red-800">
                        <AlertCircle className="mr-1 h-3 w-3" /> Suspended
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto p-4 sm:p-6">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl">
                                Driver Details
                            </DialogTitle>
                            <DialogDescription>
                                Complete information for {driver.name}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Driver Profile Header */}
                    <div className="flex flex-col items-start gap-4 border-b pb-4 sm:flex-row sm:items-center">
                        <Avatar className="h-24 w-24">
                            <AvatarImage
                                src={driver.avatar}
                                alt={driver.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                                {getInitials(driver.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <h3 className="text-2xl font-bold">
                                    {driver.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(driver.status)}
                                    <Badge
                                        variant="outline"
                                        className={
                                            driver.tricycleAssigned === 'None'
                                                ? 'text-muted-foreground'
                                                : 'text-green-600'
                                        }
                                    >
                                        {driver.tricycleAssigned}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-muted-foreground">
                                Joined {formatDate(driver.joinDate)}
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="personal">
                                Personal Info
                            </TabsTrigger>
                            <TabsTrigger value="vehicle">
                                Vehicle Details
                            </TabsTrigger>
                            <TabsTrigger value="statistics">
                                Ride Statistics
                            </TabsTrigger>
                        </TabsList>

                        {/* Personal Information Tab */}
                        <TabsContent
                            value="personal"
                            className="space-y-4 pt-4"
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold">
                                        <Building className="h-5 w-5" />
                                        Contact Information
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                Email Address
                                            </div>
                                            <p className="font-medium">
                                                {driver.email}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </div>
                                            <p className="font-medium">
                                                {driver.phone}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                Address
                                            </div>
                                            <p className="font-medium">
                                                {driver.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold">
                                        <ShieldAlert className="h-5 w-5" />
                                        Account Information
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Driver Status
                                            </div>
                                            <div className="mt-1">
                                                {getStatusBadge(driver.status)}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Tricycle Assigned
                                            </div>
                                            <div className="font-medium">
                                                {driver.tricycleAssigned}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Join Date
                                            </div>
                                            <div className="font-medium">
                                                {formatDate(driver.joinDate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Vehicle Details Tab */}
                        <TabsContent value="vehicle" className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* License Details */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold">
                                        <BadgeCheck className="h-5 w-5" />
                                        License Details
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Hash className="h-4 w-4" />
                                                License Number
                                            </div>
                                            <code className="mt-1 block rounded bg-muted px-3 py-2 font-mono text-sm">
                                                {driver.licenseNumber}
                                            </code>
                                        </div>
                                        {driver.license_expiry && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    License Expiry
                                                </div>
                                                <div className="mt-1 font-medium">
                                                    {formatDate(
                                                        driver.license_expiry,
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Vehicle Details */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold">
                                        <CarFront className="h-5 w-5" />
                                        Vehicle Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Car className="h-4 w-4" />
                                                Plate Number
                                            </div>
                                            <div className="mt-1 font-medium">
                                                {driver.vehicle_plate_number}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Model
                                            </div>
                                            <div className="mt-1 font-medium">
                                                {driver.vehicle_model}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Year
                                            </div>
                                            <div className="mt-1 font-medium">
                                                {driver.vehicle_year}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Palette className="h-4 w-4" />
                                                Color
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div
                                                    className="h-5 w-5 rounded-full border"
                                                    style={{
                                                        backgroundColor:
                                                            driver.vehicle_color.toLowerCase(),
                                                    }}
                                                />
                                                <span className="font-medium">
                                                    {driver.vehicle_color}
                                                </span>
                                            </div>
                                        </div>
                                        {driver.vehicle_type && (
                                            <div className="col-span-2 space-y-1">
                                                <div className="text-sm text-muted-foreground">
                                                    Vehicle Type
                                                </div>
                                                <div className="mt-1 font-medium">
                                                    {driver.vehicle_type}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Ride Statistics Tab */}
                        <TabsContent
                            value="statistics"
                            className="space-y-4 pt-4"
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Ride Overview */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold">
                                        <Star className="h-5 w-5" />
                                        Ride Overview
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 rounded-lg bg-muted p-4">
                                            <div className="text-sm text-muted-foreground">
                                                Total Rides
                                            </div>
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {driver.totalRides ?? 0}
                                            </div>
                                        </div>
                                        <div className="space-y-1 rounded-lg bg-muted p-4">
                                            <div className="text-sm text-muted-foreground">
                                                Total Earned
                                            </div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                ₱{driver.totalEarned ?? 0}
                                            </div>
                                        </div>
                                        <div className="space-y-1 rounded-lg bg-muted p-4">
                                            <div className="text-sm text-muted-foreground">
                                                Avg. Rating
                                            </div>
                                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {driver.rating != null
                                                    ? driver.rating
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="space-y-1 rounded-lg bg-muted p-4">
                                            <div className="text-sm text-muted-foreground">
                                                Status
                                            </div>
                                            <div className="mt-1">
                                                {getStatusBadge(driver.status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold">
                                        <Calendar className="h-5 w-5" />
                                        Recent Activity
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Last Ride
                                            </div>
                                            <div className="font-medium">
                                                {driver.lastRide
                                                    ? formatDate(
                                                          driver.lastRide,
                                                      )
                                                    : 'No rides yet'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Average Ride Earnings
                                            </div>
                                            <div className="font-medium">
                                                ₱
                                                {driver.totalRides &&
                                                driver.totalRides > 0 &&
                                                driver.totalEarned != null
                                                    ? (
                                                          driver.totalEarned /
                                                          driver.totalRides
                                                      ).toFixed(2)
                                                    : '0.00'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Account Created
                                            </div>
                                            <div className="font-medium">
                                                {formatDate(driver.joinDate)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        {driver.status === 'active' ? (
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                onClick={() => {
                                    onStatusUpdate(driver, 'inactive');
                                    onClose();
                                }}
                            >
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate Driver
                            </Button>
                        ) : (
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    onStatusUpdate(driver, 'active');
                                    onClose();
                                }}
                            >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate Driver
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
