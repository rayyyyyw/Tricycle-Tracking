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
    MapPin, 
    Phone, 
    Mail, 
    Shield, 
    AlertTriangle,
    Moon,
    Sun,
    Laptop
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { type SharedData } from '@/types';

export default function PassengerSettings() {
    const { auth } = usePage<SharedData>().props;
    
    // Get current theme from localStorage or default to 'light'
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

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.')) {
            router.delete('/profile', {
                onSuccess: () => {
                    router.visit('/');
                },
                onError: (errors) => {
                    alert('Failed to delete account. Please try again.');
                }
            });
        }
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

    return (
        <PassengerLayout>
            <Head title="Settings" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your passenger account preferences</p>
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
                                <Input id="fullName" defaultValue={auth.user.name} className="text-foreground" />
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                                <Input id="email" type="email" defaultValue={auth.user.email} className="text-foreground" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone" className="text-foreground">Contact Number</Label>
                                <Input id="phone" defaultValue="+63 912 345 6789" className="text-foreground" />
                            </div>
                            <div>
                                <Label htmlFor="address" className="text-foreground">Home Address</Label>
                                <Input id="address" defaultValue="123 Main Street, Manila City" className="text-foreground" />
                            </div>
                        </div>
                        <Button>Save Personal Information</Button>
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
                                <Input id="emergencyName" defaultValue="Maria Santos" className="text-foreground" />
                            </div>
                            <div>
                                <Label htmlFor="emergencyPhone" className="text-foreground">Contact Number</Label>
                                <Input id="emergencyPhone" defaultValue="+63 917 654 3210" className="text-foreground" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="emergencyRelationship" className="text-foreground">Relationship</Label>
                            <Input id="emergencyRelationship" defaultValue="Mother" className="text-foreground" />
                        </div>
                        <Button variant="outline">Save Emergency Contact</Button>
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
                        <Button variant="outline" onClick={() => console.log('Saving notifications:', notifications)}>
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
        </PassengerLayout>
    );
}