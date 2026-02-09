// resources/js/Pages/BecomeDriver/Status.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Car,
    CheckCircle,
    Clock,
    FileText,
    RefreshCw,
    User,
    XCircle,
} from 'lucide-react';

interface ApplicationStatusProps {
    application: {
        id: number;
        status: 'pending' | 'approved' | 'rejected';
        submitted_at: string;
        reviewed_at: string | null;
        admin_notes: string | null;
        license_number: string;
        vehicle_plate_number: string;
        vehicle_type: string;
        vehicle_model: string;
    };
}

export default function ApplicationStatus({
    application,
}: ApplicationStatusProps) {
    const getStatusConfig = () => {
        switch (application.status) {
            case 'pending':
                return {
                    icon: <Clock className="h-6 w-6 text-yellow-600" />,
                    badgeColor:
                        'bg-yellow-100 text-yellow-800 border-yellow-200',
                    title: 'Application Under Review',
                    description:
                        'We are currently reviewing your driver application',
                    message:
                        'Your application is under review. We will notify you once a decision is made, typically within 24-48 hours.',
                    iconBg: 'bg-yellow-100',
                };
            case 'approved':
                return {
                    icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                    badgeColor: 'bg-green-100 text-green-800 border-green-200',
                    title: 'Application Approved',
                    description:
                        'Congratulations! Your driver application has been approved',
                    message:
                        'Your driver application has been approved. You can now access the driver dashboard and start accepting rides.',
                    iconBg: 'bg-green-100',
                };
            case 'rejected':
                return {
                    icon: <XCircle className="h-6 w-6 text-red-600" />,
                    badgeColor: 'bg-red-100 text-red-800 border-red-200',
                    title: 'Application Not Approved',
                    description:
                        'Your driver application requires additional review',
                    message:
                        'Your application has been reviewed but unfortunately was not approved at this time.',
                    iconBg: 'bg-red-100',
                };
            default:
                return {
                    icon: <Clock className="h-6 w-6 text-gray-600" />,
                    badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
                    title: 'Application Status',
                    description: 'Checking your application status',
                    message: 'Checking application status...',
                    iconBg: 'bg-gray-100',
                };
        }
    };

    const statusConfig = getStatusConfig();

    const applicationStats = [
        {
            label: 'Application ID',
            value: `#${application.id}`,
            icon: FileText,
            color: 'text-blue-600',
        },
        {
            label: 'Status',
            value: application.status,
            icon: Clock,
            color: 'text-purple-600',
        },
        {
            label: 'Submitted Date',
            value: new Date(application.submitted_at).toLocaleDateString(),
            icon: Calendar,
            color: 'text-purple-600',
        },
        {
            label: 'Vehicle Type',
            value: application.vehicle_type,
            icon: Car,
            color: 'text-green-600',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Head title="Application Status" />

            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                asChild
                                className="mb-3 -ml-2 text-sm sm:mb-4 sm:-ml-4 sm:text-base"
                            >
                                <Link
                                    href="/passenger/dashboard"
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Back to Dashboard
                                    </span>
                                    <span className="sm:hidden">Back</span>
                                </Link>
                            </Button>
                            <h1 className="bg-linear-to-r from-emerald-600 to-emerald-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl dark:from-emerald-400 dark:to-emerald-500">
                                Application Status
                            </h1>
                            <p className="mt-1 text-sm text-emerald-600/70 sm:mt-2 sm:text-base dark:text-emerald-400/70">
                                Track the progress of your driver application
                            </p>
                        </div>
                        <Badge
                            variant="secondary"
                            className="flex shrink-0 items-center gap-2 border-emerald-200/50 bg-emerald-50/50 px-3 py-1.5 text-xs text-emerald-700 sm:px-4 sm:py-2 sm:text-base dark:border-emerald-800/30 dark:bg-emerald-950/20 dark:text-emerald-300"
                        >
                            <Car className="h-3 w-3 text-emerald-600 sm:h-4 sm:w-4 dark:text-emerald-400" />
                            <span className="hidden sm:inline">
                                Driver Application
                            </span>
                            <span className="sm:hidden">Application</span>
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                <div className="grid grid-cols-1 gap-4 py-4 sm:gap-6 sm:py-6 lg:grid-cols-4 lg:gap-8 lg:py-8">
                    {/* Left Side - Application Details */}
                    <div className="space-y-4 sm:space-y-6 lg:col-span-1">
                        <Card className="lg:sticky lg:top-8">
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="flex flex-col items-center space-y-6">
                                    {/* Status Icon */}
                                    <div
                                        className={`flex h-16 w-16 items-center justify-center rounded-xl shadow-lg sm:h-20 sm:w-20 sm:rounded-2xl ${
                                            application.status === 'pending'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                                                : application.status ===
                                                    'approved'
                                                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                  : 'bg-red-100 dark:bg-red-900/30'
                                        }`}
                                    >
                                        <Car
                                            className={`h-8 w-8 sm:h-10 sm:w-10 ${
                                                application.status === 'pending'
                                                    ? 'text-yellow-600 dark:text-yellow-400'
                                                    : application.status ===
                                                        'approved'
                                                      ? 'text-emerald-600 dark:text-emerald-400'
                                                      : 'text-red-600 dark:text-red-400'
                                            }`}
                                        />
                                    </div>

                                    {/* Application Stats */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-center text-base font-medium sm:text-lg">
                                            Application Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                            {applicationStats.map(
                                                (stat, index) => {
                                                    const IconComponent =
                                                        stat.icon;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-2 text-center sm:p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20"
                                                        >
                                                            <div
                                                                className={`text-lg font-bold sm:text-xl ${stat.color} mb-1`}
                                                            >
                                                                {stat.value}
                                                            </div>
                                                            <div className="flex items-center justify-center gap-1 text-xs text-emerald-700/70 dark:text-emerald-400/70">
                                                                <IconComponent className="h-3 w-3" />
                                                                {stat.label}
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline Info */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-center text-base font-medium sm:text-lg">
                                            Timeline
                                        </h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Submitted
                                                </span>
                                                <span className="font-medium">
                                                    {new Date(
                                                        application.submitted_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {application.reviewed_at && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Reviewed
                                                    </span>
                                                    <span className="font-medium">
                                                        {new Date(
                                                            application.reviewed_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Next Steps */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-center text-base font-medium sm:text-lg">
                                            Next Steps
                                        </h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            {application.status ===
                                                'pending' && (
                                                <>
                                                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20">
                                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Wait for our team to
                                                            review your
                                                            documents
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20">
                                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Check back here for
                                                            updates
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {application.status ===
                                                'approved' && (
                                                <>
                                                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20">
                                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Access the driver
                                                            dashboard
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20">
                                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>
                                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Start accepting ride
                                                            requests
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {application.status ===
                                                'rejected' && (
                                                <>
                                                    <div className="flex items-start gap-3 rounded-lg bg-accent p-3">
                                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-600"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Review the admin
                                                            notes below
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 rounded-lg bg-accent p-3">
                                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-600"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            You can submit a new
                                                            application
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side - Main Status Content */}
                    <div className="space-y-4 sm:space-y-6 lg:col-span-3 lg:space-y-8">
                        <Card className="border-emerald-200/30 dark:border-emerald-800/20">
                            <CardHeader className="border-b border-emerald-200/30 p-4 sm:p-6 dark:border-emerald-800/20">
                                <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                                    <div
                                        className={`shrink-0 rounded-lg p-1.5 sm:p-2 ${statusConfig.iconBg}`}
                                    >
                                        {statusConfig.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-base text-emerald-900 sm:text-lg dark:text-emerald-100">
                                            {statusConfig.title}
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-xs text-emerald-700/70 sm:text-sm dark:text-emerald-400/70">
                                            {statusConfig.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="space-y-6 sm:space-y-8">
                                    {/* Status Badge and Message */}
                                    <div className="space-y-3 text-center sm:space-y-4">
                                        <Badge
                                            className={`text-sm font-medium sm:text-base ${statusConfig.badgeColor} border px-3 py-1.5 capitalize sm:px-4 sm:py-2`}
                                        >
                                            {application.status}
                                        </Badge>
                                        <p className="px-2 text-sm text-muted-foreground sm:text-base lg:text-lg">
                                            {statusConfig.message}
                                        </p>
                                    </div>

                                    {/* Application Information */}
                                    <div className="space-y-4 sm:space-y-6">
                                        <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-900 sm:gap-3 sm:text-xl dark:text-emerald-100">
                                            <div className="h-5 w-1.5 shrink-0 rounded-full bg-emerald-500 sm:h-6 sm:w-2 dark:bg-emerald-400"></div>
                                            <span>Application Information</span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-emerald-900 sm:text-sm dark:text-emerald-100">
                                                        License Number
                                                    </Label>
                                                    <div className="rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-2.5 sm:p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20">
                                                        <p className="warp-break-words text-sm font-medium text-emerald-900 sm:text-base dark:text-emerald-100">
                                                            {
                                                                application.license_number
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-emerald-900 sm:text-sm dark:text-emerald-100">
                                                        Vehicle Plate
                                                    </Label>
                                                    <div className="rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-2.5 sm:p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20">
                                                        <p className="warp-break-words text-sm font-medium text-emerald-900 sm:text-base dark:text-emerald-100">
                                                            {
                                                                application.vehicle_plate_number
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-emerald-900 sm:text-sm dark:text-emerald-100">
                                                        Vehicle Type
                                                    </Label>
                                                    <div className="rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-2.5 sm:p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20">
                                                        <p className="text-sm font-medium text-emerald-900 capitalize sm:text-base dark:text-emerald-100">
                                                            {
                                                                application.vehicle_type
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-emerald-900 sm:text-sm dark:text-emerald-100">
                                                        Vehicle Model
                                                    </Label>
                                                    <div className="rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-2.5 sm:p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20">
                                                        <p className="warp-break-words text-sm font-medium text-emerald-900 sm:text-base dark:text-emerald-100">
                                                            {
                                                                application.vehicle_model
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Notes */}
                                    {application.admin_notes && (
                                        <div className="space-y-3 sm:space-y-4">
                                            <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-900 sm:gap-3 sm:text-xl dark:text-emerald-100">
                                                <div className="h-5 w-1.5 shrink-0 rounded-full bg-emerald-500 sm:h-6 sm:w-2 dark:bg-emerald-400"></div>
                                                <span>Admin Notes</span>
                                            </h3>
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6 dark:border-red-800 dark:bg-red-950/20">
                                                <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
                                                    <User className="h-4 w-4 shrink-0 text-red-700 sm:h-5 sm:w-5 dark:text-red-300" />
                                                    <h4 className="text-sm font-semibold text-red-800 sm:text-base dark:text-red-200">
                                                        Reviewer Comments
                                                    </h4>
                                                </div>
                                                <p className="warp-break-words text-xs leading-relaxed text-red-700 sm:text-sm dark:text-red-300">
                                                    {application.admin_notes}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3 border-t border-emerald-200/30 pt-4 sm:flex-row sm:gap-4 sm:pt-6 dark:border-emerald-800/20">
                                        {application.status === 'approved' && (
                                            <Button
                                                asChild
                                                className="h-11 w-full flex-1 bg-emerald-500 text-sm text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md sm:h-12 sm:w-auto sm:text-base dark:bg-emerald-600 dark:hover:bg-emerald-700"
                                            >
                                                <Link href="/driver/dashboard">
                                                    Go to Driver Dashboard
                                                </Link>
                                            </Button>
                                        )}

                                        {application.status === 'rejected' && (
                                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
                                                <Button
                                                    asChild
                                                    className="h-11 w-full flex-1 bg-emerald-500 text-sm text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md sm:h-12 sm:w-auto sm:text-base dark:bg-emerald-600 dark:hover:bg-emerald-700"
                                                >
                                                    <Link
                                                        href="/become-driver?reapply=true"
                                                        className="flex items-center justify-center gap-2"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                        Apply Again
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    className="h-11 w-full border-emerald-200/50 px-4 text-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:h-12 sm:w-auto sm:px-8 sm:text-base dark:border-emerald-800/30 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                                                >
                                                    <Link href="/passenger/dashboard">
                                                        Back to Dashboard
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}

                                        {application.status === 'pending' && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-11 w-full flex-1 border-emerald-200/50 text-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:h-12 sm:w-auto sm:text-base dark:border-emerald-800/30 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                                            >
                                                <Link href="/passenger/dashboard">
                                                    Back to Dashboard
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
