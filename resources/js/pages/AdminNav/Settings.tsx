import AdminLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Save, Palette, Bell, Shield, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';

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

interface AdminProfile {
    theme?: string;
    notification_preferences?: {
        email: boolean;
        push: boolean;
        security_alerts: boolean;
    };
    settings?: Record<string, unknown>;
}

interface PageProps {
    adminProfile?: AdminProfile;
    [key: string]: unknown;
}

interface AlertState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}

// Function to get initial theme (localStorage first, then adminProfile, then system)
function getInitialTheme(adminTheme?: string): string {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
    }
    return adminTheme || 'system';
}

// Apply theme function
function applyTheme(theme: string) {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('theme', theme);
}

// Alert Component - moved outside to avoid recreation on every render
const AlertMessage = ({ alert, setAlert }: { 
    alert: AlertState; 
    setAlert: React.Dispatch<React.SetStateAction<AlertState>>;
}) => {
    if (!alert.show) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm ${
            alert.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
        } rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}>
            <div className="flex items-start gap-3">
                <div className={`shrink-0 ${
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
                    className={`shrink-0 ${
                        alert.type === 'success' 
                            ? 'text-green-400 hover:text-green-600' 
                            : 'text-red-400 hover:text-red-600'
                    } transition-colors`}
                >
                    <XCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default function AdminSettings() {
    const page = usePage<PageProps>();
    const adminProfile = page.props.adminProfile;

    // Initialize form with data from adminProfile OR localStorage
    const settingsForm = useForm<SettingsFormData>({
        theme: (getInitialTheme(adminProfile?.theme)) as 'light' | 'dark' | 'system',
        notifications: adminProfile?.notification_preferences || {
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
    const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });

    // Apply theme on component mount and when theme changes
    useEffect(() => {
        applyTheme(settingsForm.data.theme);
    }, [settingsForm.data.theme]);

    // Initialize theme on component mount
    useEffect(() => {
        // Apply the initial theme when component mounts
        applyTheme(settingsForm.data.theme);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Show alert function
    const showAlert = useCallback((type: 'success' | 'error', message: string) => {
        setAlert({ show: true, type, message });
        
        // Auto-hide success alerts after 5 seconds, error alerts after 7 seconds
        const timeout = type === 'success' ? 5000 : 7000;
        const timer = setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, timeout);

        return () => clearTimeout(timer);
    }, []);

    // Handle form submission
    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if password is being changed
        const isChangingPassword = settingsForm.data.current_password || 
                                 settingsForm.data.password || 
                                 settingsForm.data.password_confirmation;

        settingsForm.put('/AdminNav/Settings', {
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
            onError: () => {
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

    return (
        <AdminLayout>
            <Head title="Admin Settings" />
            
            {/* Alert Notification */}
            <AlertMessage alert={alert} setAlert={setAlert} />

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
                            <p className="text-sm text-muted-foreground">
                                Choose how the application appears. System will follow your device's theme settings.
                            </p>
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
                                    {settingsForm.errors.password_confirmation && (
                                        <p className="text-sm text-red-600">{settingsForm.errors.password_confirmation}</p>
                                    )}
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