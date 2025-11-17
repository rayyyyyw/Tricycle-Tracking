import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    User, 
    Mail,
    Phone,
    MapPin,
    Contact,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

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

export default function PassengerProfile() {
    const { auth } = usePage<{ auth: AuthUser }>().props;
    const user = auth.user;

    // Form states
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

    // Validation states
    const [personalInfoErrors, setPersonalInfoErrors] = useState({
        name: '',
        phone: '',
        address: '',
    });

    const [emergencyContactErrors, setEmergencyContactErrors] = useState({
        name: '',
        phone: '',
        relationship: '',
    });

    const [loading, setLoading] = useState({
        personalInfo: false,
        emergencyContact: false,
    });

    const [showSuccess, setShowSuccess] = useState({
        personalInfo: false,
        emergencyContact: false,
    });

    // Validate personal information
    const validatePersonalInfo = () => {
        const errors = {
            name: '',
            phone: '',
            address: '',
        };

        if (!personalInfo.name.trim()) {
            errors.name = 'Full name is required';
        } else if (personalInfo.name.trim().length < 2) {
            errors.name = 'Full name must be at least 2 characters';
        }

        if (!personalInfo.phone.trim()) {
            errors.phone = 'Contact number is required';
        } else if (personalInfo.phone.replace(/\D/g, '').length < 12) {
            errors.phone = 'Contact number must be exactly 12 digits (including +63)';
        }

        if (!personalInfo.address.trim()) {
            errors.address = 'Home address is required';
        } else if (personalInfo.address.trim().length < 5) {
            errors.address = 'Please enter a valid address';
        }

        setPersonalInfoErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    // Validate emergency contact
    const validateEmergencyContact = () => {
        const errors = {
            name: '',
            phone: '',
            relationship: '',
        };

        if (!emergencyContact.name.trim()) {
            errors.name = 'Contact name is required';
        } else if (emergencyContact.name.trim().length < 2) {
            errors.name = 'Contact name must be at least 2 characters';
        }

        if (!emergencyContact.phone.trim()) {
            errors.phone = 'Contact number is required';
        } else if (emergencyContact.phone.replace(/\D/g, '').length < 12) {
            errors.phone = 'Contact number must be exactly 12 digits (including +63)';
        }

        if (!emergencyContact.relationship.trim()) {
            errors.relationship = 'Relationship is required';
        } else if (emergencyContact.relationship.trim().length < 2) {
            errors.relationship = 'Please specify your relationship';
        }

        setEmergencyContactErrors(errors);
        return !Object.values(errors).some(error => error !== '');
    };

    // Check if forms are valid
    const isPersonalInfoValid = () => {
        return personalInfo.name.trim() && 
               personalInfo.phone.trim() && 
               personalInfo.address.trim() &&
               personalInfo.phone.replace(/\D/g, '').length === 12;
    };

    const isEmergencyContactValid = () => {
        return emergencyContact.name.trim() && 
               emergencyContact.phone.trim() && 
               emergencyContact.relationship.trim() &&
               emergencyContact.phone.replace(/\D/g, '').length === 12;
    };

    // Show success notification
    const showSuccessNotification = (type: 'personalInfo' | 'emergencyContact') => {
        setShowSuccess(prev => ({ ...prev, [type]: true }));
        setTimeout(() => {
            setShowSuccess(prev => ({ ...prev, [type]: false }));
        }, 3000);
    };

    // Handle personal information save
    const handleSavePersonalInfo = () => {
        if (!validatePersonalInfo()) {
            return;
        }

        setLoading(prev => ({ ...prev, personalInfo: true }));

        router.patch('/passenger/profile', personalInfo, {
            onSuccess: () => {
                setLoading(prev => ({ ...prev, personalInfo: false }));
                showSuccessNotification('personalInfo');
            },
            onError: (errors) => {
                setLoading(prev => ({ ...prev, personalInfo: false }));
                console.error('Failed to save personal information:', errors);
            }
        });
    };

    // Handle emergency contact save
    const handleSaveEmergencyContact = () => {
        if (!validateEmergencyContact()) {
            return;
        }

        setLoading(prev => ({ ...prev, emergencyContact: true }));

        router.patch('/passenger/emergency-contact', {
            emergency_name: emergencyContact.name,
            emergency_phone: emergencyContact.phone,
            emergency_relationship: emergencyContact.relationship,
        }, {
            onSuccess: () => {
                setLoading(prev => ({ ...prev, emergencyContact: false }));
                showSuccessNotification('emergencyContact');
            },
            onError: (errors) => {
                setLoading(prev => ({ ...prev, emergencyContact: false }));
                console.error('Failed to save emergency contact:', errors);
            }
        });
    };

    // Handle phone number input
    const handlePhoneChange = (value: string, isEmergency: boolean = false) => {
        const numbersOnly = value.replace(/\D/g, '').slice(0, 12);
        
        if (isEmergency) {
            setEmergencyContact(prev => ({ ...prev, phone: numbersOnly }));
            if (numbersOnly) {
                setEmergencyContactErrors(prev => ({ ...prev, phone: '' }));
            }
        } else {
            setPersonalInfo(prev => ({ ...prev, phone: numbersOnly }));
            if (numbersOnly) {
                setPersonalInfoErrors(prev => ({ ...prev, phone: '' }));
            }
        }
    };

    const handlePersonalInfoChange = (field: string, value: string) => {
        setPersonalInfo(prev => ({ ...prev, [field]: value }));
        if (value && personalInfoErrors[field as keyof typeof personalInfoErrors]) {
            setPersonalInfoErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleEmergencyContactChange = (field: string, value: string) => {
        setEmergencyContact(prev => ({ ...prev, [field]: value }));
        if (value && emergencyContactErrors[field as keyof typeof emergencyContactErrors]) {
            setEmergencyContactErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Format phone number for display
    const formatPhoneDisplay = (phone: string) => {
        if (!phone) return '';
        
        const numbersOnly = phone.replace(/\D/g, '');
        
        if (numbersOnly.startsWith('63')) {
            const remainingDigits = numbersOnly.slice(2);
            if (remainingDigits.length <= 10) {
                const part1 = remainingDigits.slice(0, 3);
                const part2 = remainingDigits.slice(3, 6);
                const part3 = remainingDigits.slice(6, 10);
                return `+63 ${part1} ${part2} ${part3}`.trim();
            }
        }
        
        if (numbersOnly.length <= 10) {
            const part1 = numbersOnly.slice(0, 3);
            const part2 = numbersOnly.slice(3, 6);
            const part3 = numbersOnly.slice(6, 10);
            return `+63 ${part1} ${part2} ${part3}`.trim();
        }
        
        return `+63 ${numbersOnly}`;
    };

    const getPhoneLength = (phone: string) => {
        return phone.replace(/\D/g, '').length;
    };

    const isPhoneComplete = (phone: string) => {
        return phone.replace(/\D/g, '').length === 12;
    };

    return (
        <PassengerLayout>
            <Head title="Profile" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground mt-2">Manage your personal information and emergency contact</p>
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
                                <Label htmlFor="fullName" className="text-foreground">
                                    Full Name *
                                </Label>
                                <Input 
                                    id="fullName" 
                                    value={personalInfo.name}
                                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                                    className={`text-foreground ${personalInfoErrors.name ? 'border-red-500' : ''}`}
                                    placeholder="Enter your full name"
                                />
                                {personalInfoErrors.name && (
                                    <p className="text-sm text-red-500 mt-1">{personalInfoErrors.name}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-foreground">
                                    <Mail className="h-4 w-4 inline mr-1" />
                                    Email Address
                                </Label>
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
                                <Label htmlFor="phone" className="text-foreground">
                                    <Phone className="h-4 w-4 inline mr-1" />
                                    Contact Number *
                                </Label>
                                <Input 
                                    id="phone" 
                                    type="tel"
                                    value={formatPhoneDisplay(personalInfo.phone)}
                                    onChange={(e) => handlePhoneChange(e.target.value, false)}
                                    placeholder="+63 927 867 4244"
                                    className={`text-foreground ${personalInfoErrors.phone ? 'border-red-500' : ''}`}
                                    maxLength={19}
                                />
                                <div className="flex justify-between items-center mt-1">
                                    {personalInfoErrors.phone ? (
                                        <p className="text-sm text-red-500">{personalInfoErrors.phone}</p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            {isPhoneComplete(personalInfo.phone) ? (
                                                <span className="text-green-600">✓ Valid phone number</span>
                                            ) : (
                                                `Enter 12-digit number (${getPhoneLength(personalInfo.phone)}/12)`
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="address" className="text-foreground">
                                    <MapPin className="h-4 w-4 inline mr-1" />
                                    Home Address *
                                </Label>
                                <Input 
                                    id="address" 
                                    value={personalInfo.address}
                                    onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                                    className={`text-foreground ${personalInfoErrors.address ? 'border-red-500' : ''}`}
                                    placeholder="Enter your complete address"
                                />
                                {personalInfoErrors.address && (
                                    <p className="text-sm text-red-500 mt-1">{personalInfoErrors.address}</p>
                                )}
                            </div>
                        </div>
                        <Button 
                            onClick={handleSavePersonalInfo}
                            disabled={loading.personalInfo || !isPersonalInfoValid()}
                            className={!isPersonalInfoValid() ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            {loading.personalInfo ? 'Saving...' : 'Save Personal Information'}
                        </Button>
                        {!isPersonalInfoValid() && (
                            <p className="text-sm text-orange-600">
                                Please fill in all required fields to save your personal information.
                            </p>
                        )}
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
                                <Label htmlFor="emergencyName" className="text-foreground">
                                    <Contact className="h-4 w-4 inline mr-1" />
                                    Contact Name *
                                </Label>
                                <Input 
                                    id="emergencyName" 
                                    value={emergencyContact.name}
                                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                                    className={`text-foreground ${emergencyContactErrors.name ? 'border-red-500' : ''}`}
                                    placeholder="Enter contact's full name"
                                />
                                {emergencyContactErrors.name && (
                                    <p className="text-sm text-red-500 mt-1">{emergencyContactErrors.name}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="emergencyPhone" className="text-foreground">
                                    <Phone className="h-4 w-4 inline mr-1" />
                                    Contact Number *
                                </Label>
                                <Input 
                                    id="emergencyPhone" 
                                    type="tel"
                                    value={formatPhoneDisplay(emergencyContact.phone)}
                                    onChange={(e) => handlePhoneChange(e.target.value, true)}
                                    placeholder="+63 927 867 4244"
                                    className={`text-foreground ${emergencyContactErrors.phone ? 'border-red-500' : ''}`}
                                    maxLength={19}
                                />
                                <div className="flex justify-between items-center mt-1">
                                    {emergencyContactErrors.phone ? (
                                        <p className="text-sm text-red-500">{emergencyContactErrors.phone}</p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            {isPhoneComplete(emergencyContact.phone) ? (
                                                <span className="text-green-600">✓ Valid phone number</span>
                                            ) : (
                                                `Enter 12-digit number (${getPhoneLength(emergencyContact.phone)}/12)`
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="emergencyRelationship" className="text-foreground">
                                Relationship *
                            </Label>
                            <Input 
                                id="emergencyRelationship" 
                                value={emergencyContact.relationship}
                                onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                                className={`text-foreground ${emergencyContactErrors.relationship ? 'border-red-500' : ''}`}
                                placeholder="e.g., Parent, Spouse, Sibling, Friend"
                            />
                            {emergencyContactErrors.relationship && (
                                <p className="text-sm text-red-500 mt-1">{emergencyContactErrors.relationship}</p>
                            )}
                        </div>
                        <Button 
                            onClick={handleSaveEmergencyContact}
                            disabled={loading.emergencyContact || !isEmergencyContactValid()}
                            className={!isEmergencyContactValid() ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            {loading.emergencyContact ? 'Saving...' : 'Save Emergency Contact'}
                        </Button>
                        {!isEmergencyContactValid() && (
                            <p className="text-sm text-orange-600">
                                Please fill in all required fields to save your emergency contact.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}