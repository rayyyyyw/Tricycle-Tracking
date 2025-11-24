// resources/js/Pages/DriverSide/Settings.tsx
import DriverLayout from '@/layouts/DriverLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Save, Bell, Shield, Eye, EyeOff, Wifi, MapPin, Car, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
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
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });

    // Show alert function
    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ show: true, type, message });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if password is being changed
        const isChangingPassword = settingsForm.data.current_password || 
                                 settingsForm.data.password || 
                                 settingsForm.data.password_confirmation;

        settingsForm.put('/DriverSide/Settings', {
            preserveScroll: true,
            onSuccess: () => {
                // Show success message
                if (isChangingPassword) {
                    showAlert('success', 'Password updated successfully!');
                } else {
                    showAlert('success', 'Settings updated successfully!');
                }
                
                // Reset password fields
                settingsForm.reset('current_password', 'password', 'password_confirmation');
            },
            onError: (errors) => {
                // Show error message for password changes
                if (isChangingPassword) {
                    showAlert('error', 'Failed to update password. Please check your current password and try again.');
                } else {
                    showAlert('error', 'Failed to update settings. Please try again.');
                }
            },
        });
    };

    const handleNotificationChange = (key: keyof SettingsFormData['notifications'], checked: boolean) => {
        settingsForm.setData('notifications', {
            ...settingsForm.data.notifications,
            [key]: checked,
        });
    };

    const handlePreferenceChange = (key: keyof SettingsFormData['preferences'], value: any) => {
        settingsForm.setData('preferences', {
            ...settingsForm.data.preferences,
            [key]: value,
        });
    };

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
            <Head title="Driver Settings" />
            
            {/* Alert Notification */}
            <AlertMessage />

            <div className="container mx-auto py-6 space-y-6 max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Customize your driving experience and preferences
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Notification Settings */}
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <Bell className="w-5 h-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Choose how you want to be notified about rides and updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="new-rides" className="text-foreground">New Ride Requests</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Get notified when new rides are available
                                    </div>
                                </div>
                                <Switch
                                    id="new-rides"
                                    checked={settingsForm.data.notifications.new_rides}
                                    onCheckedChange={(checked) => handleNotificationChange('new_rides', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="ride-updates" className="text-foreground">Ride Updates</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Notifications about ride status changes
                                    </div>
                                </div>
                                <Switch
                                    id="ride-updates"
                                    checked={settingsForm.data.notifications.ride_updates}
                                    onCheckedChange={(checked) => handleNotificationChange('ride_updates', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="promotions" className="text-foreground">Promotions & Offers</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Special offers and bonus opportunities
                                    </div>
                                </div>
                                <Switch
                                    id="promotions"
                                    checked={settingsForm.data.notifications.promotions}
                                    onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="security-alerts" className="text-foreground">Security Alerts</Label>
                                    <div className="text-sm text-muted-foreground">
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
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <Car className="w-5 h-5" />
                                Driving Preferences
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Set your driving preferences and auto-accept rules
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto-accept" className="text-foreground">Auto-Accept Rides</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Automatically accept ride requests
                                    </div>
                                </div>
                                <Switch
                                    id="auto-accept"
                                    checked={settingsForm.data.preferences.auto_accept}
                                    onCheckedChange={(checked) => handlePreferenceChange('auto_accept', checked)}
                                />
                            </div>

                            <div className="space-y-2 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                                <Label htmlFor="max-distance" className="text-foreground">Maximum Ride Distance (km)</Label>
                                <Select
                                    value={settingsForm.data.preferences.max_ride_distance.toString()}
                                    onValueChange={(value) => handlePreferenceChange('max_ride_distance', parseInt(value))}
                                >
                                    <SelectTrigger className="bg-background text-foreground border-input">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border-border text-foreground">
                                        <SelectItem value="5">5 km</SelectItem>
                                        <SelectItem value="10">10 km</SelectItem>
                                        <SelectItem value="15">15 km</SelectItem>
                                        <SelectItem value="20">20 km</SelectItem>
                                        <SelectItem value="25">25 km</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Maximum distance you're willing to travel for a ride
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-card-foreground">
                                <Shield className="w-5 h-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password" className="text-foreground">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                        value={settingsForm.data.current_password}
                                        onChange={(e) => settingsForm.setData('current_password', e.target.value)}
                                        className="bg-background text-foreground border-input pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {settingsForm.errors.current_password && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{settingsForm.errors.current_password}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-foreground">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            value={settingsForm.data.password}
                                            onChange={(e) => settingsForm.setData('password', e.target.value)}
                                            className="bg-background text-foreground border-input pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {settingsForm.errors.password && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{settingsForm.errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-foreground">Confirm New Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={settingsForm.data.password_confirmation}
                                        onChange={(e) => settingsForm.setData('password_confirmation', e.target.value)}
                                        className="bg-background text-foreground border-input"
                                    />
                                    {settingsForm.errors.password_confirmation && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{settingsForm.errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button 
                            type="submit" 
                            disabled={settingsForm.processing}
                            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Save className="w-4 h-4" />
                            {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </DriverLayout>
    );
}