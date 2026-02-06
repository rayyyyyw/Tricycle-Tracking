// resources/js/Pages/BecomeDriver/Application.tsx
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Car, FileText, User, Shield, BadgeCheck, Upload, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

interface PreviousData {
    license_number?: string;
    license_expiry?: string;
    vehicle_type?: string;
    vehicle_plate_number?: string;
    vehicle_year?: number;
    vehicle_color?: string;
    vehicle_model?: string;
    admin_notes?: string;
}

// FileUploadField Component - MOVED OUTSIDE
interface FileUploadFieldProps {
    id: string;
    label: string;
    description: string;
    error?: string;
    isUploaded: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadField = ({ 
    id, 
    label, 
    description, 
    error,
    isUploaded,
    onFileChange 
}: FileUploadFieldProps) => (
    <div className="space-y-2 sm:space-y-3">
        <Label htmlFor={id} className="text-sm font-medium">
            {label}
        </Label>
        <div className="relative">
            <Input
                id={id}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={onFileChange}
                className={`h-10 sm:h-11 cursor-pointer transition-all border-2 text-xs sm:text-sm pr-10 sm:pr-12 ${
                    isUploaded 
                        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' 
                        : 'border-dashed border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-400 dark:hover:border-emerald-600'
                }`}
            />
            <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                {isUploaded ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <Upload className="h-4 w-4 text-emerald-600/50 dark:text-emerald-400/50" />
                )}
            </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <p className="text-xs text-muted-foreground">
                {description}
            </p>
            {isUploaded && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Uploaded</span>
            )}
        </div>
        {error && (
            <p className="text-xs sm:text-sm text-red-600">{error}</p>
        )}
    </div>
);

interface FormData {
    license_number: string;
    license_expiry: string;
    vehicle_type: string;
    vehicle_plate_number: string;
    vehicle_year: number;
    vehicle_color: string;
    vehicle_model: string;
    license_front: File | null;
    license_back: File | null;
    vehicle_registration: File | null;
}

interface PageProps {
    previousData?: PreviousData;
    [key: string]: unknown;
}

