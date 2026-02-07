import AdminLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Save, Palette, Bell, Shield, Eye, EyeOff, CheckCircle, XCircle, Wrench, FileText, Users, Plus, Trash2, Settings2, Upload, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect, useCallback, useRef } from 'react';

interface SettingsFormData {
    theme: 'light' | 'dark' | 'system';
    notifications: {
        email: boolean;
        push: boolean;
        security_alerts: boolean;
    };
    maintenance_mode: boolean;
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

export interface LandingAboutHighlight {
    icon: string;
    title: string;
    desc: string;
}

export interface LandingFeature {
    icon: string;
    title: string;
    description: string;
}

export interface LandingHowItWorksStep {
    step: string;
    title: string;
    desc: string;
}

export interface LandingTeamMember {
    name: string;
    role: string;
    avatar: string;
    location?: string;
    description?: string;
    isAdviser: boolean;
}

export interface LandingPageContentData {
    about_title: string | null;
    about_subtitle: string | null;
    about_paragraphs: string[] | null;
    about_highlights: LandingAboutHighlight[] | null;
    team_subtitle: string | null;
    team_members: LandingTeamMember[] | null;
    features: LandingFeature[] | null;
    how_it_works: LandingHowItWorksStep[] | null;
}

/** Default about/team content when none from server */
function getDefaultLandingContent(): LandingPageContentData {
    return {
        about_title: null,
        about_subtitle: null,
        about_paragraphs: null,
        about_highlights: [
            { icon: '👤', title: 'Passengers', desc: 'Book rides, track your tricycle in real time, and pay seamlessly.' },
            { icon: '🚲', title: 'Drivers', desc: 'Manage availability, navigate optimized routes, and accept bookings.' },
            { icon: '📊', title: 'Admins', desc: 'Oversee the fleet with analytics, smart alerts, and fleet control.' },
        ],
        features: [
            { icon: '📍', title: 'Real-time Tracking', description: 'Live GPS location tracking with accurate positioning and route history.' },
            { icon: '📊', title: 'Fleet Analytics', description: 'Comprehensive insights into fleet performance and operational metrics.' },
            { icon: '🔔', title: 'Smart Alerts', description: 'Instant notifications for maintenance, speed limits, and geofencing.' },
            { icon: '🛣️', title: 'Route Optimization', description: 'Smart routing to reduce fuel costs and improve delivery times.' },
            { icon: '📱', title: 'Mobile Access', description: 'Monitor your fleet from anywhere with our mobile-friendly dashboard.' },
            { icon: '💾', title: 'Data Export', description: 'Export reports and data for analysis and record keeping.' },
        ],
        how_it_works: [
            { step: '1', title: 'Sign Up', desc: 'Create your account' },
            { step: '2', title: 'Add Devices', desc: 'Install IoT trackers' },
            { step: '3', title: 'Monitor', desc: 'View your dashboard' },
            { step: '4', title: 'Optimize', desc: 'Improve operations' },
        ],
        team_subtitle: null,
        team_members: [
            { name: 'Ray Georpe', role: 'Team Member', avatar: '👨‍💻', location: '', description: '', isAdviser: false },
            { name: 'Team Member 2', role: 'Team Member', avatar: '👩‍💻', location: '', description: '', isAdviser: false },
            { name: 'Adviser Name', role: 'Project Adviser', avatar: '🎓', location: '', description: '', isAdviser: true },
        ],
    };
}

interface LandingFormData {
    about_title: string;
    about_subtitle: string;
    about_paragraphs: string[];
    about_highlights: LandingAboutHighlight[];
    features: LandingFeature[];
    how_it_works: LandingHowItWorksStep[];
    team_subtitle: string;
    team_members: LandingTeamMember[];
}

interface PageProps {
    adminProfile?: AdminProfile;
    maintenanceMode?: boolean;
    landingPageContent?: LandingPageContentData;
    [key: string]: unknown;
}

interface AlertState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}

