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
import { useState, useEffect } from 'react';

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
    onFileChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadField = ({ 
    id, 
    label, 
    description, 
    error,
    isUploaded,
    onFileChange 
}: FileUploadFieldProps) => (
    <div className="space-y-3">
        <Label htmlFor={id} className="text-sm font-medium">
            {label}
        </Label>
        <div className="relative">
            <Input
                id={id}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={onFileChange(id)}
                className={`h-11 cursor-pointer transition-all border-2 ${
                    isUploaded 
                        ? 'border-primary bg-primary/5' 
                        : 'border-dashed border-border hover:border-primary/50'
                }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isUploaded ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                    <Upload className="h-4 w-4 text-muted-foreground" />
                )}
            </div>
        </div>
        <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
                {description}
            </p>
            {isUploaded && (
                <span className="text-xs text-primary font-medium">Uploaded</span>
            )}
        </div>
        {error && (
            <p className="text-sm text-red-600">{error}</p>
        )}
    </div>
);

export default function BecomeDriver() {
    const { previousData } = usePage().props as { previousData?: PreviousData };
    
    const { data, setData, post, processing, errors } = useForm({
        license_number: '',
        license_expiry: '',
        vehicle_type: 'tricycle',
        vehicle_plate_number: '',
        vehicle_year: new Date().getFullYear(),
        vehicle_color: '',
        vehicle_model: '',
        license_front: null as File | null,
        license_back: null as File | null,
        vehicle_registration: null as File | null,
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
    }, [previousData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            const value = data[key as keyof typeof data];
            if (value !== null && value !== undefined) {
                formData.append(key, value as any);
            }
        });

        post('/become-driver', {
            forceFormData: true,
        });
    };

    const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData(field as any, file);
        setUploadedFiles(prev => ({
            ...prev,
            [field]: !!file
        }));
    };

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
        const value = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, '');
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
                    <div className="container mx-auto py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <Button variant="ghost" asChild className="mb-4 -ml-4">
                                    <Link href="/passenger/dashboard" className="flex items-center gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Dashboard
                                    </Link>
                                </Button>
                                <h1 className="text-3xl font-bold tracking-tight">Become a Driver</h1>
                                <p className="text-muted-foreground mt-2">
                                    Join our network of professional tricycle drivers
                                </p>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base">
                                <Car className="w-4 h-4" />
                                Driver Application
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8">
                    {/* Left Side - Requirements & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="sticky top-8">
                            <CardContent className="p-8">
                                <div className="flex flex-col items-center space-y-6">
                                    {/* Application Icon */}
                                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                                        <Car className="h-10 w-10 text-primary-foreground" />
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
                                    <div className="w-full space-y-4">
                                        <h3 className="text-lg font-medium text-center">Requirements</h3>
                                        <div className="space-y-4">
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
                                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                                                    <div className="p-1.5 bg-primary/10 rounded-full">
                                                        <item.icon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-sm">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Application Stats */}
                                    <div className="w-full space-y-4">
                                        <h3 className="text-lg font-medium text-center">Process Info</h3>
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
                    <div className="lg:col-span-3 space-y-8">
                        {/* Admin Notes Section */}
                        {previousData?.admin_notes && (
                           <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
    <CardHeader className="border-b border-red-200 dark:border-red-800">
        <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="w-5 h-5" />
            Admin Application Feedback
        </CardTitle>
        <CardDescription className="text-red-700 dark:text-red-300">
            Please address these issues from your previous application
        </CardDescription>
    </CardHeader>
    <CardContent className="p-6">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-700">
            <p className="text-red-900 dark:text-red-100 whitespace-pre-wrap">
                {previousData.admin_notes}
            </p>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <Info className="w-4 h-4" />
            Your previous application data has been pre-filled for your convenience
        </div>
    </CardContent>
</Card>
                        )}

                        <Card>
                            <CardHeader className="border-b border-border">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Driver Application
                                </CardTitle>
                                <CardDescription>
                                    Please provide accurate information for your driver application
                                </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-10" encType="multipart/form-data">
                                    {/* Driver's License Section */}
                                    <div className="space-y-8">
                                        <div className="border-b border-border pb-6">
                                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                                <div className="w-2 h-6 bg-primary rounded-full"></div>
                                                Driver's License Information
                                            </h3>
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label htmlFor="license_number" className="text-sm font-medium">
                                                        License Number *
                                                    </Label>
                                                    <Input
                                                        id="license_number"
                                                        value={data.license_number}
                                                        onChange={handleLicenseNumberChange}
                                                        placeholder="Enter license number"
                                                        className="h-11"
                                                        maxLength={15}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Letters and numbers only (LTO format)
                                                    </p>
                                                    {errors.license_number && (
                                                        <p className="text-sm text-red-600">{errors.license_number}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="license_expiry" className="text-sm font-medium">
                                                        License Expiry Date *
                                                    </Label>
                                                    <Input
                                                        id="license_expiry"
                                                        type="date"
                                                        value={data.license_expiry}
                                                        onChange={(e) => setData('license_expiry', e.target.value)}
                                                        className="h-11"
                                                    />
                                                    {errors.license_expiry && (
                                                        <p className="text-sm text-red-600">{errors.license_expiry}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* License Files */}
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                            <FileUploadField
                                                id="license_front"
                                                label="License Front Photo *"
                                                description="Clear photo of the front side of your license"
                                                error={errors.license_front}
                                                isUploaded={uploadedFiles.license_front}
                                                onFileChange={handleFileChange}
                                            />

                                            <FileUploadField
                                                id="license_back"
                                                label="License Back Photo *"
                                                description="Clear photo of the back side of your license"
                                                error={errors.license_back}
                                                isUploaded={uploadedFiles.license_back}
                                                onFileChange={handleFileChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Vehicle Information Section */}
                                    <div className="space-y-8">
                                        <div className="border-b border-border pb-6">
                                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                                <div className="w-2 h-6 bg-primary rounded-full"></div>
                                                Tricycle Information
                                            </h3>
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label htmlFor="vehicle_type" className="text-sm font-medium">
                                                        Vehicle Type *
                                                    </Label>
                                                    <Select value={data.vehicle_type} onValueChange={(value) => setData('vehicle_type', value)}>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="tricycle">Tricycle</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.vehicle_type && (
                                                        <p className="text-sm text-red-600">{errors.vehicle_type}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <Label htmlFor="vehicle_plate_number" className="text-sm font-medium">
                                                        Plate Number *
                                                    </Label>
                                                    <Input
                                                        id="vehicle_plate_number"
                                                        value={data.vehicle_plate_number}
                                                        onChange={handlePlateNumberChange}
                                                        placeholder="e.g., ABC 123"
                                                        className="h-11"
                                                        maxLength={10}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Letters and numbers only (e.g., ABC 123)
                                                    </p>
                                                    {errors.vehicle_plate_number && (
                                                        <p className="text-sm text-red-600">{errors.vehicle_plate_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <Label htmlFor="vehicle_year" className="text-sm font-medium">
                                                    Vehicle Year *
                                                </Label>
                                                <Select value={data.vehicle_year.toString()} onValueChange={(value) => setData('vehicle_year', parseInt(value))}>
                                                    <SelectTrigger className="h-11">
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
                                                    <p className="text-sm text-red-600">{errors.vehicle_year}</p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="vehicle_color" className="text-sm font-medium">
                                                    Vehicle Color *
                                                </Label>
                                                <Input
                                                    id="vehicle_color"
                                                    value={data.vehicle_color}
                                                    onChange={handleColorChange}
                                                    placeholder="e.g., Red, Blue"
                                                    className="h-11"
                                                    maxLength={20}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Letters only (e.g., Red, Blue, Black)
                                                </p>
                                                {errors.vehicle_color && (
                                                    <p className="text-sm text-red-600">{errors.vehicle_color}</p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="vehicle_model" className="text-sm font-medium">
                                                    Vehicle Model *
                                                </Label>
                                                <Input
                                                    id="vehicle_model"
                                                    value={data.vehicle_model}
                                                    onChange={handleModelChange}
                                                    placeholder="e.g., Honda TMX"
                                                    className="h-11"
                                                    maxLength={30}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Letters, numbers, and hyphens only
                                                </p>
                                                {errors.vehicle_model && (
                                                    <p className="text-sm text-red-600">{errors.vehicle_model}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vehicle Registration */}
                                        <div className="max-w-2xl">
                                            <FileUploadField
                                                id="vehicle_registration"
                                                label="Vehicle Registration Certificate *"
                                                description="Clear photo of your vehicle registration certificate"
                                                error={errors.vehicle_registration}
                                                isUploaded={uploadedFiles.vehicle_registration}
                                                onFileChange={handleFileChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 h-12 text-base"
                                        >
                                            {processing ? (
                                                <div className="flex items-center gap-3 justify-center">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Submitting Application...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                    <span>Submit Application</span>
                                                </div>
                                            )}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            asChild 
                                            className="h-12 px-8"
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