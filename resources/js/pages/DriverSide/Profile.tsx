// resources/js/Pages/DriverSide/Profile.tsx
import DriverLayout from '@/layouts/DriverLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Calendar, Car, IdCard, Award, Star, Clock, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { type SharedData } from '@/types';

interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    license_number: string;
    vehicle_type: string;
    vehicle_plate: string;
}

export default function Profile() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const [isEditing, setIsEditing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const profileForm = useForm<ProfileFormData>({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        license_number: (user as any)?.license_number || '',
        vehicle_type: (user as any)?.vehicle_type || '',
        vehicle_plate: (user as any)?.vehicle_plate || '',
    });

    // Track form changes
    useEffect(() => {
        const initialData = {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.address || '',
            license_number: (user as any)?.license_number || '',
            vehicle_type: (user as any)?.vehicle_type || '',
            vehicle_plate: (user as any)?.vehicle_plate || '',
        };

        const currentData = profileForm.data;
        const hasChanges = Object.keys(initialData).some(
            key => currentData[key as keyof ProfileFormData] !== initialData[key as keyof ProfileFormData]
        );
        setHasChanges(hasChanges);
    }, [profileForm.data, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/DriverSide/Profile', { // CHANGED: Correct route
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                setHasChanges(false);
            },
        });
    };

    const handleCancel = () => {
        profileForm.reset();
        setIsEditing(false);
        setHasChanges(false);
    };

    const handleEditToggle = () => {
        if (isEditing && hasChanges) {
            // If editing and has changes, show confirmation
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                handleCancel();
            }
        } else {
            setIsEditing(!isEditing);
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

    const stats = [
        { label: 'Total Rides', value: '47', icon: Car, color: 'text-emerald-600' },
        { label: 'Rating', value: '4.8', icon: Star, color: 'text-yellow-600' },
        { label: 'Acceptance', value: '98%', icon: Award, color: 'text-blue-600' },
        { label: 'This Month', value: '36h', icon: Clock, color: 'text-purple-600' },
    ];

    return (
        <DriverLayout>
            <Head title="Driver Profile" />
            
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
                                    onClick={handleEditToggle}
                                    disabled={profileForm.processing}
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
                                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                                        <AvatarImage src={user?.avatar} alt={user?.name} />
                                        <AvatarFallback className="text-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
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
                                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-background text-foreground border-input disabled:opacity-50 disabled:cursor-not-allowed"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
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
                                Your professional driver details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="license_number" className="text-foreground">Driver's License Number</Label>
                                    <Input
                                        id="license_number"
                                        value={profileForm.data.license_number}
                                        onChange={(e) => profileForm.setData('license_number', e.target.value)}
                                        disabled={!isEditing}
                                        className="bg-background text-foreground border-input disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="N01-23-456789"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_type" className="text-foreground">Vehicle Type</Label>
                                    <Input
                                        id="vehicle_type"
                                        value={profileForm.data.vehicle_type}
                                        onChange={(e) => profileForm.setData('vehicle_type', e.target.value)}
                                        disabled={!isEditing}
                                        className="bg-background text-foreground border-input disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Toyota Vios"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle_plate" className="text-foreground">Vehicle Plate Number</Label>
                                    <Input
                                        id="vehicle_plate"
                                        value={profileForm.data.vehicle_plate}
                                        onChange={(e) => profileForm.setData('vehicle_plate', e.target.value)}
                                        disabled={!isEditing}
                                        className="bg-background text-foreground border-input disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="ABC 123"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Driver Since</Label>
                                    <div className="flex items-center gap-2 p-2 text-muted-foreground bg-accent rounded-md">
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
                                        <div key={index} className="text-center p-4 bg-accent rounded-lg border border-border">
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