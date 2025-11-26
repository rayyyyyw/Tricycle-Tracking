// resources/js/Pages/DriverSide/Settings.tsx
import DriverLayout from '@/layouts/DriverLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Bell, Shield, Eye, EyeOff, Car, CheckCircle, XCircle, Moon, Sun, Monitor, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect, useCallback } from 'react';
import { type SharedData } from '@/types';

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

export default function Settings() {
    const { auth } = usePage<SharedData>().props;

    const settingsForm = useForm<SettingsFormData>({
        notifications: {
            new_rides: true,
            ride_updates: true,
            promotions: false,
            security_alerts: true,
        },
        preferences: {
            auto_accept: false,
            preferred_areas: ['Hinoba-an', 'City Center'],
            max_ride_distance: 10,
        },
        appearance: {
            theme: 'system',
        },
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordAlert, setPasswordAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    
    // Delete account states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Show password alert function only
    const showPasswordAlert = (type: 'success' | 'error', message: string) => {
        setPasswordAlert({ show: true, type, message });
        
        setTimeout(() => {
            setPasswordAlert(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    // Auto-save function (no alerts)
    const autoSave = useCallback(() => {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        const timeout = setTimeout(() => {
            settingsForm.put('/DriverSide/Settings', {
                preserveScroll: true,
                // No success/error handlers for auto-save
            });
        }, 1000);

        setSaveTimeout(timeout);
    }, [settingsForm, saveTimeout]);

    // Handle theme change with persistence
    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        settingsForm.setData('appearance', {
            theme,
        });

        // Apply theme immediately
        const root = window.document.documentElement;
        
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        } else {
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
        }

        // Store theme preference in localStorage
        localStorage.setItem('theme', theme);
        
        autoSave();
    };

    // Handle switch changes with auto-save (no alerts)
    const handleNotificationChange = (key: keyof SettingsFormData['notifications'], checked: boolean) => {
        settingsForm.setData('notifications', {
            ...settingsForm.data.notifications,
            [key]: checked,
        });
        autoSave();
    };

    const handlePreferenceChange = (key: keyof SettingsFormData['preferences'], value: any) => {
        settingsForm.setData('preferences', {
            ...settingsForm.data.preferences,
            [key]: value,
        });
        autoSave();
    };

    // Handle password change with alerts only
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const isChangingPassword = settingsForm.data.current_password || 
                                 settingsForm.data.password || 
                                 settingsForm.data.password_confirmation;

        if (!isChangingPassword) return;

        settingsForm.put('/DriverSide/Settings', {
            preserveScroll: true,
            onSuccess: () => {
                showPasswordAlert('success', 'Password updated successfully!');
                settingsForm.reset('current_password', 'password', 'password_confirmation');
            },
            onError: () => {
                showPasswordAlert('error', 'Failed to update password. Please check your current password.');
            },
        });
    };

    // Handle account deletion
    const handleDeleteAccount = () => {
        if (!deletePassword) {
            showPasswordAlert('error', 'Please enter your password to confirm account deletion.');
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
                    showPasswordAlert('error', 'Failed to delete account. Please try again.');
                }
            },
        });
    };

    // Initialize theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
        if (savedTheme) {
            settingsForm.setData('appearance', { theme: savedTheme });
            
            const root = window.document.documentElement;
            if (savedTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.remove('light', 'dark');
                root.classList.add(systemTheme);
            } else {
                root.classList.remove('light', 'dark');
                root.classList.add(savedTheme);
            }
        }
    }, []);

    // Password Alert Component Only
    const PasswordAlertMessage = () => {
        if (!passwordAlert.show) return null;

        return (
            <div className={`fixed top-4 right-4 z-50 max-w-sm ${
                passwordAlert.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                    : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            } rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}>
                <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${
                        passwordAlert.type === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}>
                        {passwordAlert.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <XCircle className="w-5 h-5" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{passwordAlert.message}</p>
                    </div>
                    <button
                        onClick={() => setPasswordAlert(prev => ({ ...prev, show: false }))}
                        className={`flex-shrink-0 ${
                            passwordAlert.type === 'success' 
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
            <Head title="Driver Settings" />
            
            {/* Password Alert Notification Only */}
            <PasswordAlertMessage />

            {/* Delete Account Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            This action cannot be undone. This will permanently delete your driver account and remove all your data from our servers. Please enter your password to confirm.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delete-password" className="text-sm">Password</Label>
                            <div className="relative">
                                <Input
                                    id="delete-password"
                                    type={showDeletePassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="h-9 text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                                >
                                    {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
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
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
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
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Driver Settings</h1>
                                <p className="text-muted-foreground mt-2">
                                    Customize your driving experience and preferences
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
                        {/* Left Side - Quick Settings (Non-sticky) */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Appearance Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Monitor className="w-4 h-4" />
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
                                            onClick={() => handleThemeChange('light')}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-sm ${
                                                settingsForm.data.appearance.theme === 'light'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-background hover:bg-accent'
                                            }`}
                                        >
                                            <Sun className="w-4 h-4" />
                                            <div className="text-left">
                                                <div className="font-medium">Light</div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleThemeChange('dark')}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-sm ${
                                                settingsForm.data.appearance.theme === 'dark'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-background hover:bg-accent'
                                            }`}
                                        >
                                            <Moon className="w-4 h-4" />
                                            <div className="text-left">
                                                <div className="font-medium">Dark</div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleThemeChange('system')}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-sm ${
                                                settingsForm.data.appearance.theme === 'system'
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-background hover:bg-accent'
                                            }`}
                                        >
                                            <Monitor className="w-4 h-4" />
                                            <div className="text-left">
                                                <div className="font-medium">System</div>
                                            </div>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                                    <CardDescription className="text-xs">
                                        Common settings and actions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <div className="font-medium text-sm">Auto-Accept</div>
                                            <div className="text-xs text-muted-foreground">
                                                Auto accept rides
                                            </div>
                                        </div>
                                        <Switch
                                            checked={settingsForm.data.preferences.auto_accept}
                                            onCheckedChange={(checked) => handlePreferenceChange('auto_accept', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <div className="font-medium text-sm">Ride Notifications</div>
                                            <div className="text-xs text-muted-foreground">
                                                New ride alerts
                                            </div>
                                        </div>
                                        <Switch
                                            checked={settingsForm.data.notifications.new_rides}
                                            onCheckedChange={(checked) => handleNotificationChange('new_rides', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Account Deletion Card */}
                            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                        Account Deletion
                                    </CardTitle>
                                    <CardDescription className="text-xs text-red-600/80">
                                        Permanently delete your driver account
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <p className="text-xs text-red-600/80 leading-relaxed">
                                            Once you delete your account, all your data including ride history, profile information, and driver application will be permanently removed. This action cannot be undone.
                                        </p>
                                        
                                        <Button
                                            onClick={() => setDeleteDialogOpen(true)}
                                            variant="destructive"
                                            className="w-full h-9 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </Button>
                                        
                                        <p className="text-xs text-red-600/60 text-center">
                                            You will be required to confirm your password
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Side - Detailed Settings */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Notification Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Bell className="w-4 h-4" />
                                        Notifications
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Choose how you want to be notified
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="new-rides" className="text-sm">New Ride Requests</Label>
                                            <div className="text-xs text-muted-foreground">
                                                Get notified when new rides are available
                                            </div>
                                        </div>
                                        <Switch
                                            id="new-rides"
                                            checked={settingsForm.data.notifications.new_rides}
                                            onCheckedChange={(checked) => handleNotificationChange('new_rides', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="ride-updates" className="text-sm">Ride Updates</Label>
                                            <div className="text-xs text-muted-foreground">
                                                Notifications about ride status changes
                                            </div>
                                        </div>
                                        <Switch
                                            id="ride-updates"
                                            checked={settingsForm.data.notifications.ride_updates}
                                            onCheckedChange={(checked) => handleNotificationChange('ride_updates', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="promotions" className="text-sm">Promotions & Offers</Label>
                                            <div className="text-xs text-muted-foreground">
                                                Special offers and bonus opportunities
                                            </div>
                                        </div>
                                        <Switch
                                            id="promotions"
                                            checked={settingsForm.data.notifications.promotions}
                                            onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="security-alerts" className="text-sm">Security Alerts</Label>
                                            <div className="text-xs text-muted-foreground">
                                                Important security and account updates
                                            </div>
                                        </div>
                                        <Switch
                                            id="security-alerts"
                                            checked={settingsForm.data.notifications.security_alerts}
                                            onCheckedChange={(checked) => handleNotificationChange('security_alerts', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Driving Preferences */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Car className="w-4 h-4" />
                                        Driving Preferences
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Set your driving preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="auto-accept" className="text-sm">Auto-Accept Rides</Label>
                                            <div className="text-xs text-muted-foreground">
                                                Automatically accept ride requests when online
                                            </div>
                                        </div>
                                        <Switch
                                            id="auto-accept"
                                            checked={settingsForm.data.preferences.auto_accept}
                                            onCheckedChange={(checked) => handlePreferenceChange('auto_accept', checked)}
                                        />
                                    </div>

                                    <div className="space-y-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                        <Label htmlFor="max-distance" className="text-sm">Maximum Ride Distance</Label>
                                        <Select
                                            value={settingsForm.data.preferences.max_ride_distance.toString()}
                                            onValueChange={(value) => handlePreferenceChange('max_ride_distance', parseInt(value))}
                                        >
                                            <SelectTrigger className="h-9 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5 kilometers</SelectItem>
                                                <SelectItem value="10">10 kilometers</SelectItem>
                                                <SelectItem value="15">15 kilometers</SelectItem>
                                                <SelectItem value="20">20 kilometers</SelectItem>
                                                <SelectItem value="25">25 kilometers</SelectItem>
                                                <SelectItem value="30">30 kilometers</SelectItem>
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
                                        <Shield className="w-4 h-4" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Update your password
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password" className="text-sm">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="current_password"
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    placeholder="Enter current password"
                                                    value={settingsForm.data.current_password}
                                                    onChange={(e) => settingsForm.setData('current_password', e.target.value)}
                                                    className="h-9 text-sm pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition-colors"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {settingsForm.errors.current_password && (
                                                <p className="text-sm text-red-600">{settingsForm.errors.current_password}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="password" className="text-sm">New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        placeholder="Enter new password"
                                                        value={settingsForm.data.password}
                                                        onChange={(e) => settingsForm.setData('password', e.target.value)}
                                                        className="h-9 text-sm pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition-colors"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {settingsForm.errors.password && (
                                                    <p className="text-sm text-red-600">{settingsForm.errors.password}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation" className="text-sm">Confirm Password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    placeholder="Confirm new password"
                                                    value={settingsForm.data.password_confirmation}
                                                    onChange={(e) => settingsForm.setData('password_confirmation', e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                                {settingsForm.errors.password_confirmation && (
                                                    <p className="text-sm text-red-600">{settingsForm.errors.password_confirmation}</p>
                                                )}
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={settingsForm.processing}
                                            className="h-9 text-sm"
                                        >
                                            {settingsForm.processing ? 'Updating...' : 'Update Password'}
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