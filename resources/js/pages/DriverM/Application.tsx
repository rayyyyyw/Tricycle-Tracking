// pages/DriverM/Application.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Check, X, User, Search, FileText, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

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
    documents: string[]; // Array of document paths
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    submitted_at: string;
    reviewed_at?: string;
    reviewed_by?: number;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
}

interface DriverApplicationsPageProps {
    applications: DriverApplication[];
}

export default function DriverApplicationsPage({ applications }: DriverApplicationsPageProps) {
    const [selectedApplication, setSelectedApplication] = useState<DriverApplication | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Filter applications based on search and status
    const filteredApplications = applications.filter(application => {
        const matchesSearch = application.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            application.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            application.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            application.vehicle_plate_number.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            case 'pending': return 'secondary';
            default: return 'outline';
        }
    };

    const handleStatusUpdate = (applicationId: number, status: 'approved' | 'rejected', adminNotes?: string) => {
        router.patch(`/DriverM/applications/${applicationId}`, {
            status,
            admin_notes: adminNotes,
        });
    };

    const handleDownloadDocument = (documentPath: string) => {
        // Open document in new tab or trigger download
        window.open(`/storage/${documentPath}`, '_blank');
    };

    const pendingCount = applications.filter(app => app.status === 'pending').length;
    const approvedCount = applications.filter(app => app.status === 'approved').length;
    const rejectedCount = applications.filter(app => app.status === 'rejected').length;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Driver Management', href: '/DriverM' },
                { title: 'Applications', href: '/DriverM/applications' },
            ]}
            title="Driver Applications"
        >
            <Head title="Driver Applications" />

            <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{applications.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <Check className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <X className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle>Driver Applications</CardTitle>
                                <CardDescription>
                                    Review and manage driver applications from passengers.
                                </CardDescription>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search applications..."
                                        className="pl-8 w-full md:w-[250px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>License Number</TableHead>
                                    <TableHead>Vehicle Info</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApplications.map((application) => (
                                    <TableRow key={application.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{application.user.name}</div>
                                                <div className="text-sm text-muted-foreground">{application.user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {application.license_number}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">{application.vehicle_plate_number}</div>
                                                <div className="text-muted-foreground">
                                                    {application.vehicle_color} {application.vehicle_model} ({application.vehicle_year})
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{application.user.phone || 'N/A'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(application.submitted_at || application.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(application.status)}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setSelectedApplication(application)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {application.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusUpdate(application.id, 'approved')}
                                                            >
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    const notes = prompt('Please provide reason for rejection:');
                                                                    if (notes !== null) {
                                                                        handleStatusUpdate(application.id, 'rejected', notes);
                                                                    }
                                                                }}
                                                            >
                                                                <X className="h-4 w-4 mr-2" />
                                                                Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {filteredApplications.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                {applications.length === 0 ? 'No driver applications found.' : 'No applications match your filters.'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Application Details Modal */}
            {selectedApplication && (
                <ApplicationDetailsModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onDownloadDocument={handleDownloadDocument}
                />
            )}
        </AppLayout>
    );
}

// Application Details Modal Component
function ApplicationDetailsModal({ 
    application, 
    onClose, 
    onStatusUpdate,
    onDownloadDocument
}: { 
    application: DriverApplication;
    onClose: () => void;
    onStatusUpdate: (id: number, status: 'approved' | 'rejected', notes?: string) => void;
    onDownloadDocument: (documentPath: string) => void;
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Driver Application Details</CardTitle>
                            <CardDescription>
                                Application from {application.user.name}
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Applicant Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Applicant Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="text-sm">{application.user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-sm">{application.user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                <p className="text-sm">{application.user.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                                <p className="text-sm">
                                    {new Date(application.submitted_at || application.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* License Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">License Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">License Number</label>
                                <p className="text-sm font-mono">{application.license_number}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">License Expiry</label>
                                <p className="text-sm">
                                    {new Date(application.license_expiry).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Plate Number</label>
                                <p className="text-sm font-medium">{application.vehicle_plate_number}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Vehicle Type</label>
                                <p className="text-sm capitalize">{application.vehicle_type}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Year</label>
                                <p className="text-sm">{application.vehicle_year}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Color</label>
                                <p className="text-sm">{application.vehicle_color}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Model</label>
                                <p className="text-sm">{application.vehicle_model}</p>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    {application.documents && application.documents.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Supporting Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {application.documents.map((document, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center">
                                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span className="text-sm">
                                                Document {index + 1}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDownloadDocument(document)}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Notes */}
                    {application.admin_notes && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Admin Notes</h3>
                            <p className="text-sm bg-muted p-3 rounded-md">{application.admin_notes}</p>
                        </div>
                    )}

                    {/* Admin Actions */}
                    {application.status === 'pending' && (
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const notes = prompt('Please provide reason for rejection:');
                                    if (notes !== null) {
                                        onStatusUpdate(application.id, 'rejected', notes);
                                        onClose();
                                    }
                                }}
                            >
                                Reject Application
                            </Button>
                            <Button
                                onClick={() => {
                                    onStatusUpdate(application.id, 'approved');
                                    onClose();
                                }}
                            >
                                Approve Application
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}