export default function BecomeDriver() {
    const page = usePage<PageProps>();
    const previousData = page.props.previousData;
    
    const { data, setData, post, processing, errors } = useForm<FormData>({
        license_number: '',
        license_expiry: '',
        vehicle_type: 'tricycle',
        vehicle_plate_number: '',
        vehicle_year: new Date().getFullYear(),
        vehicle_color: '',
        vehicle_model: '',
        license_front: null,
        license_back: null,
        vehicle_registration: null,
    });

    const [uploadedFiles, setUploadedFiles] = useState({
        license_front: false,
        license_back: false,
        vehicle_registration: false
    });

    // Auto-fill previous data if available
    useEffect(() => {
        if (previousData) {
            setData({
                ...data,
                license_number: previousData.license_number || '',
                license_expiry: previousData.license_expiry || '',
                vehicle_type: previousData.vehicle_type || 'tricycle',
                vehicle_plate_number: previousData.vehicle_plate_number || '',
                vehicle_year: previousData.vehicle_year || new Date().getFullYear(),
                vehicle_color: previousData.vehicle_color || '',
                vehicle_model: previousData.vehicle_model || '',
            });
        }
    }, [previousData]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            const value = data[key as keyof FormData];
            if (value !== null && value !== undefined) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        post('/become-driver', {
            forceFormData: true,
        });
    };

    // Fixed: handleFileChange functions for each field
    const handleLicenseFrontChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('license_front', file);
        setUploadedFiles(prev => ({
            ...prev,
            license_front: !!file
        }));
    }, [setData]);

    const handleLicenseBackChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('license_back', file);
        setUploadedFiles(prev => ({
            ...prev,
            license_back: !!file
        }));
    }, [setData]);

    const handleVehicleRegistrationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('vehicle_registration', file);
        setUploadedFiles(prev => ({
            ...prev,
            vehicle_registration: !!file
        }));
    }, [setData]);

    // License number validation - LTO format (alphanumeric)
    const handleLicenseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setData('license_number', value);
    };

    // Vehicle plate number validation - alphanumeric with spaces
    const handlePlateNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
        setData('vehicle_plate_number', value);
    };

    // Vehicle model validation - alphanumeric with spaces and common symbols
    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
        setData('vehicle_model', value);
    };

    // Vehicle color validation - letters and spaces only
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        setData('vehicle_color', value);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

    const applicationStats = [
        { label: 'Approval Time', value: '24-48h', icon: FileText, color: 'text-blue-600' },
        { label: 'Driver Network', value: '500+', icon: User, color: 'text-green-600' },
        { label: 'Success Rate', value: '95%', icon: BadgeCheck, color: 'text-emerald-600' },
        { label: 'Support', value: '24/7', icon: Shield, color: 'text-purple-600' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Head title="Become a Driver" />
            
            <div className="container mx-auto">
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
                                    Become a Driver
                                </h1>
                                <p className="text-sm sm:text-base text-emerald-600/70 dark:text-emerald-400/70 mt-1 sm:mt-2">
                                    Join our network of professional tricycle drivers
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 lg:py-8">
                    {/* Left Side - Requirements & Info */}
                    <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                        <Card className="lg:sticky lg:top-8">
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="flex flex-col items-center space-y-6">
                                    {/* Application Icon */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/30">
                                        <Car className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                    </div>
                                    
                                    {/* Admin Notes Alert */}
                                    {previousData?.admin_notes && (
                                        <Alert className="bg-muted">
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Admin Notes:</strong> Please review the admin feedback below.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Requirements */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg font-medium text-center">Requirements</h3>
                                        <div className="space-y-3 sm:space-y-4">
                                            {[
                                                {
                                                    icon: BadgeCheck,
                                                    title: "Valid Driver's License",
                                                    description: "Front and back photos"
                                                },
                                                {
                                                    icon: BadgeCheck,
                                                    title: "Tricycle Registration",
                                                    description: "Current registration papers"
                                                },
                                                {
                                                    icon: BadgeCheck,
                                                    title: "Vehicle Details",
                                                    description: "Complete vehicle information"
                                                }
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/20">
                                                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                                                        <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-sm text-emerald-900 dark:text-emerald-100">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Application Stats */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg font-medium text-center">Process Info</h3>
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

                                    {/* Info Note */}
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">
                                            We'll review your application within 24-48 hours
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Ensure all documents are clear and readable
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side - Main Form */}
                    <div className="lg:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8">
                        {/* Admin Notes Section */}
                        {previousData?.admin_notes && (
                            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                                <CardHeader className="border-b border-red-200 dark:border-red-800 p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-red-800 dark:text-red-200">
                                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                        <span>Admin Application Feedback</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">
                                        Please address these issues from your previous application
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="bg-red-100 dark:bg-red-900/30 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-700">
                                        <p className="text-xs sm:text-sm text-red-900 dark:text-red-100 whitespace-pre-wrap warp-break-words">
                                            {previousData.admin_notes}
                                        </p>
                                    </div>
                                    <div className="mt-3 sm:mt-4 flex items-start gap-2 text-xs sm:text-sm text-red-700 dark:text-red-300">
                                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>Your previous application data has been pre-filled for your convenience</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-emerald-200/30 dark:border-emerald-800/20">
                            <CardHeader className="border-b border-emerald-200/30 dark:border-emerald-800/20 p-4 sm:p-6">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-emerald-900 dark:text-emerald-100">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <span>Driver Application</span>
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm mt-1 text-emerald-700/70 dark:text-emerald-400/70">
                                    Please provide accurate information for your driver application
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10" encType="multipart/form-data">
                                    {/* Driver's License Section */}
                                    <div className="space-y-6 sm:space-y-8">
                                        <div className="border-b border-emerald-200/30 dark:border-emerald-800/20 pb-4 sm:pb-6">
                                            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-emerald-900 dark:text-emerald-100">
                                                <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-emerald-500 dark:bg-emerald-400 rounded-full shrink-0"></div>
                                                <span>Driver's License Information</span>
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                                <div className="space-y-2 sm:space-y-3">
                                                    <Label htmlFor="license_number" className="text-sm font-medium">
                                                        License Number *
                                                    </Label>
                                                    <Input
                                                        id="license_number"
                                                        value={data.license_number}
                                                        onChange={handleLicenseNumberChange}
                                                        placeholder="Enter license number"
                                                        className="h-10 sm:h-11 text-sm sm:text-base"
                                                        maxLength={15}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Letters and numbers only (LTO format)
                                                    </p>
                                                    {errors.license_number && (
                                                        <p className="text-xs sm:text-sm text-red-600">{errors.license_number}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2 sm:space-y-3">
                                                    <Label htmlFor="license_expiry" className="text-sm font-medium">
                                                        License Expiry Date *
                                                    </Label>
                                                    <Input
                                                        id="license_expiry"
                                                        type="date"
                                                        value={data.license_expiry}
                                                        onChange={(e) => setData('license_expiry', e.target.value)}
                                                        className="h-10 sm:h-11 text-sm sm:text-base"
                                                    />
                                                    {errors.license_expiry && (
                                                        <p className="text-xs sm:text-sm text-red-600">{errors.license_expiry}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* License Files */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                            <FileUploadField
                                                id="license_front"
                                                label="License Front Photo *"
                                                description="Clear photo of the front side of your license"
                                                error={errors.license_front}
                                                isUploaded={uploadedFiles.license_front}
                                                onFileChange={handleLicenseFrontChange}
                                            />

                                            <FileUploadField
                                                id="license_back"
                                                label="License Back Photo *"
                                                description="Clear photo of the back side of your license"
                                                error={errors.license_back}
                                                isUploaded={uploadedFiles.license_back}
                                                onFileChange={handleLicenseBackChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Vehicle Information Section */}
                                    <div className="space-y-6 sm:space-y-8">
                                        <div className="border-b border-emerald-200/30 dark:border-emerald-800/20 pb-4 sm:pb-6">
                                            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-emerald-900 dark:text-emerald-100">
                                                <div className="w-1.5 sm:w-2 h-5 sm:h-6 bg-emerald-500 dark:bg-emerald-400 rounded-full shrink-0"></div>
                                                <span>Tricycle Information</span>
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                                <div className="space-y-2 sm:space-y-3">
                                                    <Label htmlFor="vehicle_type" className="text-sm font-medium">
                                                        Vehicle Type *
                                                    </Label>
                                                    <Select value={data.vehicle_type} onValueChange={(value) => setData('vehicle_type', value)}>
                                                        <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="tricycle">Tricycle</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.vehicle_type && (
                                                        <p className="text-xs sm:text-sm text-red-600">{errors.vehicle_type}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2 sm:space-y-3">
                                                    <Label htmlFor="vehicle_plate_number" className="text-sm font-medium">
                                                        Plate Number *
                                                    </Label>
                                                    <Input
                                                        id="vehicle_plate_number"
                                                        value={data.vehicle_plate_number}
                                                        onChange={handlePlateNumberChange}
                                                        placeholder="e.g., ABC 123"
                                                        className="h-10 sm:h-11 text-sm sm:text-base"
                                                        maxLength={10}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Letters and numbers only (e.g., ABC 123)
                                                    </p>
                                                    {errors.vehicle_plate_number && (
                                                        <p className="text-xs sm:text-sm text-red-600">{errors.vehicle_plate_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                                            <div className="space-y-2 sm:space-y-3">
                                                <Label htmlFor="vehicle_year" className="text-sm font-medium">
                                                    Vehicle Year *
                                                </Label>
                                                <Select value={data.vehicle_year.toString()} onValueChange={(value) => setData('vehicle_year', parseInt(value))}>
                                                    <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {years.map((year) => (
                                                            <SelectItem key={year} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.vehicle_year && (
                                                    <p className="text-xs sm:text-sm text-red-600">{errors.vehicle_year}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2 sm:space-y-3">
                                                <Label htmlFor="vehicle_color" className="text-sm font-medium">
                                                    Vehicle Color *
                                                </Label>
                                                <Input
                                                    id="vehicle_color"
                                                    value={data.vehicle_color}
                                                    onChange={handleColorChange}
                                                    placeholder="e.g., Red, Blue"
                                                    className="h-10 sm:h-11 text-sm sm:text-base"
                                                    maxLength={20}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Letters only (e.g., Red, Blue, Black)
                                                </p>
                                                {errors.vehicle_color && (
                                                    <p className="text-xs sm:text-sm text-red-600">{errors.vehicle_color}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2 sm:space-y-3">
                                                <Label htmlFor="vehicle_model" className="text-sm font-medium">
                                                    Vehicle Model *
                                                </Label>
                                                <Input
                                                    id="vehicle_model"
                                                    value={data.vehicle_model}
                                                    onChange={handleModelChange}
                                                    placeholder="e.g., Honda TMX"
                                                    className="h-10 sm:h-11 text-sm sm:text-base"
                                                    maxLength={30}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Letters, numbers, and hyphens only
                                                </p>
                                                {errors.vehicle_model && (
                                                    <p className="text-xs sm:text-sm text-red-600">{errors.vehicle_model}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vehicle Registration */}
                                        <div className="w-full max-w-2xl">
                                            <FileUploadField
                                                id="vehicle_registration"
                                                label="Vehicle Registration Certificate *"
                                                description="Clear photo of your vehicle registration certificate"
                                                error={errors.vehicle_registration}
                                                isUploaded={uploadedFiles.vehicle_registration}
                                                onFileChange={handleVehicleRegistrationChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-emerald-200/30 dark:border-emerald-800/20">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all"
                                        >
                                            {processing ? (
                                                <div className="flex items-center gap-2 sm:gap-3 justify-center">
                                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Submitting Application...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    <span>Submit Application</span>
                                                </div>
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            asChild 
                                            className="h-11 sm:h-12 px-4 sm:px-8 text-sm sm:text-base w-full sm:w-auto border-emerald-200/50 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700"
                                        >
                                            <Link href="/passenger/dashboard">
                                                Cancel Application
                                            </Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}