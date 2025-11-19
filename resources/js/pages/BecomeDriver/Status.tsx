// resources/js/Pages/BecomeDriver/Status.tsx
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle, Car, FileText, User } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <Head title="Application Status" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <Button variant="ghost" asChild className="mb-6">
                        <Link href="/passenger/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    
                    <div className="flex justify-center mb-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${statusConfig.iconBg}`}>
                            <Car className="h-8 w-8 text-slate-700" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        Application Status
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Track the progress of your driver application
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Status Overview */}
                    <div className="lg:col-span-1">
                        <Card className="border-slate-200 dark:border-slate-700">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Application Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Application ID</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">#{application.id}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Submitted</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {new Date(application.submitted_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {application.reviewed_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Reviewed</span>
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            {new Date(application.reviewed_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card className="border-slate-200 dark:border-slate-700 mt-6">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {application.status === 'pending' && (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Wait for our team to review your documents
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Check back here for updates
                                            </p>
                                        </div>
                                    </>
                                )}
                                {application.status === 'approved' && (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Access the driver dashboard
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Start accepting ride requests
                                            </p>
                                        </div>
                                    </>
                                )}
                                {application.status === 'rejected' && (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Review the admin notes below
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                You can reapply with updated information
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Status Card */}
                    <div className="lg:col-span-3">
                        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${statusConfig.iconBg}`}>
                                        {statusConfig.icon}
                                    </div>
                                    <div>
                                        <CardTitle>{statusConfig.title}</CardTitle>
                                        <CardDescription>{statusConfig.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* Status Badge and Message */}
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <Badge className={`text-sm font-medium ${statusConfig.badgeColor} border capitalize`}>
                                                {application.status}
                                            </Badge>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-center">
                                            {statusConfig.message}
                                        </p>
                                    </div>

                                    {/* Application Details */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-900 dark:text-white">Application Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">License Number</span>
                                                    <p className="text-slate-600 dark:text-slate-400">{application.license_number}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">Vehicle Plate</span>
                                                    <p className="text-slate-600 dark:text-slate-400">{application.vehicle_plate_number}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">Vehicle Type</span>
                                                    <p className="text-slate-600 dark:text-slate-400 capitalize">{application.vehicle_type}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">Vehicle Model</span>
                                                    <p className="text-slate-600 dark:text-slate-400">{application.vehicle_model}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Notes */}
                                    {application.admin_notes && (
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Admin Notes
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{application.admin_notes}</p>
                                        </div>
                                    )}

                                    {/* Actions - Single set of buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        {application.status === 'approved' && (
                                            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                                <Link href="/driver/dashboard">
                                                    Go to Driver Dashboard
                                                </Link>
                                            </Button>
                                        )}
                                        
                                        {application.status === 'rejected' && (
                                            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                                <Link href="/become-driver">
                                                    Apply Again
                                                </Link>
                                            </Button>
                                        )}
                                        
                                        {application.status === 'pending' && (
                                            <Button asChild variant="outline" className="flex-1">
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