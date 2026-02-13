import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
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
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Download,
    Eye,
    MapPin,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const FILTER_DEBOUNCE_MS = 400;

interface BookingRow {
    id: number;
    booking_id: string;
    status: string;
    passenger_name: string;
    passenger_id: number;
    driver_name: string | null;
    driver_id: number | null;
    pickup_address: string;
    pickup_barangay: string | null;
    destination_address: string;
    destination_barangay: string | null;
    total_fare: number;
    created_at: string;
    accepted_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
}

interface BookingDetail {
    id: number;
    booking_id: string;
    status: string;
    ride_type: string;
    passenger_count: number;
    passenger: {
        id: number;
        name: string;
        email: string;
        phone: string;
    } | null;
    driver: { id: number; name: string; email: string; phone: string } | null;
    pickup: {
        address: string;
        barangay: string | null;
        lat: string;
        lng: string;
    };
    destination: {
        address: string;
        barangay: string | null;
        lat: string;
        lng: string;
    };
    distance: string | null;
    duration: string | null;
    fare: number;
    total_fare: number;
    created_at: string;
    accepted_at: string | null;
    completed_at: string | null;
    cancelled_at: string | null;
    special_instructions: string | null;
}

interface PaginatedBookings {
    data: BookingRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    bookings: PaginatedBookings;
    bookingDetail: BookingDetail | null;
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bookings', href: '/admin/bookings' },
];

