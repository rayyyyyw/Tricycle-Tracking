// resources/js/Pages/AdminNav/Profile.tsx
import AdminLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { User, Mail, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function AdminProfile() {
    const page = usePage<{ 
        auth: { user: { name?: string; email?: string } },
        adminProfile: { avatar?: string }
    }>();
    const user = page.props.auth.user;
    const adminProfile = page.props.adminProfile;

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        avatar: null as File | null,
    });

    const [previewImage, setPreviewImage] = useState(adminProfile?.avatar ? `/storage/${adminProfile.avatar}` : '');

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use router.post directly instead of profileForm.post
        router.post('/AdminNav/Profile', 
            {
                name: profileForm.data.name,
                email: profileForm.data.email,
                avatar: profileForm.data.avatar,
            },
            {
                preserveScroll: true,
                forceFormData: true,
            }
        );
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
            <div className="container mx-auto py-6 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account information and profile picture
                    </p>
                </div>

                {/* Single Card Layout */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>
                            Update your personal information and profile picture
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit} className="space-y-8">
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center space-y-6 border-b pb-8">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium">Profile Picture</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Click the camera icon to upload a new photo
                                    </p>
                                </div>
                                
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-full bg-muted flex items-center justify-center border-4 border-background overflow-hidden shadow-lg">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt={user.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-20 h-20 text-muted-foreground" />
                                        )}
                                    </div>
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
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                
                                {profileForm.errors.avatar && (
                                    <p className="text-sm text-red-600 text-center">{profileForm.errors.avatar}</p>
                                )}
                            </div>

                            {/* Profile Information Section */}
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium">Personal Information</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Update your name and contact information
                                    </p>
                                </div>

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
                                                />
                                            </div>
                                            {profileForm.errors.name && (
                                                <p className="text-sm text-red-600">{profileForm.errors.name}</p>
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
                                                Email address cannot be changed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-center pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={profileForm.processing}
                                    className="flex items-center gap-2 h-11 px-8 text-base"
                                    size="lg"
                                >
                                    <Save className="w-5 h-5" />
                                    {profileForm.processing ? 'Saving Changes...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}