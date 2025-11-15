import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    User, 
    AlertTriangle,
    Shield,
    Moon,
    Sun,
    Laptop,
    CheckCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface AuthUser {
    user?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        emergency_contact?: {
            name?: string;
            phone?: string;
            relationship?: string;
        };
    };
}

export default function PassengerSettings() {
    const { auth } = usePage<{ auth: AuthUser }>().props;
    
    // Remove the fallback that causes TypeScript errors
    const user = auth.user;
    
    // Form states with safe defaults
    const [personalInfo, setPersonalInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });

    const [emergencyContact, setEmergencyContact] = useState({
        name: user?.emergency_contact?.name || '',
        phone: user?.emergency_contact?.phone || '',
        relationship: user?.emergency_contact?.relationship || '',
    });

    const [appearance, setAppearance] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
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
        personalInfo: false,
        emergencyContact: false,
        deleteAccount: false,
    });

    // Success notification state
    const [showSuccess, setShowSuccess] = useState({
        personalInfo: false,
        emergencyContact: false,
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
            
            // Apply the selected theme
            if (appearance === 'system') {
                localStorage.removeItem('theme');
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.add('light');
                }
            } else {
                localStorage.setItem('theme', appearance);
                root.classList.add(appearance);
            }
        }
    }, [appearance]);

    // Show success notification and auto-hide after 3 seconds
    const showSuccessNotification = (type: 'personalInfo' | 'emergencyContact' | 'notifications') => {
        setShowSuccess(prev => ({ ...prev, [type]: true }));
        setTimeout(() => {
            setShowSuccess(prev => ({ ...prev, [type]: false }));
        }, 3000);
    };

    // Handle personal information save
    const handleSavePersonalInfo = () => {
        setLoading(prev => ({ ...prev, personalInfo: true }));

        router.patch('/passenger/profile', personalInfo, {
            onSuccess: () => {
                setLoading(prev => ({ ...prev, personalInfo: false }));
                showSuccessNotification('personalInfo');
                console.log('Personal information saved successfully');
            },
            onError: (errors) => {
                setLoading(prev => ({ ...prev, personalInfo: false }));
                console.error('Failed to save personal information:', errors);
            }
        });
    };

    // Handle emergency contact save
    const handleSaveEmergencyContact = () => {
        setLoading(prev => ({ ...prev, emergencyContact: true }));

        router.patch('/passenger/emergency-contact', {
            emergency_name: emergencyContact.name,
            emergency_phone: emergencyContact.phone,
            emergency_relationship: emergencyContact.relationship,
        }, {
            onSuccess: () => {
                setLoading(prev => ({ ...prev, emergencyContact: false }));
                showSuccessNotification('emergencyContact');
                console.log('Emergency contact saved successfully');
            },
            onError: (errors) => {
                setLoading(prev => ({ ...prev, emergencyContact: false }));
                console.error('Failed to save emergency contact:', errors);
            }
        });
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

        setLoading(prev => ({ ...prev, deleteAccount: true }));

        router.delete('/passenger/profile', {
            data: { password },
            onSuccess: () => {
                setLoading(prev => ({ ...prev, deleteAccount: false }));
                setShowDeleteModal(false);
                setPassword('');
                // The user will be redirected by the controller
            },
            onError: (errors) => {
                setLoading(prev => ({ ...prev, deleteAccount: false }));
                if (errors.password) {
                    alert('Incorrect password. Please try again.');
                } else {
                    alert('Failed to delete account. Please try again.');
                }
                console.error('Failed to delete account:', errors);
            }
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
        setNotifications(prev => ({
            ...prev,
            [key]: checked
        }));
    };

    // Only allow numbers for phone inputs
    const handlePhoneChange = (value: string, isEmergency: boolean = false) => {
        // Remove any non-digit characters
        const numbersOnly = value.replace(/\D/g, '');
        
        if (isEmergency) {
            setEmergencyContact(prev => ({ ...prev, phone: numbersOnly }));
        } else {
            setPersonalInfo(prev => ({ ...prev, phone: numbersOnly }));
        }
    };

    const handlePersonalInfoChange = (field: string, value: string) => {
        setPersonalInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleEmergencyContactChange = (field: string, value: string) => {
        setEmergencyContact(prev => ({ ...prev, [field]: value }));
    };

    // Format phone number for display (add +63 prefix)
    const formatPhoneDisplay = (phone: string) => {
        if (!phone) return '';
        if (phone.startsWith('63')) return `+${phone}`;
        if (phone.startsWith('+63')) return phone;
        return `+63 ${phone}`;
    };

    return (
        <PassengerLayout>
            <Head title="Settings" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your passenger account preferences</p>
            </div>

            {/* Success Notifications */}
            <div className="space-y-2 mb-6">
                {showSuccess.personalInfo && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Personal information updated successfully!</span>
                    </div>
                )}
                {showSuccess.emergencyContact && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Emergency contact updated successfully!</span>
                    </div>
                )}
                {showSuccess.notifications && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Notification preferences updated successfully!</span>
                    </div>
                )}
            </div>

            <div className="grid gap-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Your basic profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                                <Input 
                                    id="fullName" 
                                    value={personalInfo.name}
                                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                                    className="text-foreground" 
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={personalInfo.email}
                                    disabled
                                    className="text-foreground bg-muted cursor-not-allowed opacity-70" 
                                />
                                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone" className="text-foreground">Contact Number</Label>
                                <Input 
                                    id="phone" 
                                    type="tel"
                                    value={formatPhoneDisplay(personalInfo.phone)}
                                    onChange={(e) => handlePhoneChange(e.target.value, false)}
                                    placeholder="+63 912 345 6789"
                                    className="text-foreground" 
                                />
                                <p className="text-xs text-muted-foreground mt-1">Numbers only (automatically formats with +63)</p>
                            </div>
                            <div>
                                <Label htmlFor="address" className="text-foreground">Home Address</Label>
                                <Input 
                                    id="address" 
                                    value={personalInfo.address}
                                    onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                                    className="text-foreground" 
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={handleSavePersonalInfo}
                            disabled={loading.personalInfo}
                        >
                            {loading.personalInfo ? 'Saving...' : 'Save Personal Information'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Emergency Contact
                        </CardTitle>
                        <CardDescription>Someone we can contact in case of emergency</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="emergencyName" className="text-foreground">Contact Name</Label>
                                <Input 
                                    id="emergencyName" 
                                    value={emergencyContact.name}
                                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                                    className="text-foreground" 
                                />
                            </div>
                            <div>
                                <Label htmlFor="emergencyPhone" className="text-foreground">Contact Number</Label>
                                <Input 
                                    id="emergencyPhone" 
                                    type="tel"
                                    value={formatPhoneDisplay(emergencyContact.phone)}
                                    onChange={(e) => handlePhoneChange(e.target.value, true)}
                                    placeholder="+63 917 654 3210"
                                    className="text-foreground" 
                                />
                                <p className="text-xs text-muted-foreground mt-1">Numbers only (automatically formats with +63)</p>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="emergencyRelationship" className="text-foreground">Relationship</Label>
                            <Input 
                                id="emergencyRelationship" 
                                value={emergencyContact.relationship}
                                onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                                className="text-foreground" 
                            />
                        </div>
                        <Button 
                            onClick={handleSaveEmergencyContact}
                            disabled={loading.emergencyContact}
                        >
                            {loading.emergencyContact ? 'Saving...' : 'Save Emergency Contact'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Sun className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize how the app looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <Label htmlFor="theme" className="text-foreground">Theme</Label>
                                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                            </div>
                            <Select value={appearance} onValueChange={handleAppearanceChange}>
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
                                <Label htmlFor="language" className="text-foreground">Language</Label>
                                <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                            </div>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="fil">Filipino</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                        <CardDescription>Choose how you want to receive updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="rideNotifications" 
                                checked={notifications.rideUpdates}
                                onCheckedChange={(checked) => 
                                    handleNotificationChange('rideUpdates', checked as boolean)
                                }
                            />
                            <Label htmlFor="rideNotifications" className="flex-1 text-foreground">
                                <div>Ride Updates</div>
                                <p className="text-sm text-muted-foreground">Driver arrival, trip status</p>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="promoNotifications" 
                                checked={notifications.promotions}
                                onCheckedChange={(checked) => 
                                    handleNotificationChange('promotions', checked as boolean)
                                }
                            />
                            <Label htmlFor="promoNotifications" className="flex-1 text-foreground">
                                <div>Promotions & Offers</div>
                                <p className="text-sm text-muted-foreground">Discounts and special offers</p>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="safetyNotifications" 
                                checked={notifications.safetyUpdates}
                                onCheckedChange={(checked) => 
                                    handleNotificationChange('safetyUpdates', checked as boolean)
                                }
                            />
                            <Label htmlFor="safetyNotifications" className="flex-1 text-foreground">
                                <div>Safety Updates</div>
                                <p className="text-sm text-muted-foreground">Important safety information</p>
                            </Label>
                        </div>
                        <Button variant="outline" onClick={handleSaveNotifications}>
                            Save Notification Preferences
                        </Button>
                    </CardContent>
                </Card>

                {/* Danger Zone - Delete Account */}
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
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
                                <h4 className="font-medium text-red-700 dark:text-red-400">Delete Account</h4>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                            </div>
                            <Button variant="destructive" onClick={handleDeleteAccount}>
                                Delete My Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                            Delete Your Account
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="confirmPassword" className="text-foreground">
                                    Enter your password to confirm:
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
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
                                    disabled={loading.deleteAccount || !password}
                                >
                                    {loading.deleteAccount ? 'Deleting...' : 'Delete Account'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PassengerLayout>
    );
}