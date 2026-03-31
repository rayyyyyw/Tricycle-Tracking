import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Download, Eye, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tricycle Management',
        href: '/TricycleM',
    },
];

interface TricycleRow {
    driver_id: number;
    driver_name: string;
    driver_email: string;
    driver_phone: string | null;
    driver_avatar_url: string | null;
    vehicle_type: string;
    vehicle_plate_number: string;
    vehicle_model: string | null;
    vehicle_color: string | null;
    vehicle_year: string | number | null;
    completed_rides_count: number;
    active_rides_count: number;
    is_online: boolean;
    last_activity_at: string | null;
    last_activity_at_human: string | null;
    document_urls?: Record<string, string>;
}

interface PageProps {
    tricycles?: TricycleRow[];
    stats?: {
        total: number;
        online: number;
        offline: number;
        on_trip: number;
    };
}

export default function Index() {
    const { tricycles = [], stats } = usePage<PageProps>().props;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'online' | 'offline'
    >('all');
    const [sortBy, setSortBy] = useState<
        'latest' | 'completed_desc' | 'completed_asc' | 'plate_asc'
    >('latest');
    const [selectedDriver, setSelectedDriver] = useState<TricycleRow | null>(
        null,
    );
    const [selectedDocument, setSelectedDocument] = useState<{
        label: string;
        url: string;
        isImage: boolean;
    } | null>(null);

    const safeStats = stats ?? {
        total: tricycles.length,
        online: tricycles.filter((item) => item.is_online).length,
        offline: tricycles.filter((item) => !item.is_online).length,
        on_trip: tricycles.filter((item) => item.active_rides_count > 0).length,
    };

    const filteredTricycles = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        const filtered = tricycles.filter((item) => {
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'online' && item.is_online) ||
                (statusFilter === 'offline' && !item.is_online);

            const matchesSearch =
                normalizedSearch.length === 0 ||
                item.driver_name.toLowerCase().includes(normalizedSearch) ||
                item.driver_email.toLowerCase().includes(normalizedSearch) ||
                item.vehicle_plate_number
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                item.vehicle_type.toLowerCase().includes(normalizedSearch);

            return matchesStatus && matchesSearch;
        });

        const sorted = [...filtered];
        sorted.sort((a, b) => {
            if (sortBy === 'completed_desc') {
                return b.completed_rides_count - a.completed_rides_count;
            }
            if (sortBy === 'completed_asc') {
                return a.completed_rides_count - b.completed_rides_count;
            }
            if (sortBy === 'plate_asc') {
                return a.vehicle_plate_number.localeCompare(
                    b.vehicle_plate_number,
                );
            }

            const aTime = a.last_activity_at
                ? new Date(a.last_activity_at).getTime()
                : 0;
            const bTime = b.last_activity_at
                ? new Date(b.last_activity_at).getTime()
                : 0;
            return bTime - aTime;
        });

        return sorted;
    }, [tricycles, search, statusFilter, sortBy]);

    const filteredStats = useMemo(
        () => ({
            showing: filteredTricycles.length,
            online: filteredTricycles.filter((item) => item.is_online).length,
            onTrip: filteredTricycles.filter(
                (item) => item.active_rides_count > 0,
            ).length,
        }),
        [filteredTricycles],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tricycle Management" />
            <div className="space-y-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Tricycles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {safeStats.total}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Online
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-600">
                                {safeStats.online}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Offline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-slate-600">
                                {safeStats.offline}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Currently On Trip
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">
                                {safeStats.on_trip}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Registered Tricycles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tricycles.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No approved tricycle records found yet.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <Input
                                        placeholder="Search driver, email, plate, vehicle type..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value) =>
                                            setStatusFilter(
                                                value as
                                                    | 'all'
                                                    | 'online'
                                                    | 'offline',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All statuses
                                            </SelectItem>
                                            <SelectItem value="online">
                                                Online only
                                            </SelectItem>
                                            <SelectItem value="offline">
                                                Offline only
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={sortBy}
                                        onValueChange={(value) =>
                                            setSortBy(
                                                value as
                                                    | 'latest'
                                                    | 'completed_desc'
                                                    | 'completed_asc'
                                                    | 'plate_asc',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="latest">
                                                Latest activity
                                            </SelectItem>
                                            <SelectItem value="completed_desc">
                                                Completed rides (high to low)
                                            </SelectItem>
                                            <SelectItem value="completed_asc">
                                                Completed rides (low to high)
                                            </SelectItem>
                                            <SelectItem value="plate_asc">
                                                Plate number (A-Z)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-wrap gap-2 text-sm">
                                    <Badge variant="outline">
                                        Showing: {filteredStats.showing}
                                    </Badge>
                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                        Online: {filteredStats.online}
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                        On Trip: {filteredStats.onTrip}
                                    </Badge>
                                </div>

                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    Plate Number
                                                </TableHead>
                                                <TableHead>Vehicle</TableHead>
                                                <TableHead>Driver</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">
                                                    Active Rides
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Completed Rides
                                                </TableHead>
                                                <TableHead>
                                                    Last Activity
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Documents
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTricycles.map((item) => (
                                                <TableRow key={item.driver_id}>
                                                    <TableCell className="font-medium">
                                                        {
                                                            item.vehicle_plate_number
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <p className="capitalize">
                                                                {
                                                                    item.vehicle_type
                                                                }
                                                            </p>
                                                            <p className="text-muted-foreground">
                                                                {[
                                                                    item.vehicle_model,
                                                                    item.vehicle_color,
                                                                    item.vehicle_year,
                                                                ]
                                                                    .filter(
                                                                        Boolean,
                                                                    )
                                                                    .join(
                                                                        ' • ',
                                                                    ) || '—'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarImage
                                                                    src={
                                                                        item.driver_avatar_url ||
                                                                        undefined
                                                                    }
                                                                    alt={
                                                                        item.driver_name
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {item.driver_name
                                                                        .split(
                                                                            ' ',
                                                                        )
                                                                        .map(
                                                                            (
                                                                                n,
                                                                            ) =>
                                                                                n[0],
                                                                        )
                                                                        .join(
                                                                            '',
                                                                        )
                                                                        .toUpperCase()
                                                                        .slice(
                                                                            0,
                                                                            2,
                                                                        )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="text-sm">
                                                                <p>
                                                                    {
                                                                        item.driver_name
                                                                    }
                                                                </p>
                                                                <p className="text-muted-foreground">
                                                                    {
                                                                        item.driver_email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="secondary"
                                                            className={
                                                                item.is_online
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-slate-100 text-slate-700'
                                                            }
                                                        >
                                                            {item.is_online
                                                                ? 'Online'
                                                                : 'Offline'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {
                                                            item.active_rides_count
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {
                                                            item.completed_rides_count
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {item.last_activity_at_human ||
                                                            'No recent activity'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setSelectedDriver(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {filteredTricycles.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No tricycles match your current filters.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={selectedDriver !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedDriver(null);
                }}
            >
                <DialogContent className="max-h-[90vh] w-[98vw] overflow-y-auto sm:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Driver Documents</DialogTitle>
                        <DialogDescription>
                            {selectedDriver
                                ? `${selectedDriver.driver_name} • ${selectedDriver.vehicle_plate_number}`
                                : 'Driver documents'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                        {selectedDriver &&
                        selectedDriver.document_urls &&
                        Object.keys(selectedDriver.document_urls).length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {Object.entries(
                                    selectedDriver.document_urls,
                                ).map(([key, url]) => {
                                    const isImage =
                                        /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

                                    const labelMap: Record<string, string> = {
                                        license_front: "Driver's License Front",
                                        license_back: "Driver's License Back",
                                        vehicle_registration:
                                            'Vehicle Registration',
                                        mtop: 'MTOP Permit',
                                    };
                                    const descriptionMap: Record<
                                        string,
                                        string
                                    > = {
                                        license_front:
                                            "Front side of driver's license",
                                        license_back:
                                            "Back side of driver's license",
                                        vehicle_registration:
                                            'Vehicle registration certificate',
                                        mtop: "Motorized tricycle operator's permit",
                                    };
                                    const prettyLabel =
                                        labelMap[key] ||
                                        key
                                            .replace(/_/g, ' ')
                                            .replace(/\b\w/g, (c) =>
                                                c.toUpperCase(),
                                            );
                                    const prettyDescription =
                                        descriptionMap[key] ||
                                        'Uploaded driver document';

                                    return (
                                        <Card
                                            key={key}
                                            className="overflow-hidden"
                                        >
                                            <CardContent className="space-y-4 p-0">
                                                <div className="relative border-b bg-muted/30">
                                                    {isImage ? (
                                                        <img
                                                            src={url}
                                                            alt={prettyLabel}
                                                            className="h-64 w-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="flex h-64 w-full items-center justify-center">
                                                            <div className="text-center">
                                                                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                                                                <p className="mt-2 text-sm text-muted-foreground">
                                                                    No image
                                                                    preview
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3 px-4 pb-4">
                                                    <div>
                                                        <p className="font-medium">
                                                            {prettyLabel}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {prettyDescription}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 border-t px-4 pt-3 pb-4">
                                                    <a
                                                        href={url}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedDocument(
                                                                {
                                                                    label: prettyLabel,
                                                                    url,
                                                                    isImage,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </a>
                                                    <a
                                                        href={url}
                                                        download
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Download
                                                        </Button>
                                                    </a>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No uploaded documents found for this driver.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={selectedDocument !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedDocument(null);
                }}
            >
                <DialogContent className="w-[95vw] sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedDocument?.label}</DialogTitle>
                        <DialogDescription>
                            Preview of uploaded driver document
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border bg-muted/30 p-4">
                        {selectedDocument?.isImage ? (
                            <img
                                src={selectedDocument.url}
                                alt={selectedDocument.label}
                                className="max-h-[65vh] w-full rounded-md object-contain"
                            />
                        ) : (
                            <div className="space-y-3">
                                <div className="flex h-60 w-full items-center justify-center rounded-md border bg-background">
                                    <FileText className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This file type cannot be previewed inline.
                                    Use Download or Open in a new tab.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <a
                            href={selectedDocument?.url}
                            download
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-1"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </a>
                        <Button
                            type="button"
                            onClick={() => setSelectedDocument(null)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
