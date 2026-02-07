import DriverLayout from '@/layouts/DriverLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    HelpCircle,
    MessageCircle,
    Mail,
    CheckCircle,
    AlertCircle,
    Search,
    Bell,
    Loader2,
} from 'lucide-react';
import { type SharedData } from '@/types';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

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

function EmptyState({
    icon: Icon,
    title,
    message,
    iconBg = 'bg-emerald-100 dark:bg-emerald-500/20',
    iconColor = 'text-emerald-600 dark:text-emerald-400',
}: {
    icon: LucideIcon;
    title: string;
    message: string;
    iconBg?: string;
    iconColor?: string;
}) {
    return (
        <Card className="border-dashed">
            <CardContent className="p-12 text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${iconBg} mb-4`}>
                    <Icon className={`w-10 h-10 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-muted-foreground">{message}</p>
            </CardContent>
        </Card>
    );
}

export default function Support({ tickets = [] }: Props) {
    usePage<SharedData>();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('open');

    const { data, setData, post, processing, reset, errors } = useForm({
        subject: '',
        message: '',
        category: 'general',
        user_type: 'driver',
    });

    const openTickets = tickets.filter((t) => t.status === 'open');
    const inProgressTickets = tickets.filter((t) => t.status === 'in_progress');
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed');

    const faqs = [
        { id: 1, category: 'Bookings', question: 'How do I accept a booking?', answer: "When a booking request comes in, you'll receive a notification. Go to the \"Book a Ride\" page, review the details, and click Accept to confirm the ride." },
        { id: 2, category: 'Bookings', question: 'Can I cancel an accepted booking?', answer: 'Yes, but frequent cancellations may affect your driver rating. Only cancel if absolutely necessary and communicate with the passenger if possible.' },
        { id: 3, category: 'Earnings', question: 'How are my earnings calculated?', answer: 'Your earnings are based on the base fare, distance traveled, time taken, and any applicable surge pricing. View detailed breakdowns in your Earnings page.' },
        { id: 4, category: 'Earnings', question: 'When will I receive my earnings?', answer: 'Earnings are typically processed weekly. You can view your payment history and pending earnings in the Earnings section.' },
        { id: 5, category: 'Safety', question: 'What should I do in case of an emergency?', answer: 'Your safety is our priority. Use the Emergency button in the app to contact local authorities immediately. All rides are tracked.' },
        { id: 6, category: 'Account', question: 'How can I update my vehicle information?', answer: 'Go to Settings > Vehicle Information to update your tricycle details, license plate, or insurance information.' },
    ];

    const filteredFaqs = faqs.filter(
        (faq) =>
            (faq.question ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (faq.answer ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (faq.category ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.subject || !data.message) return;
        post('/driver/support', {
            onSuccess: () => {
                reset('subject', 'message');
                setActiveTab('open');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        };
        return badges[status] || badges.open;
    };

    const TicketCard = ({ ticket }: { ticket: SupportTicket }) => (
        <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">{ticket.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="font-medium text-sm mb-1">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">Submitted: {new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{ticket.message}</p>
            {ticket.admin_response && (
                <div className="mt-3 pt-3 border-t bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Admin Response:</p>
                    <p className="text-sm text-muted-foreground">{ticket.admin_response}</p>
                    {ticket.responded_at && (
                        <p className="text-xs text-muted-foreground mt-1">Responded: {new Date(ticket.responded_at).toLocaleDateString()}</p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <DriverLayout>
            <Head title="Support & Help" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Support & Help</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get help and find answers to common questions</p>
                </div>

                {/* My Support Tickets with Tabs - FIRST */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">My Support Tickets</h2>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="open" className="flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Open
                                {openTickets.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {openTickets.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="in_progress" className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4" />
                                In Progress
                                {inProgressTickets.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {inProgressTickets.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="resolved" className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Resolved
                                {resolvedTickets.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {resolvedTickets.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="open" className="space-y-3 mt-6">
                            {openTickets.length > 0 ? (
                                <div className="space-y-4">
                                    {openTickets.map((ticket) => (
                                        <TicketCard key={ticket.id} ticket={ticket} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Bell}
                                    title="No Open Tickets"
                                    message="You don't have any open support tickets at the moment."
                                    iconBg="bg-emerald-100 dark:bg-emerald-500/20"
                                    iconColor="text-emerald-600 dark:text-emerald-400"
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="in_progress" className="space-y-3 mt-6">
                            {inProgressTickets.length > 0 ? (
                                <div className="space-y-4">
                                    {inProgressTickets.map((ticket) => (
                                        <TicketCard key={ticket.id} ticket={ticket} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Loader2}
                                    title="No Tickets In Progress"
                                    message="No support tickets are currently being worked on."
                                    iconBg="bg-blue-100 dark:bg-blue-500/20"
                                    iconColor="text-blue-600 dark:text-blue-400"
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="resolved" className="space-y-3 mt-6">
                            {resolvedTickets.length > 0 ? (
                                <div className="space-y-4">
                                    {resolvedTickets.map((ticket) => (
                                        <TicketCard key={ticket.id} ticket={ticket} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={CheckCircle}
                                    title="No Resolved Tickets"
                                    message="You haven't had any tickets resolved yet."
                                    iconBg="bg-gray-100 dark:bg-gray-700"
                                    iconColor="text-gray-600 dark:text-gray-400"
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Contact Support Card - SECOND */}
                <Card className="shadow-sm overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                            </div>
                                <div>
                                    <CardTitle className="text-lg">Contact Support</CardTitle>
                                    <CardDescription className="mt-0.5">Send us a message and we'll get back to you as soon as possible</CardDescription>
                                </div>
                            </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                                <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                    <SelectTrigger id="category" className="h-10 w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General Inquiry</SelectItem>
                                        <SelectItem value="booking">Booking Issue</SelectItem>
                                        <SelectItem value="payment">Payment/Earnings Issue</SelectItem>
                                        <SelectItem value="safety">Safety Concern</SelectItem>
                                        <SelectItem value="technical">Technical Issue</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Brief summary of your issue (e.g. Booking cancellation request)"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    required
                                    className="h-10"
                                />
                                {errors.subject && (
                                    <p className="text-xs text-destructive">{errors.subject}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Describe your issue or question in detail. Include any relevant booking IDs or dates if applicable."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={5}
                                    required
                                    className="min-h-[120px] resize-y"
                                />
                                {errors.message && (
                                    <p className="text-xs text-destructive">{errors.message}</p>
                                )}
                            </div>
                            {Object.keys(errors).length > 0 && !errors.subject && !errors.message && (
                                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {Object.values(errors).map((err, i) => (
                                        <p key={i}>{String(err)}</p>
                                    ))}
                                </div>
                            )}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto h-10 px-6 shadow-sm"
                            >
                                {processing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Mail className="h-4 w-4 mr-2" />
                                )}
                                {processing ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Frequently Asked Questions - LAST */}
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
                                                <span className="text-xs font-medium text-green-600 dark:text-green-400">{faq.category}</span>
                                                <p className="font-medium text-sm mt-1">{faq.question}</p>
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
            </div>
        </DriverLayout>
    );
}
