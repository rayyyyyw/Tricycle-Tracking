// resources/js/Pages/BecomeDriver/Application.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BadgeCheck,
    Car,
    CheckCircle2,
    FileText,
    Info,
    Shield,
    Upload,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ProfileRestrictionScreen from '@/pages/BookRide/ProfileRestrictionScreen';

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
    onFileChange,
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
                className={`h-10 cursor-pointer border-2 pr-10 text-xs transition-all sm:h-11 sm:pr-12 sm:text-sm ${
                    isUploaded
                        ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/20'
                        : 'border-dashed border-emerald-200/50 hover:border-emerald-400 dark:border-emerald-800/30 dark:hover:border-emerald-600'
                }`}
            />
            <div className="absolute top-1/2 right-2 -translate-y-1/2 transform sm:right-3">
                {isUploaded ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400" />
                ) : (
                    <Upload className="h-4 w-4 text-emerald-600/50 dark:text-emerald-400/50" />
                )}
            </div>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <p className="text-xs text-muted-foreground">{description}</p>
            {isUploaded && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Uploaded
                </span>
            )}
        </div>
        {error && <p className="text-xs text-red-600 sm:text-sm">{error}</p>}
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

interface InfoStatus {
    hasPhone: boolean;
    hasAddress: boolean;
    hasEmergencyContact: boolean;
    hasAvatar: boolean;
    isComplete: boolean;
    missingFields: string[];
}

interface PageProps {
    previousData?: PreviousData;
    profileComplete?: boolean;
    infoStatus?: InfoStatus;
    auth?: { user?: { id?: number; name?: string; avatar?: string } };
    [key: string]: unknown;
}

