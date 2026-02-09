import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle,
    Contact,
    Home,
    Loader2,
    MapPin,
    Phone as PhoneIcon,
    RefreshCw,
    Shield,
    User,
    X,
} from 'lucide-react';
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

function ProfileRestrictionScreen({
    infoStatus,
    onProfileCompleted,
}: ProfileRestrictionScreenProps) {
    const [isChecking, setIsChecking] = useState(false);
    const [showMissingFieldsPrompt, setShowMissingFieldsPrompt] =
        useState(false);

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

    const completionPercentage = Math.round(
        ([
            infoStatus.hasPhone,
            infoStatus.hasAddress,
            infoStatus.hasEmergencyContact,
        ].filter(Boolean).length /
            3) *
            100,
    );

    return (
        <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-5 p-4 sm:gap-6 sm:p-6">
            {/* Missing Fields Prompt */}
            {showMissingFieldsPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg border border-emerald-500/20 bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                <AlertTriangle className="h-5 w-5 text-emerald-500" />
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
                                onClick={() =>
                                    setShowMissingFieldsPrompt(false)
                                }
                                className="ml-auto h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                            <p className="mb-2 text-sm font-medium text-emerald-800 dark:text-emerald-400">
                                Missing Information:
                            </p>
                            <ul className="space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                                {!infoStatus.hasPhone && (
                                    <li className="flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3" />
                                        Phone Number
                                    </li>
                                )}
                                {!infoStatus.hasAddress && (
                                    <li className="flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3" />
                                        Home Address
                                    </li>
                                )}
                                {!infoStatus.hasEmergencyContact && (
                                    <li className="flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3" />
                                        Emergency Contact
                                    </li>
                                )}
                            </ul>
                        </div>

                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                            You need to complete all required information in
                            your profile to book rides.
                        </p>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setShowMissingFieldsPrompt(false)
                                }
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </Button>
                            <Link href="/PassengerSide/profile">
                                <Button className="bg-emerald-500 text-white hover:bg-emerald-600">
                                    <User className="mr-2 h-4 w-4" />
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                            <Shield className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                Complete Your Profile
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Finish setting up your profile to start booking
                                rides. All required information is needed for
                                your safety.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress & Requirements Card */}
            <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                <User className="h-5 w-5 text-emerald-500" />
                                Profile Completion
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Complete these requirements to unlock ride
                                booking
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-500">
                                {completionPercentage}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Complete
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        {/* Phone Number */}
                        <div
                            className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                                infoStatus.hasPhone
                                    ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                        infoStatus.hasPhone
                                            ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {infoStatus.hasPhone ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <PhoneIcon className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Phone Number
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        For driver communication and ride
                                        notifications
                                    </p>
                                </div>
                            </div>
                            <div
                                className={`self-start rounded-full px-3 py-1.5 text-xs font-medium sm:self-auto ${
                                    infoStatus.hasPhone
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                            >
                                {infoStatus.hasPhone ? 'Completed' : 'Required'}
                            </div>
                        </div>

                        {/* Home Address */}
                        <div
                            className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                                infoStatus.hasAddress
                                    ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                        infoStatus.hasAddress
                                            ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {infoStatus.hasAddress ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <Home className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Home Address
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        For accurate pickup locations and
                                        emergency situations
                                    </p>
                                </div>
                            </div>
                            <div
                                className={`self-start rounded-full px-3 py-1.5 text-xs font-medium sm:self-auto ${
                                    infoStatus.hasAddress
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                            >
                                {infoStatus.hasAddress
                                    ? 'Completed'
                                    : 'Required'}
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div
                            className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                                infoStatus.hasEmergencyContact
                                    ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                        infoStatus.hasEmergencyContact
                                            ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {infoStatus.hasEmergencyContact ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <Contact className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Emergency Contact
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        For safety notifications and emergency
                                        situations
                                    </p>
                                </div>
                            </div>
                            <div
                                className={`self-start rounded-full px-3 py-1.5 text-xs font-medium sm:self-auto ${
                                    infoStatus.hasEmergencyContact
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                            >
                                {infoStatus.hasEmergencyContact
                                    ? 'Completed'
                                    : 'Required'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons - Optimized for mobile */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                    size="lg"
                    onClick={handleCompleteProfileClick}
                    className="h-12 w-full rounded-xl bg-emerald-500 font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-600 hover:shadow-lg active:scale-[0.98] sm:h-11 sm:flex-1"
                >
                    <User className="mr-2.5 h-5 w-5 shrink-0" />
                    Complete Profile Now
                </Button>

                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleRefreshCheck}
                    disabled={isChecking}
                    className="h-12 w-full rounded-xl border-2 border-emerald-200 font-medium text-emerald-700 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60 sm:h-11 sm:flex-1 dark:border-emerald-800 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10"
                >
                    {isChecking ? (
                        <>
                            <Loader2 className="mr-2.5 h-5 w-5 shrink-0 animate-spin" />
                            Checking...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2.5 h-5 w-5 shrink-0" />
                            I've Completed My Profile
                        </>
                    )}
                </Button>
            </div>

            {/* Safety Notice */}
            <Card className="border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10">
                <CardContent className="p-6">
                    <div className="text-center">
                        <div className="mb-3 flex justify-center">
                            <Shield className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h4 className="mb-4 text-base font-semibold text-emerald-900 dark:text-emerald-400">
                            Safety First
                        </h4>
                        <div className="grid grid-cols-1 gap-3 text-sm text-emerald-800 md:grid-cols-2 dark:text-emerald-300">
                            <div className="flex items-center justify-center gap-2">
                                <Shield className="h-4 w-4 shrink-0 text-emerald-500" />
                                <span>
                                    Emergency assistance and quick response
                                </span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                                <span>
                                    Accurate pickup locations and navigation
                                </span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <PhoneIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                                <span>
                                    Driver communication and ride updates
                                </span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Contact className="h-4 w-4 shrink-0 text-emerald-500" />
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
