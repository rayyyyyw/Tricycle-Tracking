import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
    Bell,
    CheckCircle,
    Eye,
    EyeOff,
    Laptop,
    Moon,
    Settings,
    Shield,
    Sun,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuthUser {
    user?: {
        name?: string;
        email?: string;
    };
}

export default function PassengerSettings() {
    const { auth } = usePage<{ auth: AuthUser }>().props;
    const user = auth.user;

    const [appearance, setAppearance] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('appearance') || 'light';
        }
        return 'light';
    });

    const [language, setLanguage] = useState('en');
    const [notifications, setNotifications] = useState({
        rideUpdates: true,
        promotions: true,
        safetyUpdates: true,
    });

    const [loading, setLoading] = useState({
        deleteAccount: false,
    });

    // Success notification state
    const [showSuccess, setShowSuccess] = useState({
        notifications: false,
    });

    // Delete account modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Apply theme when it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = document.documentElement;

            // Remove all theme classes first
            root.classList.remove('light', 'dark');

            // Apply the selected theme (use 'appearance' key for consistency)
            if (appearance === 'system') {
                localStorage.setItem('appearance', 'system');
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.add('light');
                }
            } else {
                localStorage.setItem('appearance', appearance);
                root.classList.add(appearance);
            }
        }
    }, [appearance]);

    // Show success notification and auto-hide after 3 seconds
    const showSuccessNotification = (type: 'notifications') => {
        setShowSuccess((prev) => ({ ...prev, [type]: true }));
        setTimeout(() => {
            setShowSuccess((prev) => ({ ...prev, [type]: false }));
        }, 3000);
    };

    // Handle notification preferences save
    const handleSaveNotifications = () => {
        // Simulate API call for notifications
        console.log('Saving notification preferences:', notifications);
        showSuccessNotification('notifications');
    };

    // Handle delete account
    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteAccount = () => {
        if (!password) {
            alert('Please enter your password to confirm account deletion.');
            return;
        }

        setLoading((prev) => ({ ...prev, deleteAccount: true }));

        router.delete('/passenger/profile', {
            data: { password },
            onSuccess: () => {
                setLoading((prev) => ({ ...prev, deleteAccount: false }));
                setShowDeleteModal(false);
                setPassword('');
                // The user will be redirected by the controller
            },
            onError: (errors) => {
                setLoading((prev) => ({ ...prev, deleteAccount: false }));
                if (errors.password) {
                    alert('Incorrect password. Please try again.');
                } else {
                    alert('Failed to delete account. Please try again.');
                }
                console.error('Failed to delete account:', errors);
            },
        });
    };

    const cancelDeleteAccount = () => {
        setShowDeleteModal(false);
        setPassword('');
    };

    const handleAppearanceChange = (value: string) => {
        setAppearance(value);
    };

    const handleNotificationChange = (key: string, checked: boolean) => {
        setNotifications((prev) => ({
            ...prev,
            [key]: checked,
        }));
    };

    return (
        <PassengerLayout>
            <Head title="Settings" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your account preferences and security
                </p>
            </div>

            {/* Success Notifications */}
            <div className="mb-6 space-y-2">
                {showSuccess.notifications && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span>
                            Notification preferences updated successfully!
                        </span>
                    </div>
                )}
            </div>

            <div className="grid gap-6">
                {/* Appearance Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Settings className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>
                            Customize how the app looks and feels
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <Label
                                    htmlFor="theme"
                                    className="text-foreground"
                                >
                                    Theme
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Choose your preferred theme
                                </p>
                            </div>
                            <Select
                                value={appearance}
                                onValueChange={handleAppearanceChange}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            Light
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            Dark
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <Laptop className="h-4 w-4" />
                                            System
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <Label
                                    htmlFor="language"
                                    className="text-foreground"
                                >
                                    Language
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Choose your preferred language
                                </p>
                            </div>
                            <Select
                                value={language}
                                onValueChange={setLanguage}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="fil">
                                        Filipino
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Bell className="h-5 w-5" />
                            Notification Preferences
                        </CardTitle>
                        <CardDescription>
                            Choose how you want to receive updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="rideNotifications"
                                checked={notifications.rideUpdates}
                                onCheckedChange={(checked) =>
                                    handleNotificationChange(
                                        'rideUpdates',
                                        checked as boolean,
                                    )
                                }
                            />
                            <Label
                                htmlFor="rideNotifications"
                                className="flex-1 text-foreground"
                            >
                                <div>Ride Updates</div>
                                <p className="text-sm text-muted-foreground">
                                    Driver arrival, trip status, and ride
                                    completion
                                </p>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="promoNotifications"
                                checked={notifications.promotions}
                                onCheckedChange={(checked) =>
                                    handleNotificationChange(
                                        'promotions',
                                        checked as boolean,
                                    )
                                }
                            />
                            <Label
                                htmlFor="promoNotifications"
                                className="flex-1 text-foreground"
                            >
                                <div>Promotions & Offers</div>
                                <p className="text-sm text-muted-foreground">
                                    Discounts, special offers, and promotional
                                    deals
                                </p>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="safetyNotifications"
                                checked={notifications.safetyUpdates}
                                onCheckedChange={(checked) =>
                                    handleNotificationChange(
                                        'safetyUpdates',
                                        checked as boolean,
                                    )
                                }
                            />
                            <Label
                                htmlFor="safetyNotifications"
                                className="flex-1 text-foreground"
                            >
                                <div>Safety Updates</div>
                                <p className="text-sm text-muted-foreground">
                                    Important safety information and alerts
                                </p>
                            </Label>
                        </div>
                        <Button onClick={handleSaveNotifications}>
                            Save Notification Preferences
                        </Button>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">
                            Account Information
                        </CardTitle>
                        <CardDescription>
                            Your basic account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label
                                    htmlFor="userName"
                                    className="text-foreground"
                                >
                                    Name
                                </Label>
                                <Input
                                    id="userName"
                                    value={user?.name || ''}
                                    disabled
                                    className="cursor-not-allowed bg-muted text-foreground opacity-70"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="userEmail"
                                    className="text-foreground"
                                >
                                    Email Address
                                </Label>
                                <Input
                                    id="userEmail"
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="cursor-not-allowed bg-muted text-foreground opacity-70"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            To update your personal information, please visit
                            the{' '}
                            <a
                                href="/PassengerSide/profile"
                                className="text-primary hover:underline"
                            >
                                Profile page
                            </a>
                            .
                        </p>
                    </CardContent>
                </Card>

                {/* Danger Zone - Delete Account */}
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <Shield className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-red-600 dark:text-red-400">
                            Permanent actions that cannot be undone
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-red-700 dark:text-red-400">
                                    Delete Account
                                </h4>
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    Once you delete your account, there is no
                                    going back. This will permanently remove all
                                    your data including ride history and
                                    personal information.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                            >
                                Delete My Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                    <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
                        <h3 className="mb-4 text-lg font-semibold text-red-600 dark:text-red-400">
                            Delete Your Account
                        </h3>
                        <p className="mb-4 text-foreground">
                            This action cannot be undone. This will permanently
                            delete your account and remove all your data from
                            our servers.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <Label
                                    htmlFor="confirmPassword"
                                    className="text-foreground"
                                >
                                    Enter your password to confirm:
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        className="bg-background pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={cancelDeleteAccount}
                                    disabled={loading.deleteAccount}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDeleteAccount}
                                    disabled={
                                        loading.deleteAccount || !password
                                    }
                                >
                                    {loading.deleteAccount
                                        ? 'Deleting...'
                                        : 'Delete Account'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PassengerLayout>
    );
}
