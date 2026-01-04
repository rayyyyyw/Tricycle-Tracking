import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    User, 
    Calendar,
    Mail,
    Phone,
    MapPin,
    Contact,
    CheckCircle,
    AlertTriangle,
    Camera,
    Edit,
    Save,
    X,
    Shield,
    Heart
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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

interface AlertState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}

export default function PassengerProfile() {
    const { auth } = usePage<{ auth: AuthUser }>().props;
    const user = auth.user;

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });

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
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
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
            emergencyContact.relationship !== initialEmergencyContact.relationship;

        setHasChanges(hasPersonalChanges || hasEmergencyChanges);
    }, [personalInfo, emergencyContact, user]);

    // Alert Component
    const AlertMessage = () => {
        if (!alert.show) return null;

        return (
            <div className={`fixed top-4 right-4 z-50 max-w-sm ${
                alert.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                    : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            } rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}>
                <div className="flex items-start gap-3">
                    <div className={`shrink-0 ${
                        alert.type === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}>
                        {alert.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertTriangle className="w-5 h-5" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                    <button
                        onClick={() => setAlert(prev => ({ ...prev, show: false }))}
                        className={`shrink-0 ${
                            alert.type === 'success' 
                                ? 'text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-400' 
                                : 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400'
                        } transition-colors`}
                    >
                        <X className="w-4 h-4" />
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
                showAlert('error', 'Failed to upload profile picture. Please try again.');
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
            setEmergencyContact(prev => ({ ...prev, phone: numbersOnly }));
            if (numbersOnly) {
                setEmergencyContactErrors(prev => ({ ...prev, phone: '' }));
            }
        } else {
            setPersonalInfo(prev => ({ ...prev, phone: numbersOnly }));
            if (numbersOnly) {
                setPersonalInfoErrors(prev => ({ ...prev, phone: '' }));
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

    const handlePersonalInfoChange = (field: string, value: string) => {
        setPersonalInfo(prev => ({ ...prev, [field]: value }));
        if (value && personalInfoErrors[field as keyof typeof personalInfoErrors]) {
            setPersonalInfoErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleEmergencyContactChange = (field: string, value: string) => {
        setEmergencyContact(prev => ({ ...prev, [field]: value }));
        if (value && emergencyContactErrors[field as keyof typeof emergencyContactErrors]) {
            setEmergencyContactErrors(prev => ({ ...prev, [field]: '' }));
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
        return !Object.values(errors).some(error => error !== '');
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
        return !Object.values(errors).some(error => error !== '');
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
            await router.patch('/passenger/emergency-contact', {
                emergency_name: emergencyContact.name,
                emergency_phone: emergencyContact.phone,
                emergency_relationship: emergencyContact.relationship,
            }, {
                preserveScroll: true,
            });

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
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
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
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const passengerStats = [
        { label: 'Total Rides', value: '24', icon: User, color: 'text-emerald-600' },
        { label: 'Member Since', value: '2024', icon: Calendar, color: 'text-blue-600' },
        { label: 'Favorite Driver', value: 'Miguel', icon: Heart, color: 'text-pink-600' },
        { label: 'Safety Score', value: '4.9', icon: Shield, color: 'text-green-600' },
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
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Passenger Profile</h1>
                                <p className="text-muted-foreground mt-2">
                                    Manage your personal information and emergency contact
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
                                        <Edit className="w-4 h-4" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button 
                                            onClick={handleSaveAll}
                                            disabled={loading || !hasChanges}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {loading ? 'Saving...' : 'Save All Changes'}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={handleCancel}
                                            disabled={loading}
                                            type="button"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
                        {/* Left Side - Profile Section */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardContent className="p-8">
                                    <div className="flex flex-col items-center space-y-6">
                                        {/* Profile Avatar */}
                                        <div className="relative">
                                            <Avatar className="w-48 h-48 border-4 border-background shadow-lg">
                                                <AvatarImage 
                                                    src={user?.avatar || ''} 
                                                    alt={user?.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <label
                                                htmlFor="avatar-upload"
                                                className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg border-2 border-background"
                                            >
                                                <Camera className="w-5 h-5" />
                                                <input
                                                    id="avatar-upload"
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                />
                                            </label>
                                            {avatarLoading && (
                                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Passenger Badge */}
                                        <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base">
                                            <User className="w-4 h-4" />
                                            Verified Passenger
                                        </Badge>

                                        {/* Passenger Stats */}
                                        <div className="w-full space-y-4">
                                            <h3 className="text-lg font-medium text-center">Passenger Stats</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {passengerStats.map((stat, index) => {
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

                                        {/* Avatar Upload Info */}
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">
                                                Click the camera icon to update your profile picture
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                JPG, PNG or GIF • Max 2MB
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Side - Form Fields */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Personal Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
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
                                                <Label htmlFor="name" className="text-base">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Enter your full name"
                                                        className="pl-10 h-11 text-base"
                                                        value={personalInfo.name}
                                                        onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                                                        disabled={!isEditing || loading}
                                                    />
                                                </div>
                                                {personalInfoErrors.name && (
                                                    <p className="text-sm text-red-600">{personalInfoErrors.name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-base">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        placeholder="+63 927 867 4244"
                                                        className="pl-10 h-11 text-base"
                                                        value={formatPhoneDisplay(personalInfo.phone)}
                                                        onChange={(e) => handlePhoneChange(e.target.value, false)}
                                                        disabled={!isEditing || loading}
                                                        maxLength={19}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    {personalInfoErrors.phone ? (
                                                        <p className="text-sm text-red-600">{personalInfoErrors.phone}</p>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">
                                                            {isPhoneComplete(personalInfo.phone) ? (
                                                                <span className="text-green-600 font-medium">✓ Valid phone number</span>
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
                                                <Label htmlFor="email" className="text-base">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="Your email address"
                                                        className="pl-10 h-11 text-base bg-muted/50"
                                                        value={personalInfo.email}
                                                        disabled
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Contact support to change email address
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-base">Home Address</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="address"
                                                        type="text"
                                                        placeholder="Enter your complete address"
                                                        className="pl-10 h-11 text-base"
                                                        value={personalInfo.address}
                                                        onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                                                        disabled={!isEditing || loading}
                                                    />
                                                </div>
                                                {personalInfoErrors.address && (
                                                    <p className="text-sm text-red-600">{personalInfoErrors.address}</p>
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
                                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                                        Emergency Contact
                                    </CardTitle>
                                    <CardDescription>
                                        Someone we can contact in case of emergency
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyName" className="text-base">Contact Name</Label>
                                                <div className="relative">
                                                    <Contact className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="emergencyName"
                                                        type="text"
                                                        placeholder="Enter contact's full name"
                                                        className="pl-10 h-11 text-base"
                                                        value={emergencyContact.name}
                                                        onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                                                        disabled={!isEditing || loading}
                                                    />
                                                </div>
                                                {emergencyContactErrors.name && (
                                                    <p className="text-sm text-red-600">{emergencyContactErrors.name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyRelationship" className="text-base">Relationship</Label>
                                                <Input
                                                    id="emergencyRelationship"
                                                    type="text"
                                                    placeholder="e.g., Parent, Spouse, Sibling, Friend"
                                                    className="h-11 text-base"
                                                    value={emergencyContact.relationship}
                                                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                                                    disabled={!isEditing || loading}
                                                />
                                                {emergencyContactErrors.relationship && (
                                                    <p className="text-sm text-red-600">{emergencyContactErrors.relationship}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyPhone" className="text-base">Contact Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="emergencyPhone"
                                                        type="tel"
                                                        placeholder="+63 927 867 4244"
                                                        className="pl-10 h-11 text-base"
                                                        value={formatPhoneDisplay(emergencyContact.phone)}
                                                        onChange={(e) => handlePhoneChange(e.target.value, true)}
                                                        disabled={!isEditing || loading}
                                                        maxLength={19}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    {emergencyContactErrors.phone ? (
                                                        <p className="text-sm text-red-600">{emergencyContactErrors.phone}</p>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">
                                                            {isPhoneComplete(emergencyContact.phone) ? (
                                                                <span className="text-green-600 font-medium">✓ Valid phone number</span>
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