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
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Eye,
    FileText,
    Filter,
    Mail,
    MapPin,
    MoreVertical,
    Phone,
    RefreshCw,
    Search,
    Star,
    Trash2,
    User,
    UserCheck,
    UserX,
} from 'lucide-react';
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
    rating: number | null;
    status: 'active' | 'inactive';
    lastRide?: string | null;
    /** Consecutive cancellations after driver accepted (resets on completed ride). */
    consecutiveCancellationCount?: number;
}

export default function PassengerManagement() {
    const { passengers = [] } = usePage<
        SharedData & { passengers: PassengerUser[] }
    >().props;
    const [selectedPassenger, setSelectedPassenger] =
        useState<PassengerUser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const [reasonDialog, setReasonDialog] = useState<{
        type: 'deactivate' | 'delete';
        passenger: PassengerUser;
    } | null>(null);
    const [reason, setReason] = useState('');

    // Use the actual passenger data passed from backend
    const passengerUsers: PassengerUser[] = passengers;

    // Filter passengers based on search and filters
    const filteredPassengers = passengerUsers.filter((passenger) => {
        const matchesSearch =
            passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            passenger.address?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || passenger.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate stats from actual data
    const stats = {
        totalPassengers: passengerUsers.length,
        activePassengers: passengerUsers.filter((p) => p.status === 'active')
            .length,
        inactivePassengers: passengerUsers.filter(
            (p) => p.status === 'inactive',
        ).length,
        averageRating: (() => {
            const withRating = passengerUsers.filter((p) => p.rating != null);
            return withRating.length > 0
                ? withRating.reduce((acc, p) => acc + (p.rating ?? 0), 0) /
                      withRating.length
                : 0;
        })(),
        totalRevenue: passengerUsers.reduce((acc, p) => acc + p.totalSpent, 0),
    };

    const handleViewDetails = (passenger: PassengerUser) => {
        setSelectedPassenger(passenger);
    };

    const handleStatusUpdate = async (passenger: PassengerUser) => {
        if (passenger.status === 'active') {
            setReasonDialog({ type: 'deactivate', passenger });
            setReason('');
            return;
        }
        setIsUpdating(passenger.id);
        try {
            await router.post(`/passengers/${passenger.id}/toggle-status`, {
                reason: '',
            });
            router.reload();
        } catch (error) {
            console.error('Failed to update passenger status:', error);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteAccount = (passenger: PassengerUser) => {
        setReasonDialog({ type: 'delete', passenger });
        setReason('');
    };

    const submitReasonDialog = async () => {
        if (!reasonDialog) return;
        const { type, passenger } = reasonDialog;
        setIsUpdating(passenger.id);
        try {
            if (type === 'deactivate') {
                await router.post(`/passengers/${passenger.id}/toggle-status`, {
                    reason,
                });
            } else {
                await router.delete(`/passengers/${passenger.id}`, {
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
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getStatusBadge = (status: PassengerUser['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" /> Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300">
                        <UserX className="mr-1 h-3 w-3" /> Inactive
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passenger Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Passenger Management
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage and monitor your passenger accounts
                        </p>
                    </div>
                    <Button className="w-full shrink-0 sm:w-auto">
                        <FileText className="mr-2 h-4 w-4" />
                        Manage Passengers
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Passengers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.totalPassengers}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Active Passengers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.activePassengers}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Inactive Passengers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.inactivePassengers}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                    <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Avg. Rating
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.averageRating.toFixed(1)}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                                    <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
                                <CardTitle>Passenger List</CardTitle>
                                <CardDescription>
                                    Manage and monitor all registered passengers
                                </CardDescription>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground sm:sr-only">
                                        Search
                                    </label>
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        placeholder="Search passengers..."
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
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile: card list */}
                        <div className="space-y-3 md:hidden">
                            {filteredPassengers.length === 0 ? (
                                <div className="rounded-lg border py-12 text-center text-muted-foreground">
                                    {passengerUsers.length === 0 ? (
                                        <>
                                            <UserX className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                                            <p className="font-medium">
                                                No passengers found
                                            </p>
                                            <p className="text-sm">
                                                Registered passengers will
                                                appear here.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                                            <p className="font-medium">
                                                No passengers match your search
                                            </p>
                                            <p className="text-sm">
                                                Try adjusting your search or
                                                filter.
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                filteredPassengers.map((passenger) => (
                                    <div
                                        key={passenger.id}
                                        className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
                                    >
                                        <Avatar className="h-11 w-11 shrink-0">
                                            <AvatarImage
                                                src={passenger.avatar_url}
                                                alt={passenger.name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-sm text-primary">
                                                {getInitials(passenger.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {passenger.name}
                                            </p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {passenger.email}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                {getStatusBadge(
                                                    passenger.status,
                                                )}
                                                {(passenger.consecutiveCancellationCount ??
                                                    0) > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 text-xs"
                                                        title="Consecutive cancellations after driver accepted. Resets when passenger completes a ride."
                                                    >
                                                        <RefreshCw className="mr-0.5 h-3 w-3" />
                                                        {
                                                            passenger.consecutiveCancellationCount
                                                        }
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(
                                                        passenger.joinDate,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <PassengerActions
                                            passenger={passenger}
                                            onStatusUpdate={handleStatusUpdate}
                                            onView={handleViewDetails}
                                            onDeleteAccount={
                                                handleDeleteAccount
                                            }
                                            isUpdating={
                                                isUpdating === passenger.id
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
                                            Passenger Information
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
                                    {filteredPassengers.length > 0 ? (
                                        filteredPassengers.map((passenger) => (
                                            <TableRow key={passenger.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage
                                                                src={
                                                                    passenger.avatar_url
                                                                }
                                                                alt={
                                                                    passenger.name
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-primary/10 text-base text-primary">
                                                                {getInitials(
                                                                    passenger.name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">
                                                                {passenger.name}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                <span>
                                                                    {passenger.rating !=
                                                                    null
                                                                        ? passenger.rating
                                                                        : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="truncate text-sm">
                                                            {passenger.email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="truncate text-sm">
                                                            {passenger.phone ||
                                                                'Not provided'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="line-clamp-2 text-sm">
                                                            {passenger.address ||
                                                                'Not provided'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {getStatusBadge(
                                                            passenger.status,
                                                        )}
                                                        {(passenger.consecutiveCancellationCount ??
                                                            0) > 0 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="shrink-0 text-xs"
                                                                title="Consecutive cancellations after driver accepted. Resets when passenger completes a ride."
                                                            >
                                                                <RefreshCw className="mr-0.5 h-3 w-3" />
                                                                {
                                                                    passenger.consecutiveCancellationCount
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 shrink-0" />
                                                        {formatDate(
                                                            passenger.joinDate,
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <PassengerActions
                                                        passenger={passenger}
                                                        onStatusUpdate={
                                                            handleStatusUpdate
                                                        }
                                                        onView={
                                                            handleViewDetails
                                                        }
                                                        onDeleteAccount={
                                                            handleDeleteAccount
                                                        }
                                                        isUpdating={
                                                            isUpdating ===
                                                            passenger.id
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
                                                    {passengerUsers.length ===
                                                    0 ? (
                                                        <div className="space-y-2">
                                                            <UserX className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">
                                                                No passengers
                                                                found
                                                            </p>
                                                            <p className="text-sm">
                                                                Registered
                                                                passengers will
                                                                appear here.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">
                                                                No passengers
                                                                match your
                                                                search
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
                                Showing {filteredPassengers.length} of{' '}
                                {passengerUsers.length} passengers
                            </div>
                            <div className="flex justify-center gap-2 sm:justify-end">
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
                                        Import multiple passengers via CSV
                                    </div>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto justify-start py-4"
                            >
                                <div className="text-left">
                                    <div className="font-semibold">
                                        Generate Reports
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        Passenger activity and spending reports
                                    </div>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto justify-start py-4"
                            >
                                <div className="text-left">
                                    <div className="font-semibold">
                                        Send Notifications
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        Broadcast messages to passengers
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
                                    ? 'Deactivate account'
                                    : 'Delete account'}
                            </DialogTitle>
                            <DialogDescription>
                                {reasonDialog.type === 'deactivate'
                                    ? `Provide a reason for deactivating ${reasonDialog.passenger.name}. This will be sent to their email.`
                                    : `Provide a reason for permanently deleting ${reasonDialog.passenger.name}'s account. This will be sent to their email. This cannot be undone.`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                    id="reason"
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
                                disabled={
                                    isUpdating === reasonDialog.passenger.id
                                }
                            >
                                {reasonDialog.type === 'deactivate'
                                    ? 'Deactivate'
                                    : 'Delete account'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

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
    onDeleteAccount,
    isUpdating,
}: {
    passenger: PassengerUser;
    onStatusUpdate: (passenger: PassengerUser) => void;
    onView: (passenger: PassengerUser) => void;
    onDeleteAccount: (passenger: PassengerUser) => void;
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
                <DropdownMenuItem onClick={() => onView(passenger)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <div className="my-1 h-px bg-gray-200" />
                {passenger.status === 'active' && (
                    <DropdownMenuItem
                        onClick={() => onStatusUpdate(passenger)}
                        disabled={isUpdating}
                    >
                        <UserX className="mr-2 h-4 w-4" />
                        {isUpdating ? 'Deactivating...' : 'Deactivate'}
                    </DropdownMenuItem>
                )}
                {passenger.status === 'inactive' && (
                    <DropdownMenuItem
                        onClick={() => onStatusUpdate(passenger)}
                        disabled={isUpdating}
                    >
                        <UserCheck className="mr-2 h-4 w-4" />
                        {isUpdating ? 'Activating...' : 'Activate'}
                    </DropdownMenuItem>
                )}
                <div className="my-1 h-px bg-gray-200" />
                <DropdownMenuItem
                    onClick={() => onDeleteAccount(passenger)}
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

// Passenger Details Modal Component
function PassengerDetailsModal({
    passenger,
    onClose,
    onStatusUpdate,
}: {
    passenger: PassengerUser;
    onClose: () => void;
    onStatusUpdate: (passenger: PassengerUser) => void;
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

    const getStatusBadge = (status: PassengerUser['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" /> Active
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300">
                        <UserX className="mr-1 h-3 w-3" /> Inactive
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
                                Passenger Details
                            </DialogTitle>
                            <DialogDescription>
                                Complete information for {passenger.name}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Passenger Profile Header */}
                    <div className="flex flex-col items-start gap-4 border-b pb-4 sm:flex-row sm:items-center">
                        <Avatar className="h-24 w-24">
                            <AvatarImage
                                src={passenger.avatar_url}
                                alt={passenger.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                                {getInitials(passenger.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <h3 className="text-2xl font-bold">
                                    {passenger.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(passenger.status)}
                                    <Badge
                                        variant="outline"
                                        className="text-green-600"
                                    >
                                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        {passenger.rating != null
                                            ? passenger.rating
                                            : 'N/A'}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-muted-foreground">
                                Joined {formatDate(passenger.joinDate)}
                            </p>
                        </div>
                    </div>

                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="personal">
                                Personal Info
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
                                        <User className="h-5 w-5" />
                                        Contact Information
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                Email Address
                                            </div>
                                            <p className="font-medium">
                                                {passenger.email}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </div>
                                            <p className="font-medium">
                                                {passenger.phone ||
                                                    'Not provided'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                Address
                                            </div>
                                            <p className="font-medium">
                                                {passenger.address ||
                                                    'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold">
                                        <AlertCircle className="h-5 w-5" />
                                        Emergency Contact
                                    </h4>
                                    <div className="space-y-4">
                                        {passenger.emergency_contact ? (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">
                                                        Contact Name
                                                    </div>
                                                    <p className="font-medium">
                                                        {
                                                            passenger
                                                                .emergency_contact
                                                                .name
                                                        }
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">
                                                        Contact Phone
                                                    </div>
                                                    <p className="font-medium">
                                                        {
                                                            passenger
                                                                .emergency_contact
                                                                .phone
                                                        }
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-sm text-muted-foreground">
                                                        Relationship
                                                    </div>
                                                    <p className="font-medium">
                                                        {
                                                            passenger
                                                                .emergency_contact
                                                                .relationship
                                                        }
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground italic">
                                                No emergency contact information
                                                provided
                                            </p>
                                        )}
                                        <div className="space-y-1 border-t pt-2">
                                            <div className="text-sm text-muted-foreground">
                                                Member Since
                                            </div>
                                            <div className="font-medium">
                                                {formatDate(passenger.joinDate)}
                                            </div>
                                        </div>
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
                                                {passenger.totalRides}
                                            </div>
                                        </div>
                                        <div className="space-y-1 rounded-lg bg-muted p-4">
                                            <div className="text-sm text-muted-foreground">
                                                Total Spent
                                            </div>
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                ₱{passenger.totalSpent}
                                            </div>
                                        </div>
                                        <div className="space-y-1 rounded-lg bg-muted p-4">
                                            <div className="text-sm text-muted-foreground">
                                                Avg. Rating Given
                                            </div>
                                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {passenger.rating != null
                                                    ? passenger.rating
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="space-y-1 rounded-lg bg-muted p-4">
                                            <div className="text-sm text-muted-foreground">
                                                Status
                                            </div>
                                            <div className="mt-1">
                                                {getStatusBadge(
                                                    passenger.status,
                                                )}
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
                                                {passenger.lastRide
                                                    ? formatDate(
                                                          passenger.lastRide,
                                                      )
                                                    : 'No rides yet'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Average Ride Cost
                                            </div>
                                            <div className="font-medium">
                                                ₱
                                                {passenger.totalRides > 0
                                                    ? (
                                                          passenger.totalSpent /
                                                          passenger.totalRides
                                                      ).toFixed(2)
                                                    : '0.00'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                Account Created
                                            </div>
                                            <div className="font-medium">
                                                {formatDate(passenger.joinDate)}
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
                        {passenger.status === 'active' ? (
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                onClick={() => {
                                    onStatusUpdate(passenger);
                                    onClose();
                                }}
                            >
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate Passenger
                            </Button>
                        ) : (
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    onStatusUpdate(passenger);
                                    onClose();
                                }}
                            >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate Passenger
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
