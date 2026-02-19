// pages/DriverM/Application.tsx
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
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Car,
    Check,
    Download,
    Eye,
    FileCheck,
    FileImage,
    FileText,
    Filter,
    History,
    IdCard,
    Image as ImageIcon,
    MoreHorizontal,
    RefreshCw,
    Search,
    User,
    X,
    ZoomIn,
} from 'lucide-react';
import { useState } from 'react';

interface PreviousApplication {
    id: number;
    status: string;
    submitted_at: string;
    reviewed_at?: string;
    admin_notes?: string;
    created_at: string;
    license_number?: string;
    vehicle_plate_number?: string;
    documents?: Record<string, string> | string[];
}

interface DriverApplication {
    id: number;
    user_id: number;
    license_number: string;
    license_expiry: string;
    vehicle_type: string;
    vehicle_plate_number: string;
    vehicle_year: string;
    vehicle_color: string;
    vehicle_model: string;
    documents: Record<string, string> | string[] | null;
    document_urls?: Record<string, string> | string[];
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    submitted_at: string;
    reviewed_at?: string;
    reviewed_by?: number;
    created_at: string;
    updated_at: string;
    application_attempt: number;
    previous_application_id?: number;
    reapplied_at?: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        address?: string;
        avatar_url?: string | null;
        emergency_contact?: {
            name?: string;
            phone?: string;
            relationship?: string;
        };
    };
    previous_applications?: PreviousApplication[];
}

