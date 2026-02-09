// resources/js/Pages/AdminNav/Profile.tsx
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
import AdminLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Camera, Mail, Save, User } from 'lucide-react';
import { useState } from 'react';

/** Use full URL from backend when present (R2); otherwise /storage/ path for local. */
function getDisplayAvatarUrl(
    adminProfile: { avatar?: string; avatar_url?: string | null } | null,
): string {
    if (!adminProfile) return '';
    if (
        adminProfile.avatar_url &&
        (adminProfile.avatar_url.startsWith('http') ||
            adminProfile.avatar_url.startsWith('//'))
    )
        return adminProfile.avatar_url;
    if (adminProfile.avatar) return `/storage/${adminProfile.avatar}`;
    return '';
}

export default function AdminProfile() {
    const page = usePage<{
        auth: { user: { name?: string; email?: string } };
        adminProfile: { avatar?: string; avatar_url?: string | null };
    }>();
    const user = page.props.auth.user;
    const adminProfile = page.props.adminProfile;

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        avatar: null as File | null,
    });

    const [previewImage, setPreviewImage] = useState('');

    const displayAvatarUrl = profileForm.data.avatar
        ? previewImage
        : getDisplayAvatarUrl(adminProfile ?? null);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Use router.post directly instead of profileForm.post
        router.post(
            '/AdminNav/Profile',
            {
                name: profileForm.data.name,
                email: profileForm.data.email,
                avatar: profileForm.data.avatar,
            },
            {
                preserveScroll: true,
                forceFormData: true,
            },
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
            <div className="container mx-auto max-w-4xl py-6">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Admin Profile
                    </h1>
                    <p className="mt-2 text-muted-foreground">
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
                        <form
                            onSubmit={handleProfileSubmit}
                            className="space-y-8"
                        >
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center space-y-6 border-b pb-8">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium">
                                        Profile Picture
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Click the camera icon to upload a new
                                        photo
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg">
                                        {displayAvatarUrl ? (
                                            <img
                                                src={displayAvatarUrl}
                                                alt={user.name}
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-20 w-20 text-muted-foreground" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute right-4 bottom-4 cursor-pointer rounded-full border-2 border-background bg-primary p-3 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                                    >
                                        <Camera className="h-5 w-5" />
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
                                    <p className="text-center text-sm text-red-600">
                                        {profileForm.errors.avatar}
                                    </p>
                                )}
                            </div>

                            {/* Profile Information Section */}
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium">
                                        Personal Information
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Update your name and contact information
                                    </p>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-base"
                                            >
                                                Full Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    className="h-11 pl-10 text-base"
                                                    value={
                                                        profileForm.data.name
                                                    }
                                                    onChange={(e) =>
                                                        profileForm.setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            {profileForm.errors.name && (
                                                <p className="text-sm text-red-600">
                                                    {profileForm.errors.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-base"
                                            >
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Your email address"
                                                    className="h-11 bg-muted/50 pl-10 text-base"
                                                    value={
                                                        profileForm.data.email
                                                    }
                                                    disabled
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
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
                                    className="flex h-11 items-center gap-2 px-8 text-base"
                                    size="lg"
                                >
                                    <Save className="h-5 w-5" />
                                    {profileForm.processing
                                        ? 'Saving Changes...'
                                        : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
