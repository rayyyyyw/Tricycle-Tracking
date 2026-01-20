import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, usePage, router } from '@inertiajs/react';
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

export default function Support() {
    const { auth } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [contactForm, setContactForm] = useState({
        subject: '',
        message: '',
        category: 'general',
    });

    const faqs = [
        {
            id: 1,
            category: 'Booking',
            question: 'How do I book a ride?',
            answer: 'To book a ride, go to the "Book a Ride" page, select your pickup and destination locations, choose your ride type, and confirm your booking. A driver will be assigned to you shortly.',
        },
        {
            id: 2,
            category: 'Booking',
            question: 'Can I cancel my booking?',
            answer: 'Yes, you can cancel your booking as long as it hasn\'t been completed. Go to your active booking and click the cancel button. Note that cancellation policies may apply.',
        },
        {
            id: 3,
            category: 'Features',
            question: 'How do I save my favorite places?',
            answer: 'Go to the "Saved & Favorites" page to add your frequently visited places like Home, School, or Work. This makes booking rides faster and more convenient.',
        },
        {
            id: 4,
            category: 'Features',
            question: 'Can I request rides from my favorite drivers?',
            answer: 'Yes! Save your favorite drivers from the "Saved & Favorites" page. You can quickly request rides from drivers you trust and prefer to ride with.',
        },
        {
            id: 5,
            category: 'Driver',
            question: 'How do I rate my driver?',
            answer: 'After completing a ride, you\'ll be prompted to rate your driver. You can also rate drivers from your Ride History page by clicking on completed rides.',
        },
        {
            id: 6,
            category: 'Safety',
            question: 'What safety measures are in place?',
            answer: 'All drivers are verified and licensed. We track all rides and have an emergency contact system. If you feel unsafe, contact your emergency contact or local authorities immediately.',
        },
    ];

    const filteredFaqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmitContact = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement contact form submission
        alert('Thank you for contacting us! We will get back to you soon.');
        setContactForm({ subject: '', message: '', category: 'general' });
    };

    return (
        <PassengerLayout>
            <Head title="Support & Help" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Support & Help</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get help and find answers to common questions</p>
                </div>

                {/* Quick Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = 'mailto:support@trigo.com'}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Email Support</p>
                                    <p className="text-xs text-muted-foreground">support@trigo.com</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = 'tel:+639123456789'}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
                                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                        {faq.category}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-sm">{faq.question}</p>
                                            </div>
                                            <AlertCircle className="h-4 w-4 text-muted-foreground group-open:hidden shrink-0 ml-2" />
                                            <CheckCircle className="h-4 w-4 text-emerald-600 hidden group-open:block shrink-0 ml-2" />
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
                        <form onSubmit={handleSubmitContact} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Category</label>
                                <select
                                    value={contactForm.category}
                                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="booking">Booking Issue</option>
                                    <option value="payment">Payment Issue</option>
                                    <option value="safety">Safety Concern</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Subject</label>
                                <Input
                                    placeholder="What is this regarding?"
                                    value={contactForm.subject}
                                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Message</label>
                                <Textarea
                                    placeholder="Describe your issue or question..."
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    rows={5}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
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
                                    <p className="font-medium">User Guide</p>
                                    <p className="text-xs text-muted-foreground">Learn how to use TriGo</p>
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
        </PassengerLayout>
    );
}
