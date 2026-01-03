import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Shield, 
    User, 
    Phone as PhoneIcon,
    Home,
    Contact,
    X,
    Loader2,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    MapPin
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface InfoStatus {
    hasPhone: boolean;
    hasAddress: boolean;
    hasEmergencyContact: boolean;
    isComplete: boolean;
    missingFields: string[];
}

interface ProfileRestrictionScreenProps {
    infoStatus: InfoStatus;
    onProfileCompleted: () => void;
}

function ProfileRestrictionScreen({ infoStatus, onProfileCompleted }: ProfileRestrictionScreenProps) {
    const [isChecking, setIsChecking] = useState(false);
    const [showMissingFieldsPrompt, setShowMissingFieldsPrompt] = useState(false);

    const handleRefreshCheck = () => {
        setIsChecking(true);
        router.reload({ only: ['auth'] });
        setTimeout(() => {
            setIsChecking(false);
            onProfileCompleted();
        }, 1000);
    };

    const handleCompleteProfileClick = () => {
        if (!infoStatus.isComplete) {
            setShowMissingFieldsPrompt(true);
        }
    };

    const completionPercentage = Math.round(([infoStatus.hasPhone, infoStatus.hasAddress, infoStatus.hasEmergencyContact].filter(Boolean).length / 3) * 100);

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
            {/* Missing Fields Prompt */}
            {showMissingFieldsPrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-emerald-500/20 p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Profile Incomplete
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Please complete all required information
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMissingFieldsPrompt(false)}
                                className="ml-auto h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-2">
                                Missing Information:
                            </p>
                            <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                                {!infoStatus.hasPhone && (
                                    <li className="flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        Phone Number
                                    </li>
                                )}
                                {!infoStatus.hasAddress && (
                                    <li className="flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        Home Address
                                    </li>
                                )}
                                {!infoStatus.hasEmergencyContact && (
                                    <li className="flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        Emergency Contact
                                    </li>
                                )}
                            </ul>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            You need to complete all required information in your profile to book rides.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowMissingFieldsPrompt(false)}
                                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </Button>
                            <Link href="/PassengerSide/profile">
                                <Button 
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Go to Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Banner */}
            <Card className="border-emerald-500/20 bg-linear-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/5 dark:to-emerald-600/5">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Finish setting up your profile to start booking rides. All required information is needed for your safety.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress & Requirements Card */}
            <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-500" />
                                Profile Completion
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Complete these requirements to unlock ride booking
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-500">{completionPercentage}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                        </div>
                    </div>
                    
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                    
                    <div className="space-y-4">
                        {/* Phone Number */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border ${
                            infoStatus.hasPhone 
                                ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' 
                                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    infoStatus.hasPhone 
                                        ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20' 
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                    {infoStatus.hasPhone ? <CheckCircle className="w-5 h-5" /> : <PhoneIcon className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone Number</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        For driver communication and ride notifications
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                infoStatus.hasPhone 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {infoStatus.hasPhone ? "Completed" : "Required"}
                            </div>
                        </div>

                        {/* Home Address */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border ${
                            infoStatus.hasAddress 
                                ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' 
                                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    infoStatus.hasAddress 
                                        ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20' 
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                    {infoStatus.hasAddress ? <CheckCircle className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Home Address</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        For accurate pickup locations and emergency situations
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                infoStatus.hasAddress 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {infoStatus.hasAddress ? "Completed" : "Required"}
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className={`flex items-center justify-between p-4 rounded-lg border ${
                            infoStatus.hasEmergencyContact 
                                ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' 
                                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    infoStatus.hasEmergencyContact 
                                        ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20' 
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                    {infoStatus.hasEmergencyContact ? <CheckCircle className="w-5 h-5" /> : <Contact className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Emergency Contact</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        For safety notifications and emergency situations
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                infoStatus.hasEmergencyContact 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                                {infoStatus.hasEmergencyContact ? "Completed" : "Required"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                    onClick={handleCompleteProfileClick}
                >
                    <User className="w-4 h-4 mr-2" />
                    Complete Profile Now
                </Button>
                
                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleRefreshCheck}
                    disabled={isChecking}
                    className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    {isChecking ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Checking...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            I've Completed My Profile
                        </>
                    )}
                </Button>
            </div>

            {/* Safety Notice */}
            <Card className="border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10">
                <CardContent className="p-6">
                    <div className="text-center">
                        <div className="flex justify-center mb-3">
                            <Shield className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 text-base mb-4">Safety First</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-emerald-800 dark:text-emerald-300">
                            <div className="flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Emergency assistance and quick response</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Accurate pickup locations and navigation</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <PhoneIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Driver communication and ride updates</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Contact className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>Emergency contact notifications</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProfileRestrictionScreen;