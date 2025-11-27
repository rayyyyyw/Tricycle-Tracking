// resources/js/Pages/BecomeDriver/Status.tsx
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle, Car, FileText, User, Calendar } from 'lucide-react';
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
                <div className="container mx-auto py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <Button variant="ghost" asChild className="mb-4 -ml-4">
                                <Link href="/passenger/dashboard" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">Application Status</h1>
                            <p className="text-muted-foreground mt-2">
                                Track the progress of your driver application
                            </p>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base">
                            <Car className="w-4 h-4" />
                            Driver Application
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8">
                    {/* Left Side - Application Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="sticky top-8">
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center space-y-6">
                                    {/* Status Icon */}
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${statusConfig.iconBg}`}>
                                        <Car className="h-10 w-10 text-foreground" />
                                    </div>
                                    
                                    {/* Application Stats */}
                                    <div className="w-full space-y-4">
                                        <h3 className="text-lg font-medium text-center">Application Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {applicationStats.map((stat, index) => {
                                                const IconComponent = stat.icon;
                                                return (
                                                    <div key={index} className="text-center p-3 bg-accent rounded-lg border border-border">
                                                        <div className={`text-xl font-bold ${stat.color} mb-1`}>
                                                            {stat.value}
                                                        </div>
                                                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                                            <IconComponent className="w-3 h-3" />
                                                            {stat.label}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Timeline Info */}
                                    <div className="w-full space-y-4">
                                        <h3 className="text-lg font-medium text-center">Timeline</h3>
                                        <div className="space-y-3">
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
                                    <div className="w-full space-y-4">
                                        <h3 className="text-lg font-medium text-center">Next Steps</h3>
                                        <div className="space-y-3">
                                            {application.status === 'pending' && (
                                                <>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Wait for our team to review your documents
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Check back here for updates
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {application.status === 'approved' && (
                                                <>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Access the driver dashboard
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Start accepting ride requests
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {application.status === 'rejected' && (
                                                <>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Review the admin notes below
                                                        </p>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-muted-foreground">
                                                            You can submit a new application if needed
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
                    <div className="lg:col-span-3 space-y-8">
                        <Card>
                            <CardHeader className="border-b border-border">
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
                            
                            <CardContent className="p-8">
                                <div className="space-y-8">
                                    {/* Status Badge and Message */}
                                    <div className="space-y-4 text-center">
                                        <Badge className={`text-base font-medium ${statusConfig.badgeColor} border capitalize py-2 px-4`}>
                                            {application.status}
                                        </Badge>
                                        <p className="text-muted-foreground text-lg">
                                            {statusConfig.message}
                                        </p>
                                    </div>

                                    {/* Application Information */}
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <div className="w-2 h-6 bg-primary rounded-full"></div>
                                            Application Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">License Number</Label>
                                                    <div className="p-3 bg-accent rounded-lg border border-border">
                                                        <p className="text-foreground font-medium">{application.license_number}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Vehicle Plate</Label>
                                                    <div className="p-3 bg-accent rounded-lg border border-border">
                                                        <p className="text-foreground font-medium">{application.vehicle_plate_number}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Vehicle Type</Label>
                                                    <div className="p-3 bg-accent rounded-lg border border-border">
                                                        <p className="text-foreground font-medium capitalize">{application.vehicle_type}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Vehicle Model</Label>
                                                    <div className="p-3 bg-accent rounded-lg border border-border">
                                                        <p className="text-foreground font-medium">{application.vehicle_model}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Notes */}
                                    {application.admin_notes && (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold flex items-center gap-3">
                                                <div className="w-2 h-6 bg-primary rounded-full"></div>
                                                Admin Notes
                                            </h3>
                                            <div className="border border-border rounded-lg p-6 bg-accent/50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                    <h4 className="font-semibold text-foreground">Reviewer Comments</h4>
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed">{application.admin_notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                                        {application.status === 'approved' && (
                                            <Button asChild className="flex-1 h-12 text-base">
                                                <Link href="/driver/dashboard">
                                                    Go to Driver Dashboard
                                                </Link>
                                            </Button>
                                        )}
                                        
                                        {(application.status === 'rejected' || application.status === 'pending') && (
                                            <Button asChild variant="outline" className="flex-1 h-12 text-base">
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