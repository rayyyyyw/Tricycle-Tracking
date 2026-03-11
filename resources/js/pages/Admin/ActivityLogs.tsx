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
import { Activity, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';

interface LogEntry {
    id: number;
    action: string;
    description: string;
    user_id: number | null;
    user_role: string | null;
    user: { id: number; name: string; email: string; role: string } | null;
    subject_type: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    /** Ordinal (1st, 2nd, …) in consecutive streak; only when cancelled after driver accepted. */
    consecutive_cancellation_ordinal?: number;
    /** Total in current consecutive streak. */
    consecutive_cancellation_total?: number;
    /** Ordinal in driver's consecutive ignore streak. */
    consecutive_ignore_ordinal?: number;
    /** Total in current consecutive ignore streak. */
    consecutive_ignore_total?: number;
}

interface PaginatedLogs {
    data: LogEntry[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    logs?: PaginatedLogs;
    actions?: string[];
    filters?: {
        action?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activity Logs', href: '/admin/activity-logs' },
];

const actionBadge: Record<string, string> = {
    account_created:
        'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    login: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    booking_created:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    booking_accepted:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    booking_completed:
        'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    booking_cancelled:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    booking_cancelled_by_admin:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    booking_ignored:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    driver_approved:
        'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
    driver_rejected:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    support_ticket_created:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    feedback_submitted:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
};

export default function ActivityLogs({
    logs: propLogs,
    actions: propActions,
    filters: propFilters,
}: Props) {
    const logs: PaginatedLogs = propLogs ?? {
        data: [],
        links: [],
        last_page: 1,
        current_page: 1,
        per_page: 20,
        total: 0,
    };
    const actions = Array.isArray(propActions) ? propActions : [];
    const filters = propFilters ?? {};

    const [search, setSearch] = useState(filters.search ?? '');
    const [actionFilter, setActionFilter] = useState(filters.action ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const applyFilters = () => {
        router.get(
            '/admin/activity-logs',
            {
                search: search || undefined,
                action: actionFilter !== 'all' ? actionFilter : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setActionFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/activity-logs', {}, { preserveState: true });
    };

    // Pagination: normalize URL to current origin so it works in production (server may send wrong domain)
    const visitPage = (url: string | null) => {
        if (!url) return;
        try {
            const parsed = new URL(url, window.location.origin);
            router.visit(parsed.pathname + parsed.search, {
                preserveState: true,
            });
        } catch {
            router.visit(url, { preserveState: true });
        }
    };

    const formatDate = (iso: string) => new Date(iso).toLocaleString();

    const list = Array.isArray(logs.data) ? logs.data : [];
    const links = logs.links ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs - Admin" />
            <div className="space-y-6">
                <Card className="border-emerald-200/50 dark:border-emerald-800/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            Activity & Audit Logs
                        </CardTitle>
                        <CardDescription>
                            View all user actions: new accounts, logins,
                            bookings, driver approvals, support queries,
                            feedback, and more.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
                            <div className="w-full min-w-0 flex-1 sm:max-w-[280px]">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Search
                                </label>
                                <Input
                                    placeholder="Search description or user..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && applyFilters()
                                    }
                                    className="h-9 w-full"
                                />
                            </div>
                            <div className="w-full min-w-0 sm:w-[180px]">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Action
                                </label>
                                <Select
                                    value={actionFilter}
                                    onValueChange={setActionFilter}
                                >
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder="Action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All actions
                                        </SelectItem>
                                        {actions.map((a) => (
                                            <SelectItem key={a} value={a}>
                                                {String(a).replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
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
                            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                                <Button
                                    onClick={applyFilters}
                                    variant="default"
                                    size="sm"
                                    className="h-9"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Apply
                                </Button>
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                >
                                    Clear
                                </Button>
                            </div>
                            <div className="flex w-full justify-end sm:ml-auto sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                                    onClick={() => {
                                        if (
                                            !confirm(
                                                'Delete all activity logs? This cannot be undone.',
                                            )
                                        )
                                            return;
                                        router.post(
                                            '/admin/activity-logs/destroy-all',
                                            {},
                                            { preserveScroll: true },
                                        );
                                    }}
                                    disabled={list.length === 0}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete all
                                </Button>
                            </div>
                        </div>

                        {/* Mobile: card list */}
                        <div className="space-y-3 md:hidden">
                            {list.length === 0 ? (
                                <div className="rounded-lg border py-8 text-center text-muted-foreground">
                                    No activity logs found.
                                </div>
                            ) : (
                                list.map((log) => (
                                    <div
                                        key={log.id}
                                        className="rounded-lg border bg-card p-4 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <Badge
                                                className={
                                                    actionBadge[log.action] ??
                                                    'bg-gray-100 text-gray-800'
                                                }
                                                variant="secondary"
                                            >
                                                {String(log.action).replace(
                                                    /_/g,
                                                    ' ',
                                                )}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(log.created_at)}
                                            </span>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-sm">
                                            {log.description}
                                        </p>
                                        {log.action === 'booking_cancelled' &&
                                            typeof log.consecutive_cancellation_ordinal ===
                                                'number' &&
                                            typeof log.consecutive_cancellation_total ===
                                                'number' && (
                                                <p
                                                    className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium ${log.consecutive_cancellation_ordinal >= 3 ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}
                                                >
                                                    <span>
                                                        Consecutive (after
                                                        acceptance):{' '}
                                                        {
                                                            log.consecutive_cancellation_ordinal
                                                        }{' '}
                                                        of{' '}
                                                        {
                                                            log.consecutive_cancellation_total
                                                        }
                                                    </span>
                                                    {log.consecutive_cancellation_ordinal >=
                                                        3 && (
                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                            Grounds for account
                                                            suspension
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        {log.action === 'booking_cancelled' &&
                                            log.user_role === 'passenger' &&
                                            typeof log.consecutive_cancellation_ordinal !==
                                                'number' && (
                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                    Does not count (cancelled
                                                    before driver accepted)
                                                </p>
                                            )}
                                        {log.action === 'booking_cancelled' &&
                                            (
                                                log.properties as
                                                    | { cancelled_by?: string }
                                                    | undefined
                                            )?.cancelled_by === 'driver' && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Cancelled by driver
                                                </p>
                                            )}
                                        {log.action === 'booking_ignored' &&
                                            typeof log.consecutive_ignore_ordinal ===
                                                'number' &&
                                            typeof log.consecutive_ignore_total ===
                                                'number' && (
                                                <p
                                                    className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium ${log.consecutive_ignore_ordinal >= 3 ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}
                                                >
                                                    <span>
                                                        Consecutive ignore:{' '}
                                                        {
                                                            log.consecutive_ignore_ordinal
                                                        }{' '}
                                                        of{' '}
                                                        {
                                                            log.consecutive_ignore_total
                                                        }
                                                    </span>
                                                    {log.consecutive_ignore_ordinal >=
                                                        3 && (
                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                            Grounds for account
                                                            suspension
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            {log.user ? (
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3 shrink-0" />
                                                    <span className="font-medium text-foreground">
                                                        {log.user.name}
                                                    </span>
                                                    <span>
                                                        ({log.user.role})
                                                    </span>
                                                </span>
                                            ) : (
                                                <span>—</span>
                                            )}
                                            {log.ip_address && (
                                                <span className="font-mono">
                                                    {log.ip_address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop: table */}
                        <div className="hidden overflow-x-auto rounded-md border md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>IP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {list.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No activity logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        list.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                                    {formatDate(log.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            actionBadge[
                                                                log.action
                                                            ] ??
                                                            'bg-gray-100 text-gray-800'
                                                        }
                                                    >
                                                        {String(
                                                            log.action,
                                                        ).replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] min-w-0">
                                                    {log.user ? (
                                                        <span
                                                            className="flex min-w-0 items-center gap-1.5"
                                                            title={`${log.user.name} (${log.user.role})`}
                                                        >
                                                            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="truncate font-medium">
                                                                {log.user.name}
                                                            </span>
                                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                                ({log.user.role}
                                                                )
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-md"
                                                    title={log.description}
                                                >
                                                    <div className="space-y-1">
                                                        <span className="line-clamp-2 block">
                                                            {log.description}
                                                        </span>
                                                        {log.action ===
                                                            'booking_cancelled' &&
                                                            typeof log.consecutive_cancellation_ordinal ===
                                                                'number' &&
                                                            typeof log.consecutive_cancellation_total ===
                                                                'number' && (
                                                                <span
                                                                    className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium ${log.consecutive_cancellation_ordinal >= 3 ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}
                                                                >
                                                                    <span>
                                                                        Consecutive
                                                                        (after
                                                                        acceptance):{' '}
                                                                        {
                                                                            log.consecutive_cancellation_ordinal
                                                                        }{' '}
                                                                        of{' '}
                                                                        {
                                                                            log.consecutive_cancellation_total
                                                                        }
                                                                    </span>
                                                                    {log.consecutive_cancellation_ordinal >=
                                                                        3 && (
                                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                                            Grounds
                                                                            for
                                                                            account
                                                                            suspension
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            )}
                                                        {log.action ===
                                                            'booking_cancelled' &&
                                                            log.user_role ===
                                                                'passenger' &&
                                                            typeof log.consecutive_cancellation_ordinal !==
                                                                'number' && (
                                                                <span className="block text-xs text-muted-foreground">
                                                                    Does not
                                                                    count
                                                                    (cancelled
                                                                    before
                                                                    driver
                                                                    accepted)
                                                                </span>
                                                            )}
                                                        {log.action ===
                                                            'booking_cancelled' &&
                                                            (
                                                                log.properties as
                                                                    | {
                                                                          cancelled_by?: string;
                                                                      }
                                                                    | undefined
                                                            )?.cancelled_by ===
                                                                'driver' && (
                                                                <span className="block text-xs text-muted-foreground">
                                                                    Cancelled by
                                                                    driver
                                                                </span>
                                                            )}
                                                        {log.action ===
                                                            'booking_ignored' &&
                                                            typeof log.consecutive_ignore_ordinal ===
                                                                'number' &&
                                                            typeof log.consecutive_ignore_total ===
                                                                'number' && (
                                                                <span
                                                                    className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium ${log.consecutive_ignore_ordinal >= 3 ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}
                                                                >
                                                                    <span>
                                                                        Consecutive
                                                                        ignore:{' '}
                                                                        {
                                                                            log.consecutive_ignore_ordinal
                                                                        }{' '}
                                                                        of{' '}
                                                                        {
                                                                            log.consecutive_ignore_total
                                                                        }
                                                                    </span>
                                                                    {log.consecutive_ignore_ordinal >=
                                                                        3 && (
                                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                                            Grounds
                                                                            for
                                                                            account
                                                                            suspension
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm text-muted-foreground">
                                                    {log.ip_address ?? '—'}
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
                                    Page {logs.current_page} of {logs.last_page}
                                    {logs.total > 0 && ` · ${logs.total} total`}
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
        </AppLayout>
    );
}
