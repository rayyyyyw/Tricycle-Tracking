// pages/DriverM/Application.tsx
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Eye, Check, X, User, Search, FileText, Download, Filter, RefreshCw, History, AlertTriangle, Image as ImageIcon, ZoomIn, FileImage } from 'lucide-react';
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
    documents?: any;
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
    documents: any;
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
    };
    previous_applications?: PreviousApplication[];
}

interface DriverApplicationsPageProps {
    applications: DriverApplication[];
}

export default function DriverApplicationsPage({ applications }: DriverApplicationsPageProps) {
    const [selectedApplication, setSelectedApplication] = useState<DriverApplication | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string; title: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Handle status update function
    const handleStatusUpdate = (applicationId: number, status: 'approved' | 'rejected', adminNotes?: string) => {
        router.patch(`/DriverM/Application/${applicationId}`, {
            status,
            admin_notes: adminNotes,
        });
    };

    // Handle document viewing
    const handleViewDocument = (documentPath: string, documentTitle: string) => {
        const documentUrl = `/storage/${documentPath}`;
        const fileName = documentPath.split('/').pop() || 'document';
        setSelectedDocument({ url: documentUrl, name: fileName, title: documentTitle });
    };

    // Filter applications based on search and status
    const filteredApplications = applications.filter(application => {
        const matchesSearch = application.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            application.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            application.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            application.vehicle_plate_number.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Statistics with reapplication count
    const pendingCount = applications.filter(app => app.status === 'pending').length;
    const approvedCount = applications.filter(app => app.status === 'approved').length;
    const rejectedCount = applications.filter(app => app.status === 'rejected').length;
    const reapplicationCount = applications.filter(app => app.application_attempt > 1).length;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl">Driver Applications</CardTitle>
                                <CardDescription>
                                    Review and manage driver applications from passengers
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search applications..."
                                        className="pl-10 w-full sm:w-[280px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[250px]">Applicant</TableHead>
                                        <TableHead>License</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-20 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.map((application) => (
                                        <TableRow key={application.id} className="group hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-sm truncate">
                                                                {application.user.name}
                                                            </p>
                                                            {application.application_attempt > 1 && (
                                                                <Badge variant="outline" className="flex items-center gap-1 px-1.5 py-0 text-xs">
                                                                    <RefreshCw className="w-3 h-3" />
                                                                    {application.application_attempt}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {application.user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="relative rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                                                        {application.license_number}
                                                    </code>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm">
                                                        {application.vehicle_plate_number}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {application.vehicle_color} {application.vehicle_model}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {application.vehicle_year} • {application.vehicle_type}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {application.user.phone || (
                                                        <span className="text-muted-foreground italic">No phone</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(application.submitted_at || application.created_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={application.status} />
                                                    {application.application_attempt > 1 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Attempt #{application.application_attempt}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ApplicationActions 
                                                    application={application}
                                                    onViewDetails={() => setSelectedApplication(application)}
                                                    onStatusUpdate={handleStatusUpdate}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {filteredApplications.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-muted-foreground mb-2">
                                        {applications.length === 0 ? (
                                            <div className="space-y-2">
                                                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                                <p className="text-lg font-medium">No driver applications</p>
                                                <p className="text-sm">Applications will appear here when passengers apply to become drivers.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                                <p className="text-lg font-medium">No applications found</p>
                                                <p className="text-sm">Try adjusting your search or filter criteria.</p>
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
    variant = "default" 
}: { 
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
    variant?: "default" | "success" | "warning" | "destructive" | "secondary";
}) {
    const variantStyles = {
        default: "text-blue-600",
        success: "text-green-600",
        warning: "text-amber-600",
        destructive: "text-red-600",
        secondary: "text-purple-600"
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
                <div className={`text-2xl font-bold ${variantStyles[variant]}`}>{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
    const statusConfig = {
        pending: { label: 'Pending', variant: 'secondary' as const, className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' },
        approved: { label: 'Approved', variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
        rejected: { label: 'Rejected', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={`${config.className} font-medium`}>
            {config.label}
        </Badge>
    );
}

// Application Actions Component
function ApplicationActions({ 
    application, 
    onViewDetails, 
    onStatusUpdate 
}: { 
    application: DriverApplication;
    onViewDetails: () => void;
    onStatusUpdate: (id: number, status: 'approved' | 'rejected', notes?: string) => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                <DropdownMenuItem 
                    onClick={onViewDetails} 
                    className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                </DropdownMenuItem>
                {application.status === 'pending' && (
                    <>
                        <DropdownMenuItem 
                            onClick={() => onStatusUpdate(application.id, 'approved')}
                            className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950/30"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Approve Application
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => {
                                const notes = prompt('Please provide reason for rejection:');
                                if (notes !== null) {
                                    onStatusUpdate(application.id, 'rejected', notes);
                                }
                            }}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Reject Application
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Document Card Component
function DocumentCard({ 
    document, 
    title, 
    description,
    onViewDocument 
}: { 
    document: string;
    title: string;
    description: string;
    onViewDocument: (documentPath: string, documentTitle: string) => void;
}) {
    const fileExtension = document.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '');
    
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                    {isImage ? (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                            {title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewDocument(document, title)}
                    >
                        <ZoomIn className="h-4 w-4 mr-1" />
                        {isImage ? 'View Image' : 'View Document'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                    >
                        <a 
                            href={`/storage/${document}`} 
                            download 
                            className="flex items-center"
                        >
                            <Download className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Helper function to format document titles
function formatDocumentTitle(key: string): string {
    const titles: { [key: string]: string } = {
        'license_front': 'Driver\'s License Front',
        'license_back': 'Driver\'s License Back', 
        'vehicle_registration': 'Vehicle Registration',
        'registration': 'Vehicle Registration'
    };
    
    return titles[key] || key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Application Details Modal Component with Tabs
function ApplicationDetailsModal({ 
    application, 
    onClose, 
    onStatusUpdate,
    onViewDocument
}: { 
    application: DriverApplication;
    onClose: () => void;
    onStatusUpdate: (id: number, status: 'approved' | 'rejected', notes?: string) => void;
    onViewDocument: (documentPath: string, documentTitle: string) => void;
}) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to check if documents exist and are in object format
    const hasDocuments = () => {
        if (!application.documents) return false;
        if (typeof application.documents === 'object' && !Array.isArray(application.documents)) {
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
                <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Documents Found</p>
                    <p className="text-sm">Documents data is null or undefined.</p>
                </div>
            );
        }

        // Handle object format (license_front, license_back, vehicle_registration)
        if (typeof application.documents === 'object' && !Array.isArray(application.documents)) {
            const documentEntries = Object.entries(application.documents);
            
            if (documentEntries.length === 0) {
                return (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No Documents Submitted</p>
                        <p className="text-sm">Documents object is empty.</p>
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documentEntries.map(([key, value]) => (
                        <DocumentCard 
                            key={key}
                            document={value as string}
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
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No Documents Submitted</p>
                        <p className="text-sm">Documents array is empty.</p>
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {application.documents.map((document, index) => (
                        <DocumentCard 
                            key={index}
                            document={document}
                            title={`Document ${index + 1}`}
                            description="Supporting document"
                            onViewDocument={onViewDocument}
                        />
                    ))}
                </div>
            );
        }

        // Handle unknown format
        return (
            <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Unknown Documents Format</p>
                <p className="text-sm">Documents type: {typeof application.documents}</p>
            </div>
        );
    };

    // Helper function to get document descriptions
    const getDocumentDescription = (key: string): string => {
        const descriptions: { [key: string]: string } = {
            'license_front': "Front side of driver's license",
            'license_back': "Back side of driver's license", 
            'vehicle_registration': "Vehicle registration certificate",
            'registration': "Vehicle registration certificate"
        };
        
        return descriptions[key] || "Supporting document";
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in-0">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in zoom-in-95">
                <CardHeader className="border-b bg-background relative z-20">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">Driver Application Details</CardTitle>
                            <CardDescription>
                                Application from {application.user.name}
                                {application.application_attempt > 1 && (
                                    <span className="ml-2">
                                        • Attempt #{application.application_attempt}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={onClose} className="shrink-0">
                            Close
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto">
                    <Tabs defaultValue="current" className="w-full">
                        <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 p-0">
                            <TabsTrigger 
                                value="current" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background py-3"
                            >
                                Current Application
                            </TabsTrigger>
                            {application.application_attempt > 1 && (
                                <TabsTrigger 
                                    value="history" 
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background py-3"
                                >
                                    <History className="w-4 h-4 mr-2" />
                                    Application History
                                </TabsTrigger>
                            )}
                            <TabsTrigger 
                                value="documents" 
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background py-3"
                            >
                                <FileImage className="w-4 h-4 mr-2" />
                                Documents ({hasDocuments() ? 'Available' : 'None'})
                            </TabsTrigger>
                        </TabsList>

                        {/* Current Application Tab */}
                        <TabsContent value="current" className="p-6 space-y-6 m-0">
                            {/* Reapplication Alert */}
                            {application.application_attempt > 1 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950/20 dark:border-blue-800">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                                                Reapplication Notice
                                            </h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                                This is attempt #{application.application_attempt} for this applicant. 
                                                {application.application_attempt > 2 && ' Consider providing detailed feedback to help them succeed.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Applicant Information */}
                            <InfoSection title="Applicant Information">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoField label="Full Name" value={application.user.name} />
                                    <InfoField label="Email" value={application.user.email} />
                                    <InfoField label="Phone" value={application.user.phone || 'Not provided'} />
                                    <InfoField 
                                        label="Application Date" 
                                        value={formatDate(application.submitted_at || application.created_at)} 
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoField label="License Number" value={application.license_number} monospace />
                                    <InfoField label="License Expiry" value={formatDate(application.license_expiry)} />
                                </div>
                            </InfoSection>

                            {/* Vehicle Information */}
                            <InfoSection title="Vehicle Information">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <InfoField label="Plate Number" value={application.vehicle_plate_number} />
                                    <InfoField label="Vehicle Type" value={application.vehicle_type} capitalize />
                                    <InfoField label="Year" value={application.vehicle_year} />
                                    <InfoField label="Color" value={application.vehicle_color} />
                                    <InfoField label="Model" value={application.vehicle_model} />
                                </div>
                            </InfoSection>

                            {/* Admin Notes */}
                            {application.admin_notes && (
                                <InfoSection title="Admin Notes">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm">{application.admin_notes}</p>
                                    </div>
                                </InfoSection>
                            )}

                            {/* Admin Actions */}
                            {application.status === 'pending' && (
                                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const defaultNotes = application.application_attempt > 1 ? 
                                                'Please review the previous feedback and ensure all issues are addressed.' : '';
                                            const notes = prompt('Please provide reason for rejection:', defaultNotes);
                                            if (notes !== null) {
                                                onStatusUpdate(application.id, 'rejected', notes);
                                                onClose();
                                            }
                                        }}
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950/50"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject Application
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            onStatusUpdate(application.id, 'approved');
                                            onClose();
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve Application
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Application History Tab */}
                        <TabsContent value="history" className="p-6 m-0">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Application History</h3>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <History className="w-3 h-3" />
                                        Total Attempts: {application.application_attempt}
                                    </Badge>
                                </div>

                                {application.previous_applications && application.previous_applications.length > 0 ? (
                                    <div className="space-y-4">
                                        {application.previous_applications.map((prevApp, index) => (
                                            <Card key={prevApp.id} className="border-l-4 border-l-amber-500">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-3 flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-3 h-3 rounded-full ${
                                                                    prevApp.status === 'approved' ? 'bg-green-500' :
                                                                    prevApp.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                                                }`}></div>
                                                                <div>
                                                                    <h4 className="font-semibold">
                                                                        Attempt #{application.application_attempt - index - 1}
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Submitted {formatDate(prevApp.submitted_at)}
                                                                        {prevApp.reviewed_at && ` • Reviewed ${formatDate(prevApp.reviewed_at)}`}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Previous Application Details */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                {prevApp.license_number && (
                                                                    <div>
                                                                        <span className="font-medium">License:</span>{' '}
                                                                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                                                            {prevApp.license_number}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                                {prevApp.vehicle_plate_number && (
                                                                    <div>
                                                                        <span className="font-medium">Plate:</span>{' '}
                                                                        {prevApp.vehicle_plate_number}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Admin Notes from Previous Application */}
                                                            {prevApp.admin_notes && (
                                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 dark:bg-amber-950/20 dark:border-amber-800">
                                                                    <h5 className="font-medium text-amber-800 dark:text-amber-300 text-sm mb-1">
                                                                        Previous Admin Feedback
                                                                    </h5>
                                                                    <p className="text-amber-700 dark:text-amber-400 text-sm">
                                                                        {prevApp.admin_notes}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <Badge variant={
                                                                prevApp.status === 'approved' ? 'default' :
                                                                prevApp.status === 'rejected' ? 'destructive' : 'secondary'
                                                            }>
                                                                {prevApp.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No Detailed History Available</p>
                                        <p className="text-sm mt-2">
                                            This is attempt #{application.application_attempt}, but detailed historical data is not available.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Documents Tab */}
                        <TabsContent value="documents" className="p-6 m-0">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Supporting Documents</h3>
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
    onClose 
}: { 
    document: { url: string; name: string; title: string };
    onClose: () => void;
}) {
    const isImage = document.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        {document.title}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center bg-black/5 rounded-lg p-4 min-h-[400px] max-h-[70vh] overflow-auto">
                    {isImage ? (
                        <img 
                            src={document.url} 
                            alt={document.title}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>This document cannot be previewed in the browser.</p>
                            <p className="text-sm mt-2">Please download the file to view its contents.</p>
                            <Button asChild className="mt-4">
                                <a href={document.url} download target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Document
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <a href={document.url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </a>
                    </Button>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Reusable Info Section Component
function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
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
    capitalize = false
}: { 
    label: string; 
    value: string;
    monospace?: boolean;
    capitalize?: boolean;
}) {
    return (
        <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">{label}</label>
            <p className={`text-sm ${monospace ? 'font-mono bg-muted px-2 py-1 rounded' : ''} ${capitalize ? 'capitalize' : ''}`}>
                {value}
            </p>
        </div>
    );
}