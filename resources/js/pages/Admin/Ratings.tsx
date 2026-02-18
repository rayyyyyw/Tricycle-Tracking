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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Archive,
    CheckCircle,
    Eye,
    Filter,
    MoreVertical,
    Star,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Feedback {
    id: number;
    user_name: string;
    user_email: string;
    user_avatar?: string;
    user_role: 'driver' | 'passenger';
    rating: number;
    feedback?: string;
    status: 'new' | 'read' | 'archived';
    created_at: string;
    created_at_human: string;
}

interface PaginatedFeedbacks {
    data: Feedback[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    total: number;
    new: number;
    read: number;
    archived: number;
    average_rating: number;
    by_role: {
        driver: number;
        passenger: number;
    };
    by_rating: {
        '5': number;
        '4': number;
        '3': number;
        '2': number;
        '1': number;
    };
}

interface Props {
    feedbacks: PaginatedFeedbacks;
    stats: Stats;
    filters: {
        status?: string;
        role?: string;
        rating?: string;
    };
}

export default function Ratings({ feedbacks, stats, filters }: Props) {
    const [selectedFeedback, setSelectedFeedback] =
        useState<Feedback | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter state
    const [statusFilter, setStatusFilter] = useState(
        filters.status || 'all',
    );
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [ratingFilter, setRatingFilter] = useState(
        filters.rating || 'all',
    );

    const { patch, delete: destroy, processing } = useForm({});

    const handleFilter = () => {
        router.get(
            '/admin/ratings',
            {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                rating: ratingFilter !== 'all' ? ratingFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearFilters = () => {
        setStatusFilter('all');
        setRoleFilter('all');
        setRatingFilter('all');
        router.get(
            '/admin/ratings',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const openFeedbackDialog = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setDialogOpen(true);
    };

    const handleStatusUpdate = (feedbackId: number, status: string) => {
        patch(`/admin/ratings/${feedbackId}/status`, {
            status,
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                setSelectedFeedback(null);
            },
        });
    };

    const handleDelete = (feedbackId: number) => {
        if (
            !confirm(
                'Are you sure you want to delete this feedback? This action cannot be undone.',
            )
        ) {
            return;
        }

        destroy(`/admin/ratings/${feedbackId}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedFeedback?.id === feedbackId) {
                    setDialogOpen(false);
                    setSelectedFeedback(null);
                }
            },
        });
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            new: {
                class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                label: 'New',
            },
            read: {
                class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
                label: 'Read',
            },
            archived: {
                class: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
                label: 'Archived',
            },
        };
        return configs[status as keyof typeof configs] || configs.new;
    };

    const getRoleBadge = (role: string) => {
        return role === 'driver'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    };

    const getRatingLabel = (rating: number) => {
        const labels: Record<number, { text: string; color: string }> = {
            5: { text: 'Excellent', color: 'text-green-600 dark:text-green-400' },
            4: { text: 'Great', color: 'text-blue-600 dark:text-blue-400' },
            3: { text: 'Satisfactory', color: 'text-yellow-600 dark:text-yellow-400' },
            2: { text: 'Fair', color: 'text-orange-600 dark:text-orange-400' },
            1: { text: 'Poor', color: 'text-red-600 dark:text-red-400' },
        };
        return labels[rating] || { text: 'Unknown', color: 'text-gray-600 dark:text-gray-400' };
    };

    const renderStars = (rating: number, showLabel = false) => {
        const label = getRatingLabel(rating);
        return (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                            }`}
                        />
                    ))}
                </div>
                {showLabel && (
                    <span className={`text-xs font-medium sm:text-sm ${label.color}`}>
                        {label.text}
                    </span>
                )}
            </div>
        );
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
        statusFilter !== 'all' ? statusFilter : null,
        roleFilter !== 'all' ? roleFilter : null,
        ratingFilter !== 'all' ? ratingFilter : null,
    ].filter(Boolean).length;

