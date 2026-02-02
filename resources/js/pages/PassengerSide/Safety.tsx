import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Shield, 
    AlertTriangle,
    Phone,
    MapPin,
    User,
    CheckCircle,
    FileText,
    Bell,
    Car,
    Eye
} from 'lucide-react';
import { type SharedData } from '@/types';

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
                'Don\'t share personal information with drivers beyond what\'s necessary',
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

    const emergencyContacts = [
        { name: 'Emergency Services', number: '911', type: 'emergency' },
        { name: 'Police', number: '117', type: 'police' },
        { name: 'TriGo Support', number: '+63 912 345 6789', type: 'support' },
    ];

    return (
        <PassengerLayout>
            <Head title="Safety" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Safety & Guidelines</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Important safety information for passengers</p>
                </div>

                {/* Emergency Contacts */}
                <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                            <AlertTriangle className="h-5 w-5" />
                            Emergency Contacts
                        </CardTitle>
                        <CardDescription>Important numbers for emergencies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {emergencyContacts.map((contact, index) => (
                                <Button
                                    key={`emergency-${contact.type}-${index}`}
                                    variant="outline"
                                    className="h-auto p-4 justify-start border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                                    onClick={() => window.location.href = `tel:${contact.number.replace(/\s/g, '')}`}
                                >
                                    <Phone className="h-5 w-5 mr-3 text-red-600 dark:text-red-400" />
                                    <div className="text-left">
                                        <p className="font-medium text-sm">{contact.name}</p>
                                        <p className="text-xs text-muted-foreground">{contact.number}</p>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Safety Guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    {guideline.items.map((item, itemIndex) => (
                                        <li key={`guideline-${index}-item-${itemIndex}`} className="flex items-start gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>

                {/* Safety Tips */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Before You Ride
                                </p>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• Verify driver name, photo, and vehicle details match the app</li>
                                    <li>• Check the license plate number before entering the vehicle</li>
                                    <li>• Share your trip details with a friend or family member</li>
                                    <li>• Review the driver's rating and reviews before accepting</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* During Your Ride */}
                <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Car className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                                    During Your Ride
                                </p>
                                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                                    <li>• Always wear your seatbelt</li>
                                    <li>• Keep your phone accessible and charged</li>
                                    <li>• Follow the route on your phone to ensure you're going the right way</li>
                                    <li>• If you feel uncomfortable, ask the driver to stop in a safe, public place</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Safety Resources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Safety Resources</CardTitle>
                        <CardDescription>Additional safety information and resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="justify-start h-auto p-4">
                                <FileText className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <p className="font-medium">Safety Manual</p>
                                    <p className="text-xs text-muted-foreground">Complete safety guidelines</p>
                                </div>
                            </Button>
                            <Button variant="outline" className="justify-start h-auto p-4">
                                <Bell className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <p className="font-medium">Report Incident</p>
                                    <p className="text-xs text-muted-foreground">Report safety concerns</p>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Safety First Message */}
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                                    Safety First
                                </p>
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    Your safety is our top priority. All drivers are verified and licensed. We track all rides 
                                    and have an emergency contact system in place. If you ever feel unsafe during a ride, 
                                    contact emergency services immediately or use the emergency contact feature in the app. 
                                    Trust your instincts and report any concerns to TriGo support.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}
