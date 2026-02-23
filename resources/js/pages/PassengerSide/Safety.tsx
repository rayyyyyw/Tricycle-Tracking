import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PassengerLayout from '@/layouts/PassengerLayout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    Car,
    CheckCircle,
    Eye,
    FileText,
    MapPin,
    Phone,
    Shield,
    User,
} from 'lucide-react';

export default function Safety() {
    usePage<SharedData>();

    const safetyGuidelines = [
        {
            icon: Car,
            title: 'Ride Safety',
            items: [
                'Always verify the driver and vehicle match the details in the app before getting in',
                'Check the license plate number matches your booking',
                'Share your ride details with a trusted contact before starting your trip',
                'Sit in the back seat when traveling alone for added safety',
            ],
        },
        {
            icon: User,
            title: 'Personal Safety',
            items: [
                'Keep your personal belongings secure and within sight',
                "Don't share personal information with drivers beyond what's necessary",
                'Trust your instincts - if something feels wrong, cancel the ride',
                'Always wear your seatbelt during the ride',
            ],
        },
        {
            icon: AlertTriangle,
            title: 'Emergency Procedures',
            items: [
                'In case of emergency, contact local authorities immediately (911)',
                'Use the emergency contact feature in the app',
                'Report any safety incidents through the app immediately',
                'Keep emergency contact numbers readily available',
            ],
        },
        {
            icon: MapPin,
            title: 'Location Safety',
            items: [
                'Wait for your ride in a well-lit, public area',
                'Verify the pickup location before confirming your booking',
                'Share your live location with trusted contacts during rides',
                'Be aware of your surroundings at all times',
            ],
        },
    ];

    const emergencyContacts: Array<
        | { name: string; number: string; type: string }
        | { name: string; numbers: string[]; type: string }
    > = [
        {
            name: 'DIAL DAPH',
            numbers: ['09271514218', '09694552488'],
            type: 'emergency',
        },
        {   name: 'Police Agency',
            numbers: ['(034)-467-2536', '09129057161'],
            type: 'emergency', },

        {   name: 'Fire Department',
            numbers: ['09129057161', '09660217032'],
            type: 'emergency' },
    ];

    return (
        <PassengerLayout>
            <Head title="Safety" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        Safety & Guidelines
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Important safety information for passengers
                    </p>
                </div>

                {/* Emergency Contacts */}
                <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                            <AlertTriangle className="h-5 w-5" />
                            Emergency Contacts
                        </CardTitle>
                        <CardDescription>
                            Important numbers for emergencies
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {emergencyContacts.map((contact, index) =>
                                'numbers' in contact ? (
                                    <div
                                        key={`emergency-${contact.type}-${index}`}
                                        className="rounded-lg border border-red-200 bg-white p-4 dark:border-red-800 dark:bg-transparent"
                                    >
                                        <p className="mb-2 text-sm font-medium text-red-900 dark:text-red-100">
                                            {contact.name}
                                        </p>
                                        <div className="space-y-1.5">
                                            {contact.numbers.map((num, i) => (
                                                <Button
                                                    key={i}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-auto w-full justify-start border-red-200 py-2 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30"
                                                    onClick={() =>
                                                        (window.location.href = `tel:${num.replace(/\s/g, '')}`)
                                                    }
                                                >
                                                    <Phone className="mr-2 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                                    <span className="text-xs">
                                                        {num}
                                                    </span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        key={`emergency-${contact.type}-${index}`}
                                        variant="outline"
                                        className="h-auto justify-start border-red-200 p-4 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30"
                                        onClick={() =>
                                            (window.location.href = `tel:${contact.number.replace(/\s/g, '')}`)
                                        }
                                    >
                                        <Phone className="mr-3 h-5 w-5 text-red-600 dark:text-red-400" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium">
                                                {contact.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {contact.number}
                                            </p>
                                        </div>
                                    </Button>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Safety Guidelines */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {safetyGuidelines.map((guideline, index) => {
                        const Icon = guideline.icon;
                        return (
                            <Card key={`guideline-${index}-${guideline.title}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Icon className="h-5 w-5 text-emerald-600" />
                                        {guideline.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {guideline.items.map(
                                            (item, itemIndex) => (
                                                <li
                                                    key={`guideline-${index}-item-${itemIndex}`}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                                    <span className="text-muted-foreground">
                                                        {item}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Safety Tips */}
                <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Eye className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                                    Before You Ride
                                </p>
                                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                    <li>
                                        • Verify driver name, photo, and vehicle
                                        details match the app
                                    </li>
                                    <li>
                                        • Check the license plate number before
                                        entering the vehicle
                                    </li>
                                    <li>
                                        • Share your trip details with a friend
                                        or family member
                                    </li>
                                    <li>
                                        • Review the driver's rating and reviews
                                        before accepting
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* During Your Ride */}
                <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Car className="mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="mb-2 font-medium text-purple-900 dark:text-purple-100">
                                    During Your Ride
                                </p>
                                <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                                    <li>• Always wear your seatbelt</li>
                                    <li>
                                        • Keep your phone accessible and charged
                                    </li>
                                    <li>
                                        • Follow the route on your phone to
                                        ensure you're going the right way
                                    </li>
                                    <li>
                                        • If you feel uncomfortable, ask the
                                        driver to stop in a safe, public place
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Safety Resources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Safety Resources</CardTitle>
                        <CardDescription>
                            Additional safety information and resources
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Button
                                variant="outline"
                                className="h-auto justify-start p-4"
                            >
                                <FileText className="mr-3 h-5 w-5" />
                                <div className="text-left">
                                    <p className="font-medium">Safety Manual</p>
                                    <p className="text-xs text-muted-foreground">
                                        Complete safety guidelines
                                    </p>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto justify-start p-4"
                            >
                                <Bell className="mr-3 h-5 w-5" />
                                <div className="text-left">
                                    <p className="font-medium">
                                        Report Incident
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Report safety concerns
                                    </p>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Safety First Message */}
                <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="mb-2 font-medium text-emerald-900 dark:text-emerald-100">
                                    Safety First
                                </p>
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    Your safety is our top priority. All drivers
                                    are verified and licensed. We track all
                                    rides and have an emergency contact system
                                    in place. If you ever feel unsafe during a
                                    ride, contact emergency services immediately
                                    or use the emergency contact feature in the
                                    app. Trust your instincts and report any
                                    concerns to TriGo support.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}
