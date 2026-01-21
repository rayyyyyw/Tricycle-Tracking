import DriverLayout from '@/layouts/DriverLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    HelpCircle, 
    MessageCircle, 
    Mail, 
    Phone, 
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Search
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState } from 'react';

interface SupportTicket {
    id: number;
    category: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    admin_response?: string;
    created_at: string;
    responded_at?: string;
}

interface Props {
    tickets: SupportTicket[];
}

export default function Support({ tickets }: Props) {
    const page = usePage<SharedData>();
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, processing, reset, errors } = useForm({
        subject: '',
        message: '',
        category: 'general',
        user_type: 'driver',
    });

    const faqs = [
        {
            id: 1,
            category: 'Bookings',
            question: 'How do I accept a booking?',
            answer: 'When a booking request comes in, you\'ll receive a notification. Go to your Bookings page, review the details (pickup location, destination, fare), and click Accept to confirm the ride.',
        },
        {
            id: 2,
            category: 'Bookings',
            question: 'Can I cancel an accepted booking?',
            answer: 'Yes, but frequent cancellations may affect your driver rating. Only cancel if absolutely necessary and communicate with the passenger if possible.',
        },
        {
            id: 3,
            category: 'Earnings',
            question: 'How are my earnings calculated?',
            answer: 'Your earnings are based on the base fare, distance traveled, time taken, and any applicable surge pricing. You can view detailed breakdowns in your Earnings page.',
        },
        {
            id: 4,
            category: 'Earnings',
            question: 'When will I receive my earnings?',
            answer: 'Earnings are typically processed weekly. You can view your payment history and pending earnings in the Earnings section.',
        },
        {
            id: 5,
            category: 'Safety',
            question: 'What should I do in case of an emergency?',
            answer: 'Your safety is our priority. Use the Emergency button in the app to contact local authorities immediately. All rides are tracked and we have your back.',
        },
        {
            id: 6,
            category: 'Account',
            question: 'How can I update my vehicle information?',
            answer: 'Go to Settings > Vehicle Information to update your tricycle details, license plate, or insurance information.',
        },
    ];

    const filteredFaqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('Form submitted!');
        console.log('Form data:', data);
        
        // Validate fields manually
        if (!data.subject || !data.message) {
            alert('⚠️ Please fill in all required fields (Subject and Message)');
            return;
        }
        
        post('/driver/support', {
            onSuccess: () => {
                console.log('Success!');
                reset('subject', 'message');
                alert('✅ Your support ticket has been submitted successfully! We will get back to you soon.');
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                alert('❌ Failed to submit ticket. Please check the console for details.');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        };
        return badges[status as keyof typeof badges] || badges.open;
    };

    return (
        <DriverLayout>
            <Head title="Support & Help" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Support & Help</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get help and find answers to common questions</p>
                </div>

                {/* Quick Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = 'mailto:driver-support@trigo.com'}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Email Support</p>
                                    <p className="text-xs text-muted-foreground">driver-support@trigo.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = 'tel:+639123456789'}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Phone Support</p>
                                    <p className="text-xs text-muted-foreground">+63 912 345 6789</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Support Hours</p>
                                    <p className="text-xs text-muted-foreground">24/7 Available</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* My Support Tickets */}
                {tickets && tickets.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>My Support Tickets</CardTitle>
                            <CardDescription>View and track your submitted tickets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                        {ticket.category}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(ticket.status)}`}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-sm mb-1">{ticket.subject}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Submitted: {new Date(ticket.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{ticket.message}</p>
                                        {ticket.admin_response && (
                                            <div className="mt-3 pt-3 border-t bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Admin Response:</p>
                                                <p className="text-sm text-muted-foreground">{ticket.admin_response}</p>
                                                {ticket.responded_at && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Responded: {new Date(ticket.responded_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            Frequently Asked Questions
                        </CardTitle>
                        <CardDescription>Find answers to common questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search FAQs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => (
                                    <details
                                        key={faq.id}
                                        className="group border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                                    >
                                        <summary className="flex items-center justify-between cursor-pointer list-none">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                                        {faq.category}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-sm">{faq.question}</p>
                                            </div>
                                            <AlertCircle className="h-4 w-4 text-muted-foreground group-open:hidden shrink-0 ml-2" />
                                            <CheckCircle className="h-4 w-4 text-green-600 hidden group-open:block shrink-0 ml-2" />
                                        </summary>
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                        </div>
                                    </details>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">No FAQs found matching your search</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Contact Support
                        </CardTitle>
                        <CardDescription>Send us a message and we'll get back to you</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Category</label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="booking">Booking Issue</option>
                                    <option value="payment">Payment/Earnings Issue</option>
                                    <option value="safety">Safety Concern</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Subject</label>
                                <Input
                                    placeholder="What is this regarding?"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Message</label>
                                <Textarea
                                    placeholder="Describe your issue or question..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={5}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={processing} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                <Mail className="h-4 w-4 mr-2" />
                                {processing ? 'Sending...' : 'Send Message'}
                            </Button>
                            
                            {Object.keys(errors).length > 0 && (
                                <div className="text-sm text-red-600 mt-2">
                                    {Object.values(errors).map((error, index) => (
                                        <p key={index}>{error}</p>
                                    ))}
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Help Resources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Help Resources</CardTitle>
                        <CardDescription>Additional resources and documentation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="justify-start h-auto p-4">
                                <FileText className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <p className="font-medium">Driver Guide</p>
                                    <p className="text-xs text-muted-foreground">Learn how to use TriGo as a driver</p>
                                </div>
                            </Button>
                            <Button variant="outline" className="justify-start h-auto p-4">
                                <AlertCircle className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <p className="font-medium">Safety Guidelines</p>
                                    <p className="text-xs text-muted-foreground">Important safety information</p>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DriverLayout>
    );
}
