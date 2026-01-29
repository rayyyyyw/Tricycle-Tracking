// resources/js/Pages/BecomeDriver/Status.tsx
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle, Car, FileText, User, Calendar, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';

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

export default function ApplicationStatus({ application }: ApplicationStatusProps) {
    const getStatusConfig = () => {
        switch (application.status) {
            case 'pending':
                return {
                    icon: <Clock className="h-6 w-6 text-yellow-600" />,
                    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    title: 'Application Under Review',
                    description: 'We are currently reviewing your driver application',
                    message: 'Your application is under review. We will notify you once a decision is made, typically within 24-48 hours.',
                    iconBg: 'bg-yellow-100'
                };
            case 'approved':
                return {
                    icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                    badgeColor: 'bg-green-100 text-green-800 border-green-200',
                    title: 'Application Approved',
                    description: 'Congratulations! Your driver application has been approved',
                    message: 'Your driver application has been approved. You can now access the driver dashboard and start accepting rides.',
                    iconBg: 'bg-green-100'
                };
            case 'rejected':
                return {
                    icon: <XCircle className="h-6 w-6 text-red-600" />,
                    badgeColor: 'bg-red-100 text-red-800 border-red-200',
                    title: 'Application Not Approved',
                    description: 'Your driver application requires additional review',
                    message: 'Your application has been reviewed but unfortunately was not approved at this time.',
                    iconBg: 'bg-red-100'
                };
            default:
                return {
                    icon: <Clock className="h-6 w-6 text-gray-600" />,
                    badgeColor: 'bg-gray-100 text-gray-800 border-gray-200',
                    title: 'Application Status',
                    description: 'Checking your application status',
                    message: 'Checking application status...',
                    iconBg: 'bg-gray-100'
                };
        }
    };

    const statusConfig = getStatusConfig();

    const applicationStats = [
        { label: 'Application ID', value: `#${application.id}`, icon: FileText, color: 'text-blue-600' },
        { label: 'Status', value: application.status, icon: Clock, color: 'text-purple-600' },
        { label: 'Submitted Date', value: new Date(application.submitted_at).toLocaleDateString(), icon: Calendar, color: 'text-purple-600' },
        { label: 'Vehicle Type', value: application.vehicle_type, icon: Car, color: 'text-green-600' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Head title="Application Status" />
            
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <div className="w-full sm:w-auto">
                            <Button variant="ghost" asChild className="mb-3 sm:mb-4 -ml-2 sm:-ml-4 text-sm sm:text-base">
                                <Link href="/passenger/dashboard" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Back to Dashboard</span>
                                    <span className="sm:hidden">Back</span>
                                </Link>
                            </Button>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-emerald-500">
                                Application Status
                            </h1>
                            <p className="text-sm sm:text-base text-emerald-600/70 dark:text-emerald-400/70 mt-1 sm:mt-2">
                                Track the progress of your driver application
                            </p>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-base shrink-0 border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
                            <Car className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden sm:inline">Driver Application</span>
                            <span className="sm:hidden">Application</span>
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 lg:py-8">
                    {/* Left Side - Application Details */}
                    <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                        <Card className="lg:sticky lg:top-8">
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="flex flex-col items-center space-y-6">
                                    {/* Status Icon */}
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${
                                        application.status === 'pending' 
                                            ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                                            : application.status === 'approved'
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                            : 'bg-red-100 dark:bg-red-900/30'
                                    }`}>
                                        <Car className={`h-8 w-8 sm:h-10 sm:w-10 ${
                                            application.status === 'pending'
                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                : application.status === 'approved'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-red-600 dark:text-red-400'
                                        }`} />
                                    </div>
                                    
                                    {/* Application Stats */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg font-medium text-center">Application Details</h3>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                            {applicationStats.map((stat, index) => {
                                                const IconComponent = stat.icon;
                                                return (
                                                    <div key={index} className="text-center p-2 sm:p-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <div className={`text-lg sm:text-xl font-bold ${stat.color} mb-1`}>
                                                            {stat.value}
                                                        </div>
                                                        <div className="flex items-center justify-center gap-1 text-xs text-emerald-700/70 dark:text-emerald-400/70">
                                                            <IconComponent className="w-3 h-3" />
                                                            {stat.label}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Timeline Info */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg font-medium text-center">Timeline</h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Submitted</span>
                                                <span className="font-medium">
                                                    {new Date(application.submitted_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {application.reviewed_at && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Reviewed</span>
                                                    <span className="font-medium">
                                                        {new Date(application.reviewed_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Next Steps */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg font-medium text-center">Next Steps</h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            {application.status === 'pending' && (
                                                <>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mt-2 shrink-0"></div>
                                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Wait for our team to review your documents
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mt-2 shrink-0"></div>
                                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Check back here for updates
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {application.status === 'approved' && (
                                                <>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mt-2 shrink-0"></div>
                                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Access the driver dashboard
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full mt-2 shrink-0"></div>
                                                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                                                            Start accepting ride requests
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {application.status === 'rejected' && (
                                                <>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 shrink-0"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Review the admin notes below
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 shrink-0"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            You can submit a new application
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
                    <div className="lg:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8">
                        <Card className="border-emerald-200/30 dark:border-emerald-800/20">
                            <CardHeader className="border-b border-emerald-200/30 dark:border-emerald-800/20 p-4 sm:p-6">
                                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                                    <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${statusConfig.iconBg}`}>
                                        {statusConfig.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-base sm:text-lg text-emerald-900 dark:text-emerald-100">{statusConfig.title}</CardTitle>
                                        <CardDescription className="text-xs sm:text-sm mt-1 text-emerald-700/70 dark:text-emerald-400/70">{statusConfig.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="space-y-6 sm:space-y-8">
                                    {/* Status Badge and Message */}
                                    <div className="space-y-3 sm:space-y-4 text-center">
                                        <Badge className={`text-sm sm:text-base font-medium ${statusConfig.badgeColor} border capitalize py-1.5 sm:py-2 px-3 sm:px-4`}>
                                            {application.status}
                                        </Badge>
                                        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
                                            {statusConfig.message}
                                        </p>
                                    </div>

                                    {/* Application Information */}
                                    <div className="space-y-4 sm:space-y-6">
                                        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3 text-emerald-900 dark:text-emerald-100">
                                            <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-emerald-500 dark:bg-emerald-400 rounded-full shrink-0"></div>
                                            <span>Application Information</span>
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-100">License Number</Label>
                                                    <div className="p-2.5 sm:p-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <p className="text-sm sm:text-base text-emerald-900 dark:text-emerald-100 font-medium warp-break-words">{application.license_number}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-100">Vehicle Plate</Label>
                                                    <div className="p-2.5 sm:p-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <p className="text-sm sm:text-base text-emerald-900 dark:text-emerald-100 font-medium warp-break-words">{application.vehicle_plate_number}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-100">Vehicle Type</Label>
                                                    <div className="p-2.5 sm:p-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <p className="text-sm sm:text-base text-emerald-900 dark:text-emerald-100 font-medium capitalize">{application.vehicle_type}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-100">Vehicle Model</Label>
                                                    <div className="p-2.5 sm:p-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/30 dark:border-emerald-800/20">
                                                        <p className="text-sm sm:text-base text-emerald-900 dark:text-emerald-100 font-medium warp-break-words">{application.vehicle_model}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Notes */}
                                    {application.admin_notes && (
                                        <div className="space-y-3 sm:space-y-4">
                                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3 text-emerald-900 dark:text-emerald-100">
                                                <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-emerald-500 dark:bg-emerald-400 rounded-full shrink-0"></div>
                                                <span>Admin Notes</span>
                                            </h3>
                                            <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 bg-red-50 dark:bg-red-950/20">
                                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-red-700 dark:text-red-300 shrink-0" />
                                                    <h4 className="font-semibold text-sm sm:text-base text-red-800 dark:text-red-200">Reviewer Comments</h4>
                                                </div>
                                                <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 leading-relaxed warp-break-words">{application.admin_notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-emerald-200/30 dark:border-emerald-800/20">
                                        {application.status === 'approved' && (
                                            <Button asChild className="flex-1 h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all">
                                                <Link href="/driver/dashboard">
                                                    Go to Driver Dashboard
                                                </Link>
                                            </Button>
                                        )}
                                        
                                        {application.status === 'rejected' && (
                                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                                                <Button asChild className="flex-1 h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all">
                                                    <Link 
                                                        href="/become-driver?reapply=true" 
                                                        className="flex items-center gap-2 justify-center"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        Apply Again 
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" className="h-11 sm:h-12 px-4 sm:px-8 text-sm sm:text-base w-full sm:w-auto border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700">
                                                    <Link href="/passenger/dashboard">
                                                        Back to Dashboard
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                        
                                        {application.status === 'pending' && (
                                            <Button asChild variant="outline" className="flex-1 h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700">
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