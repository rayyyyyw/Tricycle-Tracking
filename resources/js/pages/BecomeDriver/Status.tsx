// resources/js/Pages/BecomeDriver/Status.tsx
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

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
    const getStatusIcon = () => {
        switch (application.status) {
            case 'pending':
                return <Clock className="h-8 w-8 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="h-8 w-8 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-8 w-8 text-red-500" />;
            default:
                return <Clock className="h-8 w-8 text-gray-500" />;
        }
    };

    const getStatusColor = () => {
        switch (application.status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusMessage = () => {
        switch (application.status) {
            case 'pending':
                return 'Your application is under review. We will notify you once a decision is made.';
            case 'approved':
                return 'Congratulations! Your driver application has been approved. You can now access the driver dashboard.';
            case 'rejected':
                return 'Your application has been reviewed but unfortunately was not approved.';
            default:
                return 'Checking application status...';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title="Application Status" />
            
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button variant="ghost" asChild className="mb-6">
                    <Link href="/passenger/dashboard">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>

                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            {getStatusIcon()}
                        </div>
                        <CardTitle className="text-2xl">Driver Application Status</CardTitle>
                        <CardDescription>
                            Track the progress of your driver application
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Status Badge */}
                        <div className="text-center">
                            <Badge className={`text-sm font-medium ${getStatusColor()} capitalize`}>
                                {application.status}
                            </Badge>
                        </div>

                        {/* Status Message */}
                        <div className="text-center text-muted-foreground">
                            <p>{getStatusMessage()}</p>
                        </div>

                        {/* Application Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">License Number:</span>
                                <p className="text-muted-foreground">{application.license_number}</p>
                            </div>
                            <div>
                                <span className="font-medium">Vehicle Plate:</span>
                                <p className="text-muted-foreground">{application.vehicle_plate_number}</p>
                            </div>
                            <div>
                                <span className="font-medium">Vehicle Type:</span>
                                <p className="text-muted-foreground capitalize">{application.vehicle_type}</p>
                            </div>
                            <div>
                                <span className="font-medium">Vehicle Model:</span>
                                <p className="text-muted-foreground">{application.vehicle_model}</p>
                            </div>
                            <div>
                                <span className="font-medium">Submitted:</span>
                                <p className="text-muted-foreground">
                                    {new Date(application.submitted_at).toLocaleDateString()}
                                </p>
                            </div>
                            {application.reviewed_at && (
                                <div>
                                    <span className="font-medium">Reviewed:</span>
                                    <p className="text-muted-foreground">
                                        {new Date(application.reviewed_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Admin Notes */}
                        {application.admin_notes && (
                            <div className="border rounded-lg p-4 bg-muted/50">
                                <h4 className="font-medium mb-2">Admin Notes:</h4>
                                <p className="text-sm text-muted-foreground">{application.admin_notes}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            {application.status === 'approved' && (
                                <Button asChild className="flex-1">
                                    <Link href="/driver/dashboard">
                                        Go to Driver Dashboard
                                    </Link>
                                </Button>
                            )}
                            
                            {application.status === 'rejected' && (
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href="/become-driver">
                                        Apply Again
                                    </Link>
                                </Button>
                            )}
                            
                            <Button variant="outline" asChild className="flex-1">
                                <Link href="/passenger/dashboard">
                                    Back to Passenger Dashboard
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}