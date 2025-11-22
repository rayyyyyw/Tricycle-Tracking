// resources/js/Pages/Admin/Settings.tsx
import AdminLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Palette, Bell, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface SettingsFormData {
    theme: 'light' | 'dark' | 'system';
    notifications: {
        email: boolean;
        push: boolean;
        security_alerts: boolean;
    };
    current_password: string;
    password: string;
    password_confirmation: string;
}

export default function AdminSettings() {
    const settingsForm = useForm<SettingsFormData>({
        theme: 'system',
        notifications: {
            email: true,
            push: true,
            security_alerts: true,
        },
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        settingsForm.put('/admin/settings', {
            preserveScroll: true,
            onSuccess: () => {
                settingsForm.reset('current_password', 'password', 'password_confirmation');
            },
        });
    };

    const handleNotificationChange = (key: keyof SettingsFormData['notifications'], checked: boolean) => {
        settingsForm.setData('notifications', {
            ...settingsForm.data.notifications,
            [key]: checked,
        });
    };

    return (
        <AdminLayout>
            <Head title="Admin Settings" />
            <div className="container mx-auto py-6 max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your application preferences
                    </p>
                </div>

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                    {/* Appearance Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Appearance
                            </CardTitle>
                            <CardDescription>
                                Customize how the application looks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Theme</Label>
                                <Select
                                    value={settingsForm.data.theme}
                                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                                        settingsForm.setData('theme', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                Choose how you want to be notified
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Receive updates via email
                                    </div>
                                </div>
                                <Switch
                                    id="email-notifications"
                                    checked={settingsForm.data.notifications.email}
                                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push-notifications">Push Notifications</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Receive browser notifications
                                    </div>
                                </div>
                                <Switch
                                    id="push-notifications"
                                    checked={settingsForm.data.notifications.push}
                                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="security-alerts">Security Alerts</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Important security updates
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

                    {/* Change Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                        value={settingsForm.data.current_password}
                                        onChange={(e) => settingsForm.setData('current_password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-muted-foreground"
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
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            value={settingsForm.data.password}
                                            onChange={(e) => settingsForm.setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3 text-muted-foreground"
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
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={settingsForm.data.password_confirmation}
                                        onChange={(e) => settingsForm.setData('password_confirmation', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={settingsForm.processing}
                            className="flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {settingsForm.processing ? 'Saving...' : 'Save All Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}