// Function to get initial theme (localStorage first, then adminProfile, then light default)
function getInitialTheme(adminTheme?: string): string {
    if (typeof window !== 'undefined') {
        const savedAppearance = localStorage.getItem('appearance');
        if (savedAppearance) return savedAppearance;
    }
    return adminTheme || 'light';
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
    
    // Save to localStorage for persistence (use 'appearance' key for consistency)
    localStorage.setItem('appearance', theme);
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
        maintenance_mode: (page.props.maintenanceMode as boolean) ?? false,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);
    const [uploadingMemberIndex, setUploadingMemberIndex] = useState<number | null>(null);

    /** Ref to latest form data so async upload callback always merges with current state (fixes multiple photos disappearing) */
    const landingFormDataRef = useRef<LandingFormData | null>(null);

    /** Resolve team member avatar to a display URL (storage path -> /storage/..., or full URL as-is) */
    const getTeamMemberImageUrl = useCallback((avatar: string): string | null => {
        if (!avatar) return null;
        if (avatar.startsWith('http') || avatar.startsWith('/')) return avatar;
        if (/\.(jpe?g|png|gif|webp)$/i.test(avatar) || avatar.startsWith('team-members/')) return `/storage/${avatar}`;
        return null;
    }, []);

    const serverLanding = page.props.landingPageContent as LandingPageContentData | undefined;
    const defaults = getDefaultLandingContent();
    const landing: LandingPageContentData = serverLanding
        ? { ...defaults, ...serverLanding }
        : defaults;

    const landingForm = useForm<LandingFormData>({
        about_title: landing.about_title ?? '',
        about_subtitle: landing.about_subtitle ?? '',
        about_paragraphs: Array.isArray(landing.about_paragraphs) && landing.about_paragraphs.length > 0
            ? landing.about_paragraphs
            : ['', ''],
        about_highlights: Array.isArray(landing.about_highlights) && landing.about_highlights.length > 0
            ? landing.about_highlights
            : defaults.about_highlights ?? [],
        features: Array.isArray(landing.features) && landing.features.length > 0
            ? landing.features
            : defaults.features ?? [],
        how_it_works: Array.isArray(landing.how_it_works) && landing.how_it_works.length > 0
            ? landing.how_it_works
            : defaults.how_it_works ?? [],
        team_subtitle: landing.team_subtitle ?? 'The people behind TriGo',
        team_members: Array.isArray(landing.team_members) && landing.team_members.length > 0
            ? landing.team_members.map((member: LandingTeamMember) => ({
                ...member,
                location: member.location ?? '',
                description: member.description ?? '',
            }))
            : defaults.team_members ?? [],
    });

    // Keep ref in sync with form data for upload callback (must run in effect, not during render)
    useEffect(() => {
        landingFormDataRef.current = landingForm.data;
    }, [landingForm.data]);

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

    const handleMaintenanceToggle = (checked: boolean) => {
        setMaintenanceLoading(true);
        settingsForm.setData('maintenance_mode', checked);
        router.post('/admin/settings/maintenance', { maintenance_mode: checked }, {
            preserveScroll: true,
            onSuccess: () => {
                showAlert('success', checked
                    ? 'Maintenance mode enabled. Only admins can access the app.'
                    : 'Maintenance mode disabled. The app is now accessible.');
            },
            onError: () => showAlert('error', 'Failed to update maintenance mode.'),
            onFinish: () => setMaintenanceLoading(false),
        });
    };

    const handleLandingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use POST so request body is reliably received (PUT + JSON body can be dropped by some stacks)
        landingForm.post('/admin/settings/landing-page', {
            preserveScroll: true,
            onSuccess: () => showAlert('success', 'About page content updated successfully.'),
            onError: () => showAlert('error', 'Failed to update about page. Please try again.'),
        });
    };

    const addParagraph = () => {
        landingForm.setData('about_paragraphs', [...landingForm.data.about_paragraphs, '']);
    };
    const setParagraph = (index: number, value: string) => {
        const next = [...landingForm.data.about_paragraphs];
        next[index] = value;
        landingForm.setData('about_paragraphs', next);
    };
    const removeParagraph = (index: number) => {
        const next = landingForm.data.about_paragraphs.filter((_: string, i: number) => i !== index);
        landingForm.setData('about_paragraphs', next);
    };

    const addHighlight = () => {
        landingForm.setData('about_highlights', [...landingForm.data.about_highlights, { icon: '✨', title: '', desc: '' }]);
    };
    const setHighlight = (index: number, field: keyof LandingAboutHighlight, value: string) => {
        const next = landingForm.data.about_highlights.map((h, i) =>
            i === index ? { ...h, [field]: value } : h
        );
        landingForm.setData('about_highlights', next);
    };
    const removeHighlight = (index: number) => {
        landingForm.setData('about_highlights', landingForm.data.about_highlights.filter((_: LandingAboutHighlight, i: number) => i !== index));
    };

    const addFeature = () => {
        landingForm.setData('features', [...landingForm.data.features, { icon: '✨', title: '', description: '' }]);
    };
    const setFeature = (index: number, field: keyof LandingFeature, value: string) => {
        const next = landingForm.data.features.map((f, i) =>
            i === index ? { ...f, [field]: value } : f
        );
        landingForm.setData('features', next);
    };
    const removeFeature = (index: number) => {
        landingForm.setData('features', landingForm.data.features.filter((_: LandingFeature, i: number) => i !== index));
    };

    const addHowItWorksStep = () => {
        const nextNum = String(landingForm.data.how_it_works.length + 1);
        landingForm.setData('how_it_works', [...landingForm.data.how_it_works, { step: nextNum, title: '', desc: '' }]);
    };
    const setHowItWorksStep = (index: number, field: keyof LandingHowItWorksStep, value: string) => {
        const next = landingForm.data.how_it_works.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        );
        landingForm.setData('how_it_works', next);
    };
    const removeHowItWorksStep = (index: number) => {
        landingForm.setData('how_it_works', landingForm.data.how_it_works.filter((_: LandingHowItWorksStep, i: number) => i !== index));
    };

    const addTeamMember = () => {
        landingForm.setData('team_members', [...landingForm.data.team_members, { name: '', role: '', avatar: '', location: '', description: '', isAdviser: false }]);
    };
    const setTeamMember = (index: number, field: keyof LandingTeamMember, value: string | boolean) => {
        const next = landingForm.data.team_members.map((m, i) =>
            i === index ? { ...m, [field]: value } : m
        );
        landingForm.setData('team_members', next);
    };
    const removeTeamMember = (index: number) => {
        landingForm.setData('team_members', landingForm.data.team_members.filter((_: LandingTeamMember, i: number) => i !== index));
    };

    const handleTeamMemberPhotoChange = useCallback((index: number, file: File | null) => {
        if (!file) return;
        setUploadingMemberIndex(index);
        const formData = new FormData();
        formData.append('image', file);
        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        fetch('/admin/settings/team-member-image', {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
            credentials: 'same-origin',
        })
            .then((res) => res.json())
            .then((data: { path?: string }) => {
                if (!data.path) return;
                const formData = landingFormDataRef.current;
                if (!formData?.team_members) return;
                const current = formData.team_members;
                const next = current.map((m: LandingTeamMember, i: number) =>
                    i === index ? { ...m, avatar: data.path as string } : { ...m }
                );
                landingForm.setData('team_members', next);
            })
            .catch(() => showAlert('error', 'Failed to upload image. Use JPG, PNG, GIF or WebP under 2MB.'))
            .finally(() => setUploadingMemberIndex(null));
    }, [showAlert, landingForm]);

    return (
        <AdminLayout>
            <Head title="Admin Settings" />
            <AlertMessage alert={alert} setAlert={setAlert} />

            <div className="space-y-6">
                {/* Header - Bookings style */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                                <Settings2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-14">
                            Manage your application preferences, landing page features, how it works, and about content
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 rounded-lg bg-muted/60 p-1">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="landing" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Landing Page
                            {(landingForm.data.team_members?.length ?? 0) > 0 && (
                                <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {landingForm.data.team_members.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* General tab: Maintenance, Appearance, Notifications, Password - single form */}
                    <TabsContent value="general" className="mt-6">
                        <Card className="border-dashed sm:border-solid">
                            <CardContent className="pt-6">
                                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                                    {/* Maintenance Mode */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-medium mb-1">Maintenance Mode</h3>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                When enabled, only admins can access the app. Takes effect immediately.
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="maintenance-mode" className="text-sm">Enable Maintenance Mode</Label>
                                                <Switch
                                                    id="maintenance-mode"
                                                    checked={settingsForm.data.maintenance_mode}
                                                    onCheckedChange={handleMaintenanceToggle}
                                                    disabled={maintenanceLoading}
                                                />
                                            </div>
                                        </div>

                                        <hr className="border-border" />

                                        {/* Appearance */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <Palette className="w-4 h-4" /> Appearance
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3">Choose how the application looks.</p>
                                            <div className="space-y-2">
                                                <Label htmlFor="theme">Theme</Label>
                                                <Select
                                                    value={settingsForm.data.theme}
                                                    onValueChange={(value: 'light' | 'dark' | 'system') =>
                                                        settingsForm.setData('theme', value)
                                                    }
                                                >
                                                    <SelectTrigger id="theme" className="max-w-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="light">Light</SelectItem>
                                                        <SelectItem value="dark">Dark</SelectItem>
                                                        <SelectItem value="system">System</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <hr className="border-border" />

                                        {/* Notifications */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <Bell className="w-4 h-4" /> Notifications
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3">Choose how you want to be notified.</p>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="email-notifications" className="text-sm">Email</Label>
                                                    <Switch
                                                        id="email-notifications"
                                                        checked={settingsForm.data.notifications.email}
                                                        onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="push-notifications" className="text-sm">Push</Label>
                                                    <Switch
                                                        id="push-notifications"
                                                        checked={settingsForm.data.notifications.push}
                                                        onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="security-alerts" className="text-sm">Security alerts</Label>
                                                    <Switch
                                                        id="security-alerts"
                                                        checked={settingsForm.data.notifications.security_alerts}
                                                        onCheckedChange={(checked) => handleNotificationChange('security_alerts', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-border" />

                                        {/* Change Password */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <Shield className="w-4 h-4" /> Change Password
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3">Update your password to keep your account secure.</p>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="current_password">Current password</Label>
                                                    <div className="relative max-w-xs">
                                                        <Input
                                                            id="current_password"
                                                            type={showCurrentPassword ? 'text' : 'password'}
                                                            placeholder="Enter current password"
                                                            value={settingsForm.data.current_password}
                                                            onChange={(e) => settingsForm.setData('current_password', e.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        >
                                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {settingsForm.errors.current_password && (
                                                        <p className="text-sm text-red-600">{settingsForm.errors.current_password}</p>
                                                    )}
                                                </div>
                                                <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="password">New password</Label>
                                                        <div className="relative">
                                                            <Input
                                                                id="password"
                                                                type={showNewPassword ? 'text' : 'password'}
                                                                placeholder="New password"
                                                                value={settingsForm.data.password}
                                                                onChange={(e) => settingsForm.setData('password', e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                                                        <Label htmlFor="password_confirmation">Confirm new password</Label>
                                                        <Input
                                                            id="password_confirmation"
                                                            type={showNewPassword ? 'text' : 'password'}
                                                            placeholder="Confirm"
                                                            value={settingsForm.data.password_confirmation}
                                                            onChange={(e) => settingsForm.setData('password_confirmation', e.target.value)}
                                                        />
                                                        {settingsForm.errors.password_confirmation && (
                                                            <p className="text-sm text-red-600">{settingsForm.errors.password_confirmation}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <Button type="submit" disabled={settingsForm.processing} className="gap-2">
                                                <Save className="w-4 h-4" />
                                                {settingsForm.processing ? 'Saving...' : 'Save settings'}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* About Page tab - own form, no nesting */}
                    <TabsContent value="landing" className="mt-6">
                        <Card className="border-dashed sm:border-solid">
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-6">
                                    Control the About section and Meet the Team on your public about page. Changes appear as soon as you save.
                                </p>
                                <form onSubmit={handleLandingSubmit} className="space-y-8">
                                {/* About Section */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">About Section</h4>
                                    <div className="space-y-2">
                                        <Label htmlFor="about_title">About heading (e.g. &quot;About TriGo&quot;)</Label>
                                        <Input
                                            id="about_title"
                                            value={landingForm.data.about_title}
                                            onChange={(e) => landingForm.setData('about_title', e.target.value)}
                                            placeholder="About TriGo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="about_subtitle">Subtitle</Label>
                                        <Input
                                            id="about_subtitle"
                                            value={landingForm.data.about_subtitle}
                                            onChange={(e) => landingForm.setData('about_subtitle', e.target.value)}
                                            placeholder="Smart tricycle monitoring for modern communities"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Description paragraphs</Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={addParagraph} className="gap-1">
                                                <Plus className="w-4 h-4" /> Add
                                            </Button>
                                        </div>
                                        {landingForm.data.about_paragraphs.map((p: string, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <Textarea
                                                    value={p}
                                                    onChange={(e) => setParagraph(i, e.target.value)}
                                                    placeholder="Paragraph text..."
                                                    rows={2}
                                                    className="flex-1"
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeParagraph(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Role highlights (icon, title, description)</Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={addHighlight} className="gap-1">
                                                <Plus className="w-4 h-4" /> Add
                                            </Button>
                                        </div>
                                        {landingForm.data.about_highlights.map((h: LandingAboutHighlight, i: number) => (
                                            <div key={i} className="flex flex-wrap gap-2 items-start p-3 rounded-lg border bg-muted/30">
                                                <Input
                                                    placeholder="Icon (emoji)"
                                                    value={h.icon}
                                                    onChange={(e) => setHighlight(i, 'icon', e.target.value)}
                                                    className="w-16 text-center"
                                                />
                                                <Input
                                                    placeholder="Title"
                                                    value={h.title}
                                                    onChange={(e) => setHighlight(i, 'title', e.target.value)}
                                                    className="flex-1 min-w-[100px]"
                                                />
                                                <Input
                                                    placeholder="Description"
                                                    value={h.desc}
                                                    onChange={(e) => setHighlight(i, 'desc', e.target.value)}
                                                    className="w-full sm:flex-1 min-w-[120px]"
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlight(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Features Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Features (Landing Page)</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Features (icon, title, description)</Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={addFeature} className="gap-1">
                                                <Plus className="w-4 h-4" /> Add
                                            </Button>
                                        </div>
                                        {landingForm.data.features.map((f: LandingFeature, i: number) => (
                                            <div key={i} className="flex flex-wrap gap-2 items-start p-3 rounded-lg border bg-muted/30">
                                                <Input
                                                    placeholder="Icon (emoji)"
                                                    value={f.icon}
                                                    onChange={(e) => setFeature(i, 'icon', e.target.value)}
                                                    className="w-16 text-center"
                                                />
                                                <Input
                                                    placeholder="Title"
                                                    value={f.title}
                                                    onChange={(e) => setFeature(i, 'title', e.target.value)}
                                                    className="flex-1 min-w-[100px]"
                                                />
                                                <Input
                                                    placeholder="Description"
                                                    value={f.description}
                                                    onChange={(e) => setFeature(i, 'description', e.target.value)}
                                                    className="w-full sm:flex-1 min-w-[120px]"
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* How It Works Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">How It Works (Landing Page)</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Steps (number, title, description)</Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={addHowItWorksStep} className="gap-1">
                                                <Plus className="w-4 h-4" /> Add
                                            </Button>
                                        </div>
                                        {landingForm.data.how_it_works.map((s: LandingHowItWorksStep, i: number) => (
                                            <div key={i} className="flex flex-wrap gap-2 items-start p-3 rounded-lg border bg-muted/30">
                                                <Input
                                                    placeholder="Step (e.g. 1)"
                                                    value={s.step}
                                                    onChange={(e) => setHowItWorksStep(i, 'step', e.target.value)}
                                                    className="w-16 text-center"
                                                />
                                                <Input
                                                    placeholder="Title"
                                                    value={s.title}
                                                    onChange={(e) => setHowItWorksStep(i, 'title', e.target.value)}
                                                    className="flex-1 min-w-[100px]"
                                                />
                                                <Input
                                                    placeholder="Description"
                                                    value={s.desc}
                                                    onChange={(e) => setHowItWorksStep(i, 'desc', e.target.value)}
                                                    className="w-full sm:flex-1 min-w-[120px]"
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeHowItWorksStep(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Team Section */}
                                <div className="space-y-4 border-t pt-6">
                                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Meet the Team
                                    </h4>
                                    <div className="space-y-2">
                                        <Label htmlFor="team_subtitle">Team section subtitle</Label>
                                        <Input
                                            id="team_subtitle"
                                            value={landingForm.data.team_subtitle}
                                            onChange={(e) => landingForm.setData('team_subtitle', e.target.value)}
                                            placeholder="The people behind TriGo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>Team members</Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={addTeamMember} className="gap-1">
                                                <Plus className="w-4 h-4" /> Add member
                                            </Button>
                                        </div>
                                        {landingForm.data.team_members.map((m: LandingTeamMember, i: number) => {
                                            const imageUrl = getTeamMemberImageUrl(m.avatar);
                                            const isUploading = uploadingMemberIndex === i;
                                            return (
                                            <div key={i} className="flex flex-wrap gap-3 items-start p-3 rounded-lg border bg-muted/30">
                                                {/* Team member photo: file upload + preview */}
                                                <div className="flex flex-col items-center gap-1.5 shrink-0">
                                                    <div className="w-20 h-20 rounded-lg bg-muted border flex items-center justify-center overflow-hidden text-2xl relative">
                                                        {isUploading ? (
                                                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                                        ) : imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={m.name || 'Team member'}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        ) : m.avatar ? (
                                                            <span className="text-3xl" title="Emoji avatar">{m.avatar}</span>
                                                        ) : (
                                                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <input
                                                            type="file"
                                                            id={`team-photo-${i}`}
                                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleTeamMemberPhotoChange(i, file);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`team-photo-${i}`}
                                                            className="cursor-pointer inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-input bg-background px-3 text-xs font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                                                        >
                                                            <Upload className="w-3 h-3" /> Choose image
                                                        </Label>
                                                        {m.avatar && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-xs text-muted-foreground hover:text-destructive"
                                                                onClick={() => setTeamMember(i, 'avatar', '')}
                                                            >
                                                                Remove photo
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-[200px] space-y-2">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Name</Label>
                                                            <Input
                                                                placeholder="Name"
                                                                value={m.name}
                                                                onChange={(e) => setTeamMember(i, 'name', e.target.value)}
                                                                className="mt-0.5"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Role</Label>
                                                            <Input
                                                                placeholder="Role"
                                                                value={m.role}
                                                                onChange={(e) => setTeamMember(i, 'role', e.target.value)}
                                                                className="mt-0.5"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Location</Label>
                                                        <Input
                                                            placeholder="e.g. Philippines"
                                                            value={m.location ?? ''}
                                                            onChange={(e) => setTeamMember(i, 'location', e.target.value)}
                                                            className="mt-0.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Description</Label>
                                                        <Textarea
                                                            placeholder="Short bio or description (optional)"
                                                            value={m.description ?? ''}
                                                            onChange={(e) => setTeamMember(i, 'description', e.target.value)}
                                                            className="mt-0.5 min-h-[60px] resize-y"
                                                            rows={2}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={m.isAdviser}
                                                                onChange={(e) => setTeamMember(i, 'isAdviser', e.target.checked)}
                                                                className="rounded border-input"
                                                            />
                                                            <span className="text-sm">Adviser</span>
                                                        </label>
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeTeamMember(i)} className="text-muted-foreground hover:text-destructive gap-1">
                                                            <Trash2 className="w-4 h-4" /> Remove member
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button type="submit" disabled={landingForm.processing} className="gap-2">
                                        <Save className="w-4 h-4" />
                                        {landingForm.processing ? 'Saving...' : 'Save About Page'}
                                    </Button>
                                </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}