    return (
        <AppLayout>
            <Head title="Ratings & Feedback" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl dark:text-white">
                            <Star className="h-6 w-6 shrink-0 text-emerald-600 sm:h-8 sm:w-8" />
                            <span className="truncate">Ratings & Feedback</span>
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            View and manage feedback from passengers and
                            drivers
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
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        Total Feedback
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer border-l-4 border-l-yellow-500 transition-shadow hover:shadow-md">
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        New
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {stats.new}
                                    </p>
                                </div>
                                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer border-l-4 border-l-green-500 transition-shadow hover:shadow-md">
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        Average Rating
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                                            {stats.average_rating.toFixed(1)}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {getRatingLabel(Math.round(stats.average_rating)).text}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-green-600 text-green-600 dark:fill-green-400 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm sm:text-base">By Role</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                        Drivers
                                    </span>
                                    <Badge className={`${getRoleBadge('driver')} text-xs`}>
                                        {stats.by_role.driver}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                        Passengers
                                    </span>
                                    <Badge className={`${getRoleBadge('passenger')} text-xs`}>
                                        {stats.by_role.passenger}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm sm:text-base">By Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const label = getRatingLabel(rating);
                                    return (
                                        <div
                                            key={rating}
                                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex flex-1 items-center gap-2 min-w-0">
                                                {renderStars(rating, true)}
                                            </div>
                                            <Badge variant="outline" className="w-fit shrink-0">
                                                {stats.by_rating[rating as keyof typeof stats.by_rating]}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-medium">
                                    Status
                                </label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="h-9 sm:h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="new">New</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-medium">Role</label>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="h-9 sm:h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="driver">Driver</SelectItem>
                                        <SelectItem value="passenger">
                                            Passenger
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-medium">
                                    Rating
                                </label>
                                <Select
                                    value={ratingFilter}
                                    onValueChange={setRatingFilter}
                                >
                                    <SelectTrigger className="h-9 sm:h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ratings</SelectItem>
                                        <SelectItem value="5">5 Stars - Excellent</SelectItem>
                                        <SelectItem value="4">4 Stars - Great</SelectItem>
                                        <SelectItem value="3">3 Stars - Satisfactory</SelectItem>
                                        <SelectItem value="2">2 Stars - Fair</SelectItem>
                                        <SelectItem value="1">1 Star - Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleFilter} size="sm" className="w-full sm:w-auto">
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Feedbacks List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Feedback List</CardTitle>
                        <CardDescription>
                            {feedbacks.total} total feedback
                            {feedbacks.total !== feedbacks.data.length &&
                                ` (showing ${feedbacks.data.length})`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {feedbacks.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                                    No feedback found
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {activeFiltersCount > 0
                                        ? 'Try adjusting your filters'
                                        : 'No feedback has been submitted yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {feedbacks.data.map((feedback) => (
                                    <Card
                                        key={feedback.id}
                                        className="cursor-pointer transition-shadow hover:shadow-md"
                                        onClick={() =>
                                            openFeedbackDialog(feedback)
                                        }
                                    >
                                        <CardContent className="p-2.5 sm:p-3">
                                            <div className="flex items-start gap-2 sm:gap-3">
                                                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                                                    <AvatarImage
                                                        src={feedback.user_avatar}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(
                                                            feedback.user_name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white break-words">
                                                                    {
                                                                        feedback.user_name
                                                                    }
                                                                </p>
                                                                <Badge
                                                                    className={`${getRoleBadge(
                                                                        feedback.user_role,
                                                                    )} text-[10px] px-1.5 py-0`}
                                                                >
                                                                    {
                                                                        feedback.user_role
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    className={`${
                                                                        getStatusConfig(
                                                                            feedback.status,
                                                                        ).class
                                                                    } text-[10px] px-1.5 py-0`}
                                                                >
                                                                    {
                                                                        getStatusConfig(
                                                                            feedback.status,
                                                                        ).label
                                                                    }
                                                                </Badge>
                                                            </div>
                                                            <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                <div className="flex items-center gap-1">
                                                                    {renderStars(feedback.rating, false)}
                                                                    <span className={`text-[10px] sm:text-xs font-medium ${getRatingLabel(feedback.rating).color}`}>
                                                                        {getRatingLabel(feedback.rating).text}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                                    {feedback.created_at_human}
                                                                </span>
                                                            </div>
                                                            {feedback.feedback && (
                                                                <p className="mt-1 line-clamp-1 text-[11px] sm:text-xs text-gray-700 dark:text-gray-300 break-words">
                                                                    {
                                                                        feedback.feedback
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 shrink-0 p-0"
                                                                >
                                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openFeedbackDialog(feedback);
                                                                    }}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(
                                                                            feedback.id,
                                                                        );
                                                                    }}
                                                                    className="text-red-600 dark:text-red-400"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {feedbacks.last_page > 1 && (
                            <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                    Page {feedbacks.current_page} of{' '}
                                    {feedbacks.last_page}
                                </p>
                                <div className="flex gap-2 justify-center sm:justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={feedbacks.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                '/admin/ratings',
                                                {
                                                    page:
                                                        feedbacks.current_page -
                                                        1,
                                                    status:
                                                        statusFilter !== 'all'
                                                            ? statusFilter
                                                            : undefined,
                                                    role:
                                                        roleFilter !== 'all'
                                                            ? roleFilter
                                                            : undefined,
                                                    rating:
                                                        ratingFilter !== 'all'
                                                            ? ratingFilter
                                                            : undefined,
                                                },
                                                { preserveState: true },
                                            )
                                        }
                                        className="flex-1 sm:flex-initial"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            feedbacks.current_page ===
                                            feedbacks.last_page
                                        }
                                        onClick={() =>
                                            router.get(
                                                '/admin/ratings',
                                                {
                                                    page:
                                                        feedbacks.current_page +
                                                        1,
                                                    status:
                                                        statusFilter !== 'all'
                                                            ? statusFilter
                                                            : undefined,
                                                    role:
                                                        roleFilter !== 'all'
                                                            ? roleFilter
                                                            : undefined,
                                                    rating:
                                                        ratingFilter !== 'all'
                                                            ? ratingFilter
                                                            : undefined,
                                                },
                                                { preserveState: true },
                                            )
                                        }
                                        className="flex-1 sm:flex-initial"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Detail Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">Feedback Details</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            View and manage this feedback submission
                        </DialogDescription>
                    </DialogHeader>
                    {selectedFeedback && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                                    <AvatarImage
                                        src={selectedFeedback.user_avatar}
                                    />
                                    <AvatarFallback>
                                        {getInitials(
                                            selectedFeedback.user_name,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm sm:text-base font-semibold break-words">
                                            {selectedFeedback.user_name}
                                        </p>
                                        <Badge
                                            className={`${getRoleBadge(
                                                selectedFeedback.user_role,
                                            )} text-xs`}
                                        >
                                            {selectedFeedback.user_role}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground break-all">
                                        {selectedFeedback.user_email}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {selectedFeedback.created_at}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-medium">
                                    Rating
                                </label>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                    {renderStars(selectedFeedback.rating, true)}
                                    <span className="text-xs sm:text-sm text-muted-foreground">
                                        {selectedFeedback.rating} out of 5
                                    </span>
                                </div>
                            </div>

                            {selectedFeedback.feedback && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Feedback
                                    </label>
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <p className="text-sm whitespace-pre-wrap">
                                            {selectedFeedback.feedback}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={`${
                                            getStatusConfig(
                                                selectedFeedback.status,
                                            ).class
                                        } text-xs`}
                                    >
                                        {getStatusConfig(
                                            selectedFeedback.status,
                                        ).label}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            handleDelete(selectedFeedback.id)
                                        }
                                        disabled={processing}
                                        className="w-full sm:w-auto"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
