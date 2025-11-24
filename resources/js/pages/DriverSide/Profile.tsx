// resources/js/Pages/DriverSide/Profile.tsx
import DriverLayout from '@/layouts/DriverLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Calendar, Car, IdCard, Award, Star, Clock, Edit, Save, X, Camera, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
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
    const [hasChanges, setHasChanges] = useState(false);
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

    // Show alert function
    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
    };

    // Track form changes
    useEffect(() => {
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
        const hasChanges = Object.keys(initialData).some(
            key => currentData[key as keyof Omit<ProfileFormData, 'avatar'>] !== initialData[key as keyof typeof initialData]
        ) || profileForm.data.avatar !== null;
        
        setHasChanges(hasChanges);
    }, [profileForm.data, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if there are actually any changes
        const hasNameChanged = profileForm.data.name !== user?.name;
        const hasPhoneChanged = profileForm.data.phone !== user?.phone;
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
        formData.append('phone', profileForm.data.phone || '');
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
                setHasChanges(false);
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
        setHasChanges(false);
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
                    <div className={`flex-shrink-0 ${
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
                        className={`flex-shrink-0 ${
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

            <div className="container mx-auto py-6 space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Profile</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
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

                <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Overview Card */}
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <User className="w-5 h-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Your basic profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                                            <AvatarImage 
                                                src={avatarPreview || user?.avatar} 
                                                alt={user?.name} 
                                            />
                                            <AvatarFallback className={`text-lg ${getAvatarColor()} text-white font-semibold`}>
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isEditing && (
                                            <>
                                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-lg hover:bg-primary/90 transition-colors">
                                                    <Camera className="w-4 h-4" />
                                                    <input
                                                        id="avatar-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleAvatarChange}
                                                    />
                                                </label>
                                            </>
                                        )}
                                    </div>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        Verified Driver
                                    </Badge>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-foreground">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={profileForm.data.name}
                                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Enter your full name"
                                                className="bg-background text-foreground border-input disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-foreground">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileForm.data.email}
                                                    disabled={true}
                                                    className="pl-10 bg-muted text-foreground border-input opacity-70 cursor-not-allowed"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Contact support to change email address</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={profileForm.data.phone}
                                                    onChange={(e) => profileForm.setData('phone', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-background text-foreground border-input disabled:opacity-50 disabled:cursor-not-allowed"
                                                    placeholder="+63 912 345 6789"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-foreground">Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="address"
                                                    value={profileForm.data.address}
                                                    onChange={(e) => profileForm.setData('address', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-background text-foreground border-input disabled:opacity-50 disabled:cursor-not-allowed"
                                                    placeholder="Enter your address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Driver Information Card */}
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <IdCard className="w-5 h-5" />
                                Driver Information
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Your professional driver details (Read-only)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="license_number" className="text-foreground">Driver's License Number</Label>
                                    <Input
                                        id="license_number"
                                        value={profileForm.data.license_number}
                                        disabled={true}
                                        className="bg-muted text-foreground border-input opacity-70 cursor-not-allowed"
                                        placeholder="N01-23-456789"
                                    />
                                    <p className="text-xs text-muted-foreground">Contact support to update license information</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_type" className="text-foreground">Vehicle Type</Label>
                                    <Input
                                        id="vehicle_type"
                                        value={profileForm.data.vehicle_type}
                                        disabled={true}
                                        className="bg-muted text-foreground border-input opacity-70 cursor-not-allowed"
                                        placeholder="Toyota Vios"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_plate" className="text-foreground">Vehicle Plate Number</Label>
                                    <Input
                                        id="vehicle_plate"
                                        value={profileForm.data.vehicle_plate}
                                        disabled={true}
                                        className="bg-muted text-foreground border-input opacity-70 cursor-not-allowed"
                                        placeholder="ABC 123"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Driver Since</Label>
                                    <div className="flex items-center gap-2 p-3 text-muted-foreground bg-accent rounded-md border border-border">
                                        <Calendar className="w-4 h-4" />
                                        <span>January 2024</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-card-foreground">Driver Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {stats.map((stat, index) => {
                                    const IconComponent = stat.icon;
                                    return (
                                        <div key={index} className="text-center p-4 bg-accent rounded-lg border border-border hover:bg-accent/70 transition-colors">
                                            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                                                {stat.value}
                                            </div>
                                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                                <IconComponent className="w-3 h-3" />
                                                {stat.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Errors */}
                    {Object.keys(profileForm.errors).length > 0 && (
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
                    )}
                </form>
            </div>
        </DriverLayout>
    );
}