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
    filters?: { action?: string; user_id?: string; date_from?: string; date_to?: string; search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activity Logs', href: '/admin/activity-logs' },
];

const actionBadge: Record<string, string> = {
    login: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    booking_created: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    booking_accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    booking_completed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    booking_cancelled: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    booking_cancelled_by_admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    driver_approved: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
};

export default function ActivityLogs({ logs: propLogs, actions: propActions, filters: propFilters }: Props) {
    const logs = propLogs ?? { data: [], links: [], last_page: 1 };
    const actions = Array.isArray(propActions) ? propActions : [];
    const filters = propFilters ?? {};

    const [search, setSearch] = useState(filters.search ?? '');
    const [actionFilter, setActionFilter] = useState(filters.action ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const applyFilters = () => {
        router.get('/admin/activity-logs', {
            search: search || undefined,
            action: actionFilter !== 'all' ? actionFilter : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setActionFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/activity-logs', {}, { preserveState: true });
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
                            View all user actions: logins, bookings, driver approvals, and more.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                placeholder="Search description or user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All actions</SelectItem>
                                    {actions.map((a) => (
                                        <SelectItem key={a} value={a}>
                                            {String(a).replace(/_/g, ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-[140px]"
                            />
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-[140px]"
                            />
                            <Button onClick={applyFilters} variant="default" size="sm">
                                <Search className="mr-2 h-4 w-4" />
                                Apply
                            </Button>
                            <Button onClick={clearFilters} variant="outline" size="sm">
                                Clear
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                    if (!confirm('Delete all activity logs? This cannot be undone.')) return;
                                    router.post('/admin/activity-logs/destroy-all', {}, { preserveScroll: true });
                                }}
                                disabled={list.length === 0}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete all
                            </Button>
                        </div>

                        <div className="rounded-md border overflow-x-auto">
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
                                            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                No activity logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        list.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                                    {formatDate(log.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={actionBadge[log.action] ?? 'bg-gray-100 text-gray-800'}>
                                                        {String(log.action).replace(/_/g, ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {log.user ? (
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {log.user.name}
                                                            <span className="text-muted-foreground text-xs">({log.user.role})</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-md truncate" title={log.description}>
                                                    {log.description}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm font-mono">
                                                    {log.ip_address ?? '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {links.length > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        className="min-w-8"
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