const statusBadge: Record<string, string> = {
    pending:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    accepted:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function AdminBookings({
    bookings,
    bookingDetail: initialDetail,
    filters = {},
}: Props) {
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<BookingDetail | null>(
        initialDetail ?? null,
    );

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    // Sync sheet with server: open when detail requested, close when not (defer setState to satisfy lint)
    useEffect(() => {
        if (initialDetail) {
            queueMicrotask(() => {
                setSelectedDetail(initialDetail);
                setDetailOpen(true);
            });
        } else {
            queueMicrotask(() => {
                setDetailOpen(false);
                setSelectedDetail(null);
            });
        }
    }, [initialDetail]);

    const applyFilters = useCallback(() => {
        router.get(
            '/admin/bookings',
            {
                search: search || undefined,
                status: status !== 'all' ? status : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true },
        );
    }, [search, status, dateFrom, dateTo]);

    // Auto-apply filters when search/status/dates change (debounced so we don't hit server on every keystroke)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        const sameAsServer =
            (filters.search ?? '') === search &&
            (filters.status ?? 'all') === status &&
            (filters.date_from ?? '') === dateFrom &&
            (filters.date_to ?? '') === dateTo;
        if (sameAsServer) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
            applyFilters();
        }, FILTER_DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [
        search,
        status,
        dateFrom,
        dateTo,
        filters.search,
        filters.status,
        filters.date_from,
        filters.date_to,
        applyFilters,
    ]);

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/bookings', {}, { preserveState: true });
    };

    const openDetail = (booking: BookingRow) => {
        router.get(
            '/admin/bookings',
            { ...filters, detail: booking.id },
            { preserveState: true },
        );
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setSelectedDetail(null);
        // Remove detail from URL so pagination doesn’t keep reopening the sheet
        router.get('/admin/bookings', { ...filters }, { preserveState: true });
    };

    // Pagination: visit link URL without ?detail= so the sheet doesn’t reopen
    const visitPage = (url: string | null) => {
        if (!url) return;
        try {
            const parsed = new URL(url, window.location.origin);
            parsed.searchParams.delete('detail');
            router.visit(parsed.pathname + parsed.search, {
                preserveState: true,
            });
        } catch {
            router.visit(url, { preserveState: true });
        }
    };

    const formatDate = (iso: string | null) =>
        iso ? new Date(iso).toLocaleString() : '—';

    const list = Array.isArray(bookings?.data) ? bookings.data : [];
    const links = bookings?.links ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings - Admin" />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Bookings & Trips
                        </CardTitle>
                        <CardDescription>
                            View and manage all bookings. Cancel when needed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
                            <div className="min-w-0 w-full flex-1 sm:max-w-[260px]">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Search
                                </label>
                                <Input
                                    placeholder="Booking ID, passenger, driver..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && applyFilters()
                                    }
                                    className="h-9 w-full"
                                />
                            </div>
                            <div className="w-full min-w-0 sm:w-[130px]">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Status
                                </label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All statuses
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="accepted">
                                            Accepted
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            In progress
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full min-w-0 sm:w-[140px]">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    From date
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="h-9 w-full"
                                />
                            </div>
                            <div className="w-full min-w-0 sm:w-[140px]">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    To date
                                </label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-9 w-full"
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    onClick={applyFilters}
                                    variant="default"
                                    size="sm"
                                    className="h-9"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Apply now
                                </Button>
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                >
                                    Clear
                                </Button>
                                <span className="hidden text-xs text-muted-foreground sm:inline">
                                    Filters auto-update
                                </span>
                            </div>
                            <div className="flex w-full justify-end sm:ml-auto sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                                    onClick={() => {
                                        if (
                                            !confirm(
                                                'Permanently delete ALL bookings? This cannot be undone.',
                                            )
                                        )
                                            return;
                                        router.post(
                                            '/admin/bookings/destroy-all',
                                            {},
                                            { preserveScroll: true },
                                        );
                                    }}
                                    disabled={
                                        !bookings?.total || bookings.total === 0
                                    }
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete all
                                </Button>
                            </div>
                        </div>

                        {/* Mobile: card list */}
                        <div className="space-y-3 md:hidden">
                            {list.length === 0 ? (
                                <div className="rounded-lg border py-10 text-center text-muted-foreground">
                                    No bookings found.
                                </div>
                            ) : (
                                list.map((b) => (
                                    <div
                                        key={b.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => openDetail(b)}
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' &&
                                            openDetail(b)
                                        }
                                        className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30 active:bg-muted/50"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-mono text-sm font-medium">
                                                {b.booking_id}
                                            </p>
                                            <Badge
                                                className={
                                                    statusBadge[b.status] ??
                                                    'bg-gray-100'
                                                }
                                                variant="secondary"
                                            >
                                                {String(b.status).replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </Badge>
                                        </div>
                                        <p className="mt-1.5 text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {b.passenger_name}
                                            </span>
                                            {' · '}
                                            {b.driver_name ?? '—'}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                            {b.pickup_barangay ??
                                                b.pickup_address}{' '}
                                            →{' '}
                                            {b.destination_barangay ??
                                                b.destination_address}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                                            <span className="text-sm font-medium">
                                                ₱
                                                {Number(b.total_fare).toFixed(
                                                    2,
                                                )}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-1.5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDetail(b);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop: table */}
                        <div className="hidden overflow-x-auto rounded-lg border shadow-sm md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-semibold">
                                            Booking ID
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Passenger
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Driver
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Route
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Fare
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Created
                                        </TableHead>
                                        <TableHead className="w-[70px] font-semibold">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {list.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No bookings found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        list.map((b) => (
                                            <TableRow
                                                key={b.id}
                                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                                onClick={() => openDetail(b)}
                                            >
                                                <TableCell className="font-mono text-sm">
                                                    {b.booking_id}
                                                </TableCell>
                                                <TableCell>
                                                    {b.passenger_name}
                                                </TableCell>
                                                <TableCell>
                                                    {b.driver_name ?? '—'}
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-[200px] truncate"
                                                    title={`${b.pickup_address} → ${b.destination_address}`}
                                                >
                                                    {b.pickup_barangay ??
                                                        b.pickup_address}{' '}
                                                    →{' '}
                                                    {b.destination_barangay ??
                                                        b.destination_address}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    ₱
                                                    {Number(
                                                        b.total_fare,
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            statusBadge[
                                                                b.status
                                                            ] ?? 'bg-gray-100'
                                                        }
                                                        variant="secondary"
                                                    >
                                                        {String(
                                                            b.status,
                                                        ).replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(b.created_at)}
                                                </TableCell>
                                                <TableCell
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1.5"
                                                        onClick={() =>
                                                            openDetail(b)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {links.length > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 border-t pt-4">
                                <p className="w-full text-center text-xs text-muted-foreground sm:mr-2 sm:w-auto">
                                    Page {bookings.current_page} of{' '}
                                    {bookings.last_page}
                                    {bookings.total > 0 &&
                                        ` · ${bookings.total} total`}
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-1">
                                    {links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() =>
                                                visitPage(link.url ?? null)
                                            }
                                            className="min-w-8"
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Sheet
                open={detailOpen}
                onOpenChange={(open) => !open && closeDetail()}
            >
                <SheetContent
                    className="flex flex-col overflow-y-auto sm:max-w-md"
                    onClose={closeDetail}
                >
                    <SheetHeader className="space-y-1 border-b pb-4">
                        <SheetTitle className="text-lg">
                            Booking details
                        </SheetTitle>
                        <SheetDescription className="font-mono text-sm">
                            {selectedDetail?.booking_id}
                        </SheetDescription>
                    </SheetHeader>
                    {selectedDetail && (
                        <div className="mt-4 flex flex-1 flex-col gap-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <Badge
                                    className={
                                        statusBadge[selectedDetail.status] ??
                                        'bg-gray-100'
                                    }
                                    variant="secondary"
                                >
                                    {String(selectedDetail.status).replace(
                                        '_',
                                        ' ',
                                    )}
                                </Badge>
                                <span className="text-xl font-semibold tabular-nums">
                                    ₱
                                    {Number(selectedDetail.total_fare).toFixed(
                                        2,
                                    )}
                                </span>
                            </div>

                            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Passenger
                                </p>
                                <p className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    {selectedDetail.passenger?.name ?? '—'} ·{' '}
                                    {selectedDetail.passenger?.email ?? '—'}
                                </p>
                                {selectedDetail.passenger?.phone && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedDetail.passenger.phone}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Driver
                                </p>
                                <p className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    {selectedDetail.driver?.name ?? '—'} ·{' '}
                                    {selectedDetail.driver?.email ?? '—'}
                                </p>
                                {selectedDetail.driver?.phone && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedDetail.driver.phone}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    <MapPin className="h-3.5 w-3.5" /> Pickup
                                </p>
                                <p className="text-sm">
                                    {selectedDetail.pickup?.address ?? '—'}
                                </p>
                                {selectedDetail.pickup?.barangay && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedDetail.pickup.barangay}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    <MapPin className="h-3.5 w-3.5" />{' '}
                                    Destination
                                </p>
                                <p className="text-sm">
                                    {selectedDetail.destination?.address ?? '—'}
                                </p>
                                {selectedDetail.destination?.barangay && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedDetail.destination.barangay}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                                <p>
                                    <span className="text-muted-foreground">
                                        Created:
                                    </span>{' '}
                                    {formatDate(selectedDetail.created_at)}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Accepted:
                                    </span>{' '}
                                    {formatDate(selectedDetail.accepted_at)}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Completed:
                                    </span>{' '}
                                    {formatDate(selectedDetail.completed_at)}
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Cancelled:
                                    </span>{' '}
                                    {formatDate(selectedDetail.cancelled_at)}
                                </p>
                            </div>
                            {selectedDetail.special_instructions && (
                                <p className="rounded-lg border bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
                                    <span className="font-medium text-muted-foreground">
                                        Notes:
                                    </span>{' '}
                                    {selectedDetail.special_instructions}
                                </p>
                            )}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    window.open(
                                        `/admin/bookings/${selectedDetail.id}/receipt`,
                                        '_blank',
                                        'noopener,noreferrer',
                                    )
                                }
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download receipt
                            </Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
