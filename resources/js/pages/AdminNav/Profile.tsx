// resources/js/Pages/AdminNav/Profile.tsx
import AdminLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { User, Mail, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function AdminProfile() {
    const page = usePage<{ auth: { user: { name?: string; email?: string; avatar?: string } } }>();
    const user = page.props.auth.user;

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        avatar: null as File | null,
    });

    const [previewImage, setPreviewImage] = useState(user.avatar || '');

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/admin/profile', {
            preserveScroll: true,
            forceFormData: true, // Important for file uploads
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('avatar', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminLayout>
            <Head title="Admin Profile" />
            <div className="container mx-auto py-6 max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account information
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Image */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Profile Image</CardTitle>
                            <CardDescription>
                                Update your profile photo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-background overflow-hidden">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt={user.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-16 h-16 text-muted-foreground" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Click the camera icon to change photo
                                    </p>
                                    {profileForm.errors.avatar && (
                                        <p className="text-sm text-red-600 mt-2">{profileForm.errors.avatar}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your account's profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="pl-10"
                                                value={profileForm.data.name}
                                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                            />
                                        </div>
                                        {profileForm.errors.name && (
                                            <p className="text-sm text-red-600">{profileForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                className="pl-10"
                                                value={profileForm.data.email}
                                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                            />
                                        </div>
                                        {profileForm.errors.email && (
                                            <p className="text-sm text-red-600">{profileForm.errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <Button 
                                        type="submit" 
                                        disabled={profileForm.processing}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}