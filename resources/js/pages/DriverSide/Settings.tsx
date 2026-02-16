// resources/js/Pages/DriverSide/Settings.tsx
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import DriverLayout from '@/layouts/DriverLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    Car,
    CheckCircle,
    Eye,
    EyeOff,
    Monitor,
    Moon,
    Shield,
    Sun,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SettingsFormData {
    notifications: {
        new_rides: boolean;
        ride_updates: boolean;
        promotions: boolean;
        security_alerts: boolean;
    };
    preferences: {
        auto_accept: boolean;
        preferred_areas: string[];
        max_ride_distance: number;
    };
    appearance: {
        theme: 'light' | 'dark' | 'system';
    };
    current_password: string;
    password: string;
    password_confirmation: string;
}

interface AlertState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}

interface PasswordAlertMessageProps {
    show: boolean;
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

// PasswordAlertMessage Component - MOVED OUTSIDE
const PasswordAlertMessage = ({
    show,
    type,
    message,
    onClose,
}: PasswordAlertMessageProps) => {
    if (!show) return null;

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm ${
                type === 'success'
                    ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
            } rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`shrink-0 ${
                        type === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {type === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <XCircle className="h-5 w-5" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className={`shrink-0 ${
                        type === 'success'
                            ? 'text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-400'
                            : 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400'
                    } transition-colors`}
                >
                    <XCircle className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

interface SettingsPageProps {
    settings?: {
        notifications?: {
            new_rides?: boolean;
            ride_updates?: boolean;
            promotions?: boolean;
            security_alerts?: boolean;
        };
        preferences?: {
            auto_accept?: boolean;
            preferred_areas?: string[];
            max_ride_distance?: number;
        };
        appearance?: {
            theme?: 'light' | 'dark' | 'system';
        };
    };
}

export default function Settings() {
    const page = usePage<SettingsPageProps>();
    const savedSettings = page.props.settings || {};

    // Get initial theme from settings, localStorage, or default
    const getInitialTheme = (): 'light' | 'dark' | 'system' => {
        if (savedSettings.appearance?.theme) {
            return savedSettings.appearance.theme;
        }
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('appearance');
            if (stored === 'light' || stored === 'dark' || stored === 'system') {
                return stored;
            }
        }
        return 'light';
    };

    const settingsForm = useForm<SettingsFormData>({
        notifications: {
            new_rides: savedSettings.notifications?.new_rides ?? true,
            ride_updates: savedSettings.notifications?.ride_updates ?? true,
            promotions: savedSettings.notifications?.promotions ?? false,
            security_alerts: savedSettings.notifications?.security_alerts ?? true,
        },
        preferences: {
            auto_accept: savedSettings.preferences?.auto_accept ?? false,
            preferred_areas: savedSettings.preferences?.preferred_areas ?? ['Hinoba-an', 'City Center'],
            max_ride_distance: savedSettings.preferences?.max_ride_distance ?? 10,
        },
        appearance: {
            theme: getInitialTheme(),
        },
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordAlert, setPasswordAlert] = useState<AlertState>({
        show: false,
        type: 'success',
        message: '',
    });
    const [settingsAlert, setSettingsAlert] = useState<AlertState>({
        show: false,
        type: 'success',
        message: '',
    });
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Delete account states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Show password alert function only
    const showPasswordAlert = (type: 'success' | 'error', message: string) => {
        setPasswordAlert({ show: true, type, message });

        setTimeout(() => {
            setPasswordAlert((prev) => ({ ...prev, show: false }));
        }, 5000);
    };

    // Auto-save function with subtle feedback
    const autoSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            settingsForm.put('/DriverSide/Settings', {
                preserveScroll: true,
                onSuccess: () => {
                    setSettingsAlert({
                        show: true,
                        type: 'success',
                        message: 'Settings saved',
                    });
                    setTimeout(() => {
                        setSettingsAlert((prev) => ({ ...prev, show: false }));
                    }, 2000);
                },
                onError: () => {
                    setSettingsAlert({
                        show: true,
                        type: 'error',
                        message: 'Failed to save settings',
                    });
                    setTimeout(() => {
                        setSettingsAlert((prev) => ({ ...prev, show: false }));
                    }, 3000);
                },
            });
        }, 1000);
    }, [settingsForm]);

    // Handle theme change with persistence
    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        settingsForm.setData('appearance', {
            theme,
        });

        // Apply theme immediately
        const root = window.document.documentElement;

        if (theme === 'system') {
            const systemTheme = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches
                ? 'dark'
                : 'light';
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        } else {
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
        }

        // Store theme preference in localStorage (use 'appearance' key for consistency)
        localStorage.setItem('appearance', theme);

        autoSave();
    };

    // Handle switch changes with auto-save (no alerts)
    const handleNotificationChange = (
        key: keyof SettingsFormData['notifications'],
        checked: boolean,
    ) => {
        settingsForm.setData('notifications', {
            ...settingsForm.data.notifications,
            [key]: checked,
        });
        autoSave();
    };

    const handlePreferenceChange = (
        key: keyof SettingsFormData['preferences'],
        value: boolean | number,
    ) => {
        settingsForm.setData('preferences', {
            ...settingsForm.data.preferences,
            [key]: value,
        });
        autoSave();
    };

    // Handle password change with alerts only
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isChangingPassword =
            settingsForm.data.current_password ||
            settingsForm.data.password ||
            settingsForm.data.password_confirmation;

        if (!isChangingPassword) return;

        settingsForm.put('/DriverSide/Settings', {
            preserveScroll: true,
            onSuccess: () => {
                showPasswordAlert('success', 'Password updated successfully!');
                settingsForm.reset(
                    'current_password',
                    'password',
                    'password_confirmation',
                );
            },
            onError: () => {
                showPasswordAlert(
                    'error',
                    'Failed to update password. Please check your current password.',
                );
            },
        });
    };

    // Handle account deletion
    const handleDeleteAccount = () => {
        if (!deletePassword) {
            showPasswordAlert(
                'error',
                'Please enter your password to confirm account deletion.',
            );
            return;
        }

        setDeleteLoading(true);

        router.delete('/DriverSide/Settings', {
            data: { password: deletePassword },
            onSuccess: () => {
                // Redirect happens on the server side
            },
            onError: (errors) => {
                setDeleteLoading(false);
                if (errors.password) {
                    showPasswordAlert('error', errors.password);
                } else {
                    showPasswordAlert(
                        'error',
                        'Failed to delete account. Please try again.',
                    );
                }
            },
        });
    };

    // Initialize theme from saved settings
    useEffect(() => {
        const theme = settingsForm.data.appearance.theme;
        const root = window.document.documentElement;
        
        if (theme === 'system') {
            const systemTheme = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches
                ? 'dark'
                : 'light';
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        } else {
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
        }
        
        // Store in localStorage for consistency
        localStorage.setItem('appearance', theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return (
        <DriverLayout>
            <Head title="Driver Settings" />

            {/* Password Alert Notification Only */}
            <PasswordAlertMessage
                show={passwordAlert.show}
                type={passwordAlert.type}
                message={passwordAlert.message}
                onClose={() =>
                    setPasswordAlert((prev) => ({ ...prev, show: false }))
                }
            />

            {/* Settings Save Alert */}
            {settingsAlert.show && (
                <div
                    className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border p-3 shadow-lg transition-all duration-300 ${
                        settingsAlert.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {settingsAlert.type === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <p className="text-sm font-medium">
                            {settingsAlert.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Delete Account Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            This action cannot be undone. This will permanently
                            delete your driver account and remove all your data
                            from our servers. Please enter your password to
                            confirm.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="delete-password"
                                className="text-sm"
                            >
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="delete-password"
                                    type={
                                        showDeletePassword ? 'text' : 'password'
                                    }
                                    placeholder="Enter your password"
                                    value={deletePassword}
                                    onChange={(e) =>
                                        setDeletePassword(e.target.value)
                                    }
                                    className="h-9 pr-10 text-sm"
                                />
                                <button
                                    type="button"
                                    className="absolute top-2 right-3 text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() =>
                                        setShowDeletePassword(
                                            !showDeletePassword,
                                        )
                                    }
                                >
                                    {showDeletePassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleteLoading}
                            className="sm:flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading || !deletePassword}
                            className="sm:flex-1"
                        >
                            {deleteLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Deleting...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b bg-card">
                    <div className="container mx-auto py-6">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Driver Settings
                                </h1>
                                <p className="mt-2 text-muted-foreground">
                                    Customize your driving experience and
                                    preferences
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto">
                    <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-3">
                        {/* Left Side - Quick Settings (Non-sticky) */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Appearance Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Monitor className="h-4 w-4" />
                                        Appearance
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Choose your preferred theme
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleThemeChange('light')
                                            }
                                            className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-all ${
                                                settingsForm.data.appearance
                                                    .theme === 'light'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-background hover:bg-accent'
                                            }`}
                                        >
                                            <Sun className="h-4 w-4" />
                                            <div className="text-left">
                                                <div className="font-medium">
                                                    Light
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleThemeChange('dark')
                                            }
                                            className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-all ${
                                                settingsForm.data.appearance
                                                    .theme === 'dark'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-background hover:bg-accent'
                                            }`}
                                        >
                                            <Moon className="h-4 w-4" />
                                            <div className="text-left">
                                                <div className="font-medium">
                                                    Dark
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleThemeChange('system')
                                            }
                                            className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-all ${
                                                settingsForm.data.appearance
                                                    .theme === 'system'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-background hover:bg-accent'
                                            }`}
                                        >
                                            <Monitor className="h-4 w-4" />
                                            <div className="text-left">
                                                <div className="font-medium">
                                                    System
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Quick Actions
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Common settings and actions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">
                                                Auto-Accept
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Auto accept rides
                                            </div>
                                        </div>
                                        <Switch
                                            checked={
                                                settingsForm.data.preferences
                                                    .auto_accept
                                            }
                                            onCheckedChange={(checked) =>
                                                handlePreferenceChange(
                                                    'auto_accept',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">
                                                Ride Notifications
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                New ride alerts
                                            </div>
                                        </div>
                                        <Switch
                                            checked={
                                                settingsForm.data.notifications
                                                    .new_rides
                                            }
                                            onCheckedChange={(checked) =>
                                                handleNotificationChange(
                                                    'new_rides',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Account Deletion Card */}
                            <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                        Account Deletion
                                    </CardTitle>
                                    <CardDescription className="text-xs text-red-600/80">
                                        Permanently delete your driver account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <p className="text-xs leading-relaxed text-red-600/80">
                                            Once you delete your account, all
                                            your data including ride history,
                                            profile information, and driver
                                            application will be permanently
                                            removed. This action cannot be
                                            undone.
                                        </p>

                                        <Button
                                            onClick={() =>
                                                setDeleteDialogOpen(true)
                                            }
                                            variant="destructive"
                                            className="h-9 w-full text-sm"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Account
                                        </Button>

                                        <p className="text-center text-xs text-red-600/60">
                                            You will be required to confirm your
                                            password
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Side - Detailed Settings */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Notification Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Bell className="h-4 w-4" />
                                        Notifications
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Choose how you want to be notified
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50">
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="new-rides"
                                                className="text-sm"
                                            >
                                                New Ride Requests
                                            </Label>
                                            <div className="text-xs text-muted-foreground">
                                                Get notified when new rides are
                                                available
                                            </div>
                                        </div>
                                        <Switch
                                            id="new-rides"
                                            checked={
                                                settingsForm.data.notifications
                                                    .new_rides
                                            }
                                            onCheckedChange={(checked) =>
                                                handleNotificationChange(
                                                    'new_rides',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50">
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="ride-updates"
                                                className="text-sm"
                                            >
                                                Ride Updates
                                            </Label>
                                            <div className="text-xs text-muted-foreground">
                                                Notifications about ride status
                                                changes
                                            </div>
                                        </div>
                                        <Switch
                                            id="ride-updates"
                                            checked={
                                                settingsForm.data.notifications
                                                    .ride_updates
                                            }
                                            onCheckedChange={(checked) =>
                                                handleNotificationChange(
                                                    'ride_updates',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50">
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="promotions"
                                                className="text-sm"
                                            >
                                                Promotions & Offers
                                            </Label>
                                            <div className="text-xs text-muted-foreground">
                                                Special offers and bonus
                                                opportunities
                                            </div>
                                        </div>
                                        <Switch
                                            id="promotions"
                                            checked={
                                                settingsForm.data.notifications
                                                    .promotions
                                            }
                                            onCheckedChange={(checked) =>
                                                handleNotificationChange(
                                                    'promotions',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50">
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="security-alerts"
                                                className="text-sm"
                                            >
                                                Security Alerts
                                            </Label>
                                            <div className="text-xs text-muted-foreground">
                                                Important security and account
                                                updates
                                            </div>
                                        </div>
                                        <Switch
                                            id="security-alerts"
                                            checked={
                                                settingsForm.data.notifications
                                                    .security_alerts
                                            }
                                            onCheckedChange={(checked) =>
                                                handleNotificationChange(
                                                    'security_alerts',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Driving Preferences */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Car className="h-4 w-4" />
                                        Driving Preferences
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Set your driving preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent/50">
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="auto-accept"
                                                className="text-sm"
                                            >
                                                Auto-Accept Rides
                                            </Label>
                                            <div className="text-xs text-muted-foreground">
                                                Automatically accept ride
                                                requests when online
                                            </div>
                                        </div>
                                        <Switch
                                            id="auto-accept"
                                            checked={
                                                settingsForm.data.preferences
                                                    .auto_accept
                                            }
                                            onCheckedChange={(checked) =>
                                                handlePreferenceChange(
                                                    'auto_accept',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2 rounded-lg p-3 transition-colors hover:bg-accent/50">
                                        <Label
                                            htmlFor="max-distance"
                                            className="text-sm"
                                        >
                                            Maximum Ride Distance
                                        </Label>
                                        <Select
                                            value={settingsForm.data.preferences.max_ride_distance.toString()}
                                            onValueChange={(value) =>
                                                handlePreferenceChange(
                                                    'max_ride_distance',
                                                    parseInt(value),
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-9 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">
                                                    5 kilometers
                                                </SelectItem>
                                                <SelectItem value="10">
                                                    10 kilometers
                                                </SelectItem>
                                                <SelectItem value="15">
                                                    15 kilometers
                                                </SelectItem>
                                                <SelectItem value="20">
                                                    20 kilometers
                                                </SelectItem>
                                                <SelectItem value="25">
                                                    25 kilometers
                                                </SelectItem>
                                                <SelectItem value="30">
                                                    30 kilometers
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Maximum distance for ride pickup
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Change Password */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Update your password
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handlePasswordSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="current_password"
                                                className="text-sm"
                                            >
                                                Current Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="current_password"
                                                    type={
                                                        showCurrentPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="Enter current password"
                                                    value={
                                                        settingsForm.data
                                                            .current_password
                                                    }
                                                    onChange={(e) =>
                                                        settingsForm.setData(
                                                            'current_password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 pr-10 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-2 right-3 text-muted-foreground transition-colors hover:text-foreground"
                                                    onClick={() =>
                                                        setShowCurrentPassword(
                                                            !showCurrentPassword,
                                                        )
                                                    }
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {settingsForm.errors
                                                .current_password && (
                                                <p className="text-sm text-red-600">
                                                    {
                                                        settingsForm.errors
                                                            .current_password
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="password"
                                                    className="text-sm"
                                                >
                                                    New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={
                                                            showNewPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder="Enter new password"
                                                        value={
                                                            settingsForm.data
                                                                .password
                                                        }
                                                        onChange={(e) =>
                                                            settingsForm.setData(
                                                                'password',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-9 pr-10 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute top-2 right-3 text-muted-foreground transition-colors hover:text-foreground"
                                                        onClick={() =>
                                                            setShowNewPassword(
                                                                !showNewPassword,
                                                            )
                                                        }
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                                {settingsForm.errors
                                                    .password && (
                                                    <p className="text-sm text-red-600">
                                                        {
                                                            settingsForm.errors
                                                                .password
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="password_confirmation"
                                                    className="text-sm"
                                                >
                                                    Confirm Password
                                                </Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type={
                                                        showNewPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder="Confirm new password"
                                                    value={
                                                        settingsForm.data
                                                            .password_confirmation
                                                    }
                                                    onChange={(e) =>
                                                        settingsForm.setData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 text-sm"
                                                />
                                                {settingsForm.errors
                                                    .password_confirmation && (
                                                    <p className="text-sm text-red-600">
                                                        {
                                                            settingsForm.errors
                                                                .password_confirmation
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={settingsForm.processing}
                                            className="h-9 text-sm"
                                        >
                                            {settingsForm.processing
                                                ? 'Updating...'
                                                : 'Update Password'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </DriverLayout>
    );
}