interface DriverApplicationsPageProps {
    applications: DriverApplication[];
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function DriverApplicationsPage({
    applications,
}: DriverApplicationsPageProps) {
    const [selectedApplication, setSelectedApplication] =
        useState<DriverApplication | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<{
        url: string;
        name: string;
        title: string;
    } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Handle status update function
    const handleStatusUpdate = (
        applicationId: number,
        status: 'approved' | 'rejected',
        adminNotes?: string,
    ) => {
        router.patch(`/DriverM/Application/${applicationId}`, {
            status,
            admin_notes: adminNotes,
        });
    };

    // Handle document viewing (path or full URL from R2)
    const handleViewDocument = (
        documentPathOrUrl: string,
        documentTitle: string,
    ) => {
        const documentUrl =
            documentPathOrUrl.startsWith('http') ||
            documentPathOrUrl.startsWith('//')
                ? documentPathOrUrl
                : `/storage/${documentPathOrUrl}`;
        const fileName = documentPathOrUrl.split('/').pop() || 'document';
        setSelectedDocument({
            url: documentUrl,
            name: fileName,
            title: documentTitle,
        });
    };

    // Filter applications based on search and status
    const filteredApplications = applications.filter((application) => {
        const matchesSearch =
            application.user.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            application.user.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            application.license_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            application.vehicle_plate_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || application.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Statistics with reapplication count
    const pendingCount = applications.filter(
        (app) => app.status === 'pending',
    ).length;
    const approvedCount = applications.filter(
        (app) => app.status === 'approved',
    ).length;
    const rejectedCount = applications.filter(
        (app) => app.status === 'rejected',
    ).length;
    const reapplicationCount = applications.filter(
        (app) => app.application_attempt > 1,
    ).length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Driver Management', href: '/DriverM' },
                { title: 'Applications', href: '/DriverM/Application' },
            ]}
            title="Driver Applications"
        >
            <Head title="Driver Applications" />

            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Applications"
                        value={applications.length}
                        icon={<User className="h-4 w-4" />}
                        description="All driver applications"
                    />
                    <StatCard
                        title="Pending Review"
                        value={pendingCount}
                        icon={<FileText className="h-4 w-4" />}
                        description="Awaiting approval"
                        variant="warning"
                    />
                    <StatCard
                        title="Approved"
                        value={approvedCount}
                        icon={<Check className="h-4 w-4" />}
                        description="Successful applications"
                        variant="success"
                    />
                    <StatCard
                        title="Rejected"
                        value={rejectedCount}
                        icon={<X className="h-4 w-4" />}
                        description="Rejected applications"
                        variant="destructive"
                    />
                    <StatCard
                        title="Reapplications"
                        value={reapplicationCount}
                        icon={<RefreshCw className="h-4 w-4" />}
                        description="Multiple attempts"
                        variant="secondary"
                    />
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl">
                                    Driver Applications
                                </CardTitle>
                                <CardDescription>
                                    Review and manage driver applications from
                                    passengers
                                </CardDescription>
                            </div>
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
                                <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground sm:sr-only">
                                        Search
                                    </label>
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        placeholder="Search applications..."
                                        className="w-full pl-10"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="w-full sm:w-[180px]">
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground sm:sr-only">
                                        Status
                                    </label>
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value: StatusFilter) =>
                                            setStatusFilter(value)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <Filter className="mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="approved">
                                                Approved
                                            </SelectItem>
                                            <SelectItem value="rejected">
                                                Rejected
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Mobile: card list */}
                        <div className="space-y-3 border-t p-4 md:hidden">
                            {filteredApplications.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    {applications.length === 0 ? (
                                        <>
                                            <FileText className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                                            <p className="font-medium">
                                                No driver applications
                                            </p>
                                            <p className="text-sm">
                                                Applications will appear here
                                                when passengers apply to become
                                                drivers.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                                            <p className="font-medium">
                                                No applications found
                                            </p>
                                            <p className="text-sm">
                                                Try adjusting your search or
                                                filter.
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                filteredApplications.map((application) => (
                                    <div
                                        key={application.id}
                                        className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
                                    >
                                        {application.user.avatar_url ? (
                                            <img
                                                src={
                                                    application.user.avatar_url
                                                }
                                                alt={application.user.name}
                                                className="h-11 w-11 shrink-0 rounded-full border-2 border-border object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate font-medium">
                                                    {application.user.name}
                                                </p>
                                                {application.application_attempt >
                                                    1 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 text-xs"
                                                    >
                                                        <RefreshCw className="mr-0.5 h-3 w-3" />
                                                        {
                                                            application.application_attempt
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {application.user.email}
                                            </p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <StatusBadge
                                                    status={application.status}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(
                                                        application.submitted_at ||
                                                            application.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {
                                                    application.vehicle_plate_number
                                                }{' '}
                                                · {application.vehicle_model}
                                            </p>
                                        </div>
                                        <ApplicationActions
                                            application={application}
                                            onViewDetails={() =>
                                                setSelectedApplication(
                                                    application,
                                                )
                                            }
                                            onStatusUpdate={handleStatusUpdate}
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop: table */}
                        <div className="hidden overflow-x-auto border-t md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[250px]">
                                            Applicant
                                        </TableHead>
                                        <TableHead>License</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-20 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.map((application) => (
                                        <TableRow
                                            key={application.id}
                                            className="group transition-colors hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {application.user
                                                        .avatar_url ? (
                                                        <img
                                                            src={
                                                                application.user
                                                                    .avatar_url
                                                            }
                                                            alt={
                                                                application.user
                                                                    .name
                                                            }
                                                            className="h-8 w-8 shrink-0 rounded-full border-2 border-border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm font-medium">
                                                                {
                                                                    application
                                                                        .user
                                                                        .name
                                                                }
                                                            </p>
                                                            {application.application_attempt >
                                                                1 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="flex items-center gap-1 px-1.5 py-0 text-xs"
                                                                >
                                                                    <RefreshCw className="h-3 w-3" />
                                                                    {
                                                                        application.application_attempt
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {
                                                                application.user
                                                                    .email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="relative rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                                                        {
                                                            application.license_number
                                                        }
                                                    </code>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium">
                                                        {
                                                            application.vehicle_plate_number
                                                        }
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {
                                                            application.vehicle_color
                                                        }{' '}
                                                        {
                                                            application.vehicle_model
                                                        }
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {
                                                            application.vehicle_year
                                                        }{' '}
                                                        •{' '}
                                                        {
                                                            application.vehicle_type
                                                        }
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {application.user.phone || (
                                                        <span className="text-muted-foreground italic">
                                                            No phone
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        application.submitted_at ||
                                                            application.created_at,
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge
                                                        status={
                                                            application.status
                                                        }
                                                    />
                                                    {application.application_attempt >
                                                        1 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Attempt #
                                                            {
                                                                application.application_attempt
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ApplicationActions
                                                    application={application}
                                                    onViewDetails={() =>
                                                        setSelectedApplication(
                                                            application,
                                                        )
                                                    }
                                                    onStatusUpdate={
                                                        handleStatusUpdate
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {filteredApplications.length === 0 && (
                                <div className="py-12 text-center">
                                    <div className="mb-2 text-muted-foreground">
                                        {applications.length === 0 ? (
                                            <div className="space-y-2">
                                                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                <p className="text-lg font-medium">
                                                    No driver applications
                                                </p>
                                                <p className="text-sm">
                                                    Applications will appear
                                                    here when passengers apply
                                                    to become drivers.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                                <p className="text-lg font-medium">
                                                    No applications found
                                                </p>
                                                <p className="text-sm">
                                                    Try adjusting your search or
                                                    filter criteria.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Application Details Modal */}
            {selectedApplication && (
                <ApplicationDetailsModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onViewDocument={handleViewDocument}
                />
            )}

            {/* Document Viewer Modal */}
            {selectedDocument && (
                <DocumentViewerModal
                    document={selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                />
            )}
        </AppLayout>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    icon,
    description,
    variant = 'default',
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
}) {
    const variantStyles = {
        default: 'text-blue-600',
        success: 'text-green-600',
        warning: 'text-amber-600',
        destructive: 'text-red-600',
        secondary: 'text-purple-600',
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`${variantStyles[variant]} opacity-80`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${variantStyles[variant]}`}>
                    {value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

// Status Badge Component
function StatusBadge({
    status,
}: {
    status: 'pending' | 'approved' | 'rejected';
}) {
    const statusConfig = {
        pending: {
            label: 'Pending',
            variant: 'secondary' as const,
            className:
                'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
        },
        approved: {
            label: 'Approved',
            variant: 'default' as const,
            className:
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        },
        rejected: {
            label: 'Rejected',
            variant: 'destructive' as const,
            className:
                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        },
    };

    const config = statusConfig[status];

    return (
        <Badge
            variant={config.variant}
            className={`${config.className} font-medium`}
        >
            {config.label}
        </Badge>
    );
}

// Application Actions Component
function ApplicationActions({
    application,
    onViewDetails,
    onStatusUpdate,
}: {
    application: DriverApplication;
    onViewDetails: () => void;
    onStatusUpdate: (
        id: number,
        status: 'approved' | 'rejected',
        notes?: string,
    ) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-70 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 border-border bg-popover"
            >
                <DropdownMenuItem
                    onClick={onViewDetails}
                    className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                {application.status === 'pending' && (
                    <>
                        <DropdownMenuItem
                            onClick={() =>
                                onStatusUpdate(application.id, 'approved')
                            }
                            className="cursor-pointer text-green-600 focus:bg-green-50 focus:text-green-600 dark:focus:bg-green-950/30"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Approve Application
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                const notes = prompt(
                                    'Please provide reason for rejection:',
                                );
                                if (notes !== null) {
                                    onStatusUpdate(
                                        application.id,
                                        'rejected',
                                        notes,
                                    );
                                }
                            }}
                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Reject Application
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Semantic icon per document type (when not showing thumbnail)
function DocumentTypeIcon({
    documentKey,
    isImage,
    className,
}: {
    documentKey: string;
    isImage: boolean;
    className?: string;
}) {
    const iconClass = 'h-6 w-6 sm:h-7 sm:w-7';
    if (documentKey === 'license_front' || documentKey === 'license_back') {
        return <IdCard className={`${iconClass} text-blue-600 dark:text-blue-400 ${className ?? ''}`} />;
    }
    if (documentKey === 'vehicle_registration' || documentKey === 'registration') {
        return <Car className={`${iconClass} text-amber-600 dark:text-amber-400 ${className ?? ''}`} />;
    }
    if (documentKey === 'mtop') {
        return <FileCheck className={`${iconClass} text-emerald-600 dark:text-emerald-400 ${className ?? ''}`} />;
    }
    return isImage ? (
        <ImageIcon className={`${iconClass} text-blue-600 dark:text-blue-400 ${className ?? ''}`} />
    ) : (
        <FileText className={`${iconClass} text-muted-foreground ${className ?? ''}`} />
    );
}

// Document Card – vertical layout so View/Download never truncate; semantic icons when no thumbnail
function DocumentCard({
    document: documentUrl,
    documentKey,
    title,
    description,
    onViewDocument,
}: {
    document: string;
    documentKey?: string;
    title: string;
    description: string;
    onViewDocument: (documentPath: string, documentTitle: string) => void;
}) {
    const [thumbFailed, setThumbFailed] = useState(false);
    const isImageType = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(
        (documentUrl.split('.').pop() || '').toLowerCase(),
    );
    const showThumb = isImageType && !thumbFailed;
    const fullUrl =
        documentUrl.startsWith('http') || documentUrl.startsWith('//')
            ? documentUrl
            : `/storage/${documentUrl.replace(/^\//, '')}`;

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start gap-3">
                    {showThumb ? (
                        <button
                            type="button"
                            onClick={() => onViewDocument(documentUrl, title)}
                            className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <img
                                src={fullUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={() => setThumbFailed(true)}
                            />
                        </button>
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <DocumentTypeIcon
                                documentKey={documentKey ?? ''}
                                isImage={isImageType}
                            />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t pt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 whitespace-nowrap"
                        onClick={() => onViewDocument(documentUrl, title)}
                    >
                        <ZoomIn className="mr-2 h-4 w-4 shrink-0" />
                        View
                    </Button>
                    <Button variant="outline" size="sm" asChild className="shrink-0">
                        <a href={fullUrl} download className="inline-flex items-center gap-2">
                            <Download className="h-4 w-4 shrink-0" />
                            Download
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Helper function to format document titles
function formatDocumentTitle(key: string): string {
    const titles: Record<string, string> = {
        license_front: "Driver's License Front",
        license_back: "Driver's License Back",
        vehicle_registration: 'Vehicle Registration',
        registration: 'Vehicle Registration',
        mtop: "Motorized Tricycle Operator's Permit",
    };

    return (
        titles[key] ||
        key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    );
}

// Application Details Modal Component with Tabs
function ApplicationDetailsModal({
    application,
    onClose,
    onStatusUpdate,
    onViewDocument,
}: {
    application: DriverApplication;
    onClose: () => void;
    onStatusUpdate: (
        id: number,
        status: 'approved' | 'rejected',
        notes?: string,
    ) => void;
    onViewDocument: (documentPath: string, documentTitle: string) => void;
}) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Function to check if documents exist and are in object format
    const hasDocuments = () => {
        if (!application.documents) return false;
        if (
            typeof application.documents === 'object' &&
            !Array.isArray(application.documents)
        ) {
            return Object.keys(application.documents).length > 0;
        }
        if (Array.isArray(application.documents)) {
            return application.documents.length > 0;
        }
        return false;
    };

    // Function to render documents based on their structure
    const renderDocuments = () => {
        if (!application.documents) {
            return (
                <div className="py-8 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">No Documents Found</p>
                    <p className="text-sm">
                        Documents data is null or undefined.
                    </p>
                </div>
            );
        }

        // Handle object format (license_front, license_back, vehicle_registration)
        if (
            typeof application.documents === 'object' &&
            !Array.isArray(application.documents)
        ) {
            const documentEntries = Object.entries(application.documents) as [
                string,
                string,
            ][];

            if (documentEntries.length === 0) {
                return (
                    <div className="py-8 text-center text-muted-foreground">
                        <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p className="text-lg font-medium">
                            No Documents Submitted
                        </p>
                        <p className="text-sm">Documents object is empty.</p>
                    </div>
                );
            }

            const urlMap =
                application.document_urls &&
                typeof application.document_urls === 'object' &&
                !Array.isArray(application.document_urls)
                    ? (application.document_urls as Record<string, string>)
                    : null;
            return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {documentEntries.map(([key, value]) => (
                        <DocumentCard
                            key={key}
                            document={urlMap?.[key] ?? value}
                            documentKey={key}
                            title={formatDocumentTitle(key)}
                            description={getDocumentDescription(key)}
                            onViewDocument={onViewDocument}
                        />
                    ))}
                </div>
            );
        }

        // Handle array format (fallback)
        if (Array.isArray(application.documents)) {
            if (application.documents.length === 0) {
                return (
                    <div className="py-8 text-center text-muted-foreground">
                        <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p className="text-lg font-medium">
                            No Documents Submitted
                        </p>
                        <p className="text-sm">Documents array is empty.</p>
                    </div>
                );
            }

            const urlList = Array.isArray(application.document_urls)
                ? (application.document_urls as string[])
                : null;
            return (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {application.documents.map(
                        (document: string, index: number) => (
                            <DocumentCard
                                key={index}
                                document={urlList?.[index] ?? document}
                                title={`Document ${index + 1}`}
                                description="Supporting document"
                                onViewDocument={onViewDocument}
                            />
                        ),
                    )}
                </div>
            );
        }

        // Handle unknown format
        return (
            <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">Unknown Documents Format</p>
                <p className="text-sm">
                    Documents type: {typeof application.documents}
                </p>
            </div>
        );
    };

    // Helper function to get document descriptions
    const getDocumentDescription = (key: string): string => {
        const descriptions: Record<string, string> = {
            license_front: "Front side of driver's license",
            license_back: "Back side of driver's license",
            vehicle_registration: 'Vehicle registration certificate',
            registration: 'Vehicle registration certificate',
            mtop: "Motorized tricycle operator's permit",
        };

        return descriptions[key] || 'Supporting document';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
            <Card className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden sm:w-[calc(100vw-2rem)]" >
                <CardHeader className="shrink-0 border-b bg-background p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-1">
                            <CardTitle className="text-lg sm:text-xl">
                                Driver Application Details
                            </CardTitle>
                            <CardDescription>
                                Application from {application.user.name}
                                {application.application_attempt > 1 && (
                                    <span className="ml-2">
                                        • Attempt #
                                        {application.application_attempt}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="w-full shrink-0 sm:w-auto"
                        >
                            Close
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col overflow-y-auto p-0">
                    <Tabs defaultValue="current" className="w-full">
                        <TabsList className="flex w-full flex-wrap justify-start gap-1.5 border-0 border-b bg-muted/30 px-4 py-2 [&>button]:shrink-0">
                            <TabsTrigger
                                value="current"
                                className="inline-flex items-center gap-1.5 rounded-md border-0 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground shadow-none sm:gap-2 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm transition-colors hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Current
                            </TabsTrigger>
                            {application.application_attempt > 1 && (
                                <TabsTrigger
                                    value="history"
                                    className="inline-flex items-center gap-1.5 rounded-md border-0 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground shadow-none sm:gap-2 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm transition-colors hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    History
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="documents"
                                className="inline-flex items-center gap-1.5 rounded-md border-0 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground shadow-none sm:gap-2 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm transition-colors hover:bg-muted/60 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                <FileImage className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Documents
                                {hasDocuments() ? (
                                    <span className="rounded-full bg-muted/80 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground sm:text-xs">
                                        Available
                                    </span>
                                ) : null}
                            </TabsTrigger>
                        </TabsList>

                        {/* Current Application Tab */}
                        <TabsContent
                            value="current"
                            className="m-0 space-y-6 p-4 sm:p-6"
                        >
                            {/* Reapplication Alert */}
                            {application.application_attempt > 1 && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                                                Reapplication Notice
                                            </h4>
                                            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                                This is attempt #
                                                {
                                                    application.application_attempt
                                                }{' '}
                                                for this applicant.
                                                {application.application_attempt >
                                                    2 &&
                                                    ' Consider providing detailed feedback to help them succeed.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Applicant Information */}
                            <InfoSection title="Applicant Information">
                                <div className="mb-4 flex items-start gap-4 border-b pb-4">
                                    {application.user.avatar_url ? (
                                        <img
                                            src={application.user.avatar_url}
                                            alt={application.user.name}
                                            className="h-16 w-16 rounded-full border-2 border-border object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                            <User className="h-8 w-8 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">
                                            {application.user.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {application.user.email}
                                        </p>
                                        {application.user.phone && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {application.user.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoField
                                        label="Full Name"
                                        value={application.user.name}
                                    />
                                    <InfoField
                                        label="Email"
                                        value={application.user.email}
                                    />
                                    <InfoField
                                        label="Phone"
                                        value={
                                            application.user.phone ||
                                            'Not provided'
                                        }
                                    />
                                    <InfoField
                                        label="Address"
                                        value={
                                            application.user.address ||
                                            'Not provided'
                                        }
                                    />
                                    <InfoField
                                        label="Application Date"
                                        value={formatDate(
                                            application.submitted_at ||
                                                application.created_at,
                                        )}
                                    />
                                    {application.application_attempt > 1 && (
                                        <InfoField
                                            label="Application Attempt"
                                            value={`#${application.application_attempt}`}
                                        />
                                    )}
                                </div>
                            </InfoSection>

                            {/* License Information */}
                            <InfoSection title="License Information">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoField
                                        label="License Number"
                                        value={application.license_number}
                                        monospace
                                    />
                                    <InfoField
                                        label="License Expiry"
                                        value={formatDate(
                                            application.license_expiry,
                                        )}
                                    />
                                </div>
                            </InfoSection>

                            {/* Vehicle Information */}
                            <InfoSection title="Vehicle Information">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <InfoField
                                        label="Plate Number"
                                        value={application.vehicle_plate_number}
                                    />
                                    <InfoField
                                        label="Vehicle Type"
                                        value={application.vehicle_type}
                                        capitalize
                                    />
                                    <InfoField
                                        label="Year"
                                        value={application.vehicle_year}
                                    />
                                    <InfoField
                                        label="Color"
                                        value={application.vehicle_color}
                                    />
                                    <InfoField
                                        label="Model"
                                        value={application.vehicle_model}
                                    />
                                </div>
                            </InfoSection>

                            {/* Admin Notes */}
                            {application.admin_notes && (
                                <InfoSection title="Admin Notes">
                                    <div className="rounded-lg bg-muted p-3">
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {application.admin_notes}
                                        </p>
                                    </div>
                                </InfoSection>
                            )}

                            {/* Supporting Documents - in Current tab so visible on mobile without switching tabs */}
                            {hasDocuments() && (
                                <InfoSection title="Supporting Documents">
                                    {renderDocuments()}
                                </InfoSection>
                            )}

                            {/* Admin Actions */}
                            {application.status === 'pending' && (
                                <div className="flex flex-col justify-end gap-3 border-t pt-4 sm:flex-row sm:pt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const defaultNotes =
                                                application.application_attempt >
                                                1
                                                    ? 'Please review the previous feedback and ensure all issues are addressed.'
                                                    : '';
                                            const notes = prompt(
                                                'Please provide reason for rejection:',
                                                defaultNotes,
                                            );
                                            if (notes !== null) {
                                                onStatusUpdate(
                                                    application.id,
                                                    'rejected',
                                                    notes,
                                                );
                                                onClose();
                                            }
                                        }}
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950/50"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Reject Application
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            onStatusUpdate(
                                                application.id,
                                                'approved',
                                            );
                                            onClose();
                                        }}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve Application
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Application History Tab */}
                        <TabsContent value="history" className="m-0 p-4 sm:p-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                        Application History
                                    </h3>
                                    <Badge
                                        variant="outline"
                                        className="flex items-center gap-1"
                                    >
                                        <History className="h-3 w-3" />
                                        Total Attempts:{' '}
                                        {application.application_attempt}
                                    </Badge>
                                </div>

                                {application.previous_applications &&
                                application.previous_applications.length > 0 ? (
                                    <div className="space-y-4">
                                        {application.previous_applications.map(
                                            (prevApp, index) => (
                                                <Card
                                                    key={prevApp.id}
                                                    className="border-l-4 border-l-amber-500"
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={`h-3 w-3 rounded-full ${
                                                                            prevApp.status ===
                                                                            'approved'
                                                                                ? 'bg-green-500'
                                                                                : prevApp.status ===
                                                                                    'rejected'
                                                                                  ? 'bg-red-500'
                                                                                  : 'bg-yellow-500'
                                                                        }`}
                                                                    ></div>
                                                                    <div>
                                                                        <h4 className="font-semibold">
                                                                            Attempt
                                                                            #
                                                                            {application.application_attempt -
                                                                                index -
                                                                                1}
                                                                        </h4>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Submitted{' '}
                                                                            {formatDate(
                                                                                prevApp.submitted_at,
                                                                            )}
                                                                            {prevApp.reviewed_at &&
                                                                                ` • Reviewed ${formatDate(prevApp.reviewed_at)}`}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Previous Application Details */}
                                                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                                    {prevApp.license_number && (
                                                                        <div>
                                                                            <span className="font-medium">
                                                                                License:
                                                                            </span>{' '}
                                                                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                                                                {
                                                                                    prevApp.license_number
                                                                                }
                                                                            </code>
                                                                        </div>
                                                                    )}
                                                                    {prevApp.vehicle_plate_number && (
                                                                        <div>
                                                                            <span className="font-medium">
                                                                                Plate:
                                                                            </span>{' '}
                                                                            {
                                                                                prevApp.vehicle_plate_number
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Admin Notes from Previous Application */}
                                                                {prevApp.admin_notes && (
                                                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                                                                        <h5 className="mb-1 text-sm font-medium text-amber-800 dark:text-amber-300">
                                                                            Previous
                                                                            Admin
                                                                            Feedback
                                                                        </h5>
                                                                        <p className="text-sm text-amber-700 dark:text-amber-400">
                                                                            {
                                                                                prevApp.admin_notes
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <Badge
                                                                    variant={
                                                                        prevApp.status ===
                                                                        'approved'
                                                                            ? 'default'
                                                                            : prevApp.status ===
                                                                                'rejected'
                                                                              ? 'destructive'
                                                                              : 'secondary'
                                                                    }
                                                                >
                                                                    {
                                                                        prevApp.status
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <AlertTriangle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                        <p className="text-lg font-medium">
                                            No Detailed History Available
                                        </p>
                                        <p className="mt-2 text-sm">
                                            This is attempt #
                                            {application.application_attempt},
                                            but detailed historical data is not
                                            available.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Documents Tab */}
                        <TabsContent
                            value="documents"
                            className="m-0 p-4 sm:p-6"
                        >
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">
                                    Supporting Documents
                                </h3>
                                {renderDocuments()}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

// Document Viewer Modal Component
function DocumentViewerModal({
    document,
    onClose,
}: {
    document: { url: string; name: string; title: string };
    onClose: () => void;
}) {
    const isImage = document.name
        .toLowerCase()
        .match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        {document.title}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex max-h-[70vh] min-h-[400px] items-center justify-center overflow-auto rounded-lg bg-black/5 p-4">
                    {isImage ? (
                        <img
                            src={document.url}
                            alt={document.title}
                            className="max-h-full max-w-full rounded-lg object-contain"
                        />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <FileText className="mx-auto mb-4 h-16 w-16 opacity-50" />
                            <p>
                                This document cannot be previewed in the
                                browser.
                            </p>
                            <p className="mt-2 text-sm">
                                Please download the file to view its contents.
                            </p>
                            <Button asChild className="mt-4">
                                <a
                                    href={document.url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Document
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <a
                            href={document.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </a>
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Reusable Info Section Component
function InfoSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {children}
        </div>
    );
}

// Reusable Info Field Component
function InfoField({
    label,
    value,
    monospace = false,
    capitalize = false,
}: {
    label: string;
    value: string;
    monospace?: boolean;
    capitalize?: boolean;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
                {label}
            </label>
            <p
                className={`text-sm ${monospace ? 'rounded bg-muted px-2 py-1 font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}
            >
                {value}
            </p>
        </div>
    );
}
