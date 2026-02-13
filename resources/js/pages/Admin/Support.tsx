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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    Filter,
    Mail,
    MessageCircle,
    Search,
    Send,
    User,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface SupportTicket {
    id: number;
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
        avatar_url?: string;
    };
    user_type: string;
    category: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    admin_response?: string;
    created_at: string;
    responded_at?: string;
    responded_by?: {
        id: number;
        name: string;
    };
}

interface PaginatedTickets {
    data: SupportTicket[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
}

interface Props {
    tickets: PaginatedTickets;
    stats: Stats;
    filters: {
        status?: string;
        user_type?: string;
        search?: string;
    };
}

export default function Support({ tickets, stats, filters }: Props) {
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
        null,
    );
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter state
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [userTypeFilter, setUserTypeFilter] = useState(
        filters.user_type || 'all',
    );

    const { data, setData, post, processing, reset } = useForm({
        admin_response: '',
        status: 'in_progress' as 'open' | 'in_progress' | 'resolved' | 'closed',
    });

    const handleFilter = () => {
        router.get(
            '/admin/support',
            {
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                user_type:
                    userTypeFilter !== 'all' ? userTypeFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setUserTypeFilter('all');
        router.get(
            '/admin/support',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const openTicketDialog = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setData({
            admin_response: ticket.admin_response || '',
            status: ticket.status,
        });
        setDialogOpen(true);
    };

    const handleRespond = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket) return;

        post(`/admin/support/${selectedTicket.id}/respond`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setDialogOpen(false);
                setSelectedTicket(null);
            },
        });
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            open: {
                class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                icon: AlertCircle,
                label: 'Open',
            },
            in_progress: {
                class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
                icon: Clock,
                label: 'In Progress',
            },
            resolved: {
                class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
                icon: CheckCircle,
                label: 'Resolved',
            },
            closed: {
                class: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
                icon: XCircle,
                label: 'Closed',
            },
        };
        return configs[status as keyof typeof configs] || configs.open;
    };

    const getUserTypeBadge = (userType: string) => {
        return userType === 'driver'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            general:
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            booking:
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            payment:
                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            safety: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            technical:
                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            other: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        };
        return colors[category] || colors.general;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const activeFiltersCount = [
        searchQuery,
        statusFilter !== 'all' ? statusFilter : null,
        userTypeFilter !== 'all' ? userTypeFilter : null,
    ].filter(Boolean).length;

    return (
        <AppLayout>
            <Head title="Support Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl dark:text-white">
                            <MessageCircle className="h-6 w-6 shrink-0 text-emerald-600 sm:h-8 sm:w-8" />
                            <span className="truncate">Support Management</span>
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage and respond to support tickets from
                            passengers and drivers
                        </p>
                    </div>
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="w-full shrink-0 gap-2 sm:w-auto"
                        >
                            <X className="h-4 w-4" />
                            Clear Filters ({activeFiltersCount})
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="cursor-pointer border-l-4 border-l-blue-500 transition-shadow hover:shadow-md">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Tickets
                                    </p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer border-l-4 border-l-yellow-500 transition-shadow hover:shadow-md">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Open
                                    </p>
                                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {stats.open}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                    <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer border-l-4 border-l-orange-500 transition-shadow hover:shadow-md">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        In Progress
                                    </p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                        {stats.in_progress}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer border-l-4 border-l-green-500 transition-shadow hover:shadow-md">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Resolved
                                    </p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {stats.resolved}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            <div className="relative min-w-0 sm:col-span-2 md:col-span-1">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && handleFilter()
                                    }
                                    className="w-full pl-9"
                                />
                            </div>

                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">
                                        In Progress
                                    </SelectItem>
                                    <SelectItem value="resolved">
                                        Resolved
                                    </SelectItem>
                                    <SelectItem value="closed">
                                        Closed
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={userTypeFilter}
                                onValueChange={setUserTypeFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Users
                                    </SelectItem>
                                    <SelectItem value="passenger">
                                        Passengers
                                    </SelectItem>
                                    <SelectItem value="driver">
                                        Drivers
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleFilter}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 sm:col-span-2 md:col-span-1"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tickets List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Support Tickets</CardTitle>
                                <CardDescription className="mt-1">
                                    Showing {tickets.data.length} of{' '}
                                    {tickets.total} tickets
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {tickets.data.length > 0 ? (
                            <div className="space-y-4">
                                {tickets.data.map((ticket) => {
                                    const statusConfig = getStatusConfig(
                                        ticket.status,
                                    );
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <div
                                            key={ticket.id}
                                            className="group cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-700"
                                            onClick={() =>
                                                openTicketDialog(ticket)
                                            }
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                                                {/* User Avatar */}
                                                <Avatar className="h-10 w-10 shrink-0 ring-2 ring-emerald-100 dark:ring-emerald-900 sm:h-12 sm:w-12">
                                                    <AvatarImage
                                                        src={
                                                            ticket.user
                                                                .avatar_url
                                                        }
                                                    />
                                                    <AvatarFallback
                                                        className={getUserTypeBadge(
                                                            ticket.user_type,
                                                        )}
                                                    >
                                                        {getInitials(
                                                            ticket.user.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>

                                                {/* Ticket Content */}
                                                <div className="min-w-0 flex-1">
                                                    {/* Header Row: badges + title, View on own row on mobile */}
                                                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                <span className="text-xs font-semibold text-muted-foreground">
                                                                    #{ticket.id}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={getUserTypeBadge(
                                                                        ticket.user_type,
                                                                    )}
                                                                >
                                                                    {
                                                                        ticket.user_type
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`${statusConfig.class} flex items-center gap-1 border`}
                                                                >
                                                                    <StatusIcon className="h-3 w-3" />
                                                                    {
                                                                        statusConfig.label
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={getCategoryColor(
                                                                        ticket.category,
                                                                    )}
                                                                >
                                                                    {
                                                                        ticket.category
                                                                    }
                                                                </Badge>
                                                            </div>
                                                            <h3 className="wrap-break-word text-base font-semibold transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                                                {ticket.subject}
                                                            </h3>
                                                        </div>

                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="w-full shrink-0 sm:w-auto"
                                                        >
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </div>

                                                    {/* Message Preview */}
                                                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                                                        {ticket.message}
                                                    </p>

                                                    {/* Footer Row: wrap so Responded is visible on mobile */}
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{ticket.user.name}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1 min-w-0">
                                                            <Mail className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{ticket.user.email}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1 shrink-0">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(
                                                                ticket.created_at,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                        {ticket.admin_response && (
                                                            <Badge
                                                                variant="outline"
                                                                className="shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                                            >
                                                                Responded
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-700" />
                                <h3 className="mb-2 text-lg font-semibold">
                                    No support tickets found
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {activeFiltersCount > 0
                                        ? 'Try adjusting your filters to see more results'
                                        : 'All support tickets will appear here'}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {tickets.last_page > 1 && (
                            <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-center text-sm text-muted-foreground sm:text-left">
                                    Page {tickets.current_page} of{' '}
                                    {tickets.last_page}
                                </p>
                                <div className="flex justify-center gap-2 sm:justify-end">
                                    {tickets.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get('/admin/support', {
                                                    ...filters,
                                                    page:
                                                        tickets.current_page -
                                                        1,
                                                })
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {tickets.current_page <
                                        tickets.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get('/admin/support', {
                                                    ...filters,
                                                    page:
                                                        tickets.current_page +
                                                        1,
                                                })
                                            }
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Ticket Detail Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto p-4 sm:p-6">
                    {selectedTicket && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12 ring-2 ring-emerald-100 dark:ring-emerald-900">
                                        <AvatarImage
                                            src={selectedTicket.user.avatar_url}
                                        />
                                        <AvatarFallback
                                            className={getUserTypeBadge(
                                                selectedTicket.user_type,
                                            )}
                                        >
                                            {getInitials(
                                                selectedTicket.user.name,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <DialogTitle className="text-xl">
                                            Ticket #{selectedTicket.id}:{' '}
                                            {selectedTicket.subject}
                                        </DialogTitle>
                                        <DialogDescription className="mt-1">
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <Badge
                                                    className={getUserTypeBadge(
                                                        selectedTicket.user_type,
                                                    )}
                                                >
                                                    {selectedTicket.user_type}
                                                </Badge>
                                                <Badge
                                                    className={getCategoryColor(
                                                        selectedTicket.category,
                                                    )}
                                                >
                                                    {selectedTicket.category}
                                                </Badge>
                                                <span className="text-xs">
                                                    From:{' '}
                                                    {selectedTicket.user.name} (
                                                    {selectedTicket.user.email})
                                                </span>
                                            </div>
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="mt-6 space-y-6">
                                {/* Original Message */}
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                        <MessageCircle className="h-4 w-4" />
                                        Customer Message
                                    </h4>
                                    <p className="text-sm whitespace-pre-wrap">
                                        {selectedTicket.message}
                                    </p>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Submitted on{' '}
                                        {new Date(
                                            selectedTicket.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                {/* Previous Response (if exists) */}
                                {selectedTicket.admin_response && (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
                                        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle className="h-4 w-4" />
                                            Admin Response
                                        </h4>
                                        <p className="text-sm whitespace-pre-wrap">
                                            {selectedTicket.admin_response}
                                        </p>
                                        {selectedTicket.responded_by &&
                                            selectedTicket.responded_at && (
                                                <p className="mt-3 text-xs text-muted-foreground">
                                                    Responded by{' '}
                                                    {
                                                        selectedTicket
                                                            .responded_by.name
                                                    }{' '}
                                                    on{' '}
                                                    {new Date(
                                                        selectedTicket.responded_at,
                                                    ).toLocaleString()}
                                                </p>
                                            )}
                                    </div>
                                )}

                                {/* Response Form */}
                                <form
                                    onSubmit={handleRespond}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold">
                                            {selectedTicket.admin_response
                                                ? 'Update Response'
                                                : 'Your Response'}
                                        </label>
                                        <Textarea
                                            placeholder="Type your response to the customer..."
                                            value={data.admin_response}
                                            onChange={(e) =>
                                                setData(
                                                    'admin_response',
                                                    e.target.value,
                                                )
                                            }
                                            rows={6}
                                            required
                                            className="resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold">
                                            Update Status
                                        </label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData(
                                                    'status',
                                                    value as
                                                        | 'open'
                                                        | 'in_progress'
                                                        | 'resolved'
                                                        | 'closed',
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">
                                                    Open
                                                </SelectItem>
                                                <SelectItem value="in_progress">
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value="resolved">
                                                    Resolved
                                                </SelectItem>
                                                <SelectItem value="closed">
                                                    Closed
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {processing
                                                ? 'Sending...'
                                                : 'Send Response'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
