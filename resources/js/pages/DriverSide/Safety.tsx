import DriverLayout from '@/layouts/DriverLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Shield, 
    AlertTriangle,
    Phone,
    MapPin,
    Users,
    CheckCircle,
    FileText,
    Bell
} from 'lucide-react';
import { type SharedData } from '@/types';

export default function Safety() {
    const { auth } = usePage<SharedData>().props;

    const safetyGuidelines = [
        {
            icon: Shield,
            title: 'Vehicle Safety',
            items: [
                'Always ensure your vehicle is in good working condition before starting your shift',
                'Perform regular maintenance checks (brakes, lights, tires)',
                'Keep your vehicle clean and well-maintained',
                'Report any vehicle issues immediately',
            ],
        },
        {
            icon: Users,
            title: 'Passenger Safety',
            items: [
                'Verify passenger identity when picking up',
                'Follow all traffic rules and regulations',
                'Drive safely and avoid distractions',
                'Be respectful and professional with all passengers',
            ],
        },
        {
            icon: AlertTriangle,
            title: 'Emergency Procedures',
            items: [
                'In case of emergency, contact local authorities immediately (911)',
                'Use the emergency contact feature in the app',
                'Report any safety incidents through the app',
                'Keep emergency contact numbers readily available',
            ],
        },
        {
            icon: MapPin,
            title: 'Route Safety',
            items: [
                'Use GPS navigation for optimal routes',
                'Avoid unsafe or poorly lit areas when possible',
                'Share your location with trusted contacts during rides',
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
        <DriverLayout>
            <Head title="Safety" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Safety & Guidelines</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Important safety information and guidelines</p>
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
                                    key={index}
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
                    {safetyGuidelines.map((guideline, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <guideline.icon className="h-5 w-5 text-emerald-600" />
                                    {guideline.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {guideline.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

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

                {/* Safety Tips */}
                <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                                    Safety First
                                </p>
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    Your safety and the safety of your passengers is our top priority. Always follow traffic rules, 
                                    maintain your vehicle properly, and report any safety concerns immediately. If you ever feel 
                                    unsafe, contact emergency services right away.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DriverLayout>
    );
}
