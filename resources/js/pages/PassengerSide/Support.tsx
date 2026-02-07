import PassengerLayout from '@/layouts/PassengerLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
        user_type: 'passenger',
    });

    const openTickets = tickets.filter((t) => t.status === 'open');
    const inProgressTickets = tickets.filter((t) => t.status === 'in_progress');
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed');

    const faqs = [
        { id: 1, category: 'Booking', question: 'How do I book a ride?', answer: 'To book a ride, go to the "Book a Ride" page, select your pickup and destination locations, choose your ride type, and confirm your booking. A driver will be assigned to you shortly.' },
        { id: 2, category: 'Booking', question: 'Can I cancel my booking?', answer: "Yes, you can cancel your booking as long as it hasn't been completed. Go to your active booking and click the cancel button. Note that cancellation policies may apply." },
        { id: 3, category: 'Features', question: 'How do I save my favorite places?', answer: 'Go to the "Saved & Favorites" page to add your frequently visited places like Home, School, or Work. This makes booking rides faster and more convenient.' },
        { id: 4, category: 'Features', question: 'Can I request rides from my favorite drivers?', answer: "Yes! Save your favorite drivers from the \"Saved & Favorites\" page. You can quickly request rides from drivers you trust and prefer to ride with." },
        { id: 5, category: 'Driver', question: 'How do I rate my driver?', answer: "After completing a ride, you'll be prompted to rate your driver. You can also rate drivers from your Ride History page by clicking on completed rides." },
        { id: 6, category: 'Safety', question: 'What safety measures are in place?', answer: 'All drivers are verified and licensed. We track all rides and have an emergency contact system. If you feel unsafe, contact your emergency contact or local authorities immediately.' },
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
        post('/passenger/support', {
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
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{ticket.category}</span>
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
        <PassengerLayout>
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
                <Card className="border-emerald-200 dark:border-emerald-800">
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
                            <Button type="submit" disabled={processing} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                                {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                                {processing ? 'Sending...' : 'Send Message'}
                            </Button>
                            {Object.keys(errors).length > 0 && (
                                <div className="text-sm text-red-600 mt-2">
                                    {Object.values(errors).map((err, i) => (
                                        <p key={i}>{String(err)}</p>
                                    ))}
                                </div>
                            )}
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
                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{faq.category}</span>
                                                <p className="font-medium text-sm mt-1">{faq.question}</p>
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
            </div>
        </PassengerLayout>
    );
}
