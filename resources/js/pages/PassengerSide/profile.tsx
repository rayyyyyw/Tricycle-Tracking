import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Camera,
    CheckCircle,
    Contact,
    Edit,
    Heart,
    Mail,
    MapPin,
    Phone,
    Save,
    Shield,
    User,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AuthUser {
    user?: {
        id?: number;
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        avatar?: string;
        emergency_contact?: {
            name?: string;
            phone?: string;
            relationship?: string;
        };
    };
}

interface ProfileStats {
    totalRides: number;
    memberSince: string;
    favoriteDriverName: string;
    safetyScore: number;
}

interface AlertState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}

const RELATIONSHIP_OPTIONS = [
    'Parent',
    'Spouse',
    'Sibling',
    'Friend',
    'Child',
    'Partner',
    'Other',
] as const;

export default function PassengerProfile() {
    const { auth, stats: propStats } = usePage<{
        auth: AuthUser;
        stats?: ProfileStats;
    }>().props;
    const user = auth.user;
    const stats = propStats ?? {
        totalRides: 0,
        memberSince: new Date().getFullYear().toString(),
        favoriteDriverName: '—',
        safetyScore: 0,
    };

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({
        show: false,
        type: 'success',
        message: '',
    });

    // Form states
    const [personalInfo, setPersonalInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });

    const [emergencyContact, setEmergencyContact] = useState({
        name: user?.emergency_contact?.name || '',
        phone: user?.emergency_contact?.phone || '',
        relationship: user?.emergency_contact?.relationship || '',
    });

    // Validation states
    const [personalInfoErrors, setPersonalInfoErrors] = useState({
        name: '',
        phone: '',
        address: '',
    });

    const [emergencyContactErrors, setEmergencyContactErrors] = useState({
        name: '',
        phone: '',
        relationship: '',
    });

    const [loading, setLoading] = useState(false);

    // Show alert function
    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 5000);
    };

    // Track form changes
    useEffect(() => {
        const initialPersonalInfo = {
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || '',
        };

        const initialEmergencyContact = {
            name: user?.emergency_contact?.name || '',
            phone: user?.emergency_contact?.phone || '',
            relationship: user?.emergency_contact?.relationship || '',
        };

        const hasPersonalChanges =
            personalInfo.name !== initialPersonalInfo.name ||
            personalInfo.phone !== initialPersonalInfo.phone ||
            personalInfo.address !== initialPersonalInfo.address;

        const hasEmergencyChanges =
            emergencyContact.name !== initialEmergencyContact.name ||
            emergencyContact.phone !== initialEmergencyContact.phone ||
            emergencyContact.relationship !==
                initialEmergencyContact.relationship;

        setHasChanges(hasPersonalChanges || hasEmergencyChanges);
    }, [personalInfo, emergencyContact, user]);

    // Alert Component
    const AlertMessage = () => {
        if (!alert.show) return null;

        return (
            <div
                className={`fixed top-4 right-4 z-50 max-w-sm ${
                    alert.type === 'success'
                        ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                } rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out`}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`shrink-0 ${
                            alert.type === 'success'
                                ? 'text-green-500'
                                : 'text-red-500'
                        }`}
                    >
                        {alert.type === 'success' ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                    <button
                        onClick={() =>
                            setAlert((prev) => ({ ...prev, show: false }))
                        }
                        className={`shrink-0 ${
                            alert.type === 'success'
                                ? 'text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-400'
                                : 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400'
                        } transition-colors`}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Avatar handlers
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            showAlert('error', 'Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showAlert('error', 'Image size must be less than 2MB');
            return;
        }

        // Upload avatar immediately when file is selected
        setAvatarLoading(true);

        const formData = new FormData();
        formData.append('avatar', file);

        router.post('/passenger/profile', formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setAvatarLoading(false);
                showAlert('success', 'Profile picture updated successfully!');
                // Clear the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: (errors) => {
                setAvatarLoading(false);
                console.error('Failed to upload avatar:', errors);
                showAlert(
                    'error',
                    'Failed to upload profile picture. Please try again.',
                );
                // Clear the file input on error too
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    // Phone number validation and formatting
    const handlePhoneChange = (value: string, isEmergency: boolean = false) => {
        const numbersOnly = value.replace(/\D/g, '').slice(0, 12);

        if (isEmergency) {
            setEmergencyContact((prev) => ({ ...prev, phone: numbersOnly }));
            if (numbersOnly) {
                setEmergencyContactErrors((prev) => ({ ...prev, phone: '' }));
            }
        } else {
            setPersonalInfo((prev) => ({ ...prev, phone: numbersOnly }));
            if (numbersOnly) {
                setPersonalInfoErrors((prev) => ({ ...prev, phone: '' }));
            }
        }
    };

    // Format phone number for display
    const formatPhoneDisplay = (phone: string) => {
        if (!phone) return '';

        const numbersOnly = phone.replace(/\D/g, '');

        if (numbersOnly.startsWith('63')) {
            const remainingDigits = numbersOnly.slice(2);
            if (remainingDigits.length <= 10) {
                const part1 = remainingDigits.slice(0, 3);
                const part2 = remainingDigits.slice(3, 6);
                const part3 = remainingDigits.slice(6, 10);
                return `+63 ${part1} ${part2} ${part3}`.trim();
            }
        }

        if (numbersOnly.length <= 10) {
            const part1 = numbersOnly.slice(0, 3);
            const part2 = numbersOnly.slice(3, 6);
            const part3 = numbersOnly.slice(6, 10);
            return `+63 ${part1} ${part2} ${part3}`.trim();
        }

        return `+63 ${numbersOnly}`;
    };

    const getPhoneLength = (phone: string) => {
        return phone.replace(/\D/g, '').length;
    };

    const isPhoneComplete = (phone: string) => {
        return phone.replace(/\D/g, '').length === 12;
    };

    // Red indication: required fields that are still incomplete (for "Complete profile" clarity)
    const phoneIncomplete =
        !personalInfo.phone || !isPhoneComplete(personalInfo.phone);
    const addressIncomplete = !personalInfo.address?.trim();
    const emergencyNameIncomplete = !emergencyContact.name?.trim();
    const emergencyPhoneIncomplete =
        !emergencyContact.phone || !isPhoneComplete(emergencyContact.phone);
    const emergencyRelationshipIncomplete =
        !emergencyContact.relationship?.trim();

    const handlePersonalInfoChange = (field: string, value: string) => {
        setPersonalInfo((prev) => ({ ...prev, [field]: value }));
        if (
            value &&
            personalInfoErrors[field as keyof typeof personalInfoErrors]
        ) {
            setPersonalInfoErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleEmergencyContactChange = (field: string, value: string) => {
        setEmergencyContact((prev) => ({ ...prev, [field]: value }));
        if (
            value &&
            emergencyContactErrors[field as keyof typeof emergencyContactErrors]
        ) {
            setEmergencyContactErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    // Validate forms
    const validatePersonalInfo = () => {
        const errors = {
            name: '',
            phone: '',
            address: '',
        };

        if (!personalInfo.name.trim()) {
            errors.name = 'Full name is required';
        } else if (personalInfo.name.trim().length < 2) {
            errors.name = 'Full name must be at least 2 characters';
        }

        if (!personalInfo.phone.trim()) {
            errors.phone = 'Contact number is required';
        } else if (!isPhoneComplete(personalInfo.phone)) {
            errors.phone = 'Contact number must be exactly 12 digits';
        }

        if (!personalInfo.address.trim()) {
            errors.address = 'Home address is required';
        } else if (personalInfo.address.trim().length < 5) {
            errors.address = 'Please enter a valid address';
        }

        setPersonalInfoErrors(errors);
        return !Object.values(errors).some((error) => error !== '');
    };

    const validateEmergencyContact = () => {
        const errors = {
            name: '',
            phone: '',
            relationship: '',
        };

        if (!emergencyContact.name.trim()) {
            errors.name = 'Contact name is required';
        } else if (emergencyContact.name.trim().length < 2) {
            errors.name = 'Contact name must be at least 2 characters';
        }

        if (!emergencyContact.phone.trim()) {
            errors.phone = 'Contact number is required';
        } else if (!isPhoneComplete(emergencyContact.phone)) {
            errors.phone = 'Contact number must be exactly 12 digits';
        }

        if (!emergencyContact.relationship.trim()) {
            errors.relationship = 'Relationship is required';
        } else if (emergencyContact.relationship.trim().length < 2) {
            errors.relationship = 'Please specify your relationship';
        }

        setEmergencyContactErrors(errors);
        return !Object.values(errors).some((error) => error !== '');
    };

    // Handle form submission
    const handleSaveAll = async () => {
        // Validate both forms
        const isPersonalValid = validatePersonalInfo();
        const isEmergencyValid = validateEmergencyContact();

        if (!isPersonalValid || !isEmergencyValid) {
            showAlert('error', 'Please fix all errors before saving');
            return;
        }

        setLoading(true);

        try {
            // Save personal information
            await router.patch('/passenger/profile', personalInfo, {
                preserveScroll: true,
            });

            // Save emergency contact
            await router.patch(
                '/passenger/emergency-contact',
                {
                    emergency_name: emergencyContact.name,
                    emergency_phone: emergencyContact.phone,
                    emergency_relationship: emergencyContact.relationship,
                },
                {
                    preserveScroll: true,
                },
            );

            setIsEditing(false);
            showAlert('success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Failed to save profile:', error);
            showAlert('error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing && hasChanges) {
            if (
                confirm(
                    'You have unsaved changes. Are you sure you want to cancel?',
                )
            ) {
                handleCancel();
            }
        } else {
            setIsEditing(!isEditing);
        }
    };

    const handleCancel = () => {
        // Reset form to original values
        setPersonalInfo({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
        });
        setEmergencyContact({
            name: user?.emergency_contact?.name || '',
            phone: user?.emergency_contact?.phone || '',
            relationship: user?.emergency_contact?.relationship || '',
        });
        setIsEditing(false);
        setHasChanges(false);

        // Clear any validation errors
        setPersonalInfoErrors({ name: '', phone: '', address: '' });
        setEmergencyContactErrors({ name: '', phone: '', relationship: '' });
    };

    const getUserInitials = () => {
        if (!user?.name) return 'P';
        return user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const passengerStats = [
        {
            label: 'Total Rides',
            value: String(stats.totalRides),
            icon: User,
            color: 'text-emerald-600',
        },
        {
            label: 'Member Since',
            value: stats.memberSince,
            icon: Calendar,
            color: 'text-blue-600',
        },
        {
            label: 'Favorite Driver',
            value: stats.favoriteDriverName,
            icon: Heart,
            color: 'text-pink-600',
        },
        {
            label: 'Safety Score',
            value: stats.safetyScore > 0 ? String(stats.safetyScore) : '—',
            icon: Shield,
            color: 'text-green-600',
        },
    ];

    return (
        <PassengerLayout>
            <Head title="Passenger Profile" />

            {/* Alert Notification */}
            <AlertMessage />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b bg-card">
                    <div className="container mx-auto py-6">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Passenger Profile
                                </h1>
                                <p className="mt-2 text-muted-foreground">
                                    Manage your personal information and
                                    emergency contact
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <Button
                                        onClick={handleEditToggle}
                                        className="flex items-center gap-2"
                                        variant="outline"
                                        type="button"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleSaveAll}
                                            disabled={loading || !hasChanges}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {loading
                                                ? 'Saving...'
                                                : 'Save All Changes'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancel}
                                            disabled={loading}
                                            type="button"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto">
                    <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-3">
                        {/* Left Side - Profile Section */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardContent className="p-8">
                                    <div className="flex flex-col items-center space-y-6">
                                        {/* Profile Avatar */}
                                        <div className="relative">
                                            <Avatar
                                                className={`h-48 w-48 border-4 shadow-lg ${!user?.avatar ? 'border-red-500 ring-2 ring-red-500/30 dark:border-red-500 dark:ring-red-500/30' : 'border-background'}`}
                                            >
                                                <AvatarImage
                                                    src={user?.avatar || ''}
                                                    alt={user?.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-muted text-4xl text-muted-foreground">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <label
                                                htmlFor="avatar-upload"
                                                className="absolute right-4 bottom-4 cursor-pointer rounded-full border-2 border-background bg-primary p-3 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                                            >
                                                <Camera className="h-5 w-5" />
                                                <input
                                                    id="avatar-upload"
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={
                                                        handleAvatarChange
                                                    }
                                                />
                                            </label>
                                            {avatarLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Passenger Badge */}
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-2 px-4 py-2 text-base"
                                        >
                                            <User className="h-4 w-4" />
                                            Verified Passenger
                                        </Badge>

                                        {/* Passenger Stats */}
                                        <div className="w-full space-y-4">
                                            <h3 className="text-center text-lg font-medium">
                                                Passenger Stats
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {passengerStats.map(
                                                    (stat, index) => {
                                                        const IconComponent =
                                                            stat.icon;
                                                        return (
                                                            <div
                                                                key={`stat-${stat.label}-${index}`}
                                                                className="rounded-lg border border-border bg-accent p-3 text-center"
                                                            >
                                                                <div
                                                                    className={`text-xl font-bold ${stat.color} mb-1`}
                                                                >
                                                                    {stat.value}
                                                                </div>
                                                                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                                                    <IconComponent className="h-3 w-3" />
                                                                    {stat.label}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>

                                        {/* Avatar Upload Info */}
                                        <div className="text-center">
                                            {!user?.avatar && (
                                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                                    Profile picture required
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                Click the camera icon to update
                                                your profile picture
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                JPG, PNG or GIF • Max 2MB
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Side - Form Fields */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Personal Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>
                                        Your basic profile information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="name"
                                                    className="text-sm font-medium"
                                                >
                                                    Full Name
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Enter your full name"
                                                        className="h-11 pl-10 text-sm"
                                                        value={
                                                            personalInfo.name
                                                        }
                                                        onChange={(e) =>
                                                            handlePersonalInfoChange(
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !isEditing ||
                                                            loading
                                                        }
                                                    />
                                                </div>
                                                {personalInfoErrors.name && (
                                                    <p className="text-sm text-red-600">
                                                        {
                                                            personalInfoErrors.name
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="phone"
                                                    className={`text-sm font-medium ${phoneIncomplete ? 'text-red-600 dark:text-red-400' : ''}`}
                                                >
                                                    Phone Number
                                                    {phoneIncomplete && (
                                                        <span className="ml-1 font-normal text-red-600 dark:text-red-400">
                                                            (required)
                                                        </span>
                                                    )}
                                                </Label>
                                                <div className="relative">
                                                    <Phone
                                                        className={`absolute top-3 left-3 h-4 w-4 ${phoneIncomplete ? 'text-red-500' : 'text-muted-foreground'}`}
                                                    />
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        placeholder="+63 927 867 4244"
                                                        className={`h-11 pl-10 text-sm ${phoneIncomplete ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:ring-red-500' : ''}`}
                                                        value={formatPhoneDisplay(
                                                            personalInfo.phone,
                                                        )}
                                                        onChange={(e) =>
                                                            handlePhoneChange(
                                                                e.target.value,
                                                                false,
                                                            )
                                                        }
                                                        disabled={
                                                            !isEditing ||
                                                            loading
                                                        }
                                                        maxLength={19}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    {personalInfoErrors.phone ? (
                                                        <p className="text-sm text-red-600">
                                                            {
                                                                personalInfoErrors.phone
                                                            }
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">
                                                            {isPhoneComplete(
                                                                personalInfo.phone,
                                                            ) ? (
                                                                <span className="font-medium text-green-600">
                                                                    ✓ Valid
                                                                    phone number
                                                                </span>
                                                            ) : (
                                                                `Enter 12-digit number (${getPhoneLength(personalInfo.phone)}/12)`
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-sm font-medium"
                                                >
                                                    Email Address
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="Your email address"
                                                        className="h-11 bg-muted/50 pl-10 text-sm"
                                                        value={
                                                            personalInfo.email
                                                        }
                                                        disabled
                                                    />
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Contact support to change
                                                    email address
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="address"
                                                    className={`text-sm font-medium ${addressIncomplete ? 'text-red-600 dark:text-red-400' : ''}`}
                                                >
                                                    Home Address
                                                    {addressIncomplete && (
                                                        <span className="ml-1 font-normal text-red-600 dark:text-red-400">
                                                            (required)
                                                        </span>
                                                    )}
                                                </Label>
                                                <div className="relative">
                                                    <MapPin
                                                        className={`absolute top-3 left-3 h-4 w-4 ${addressIncomplete ? 'text-red-500' : 'text-muted-foreground'}`}
                                                    />
                                                    <Input
                                                        id="address"
                                                        type="text"
                                                        placeholder="Enter your complete address"
                                                        className={`h-11 pl-10 text-sm ${addressIncomplete ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:ring-red-500' : ''}`}
                                                        value={
                                                            personalInfo.address
                                                        }
                                                        onChange={(e) =>
                                                            handlePersonalInfoChange(
                                                                'address',
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !isEditing ||
                                                            loading
                                                        }
                                                    />
                                                </div>
                                                {personalInfoErrors.address && (
                                                    <p className="text-sm text-red-600">
                                                        {
                                                            personalInfoErrors.address
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Emergency Contact Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                                        Emergency Contact
                                    </CardTitle>
                                    <CardDescription>
                                        Someone we can contact in case of
                                        emergency
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="emergencyName"
                                                    className={`text-sm font-medium ${emergencyNameIncomplete ? 'text-red-600 dark:text-red-400' : ''}`}
                                                >
                                                    Contact Name
                                                    {emergencyNameIncomplete && (
                                                        <span className="ml-1 font-normal text-red-600 dark:text-red-400">
                                                            (required)
                                                        </span>
                                                    )}
                                                </Label>
                                                <div className="relative">
                                                    <Contact
                                                        className={`absolute top-3 left-3 h-4 w-4 ${emergencyNameIncomplete ? 'text-red-500' : 'text-muted-foreground'}`}
                                                    />
                                                    <Input
                                                        id="emergencyName"
                                                        type="text"
                                                        placeholder="Enter contact's full name"
                                                        className={`h-11 pl-10 text-sm ${emergencyNameIncomplete ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:ring-red-500' : ''}`}
                                                        value={
                                                            emergencyContact.name
                                                        }
                                                        onChange={(e) =>
                                                            handleEmergencyContactChange(
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !isEditing ||
                                                            loading
                                                        }
                                                    />
                                                </div>
                                                {emergencyContactErrors.name && (
                                                    <p className="text-sm text-red-600">
                                                        {
                                                            emergencyContactErrors.name
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="emergencyRelationship"
                                                    className={`text-sm font-medium ${emergencyRelationshipIncomplete ? 'text-red-600 dark:text-red-400' : ''}`}
                                                >
                                                    Relationship
                                                    {emergencyRelationshipIncomplete && (
                                                        <span className="ml-1 font-normal text-red-600 dark:text-red-400">
                                                            (required)
                                                        </span>
                                                    )}
                                                </Label>
                                                <Select
                                                    value={
                                                        RELATIONSHIP_OPTIONS.includes(
                                                            emergencyContact.relationship as (typeof RELATIONSHIP_OPTIONS)[number],
                                                        )
                                                            ? emergencyContact.relationship
                                                            : 'Other'
                                                    }
                                                    onValueChange={(value) =>
                                                        handleEmergencyContactChange(
                                                            'relationship',
                                                            value === 'Other'
                                                                ? ''
                                                                : value,
                                                        )
                                                    }
                                                    disabled={
                                                        !isEditing || loading
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="emergencyRelationship"
                                                        className={`h-11 text-sm ${emergencyRelationshipIncomplete ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:ring-red-500' : ''}`}
                                                    >
                                                        <SelectValue placeholder="Select relationship" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {RELATIONSHIP_OPTIONS.map(
                                                            (opt) => (
                                                                <SelectItem
                                                                    key={opt}
                                                                    value={opt}
                                                                    className="text-sm"
                                                                >
                                                                    {opt}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {(!emergencyContact.relationship ||
                                                    !RELATIONSHIP_OPTIONS.includes(
                                                        emergencyContact.relationship as (typeof RELATIONSHIP_OPTIONS)[number],
                                                    )) && (
                                                    <Input
                                                        type="text"
                                                        placeholder="Specify relationship (e.g., Guardian, Cousin)"
                                                        className={`mt-2 h-11 text-sm ${emergencyRelationshipIncomplete ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:ring-red-500' : ''}`}
                                                        value={
                                                            RELATIONSHIP_OPTIONS.includes(
                                                                emergencyContact.relationship as (typeof RELATIONSHIP_OPTIONS)[number],
                                                            )
                                                                ? ''
                                                                : emergencyContact.relationship
                                                        }
                                                        onChange={(e) =>
                                                            handleEmergencyContactChange(
                                                                'relationship',
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={
                                                            !isEditing ||
                                                            loading
                                                        }
                                                    />
                                                )}
                                                {emergencyContactErrors.relationship && (
                                                    <p className="text-sm text-red-600">
                                                        {
                                                            emergencyContactErrors.relationship
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="emergencyPhone"
                                                    className={`text-sm font-medium ${emergencyPhoneIncomplete ? 'text-red-600 dark:text-red-400' : ''}`}
                                                >
                                                    Contact Number
                                                    {emergencyPhoneIncomplete && (
                                                        <span className="ml-1 font-normal text-red-600 dark:text-red-400">
                                                            (required)
                                                        </span>
                                                    )}
                                                </Label>
                                                <div className="relative">
                                                    <Phone
                                                        className={`absolute top-3 left-3 h-4 w-4 ${emergencyPhoneIncomplete ? 'text-red-500' : 'text-muted-foreground'}`}
                                                    />
                                                    <Input
                                                        id="emergencyPhone"
                                                        type="tel"
                                                        placeholder="+63 927 867 4244"
                                                        className={`h-11 pl-10 text-sm ${emergencyPhoneIncomplete ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-500 dark:focus-visible:ring-red-500' : ''}`}
                                                        value={formatPhoneDisplay(
                                                            emergencyContact.phone,
                                                        )}
                                                        onChange={(e) =>
                                                            handlePhoneChange(
                                                                e.target.value,
                                                                true,
                                                            )
                                                        }
                                                        disabled={
                                                            !isEditing ||
                                                            loading
                                                        }
                                                        maxLength={19}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    {emergencyContactErrors.phone ? (
                                                        <p className="text-sm text-red-600">
                                                            {
                                                                emergencyContactErrors.phone
                                                            }
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">
                                                            {isPhoneComplete(
                                                                emergencyContact.phone,
                                                            ) ? (
                                                                <span className="font-medium text-green-600">
                                                                    ✓ Valid
                                                                    phone number
                                                                </span>
                                                            ) : (
                                                                `Enter 12-digit number (${getPhoneLength(emergencyContact.phone)}/12)`
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}