export default function BecomeDriver() {
    const page = usePage<PageProps>();
    const previousData = page.props.previousData;
    const profileComplete = page.props.profileComplete ?? true;
    const infoStatus = page.props.infoStatus ?? {
        hasPhone: true,
        hasAddress: true,
        hasEmergencyContact: true,
        hasAvatar: true,
        isComplete: true,
        missingFields: [],
    };
    const user = page.props.auth?.user;

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
        vehicle_registration: false,
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
                vehicle_year:
                    previousData.vehicle_year || new Date().getFullYear(),
                vehicle_color: previousData.vehicle_color || '',
                vehicle_model: previousData.vehicle_model || '',
            });
        }
    }, [previousData]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
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
    const handleLicenseFrontChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            setData('license_front', file);
            setUploadedFiles((prev) => ({
                ...prev,
                license_front: !!file,
            }));
        },
        [setData],
    );

    const handleLicenseBackChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            setData('license_back', file);
            setUploadedFiles((prev) => ({
                ...prev,
                license_back: !!file,
            }));
        },
        [setData],
    );

    const handleVehicleRegistrationChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            setData('vehicle_registration', file);
            setUploadedFiles((prev) => ({
                ...prev,
                vehicle_registration: !!file,
            }));
        },
        [setData],
    );

    // License number validation - LTO format (alphanumeric)
    const handleLicenseNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setData('license_number', value);
    };

    // Vehicle plate number validation - alphanumeric with spaces
    const handlePlateNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
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
        {
            label: 'Approval Time',
            value: '24-48h',
            icon: FileText,
            color: 'text-blue-600',
        },
        {
            label: 'Driver Network',
            value: '500+',
            icon: User,
            color: 'text-green-600',
        },
        {
            label: 'Success Rate',
            value: '95%',
            icon: BadgeCheck,
            color: 'text-emerald-600',
        },
        {
            label: 'Support',
            value: '24/7',
            icon: Shield,
            color: 'text-purple-600',
        },
    ];

    // Profile must be complete (phone, address, emergency contact, avatar) before applying
    if (!profileComplete) {
        return (
            <div className="min-h-screen bg-background">
                <Head title="Complete Your Profile" />
                <div className="container mx-auto">
                    <div className="border-b bg-card">
                        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
                            <Button variant="ghost" asChild className="-ml-2 sm:-ml-4">
                                <Link href="/passenger/dashboard" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <h1 className="mt-2 bg-linear-to-r from-emerald-600 to-emerald-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl dark:from-emerald-400 dark:to-emerald-500">
                                Become a Driver
                            </h1>
                            <p className="mt-1 text-sm text-emerald-600/70 dark:text-emerald-400/70">
                                Complete your profile first so admins can identify you when reviewing your application.
                            </p>
                        </div>
                    </div>
                    <ProfileRestrictionScreen
                        infoStatus={infoStatus}
                        user={user ?? null}
                        onProfileCompleted={() => {}}
                        reloadFullPage={true}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Head title="Become a Driver" />

            <div className="container mx-auto">
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
                                    Become a Driver
                                </h1>
                                <p className="mt-1 text-sm text-emerald-600/70 sm:mt-2 sm:text-base dark:text-emerald-400/70">
                                    Join our network of professional tricycle
                                    drivers
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

                <div className="grid grid-cols-1 gap-4 py-4 sm:gap-6 sm:py-6 lg:grid-cols-4 lg:gap-8 lg:py-8">
                    {/* Left Side - Requirements & Info */}
                    <div className="space-y-4 sm:space-y-6 lg:col-span-1">
                        <Card className="lg:sticky lg:top-8">
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="flex flex-col items-center space-y-6">
                                    {/* Application Icon */}
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 sm:h-20 sm:w-20 sm:rounded-2xl dark:from-emerald-600 dark:to-emerald-700 dark:shadow-emerald-900/30">
                                        <Car className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                                    </div>

                                    {/* Admin Notes Alert */}
                                    {previousData?.admin_notes && (
                                        <Alert className="bg-muted">
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Admin Notes:</strong>{' '}
                                                Please review the admin feedback
                                                below.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Requirements */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-center text-base font-medium sm:text-lg">
                                            Requirements
                                        </h3>
                                        <div className="space-y-3 sm:space-y-4">
                                            {[
                                                {
                                                    icon: BadgeCheck,
                                                    title: "Valid Driver's License",
                                                    description:
                                                        'Front and back photos',
                                                },
                                                {
                                                    icon: BadgeCheck,
                                                    title: 'Tricycle Registration',
                                                    description:
                                                        'Current registration papers',
                                                },
                                                {
                                                    icon: BadgeCheck,
                                                    title: 'Vehicle Details',
                                                    description:
                                                        'Complete vehicle information',
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-3 rounded-lg border border-emerald-200/30 bg-emerald-50/30 p-3 dark:border-emerald-800/20 dark:bg-emerald-950/20"
                                                >
                                                    <div className="rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-900/40">
                                                        <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                                            {item.title}
                                                        </h4>
                                                        <p className="mt-1 text-xs text-emerald-700/70 dark:text-emerald-400/70">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Application Stats */}
                                    <div className="w-full space-y-3 sm:space-y-4">
                                        <h3 className="text-center text-base font-medium sm:text-lg">
                                            Process Info
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

                                    {/* Info Note */}
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">
                                            We'll review your application within
                                            24-48 hours
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Ensure all documents are clear and
                                            readable
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side - Main Form */}
                    <div className="space-y-4 sm:space-y-6 lg:col-span-3 lg:space-y-8">
                        {/* Admin Notes Section */}
                        {previousData?.admin_notes && (
                            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                                <CardHeader className="border-b border-red-200 p-4 sm:p-6 dark:border-red-800">
                                    <CardTitle className="flex items-center gap-2 text-sm text-red-800 sm:text-base dark:text-red-200">
                                        <AlertCircle className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                                        <span>Admin Application Feedback</span>
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs text-red-700 sm:text-sm dark:text-red-300">
                                        Please address these issues from your
                                        previous application
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="rounded-lg border border-red-200 bg-red-100 p-3 sm:p-4 dark:border-red-700 dark:bg-red-900/30">
                                        <p className="warp-break-words text-xs whitespace-pre-wrap text-red-900 sm:text-sm dark:text-red-100">
                                            {previousData.admin_notes}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex items-start gap-2 text-xs text-red-700 sm:mt-4 sm:text-sm dark:text-red-300">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>
                                            Your previous application data has
                                            been pre-filled for your convenience
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-emerald-200/30 dark:border-emerald-800/20">
                            <CardHeader className="border-b border-emerald-200/30 p-4 sm:p-6 dark:border-emerald-800/20">
                                <CardTitle className="flex items-center gap-2 text-base text-emerald-900 sm:text-lg dark:text-emerald-100">
                                    <User className="h-4 w-4 shrink-0 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400" />
                                    <span>Driver Application</span>
                                </CardTitle>
                                <CardDescription className="mt-1 text-xs text-emerald-700/70 sm:text-sm dark:text-emerald-400/70">
                                    Please provide accurate information for your
                                    driver application
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6 sm:space-y-8 lg:space-y-10"
                                    encType="multipart/form-data"
                                >
                                    {/* Driver's License Section */}
                                    <div className="space-y-6 sm:space-y-8">
                                        <div className="border-b border-emerald-200/30 pb-4 sm:pb-6 dark:border-emerald-800/20">
                                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-900 sm:mb-6 sm:gap-3 sm:text-xl dark:text-emerald-100">
                                                <div className="h-5 w-1.5 shrink-0 rounded-full bg-emerald-500 sm:h-6 sm:w-2 dark:bg-emerald-400"></div>
                                                <span>
                                                    Driver's License Information
                                                </span>
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
                                                <div className="space-y-2 sm:space-y-3">
                                                    <Label
                                                        htmlFor="license_number"
                                                        className="text-sm font-medium"
                                                    >
                                                        License Number *
                                                    </Label>
                                                    <Input
                                                        id="license_number"
                                                        value={
                                                            data.license_number
                                                        }
                                                        onChange={
                                                            handleLicenseNumberChange
                                                        }
                                                        placeholder="Enter license number"
                                                        className="h-10 text-sm sm:h-11 sm:text-base"
                                                        maxLength={15}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Letters and numbers only
                                                        (LTO format)
                                                    </p>
                                                    {errors.license_number && (
                                                        <p className="text-xs text-red-600 sm:text-sm">
                                                            {
                                                                errors.license_number
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2 sm:space-y-3">
                                                    <Label
                                                        htmlFor="license_expiry"
                                                        className="text-sm font-medium"
                                                    >
                                                        License Expiry Date *
                                                    </Label>
                                                    <Input
                                                        id="license_expiry"
                                                        type="date"
                                                        value={
                                                            data.license_expiry
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'license_expiry',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 text-sm sm:h-11 sm:text-base"
                                                    />
                                                    {errors.license_expiry && (
                                                        <p className="text-xs text-red-600 sm:text-sm">
                                                            {
                                                                errors.license_expiry
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* License Files */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
                                            <FileUploadField
                                                id="license_front"
                                                label="License Front Photo *"
                                                description="Clear photo of the front side of your license"
                                                error={errors.license_front}
                                                isUploaded={
                                                    uploadedFiles.license_front
                                                }
                                                onFileChange={
                                                    handleLicenseFrontChange
                                                }
                                            />

                                            <FileUploadField
                                                id="license_back"
                                                label="License Back Photo *"
                                                description="Clear photo of the back side of your license"
                                                error={errors.license_back}
                                                isUploaded={
                                                    uploadedFiles.license_back
                                                }
                                                onFileChange={
                                                    handleLicenseBackChange
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Vehicle Information Section */}
                                    <div className="space-y-6 sm:space-y-8">
                                        <div className="border-b border-emerald-200/30 pb-4 sm:pb-6 dark:border-emerald-800/20">
                                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-900 sm:mb-6 sm:gap-3 sm:text-xl dark:text-emerald-100">
                                                <div className="h-5 w-1.5 shrink-0 rounded-full bg-emerald-500 sm:h-6 sm:w-2 dark:bg-emerald-400"></div>
                                                <span>
                                                    Tricycle Information
                                                </span>
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
                                                <div className="space-y-2 sm:space-y-3">
                                                    <Label
                                                        htmlFor="vehicle_type"
                                                        className="text-sm font-medium"
                                                    >
                                                        Vehicle Type *
                                                    </Label>
                                                    <Select
                                                        value={
                                                            data.vehicle_type
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setData(
                                                                'vehicle_type',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-10 text-sm sm:h-11 sm:text-base">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="tricycle">
                                                                Tricycle
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.vehicle_type && (
                                                        <p className="text-xs text-red-600 sm:text-sm">
                                                            {
                                                                errors.vehicle_type
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2 sm:space-y-3">
                                                    <Label
                                                        htmlFor="vehicle_plate_number"
                                                        className="text-sm font-medium"
                                                    >
                                                        Plate Number *
                                                    </Label>
                                                    <Input
                                                        id="vehicle_plate_number"
                                                        value={
                                                            data.vehicle_plate_number
                                                        }
                                                        onChange={
                                                            handlePlateNumberChange
                                                        }
                                                        placeholder="e.g., ABC 123"
                                                        className="h-10 text-sm sm:h-11 sm:text-base"
                                                        maxLength={10}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Letters and numbers only
                                                        (e.g., ABC 123)
                                                    </p>
                                                    {errors.vehicle_plate_number && (
                                                        <p className="text-xs text-red-600 sm:text-sm">
                                                            {
                                                                errors.vehicle_plate_number
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                                            <div className="space-y-2 sm:space-y-3">
                                                <Label
                                                    htmlFor="vehicle_year"
                                                    className="text-sm font-medium"
                                                >
                                                    Vehicle Year *
                                                </Label>
                                                <Select
                                                    value={data.vehicle_year.toString()}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'vehicle_year',
                                                            parseInt(value),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-10 text-sm sm:h-11 sm:text-base">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {years.map((year) => (
                                                            <SelectItem
                                                                key={year}
                                                                value={year.toString()}
                                                            >
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.vehicle_year && (
                                                    <p className="text-xs text-red-600 sm:text-sm">
                                                        {errors.vehicle_year}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 sm:space-y-3">
                                                <Label
                                                    htmlFor="vehicle_color"
                                                    className="text-sm font-medium"
                                                >
                                                    Vehicle Color *
                                                </Label>
                                                <Input
                                                    id="vehicle_color"
                                                    value={data.vehicle_color}
                                                    onChange={handleColorChange}
                                                    placeholder="e.g., Red, Blue"
                                                    className="h-10 text-sm sm:h-11 sm:text-base"
                                                    maxLength={20}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Letters only (e.g., Red,
                                                    Blue, Black)
                                                </p>
                                                {errors.vehicle_color && (
                                                    <p className="text-xs text-red-600 sm:text-sm">
                                                        {errors.vehicle_color}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 sm:space-y-3">
                                                <Label
                                                    htmlFor="vehicle_model"
                                                    className="text-sm font-medium"
                                                >
                                                    Vehicle Model *
                                                </Label>
                                                <Input
                                                    id="vehicle_model"
                                                    value={data.vehicle_model}
                                                    onChange={handleModelChange}
                                                    placeholder="e.g., Honda TMX"
                                                    className="h-10 text-sm sm:h-11 sm:text-base"
                                                    maxLength={30}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Letters, numbers, and
                                                    hyphens only
                                                </p>
                                                {errors.vehicle_model && (
                                                    <p className="text-xs text-red-600 sm:text-sm">
                                                        {errors.vehicle_model}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vehicle Registration */}
                                        <div className="w-full max-w-2xl">
                                            <FileUploadField
                                                id="vehicle_registration"
                                                label="Vehicle Registration Certificate *"
                                                description="Clear photo of your vehicle registration certificate"
                                                error={
                                                    errors.vehicle_registration
                                                }
                                                isUploaded={
                                                    uploadedFiles.vehicle_registration
                                                }
                                                onFileChange={
                                                    handleVehicleRegistrationChange
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex flex-col gap-3 border-t border-emerald-200/30 pt-6 sm:flex-row sm:gap-4 sm:pt-8 dark:border-emerald-800/20">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-11 w-full flex-1 bg-emerald-500 text-sm text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md sm:h-12 sm:w-auto sm:text-base dark:bg-emerald-600 dark:hover:bg-emerald-700"
                                        >
                                            {processing ? (
                                                <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5"></div>
                                                    <span>
                                                        Submitting
                                                        Application...
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    <span>
                                                        Submit Application
                                                    </span>
                                                </div>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="h-11 w-full border-emerald-200/50 px-4 text-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:h-12 sm:w-auto sm:px-8 sm:text-base dark:border-emerald-800/30 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
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
