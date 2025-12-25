// resources/js/Pages/DriverSide/Profile.tsx
import DriverLayout from '@/layouts/DriverLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Calendar, Car, IdCard, Award, Star, Clock, Edit, Save, X, Camera, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { type DriverSharedData } from '@/types';

interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    license_number: string;
    vehicle_type: string;
    vehicle_plate: string;
    avatar: File | null;
}

interface AlertState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}

export default function Profile() {
    const { auth } = usePage<DriverSharedData>().props;
    const user = auth.user;

    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });

    const profileForm = useForm<ProfileFormData>({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        license_number: user?.license_number || '',
        vehicle_type: user?.vehicle_type || '',
        vehicle_plate: user?.vehicle_plate || '',
        avatar: null,
    });

    // Track form changes with useMemo
    const hasChanges = useMemo(() => {
        const initialData = {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
            license_number: user?.license_number || '',
            vehicle_type: user?.vehicle_type || '',
            vehicle_plate: user?.vehicle_plate || '',
        };

        const currentData = profileForm.data;
        return Object.keys(initialData).some(
            (key) =>
                currentData[key as keyof Omit<ProfileFormData, 'avatar'>] !==
                initialData[key as keyof typeof initialData]
        ) || profileForm.data.avatar !== null;
    }, [profileForm.data, user]);

    // Show alert function
    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
    };

    // Phone number validation and formatting
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Remove all non-digit characters except '+'
        value = value.replace(/[^\d+]/g, '');
        
        // Ensure it starts with +63
        if (!value.startsWith('+63')) {
            value = '+63' + value.replace(/^\+?63?/, '');
        }
        
        // Limit to 13 characters (+63 followed by 10 digits)
        if (value.length > 13) {
            value = value.slice(0, 13);
        }
        
        profileForm.setData('phone', value);
    };

    // Prevent non-numeric input (except + which we handle above)
    const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow: backspace, delete, tab, escape, enter, home, end, left, right
        if ([8, 9, 13, 27, 46].includes(e.keyCode) || 
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
            return;
        }
        
        // Prevent: anything that is not a number or +
        if (!((e.keyCode >= 48 && e.keyCode <= 57) || // number keys
              (e.keyCode >= 96 && e.keyCode <= 105) || // numpad keys
              e.keyCode === 107 || // + key
              e.key === '+')) {
            e.preventDefault();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate phone number before submission - exactly 13 characters (+63 + 10 digits)
        const phone = profileForm.data.phone;
        if (phone && !/^\+63\d{10}$/.test(phone)) {
            showAlert('error', 'Please enter a valid Philippine phone number (+63 followed by 10 digits)');
            return;
        }
        
        // Check if there are actually any changes
        const hasNameChanged = profileForm.data.name !== user?.name;
        const hasPhoneChanged = phone !== user?.phone;
        const hasAddressChanged = profileForm.data.address !== user?.address;
        const hasAvatarChanged = profileForm.data.avatar !== null;

        if (!hasNameChanged && !hasPhoneChanged && !hasAddressChanged && !hasAvatarChanged) {
            showAlert('error', 'No changes detected');
            return;
        }

        // Create FormData object to handle both file and text data
        const formData = new FormData();
        
        // Always append all fields that are part of the form
        formData.append('name', profileForm.data.name);
        formData.append('phone', phone || '');
        formData.append('address', profileForm.data.address || '');
        
        // Only append avatar if a new file was selected
        if (profileForm.data.avatar instanceof File) {
            formData.append('avatar', profileForm.data.avatar);
        }

        // Submit the form data
        profileForm.post('/DriverSide/Profile', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setIsEditing(false);
                setAvatarPreview(null);
                // Reset the avatar field to null after successful upload
                profileForm.setData('avatar', null);
                showAlert('success', 'Profile updated successfully!');
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
                showAlert('error', 'Failed to update profile. Please check the form for errors.');
            },
        });
    };

    const handleCancel = () => {
        // Reset form to original values
        profileForm.setData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
            license_number: user?.license_number || '',
            vehicle_type: user?.vehicle_type || '',
            vehicle_plate: user?.vehicle_plate || '',
            avatar: null,
        });
        setIsEditing(false);
        setAvatarPreview(null);
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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('avatar', file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const getUserInitials = () => {
        if (!user?.name) return 'D';
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate consistent color based on user's name
    const getAvatarColor = () => {
        if (!user?.name) return 'bg-gray-400';
        
        const colors = [
            'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-yellow-400', 
            'bg-lime-400', 'bg-green-400', 'bg-emerald-400', 'bg-teal-400', 
            'bg-cyan-400', 'bg-sky-400', 'bg-blue-400', 'bg-indigo-400', 
            'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-pink-400'
        ];
        
        const name = user.name;
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const stats = [
        { label: 'Total Rides', value: '47', icon: Car, color: 'text-emerald-600' },
        { label: 'Rating', value: '4.8', icon: Star, color: 'text-yellow-600' },
        { label: 'Acceptance', value: '98%', icon: Award, color: 'text-blue-600' },
        { label: 'This Month', value: '36h', icon: Clock, color: 'text-purple-600' },
    ];

    // Alert Component - Simple function component (not using useMemo)
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
                            <XCircle className="w-5 h-5" />
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
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <DriverLayout>
            <Head title="Driver Profile" />
            
            {/* Alert Notification */}
            <AlertMessage />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b bg-card">
                    <div className="container mx-auto py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Driver Profile</h1>
                                <p className="text-muted-foreground mt-2">
                                    Manage your personal and vehicle information
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
                                            type="submit"
                                            form="profile-form"
                                            disabled={profileForm.processing || !hasChanges}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={handleCancel}
                                            disabled={profileForm.processing}
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

                <form id="profile-form" onSubmit={handleSubmit} className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
                        {/* Left Side - Profile Section */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardContent className="p-8">
                                    <div className="flex flex-col items-center space-y-6">
                                        {/* Profile Avatar */}
                                        <div className="relative">
                                            <div className="w-48 h-48 rounded-full bg-muted flex items-center justify-center border-4 border-background overflow-hidden shadow-lg">
                                                {avatarPreview || user?.avatar ? (
                                                    <img
                                                        src={avatarPreview || user?.avatar || ''}
                                                        alt={user?.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full rounded-full flex items-center justify-center ${getAvatarColor()} text-white text-5xl font-semibold`}>
                                                        {getUserInitials()}
                                                    </div>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <label
                                                    htmlFor="avatar-upload"
                                                    className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg border-2 border-background"
                                                >
                                                    <Camera className="w-5 h-5" />
                                                    <input
                                                        id="avatar-upload"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleAvatarChange}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        
                                        {/* Driver Badge */}
                                        <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base">
                                            <User className="w-4 h-4" />
                                            Verified Driver
                                        </Badge>

                                        {/* Driver Stats */}
                                        <div className="w-full space-y-4">
                                            <h3 className="text-lg font-medium text-center">Driver Stats</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {stats.map((stat, index) => {
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

                                        {profileForm.errors.avatar && (
                                            <p className="text-sm text-red-600 text-center">{profileForm.errors.avatar}</p>
                                        )}
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
                                                        value={profileForm.data.name}
                                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                {profileForm.errors.name && (
                                                    <p className="text-sm text-red-600">{profileForm.errors.name}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-base">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        placeholder="+639121231234"
                                                        className="pl-10 h-11 text-base"
                                                        value={profileForm.data.phone}
                                                        onChange={handlePhoneChange}
                                                        onKeyDown={handlePhoneKeyDown}
                                                        disabled={!isEditing}
                                                        maxLength={13} // +639121231234
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Format: +63 followed by 10 digits (e.g., +639121231234)
                                                </p>
                                                {profileForm.errors.phone && (
                                                    <p className="text-sm text-red-600">{profileForm.errors.phone}</p>
                                                )}
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
                                                        value={profileForm.data.email}
                                                        disabled
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Contact support to change email address
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-base">Address</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="address"
                                                        type="text"
                                                        placeholder="Enter your address"
                                                        className="pl-10 h-11 text-base"
                                                        value={profileForm.data.address}
                                                        onChange={(e) => profileForm.setData('address', e.target.value)}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                {profileForm.errors.address && (
                                                    <p className="text-sm text-red-600">{profileForm.errors.address}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Driver Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IdCard className="w-5 h-5" />
                                        Driver Information
                                    </CardTitle>
                                    <CardDescription>
                                        Your professional driver details (Read-only)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="license_number" className="text-base">Driver's License Number</Label>
                                                <Input
                                                    id="license_number"
                                                    value={profileForm.data.license_number}
                                                    disabled={true}
                                                    className="h-11 text-base bg-muted/50"
                                                    placeholder="N01-23-456789"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Contact support to update license information
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="vehicle_type" className="text-base">Vehicle Type</Label>
                                                <Input
                                                    id="vehicle_type"
                                                    value={profileForm.data.vehicle_type}
                                                    disabled={true}
                                                    className="h-11 text-base bg-muted/50"
                                                    placeholder="Toyota Vios"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="vehicle_plate" className="text-base">Vehicle Plate Number</Label>
                                                <Input
                                                    id="vehicle_plate"
                                                    value={profileForm.data.vehicle_plate}
                                                    disabled={true}
                                                    className="h-11 text-base bg-muted/50"
                                                    placeholder="ABC 123"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-base">Driver Since</Label>
                                                <div className="flex items-center gap-2 p-3 text-muted-foreground bg-accent rounded-md border border-border h-11">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>January 2024</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>

                {/* Form Errors */}
                {Object.keys(profileForm.errors).length > 0 && (
                    <div className="container mx-auto pb-8">
                        <Card className="border-destructive bg-destructive/10">
                            <CardContent className="pt-6">
                                <div className="text-destructive text-sm">
                                    <strong>Please fix the following errors:</strong>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        {Object.entries(profileForm.errors).map(([key, error]) => (
                                            <li key={key}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DriverLayout>
    );
}