import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PassengerLayout from '@/layouts/PassengerLayout';
import { type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LucideIcon } from 'lucide-react';
import {
    AlertCircle,
    Bell,
    CheckCircle,
    HelpCircle,
    ImagePlus,
    Loader2,
    Mail,
    MessageCircle,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
                <div
                    className={`inline-flex h-20 w-20 items-center justify-center rounded-full ${iconBg} mb-4`}
                >
                    <Icon className={`h-10 w-10 ${iconColor}`} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-muted-foreground">{message}</p>
            </CardContent>
        </Card>
    );
}

export default function Support({ tickets = [] }: Props) {
    const { flash } = usePage<SharedData & { flash?: { success?: string } }>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('open');
    const [showSuccessAlert, setShowSuccessAlert] = useState(!!flash?.success);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccessAlert(true);
            const t = setTimeout(() => setShowSuccessAlert(false), 10000);
            return () => clearTimeout(t);
        } else {
            setShowSuccessAlert(false);
        }
    }, [flash?.success]);

    const { data, setData, post, processing, reset, errors } = useForm({
        subject: '',
        message: '',
        category: 'general',
        user_type: 'passenger',
        attachments: [] as File[],
    });

    const openTickets = tickets.filter((t) => t.status === 'open');
    const inProgressTickets = tickets.filter((t) => t.status === 'in_progress');
    const resolvedTickets = tickets.filter(
        (t) => t.status === 'resolved' || t.status === 'closed',
    );

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
            answer: "Yes, you can cancel your booking as long as it hasn't been completed. Go to your active booking and click the cancel button. Note that cancellation policies may apply.",
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
            answer: "After completing a ride, you'll be prompted to rate your driver. You can also rate drivers from your Ride History page by clicking on completed rides.",
        },
        {
            id: 6,
            category: 'Safety',
            question: 'What safety measures are in place?',
            answer: 'All drivers are verified and licensed. We track all rides and have an emergency contact system. If you feel unsafe, contact your emergency contact or local authorities immediately.',
        },
    ];

    const filteredFaqs = faqs.filter(
        (faq) =>
            (faq.question ?? '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (faq.answer ?? '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (faq.category ?? '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.subject || !data.message) return;
        post('/passenger/support', {
            onSuccess: () => {
                reset('subject', 'message', 'attachments');
                setActiveTab('open');
            },
        });
    };

    const maxAttachments = 3;
    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        const existing = data.attachments ?? [];
        const added = Array.from(files).filter((f) => f.type.startsWith('image/'));
        const combined = [...existing, ...added].slice(0, maxAttachments);
        setData('attachments', combined);
        e.target.value = '';
    };
    const removeAttachment = (index: number) => {
        const next = (data.attachments ?? []).filter((_, i) => i !== index);
        setData('attachments', next);
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            in_progress:
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            resolved:
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        };
        return badges[status] || badges.open;
    };

    const handleDeleteTicket = (e: React.MouseEvent, ticketId: number) => {
        e.stopPropagation();
        if (window.confirm('Delete this ticket? This cannot be undone.')) {
            router.delete(`/passenger/support/${ticketId}`);
        }
    };

    const getTicketsForCurrentTab = () => {
        if (activeTab === 'open') return openTickets;
        if (activeTab === 'in_progress') return inProgressTickets;
        return resolvedTickets;
    };

    const handleDeleteAll = () => {
        const tabTickets = getTicketsForCurrentTab();
        if (
            tabTickets.length === 0 ||
            !window.confirm(
                `Delete all ${tabTickets.length} ticket(s) in this tab? This cannot be undone.`,
            )
        ) {
            return;
        }
        const status =
            activeTab === 'resolved' ? 'resolved' : activeTab;
        router.post(
            `/passenger/support/delete-all?status=${encodeURIComponent(status)}`,
        );
    };

    const TicketCard = ({
        ticket,
        onDelete,
    }: {
        ticket: SupportTicket;
        onDelete: (e: React.MouseEvent, ticketId: number) => void;
    }) => (
        <div className="rounded-lg border p-4 transition-colors hover:bg-accent/50">
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {ticket.category}
                        </span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(ticket.status)}`}
                        >
                            {ticket.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="mb-1 text-sm font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                        Submitted:{' '}
                        {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => onDelete(e, ticket.id)}
                    aria-label="Delete ticket"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
                {ticket.message}
            </p>
            {ticket.admin_response && (
                <div className="mt-3 rounded-lg border-t bg-blue-50 p-3 pt-3 dark:bg-blue-950/20">
                    <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        Admin Response:
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {ticket.admin_response}
                    </p>
                    {ticket.responded_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            Responded:{' '}
                            {new Date(ticket.responded_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <PassengerLayout>
            <Head title="Support & Help" />

            <div className="space-y-6">
                {flash?.success && showSuccessAlert && (
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        Support & Help
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Get help and find answers to common questions
                    </p>
                </div>

                {/* My Support Tickets with Tabs - FIRST */}
                <div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold">
                            My Support Tickets
                        </h2>
                        {tickets.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={handleDeleteAll}
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Delete all
                            </Button>
                        )}
                    </div>
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger
                                value="open"
                                className="flex items-center gap-2"
                            >
                                <Bell className="h-4 w-4" />
                                Open
                                {openTickets.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {openTickets.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="in_progress"
                                className="flex items-center gap-2"
                            >
                                <Loader2 className="h-4 w-4" />
                                In Progress
                                {inProgressTickets.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {inProgressTickets.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="resolved"
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Resolved
                                {resolvedTickets.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {resolvedTickets.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="open" className="mt-6 space-y-3">
                            {openTickets.length > 0 ? (
                                <div className="space-y-4">
                                    {openTickets.map((ticket) => (
                                        <TicketCard
                                            key={ticket.id}
                                            ticket={ticket}
                                            onDelete={handleDeleteTicket}
                                        />
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

                        <TabsContent
                            value="in_progress"
                            className="mt-6 space-y-3"
                        >
                            {inProgressTickets.length > 0 ? (
                                <div className="space-y-4">
                                    {inProgressTickets.map((ticket) => (
                                        <TicketCard
                                            key={ticket.id}
                                            ticket={ticket}
                                            onDelete={handleDeleteTicket}
                                        />
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

                        <TabsContent
                            value="resolved"
                            className="mt-6 space-y-3"
                        >
                            {resolvedTickets.length > 0 ? (
                                <div className="space-y-4">
                                    {resolvedTickets.map((ticket) => (
                                        <TicketCard
                                            key={ticket.id}
                                            ticket={ticket}
                                            onDelete={handleDeleteTicket}
                                        />
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
                <Card className="overflow-hidden shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    Contact Support
                                </CardTitle>
                                <CardDescription className="mt-0.5">
                                    Send us a message and we'll get back to you
                                    as soon as possible
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="category"
                                    className="text-sm font-medium"
                                >
                                    Category
                                </Label>
                                <Select
                                    value={data.category}
                                    onValueChange={(v) =>
                                        setData('category', v)
                                    }
                                >
                                    <SelectTrigger
                                        id="category"
                                        className="h-10 w-full"
                                    >
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">
                                            General Inquiry
                                        </SelectItem>
                                        <SelectItem value="booking">
                                            Booking Issue
                                        </SelectItem>
                                        <SelectItem value="payment">
                                            Payment Issue
                                        </SelectItem>
                                        <SelectItem value="safety">
                                            Safety Concern
                                        </SelectItem>
                                        <SelectItem value="technical">
                                            Technical Issue
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="subject"
                                    className="text-sm font-medium"
                                >
                                    Subject
                                </Label>
                                <Input
                                    id="subject"
                                    placeholder="Brief summary of your issue (e.g. Booking cancellation request)"
                                    value={data.subject}
                                    onChange={(e) =>
                                        setData('subject', e.target.value)
                                    }
                                    required
                                    className="h-10"
                                />
                                {errors.subject && (
                                    <p className="text-xs text-destructive">
                                        {errors.subject}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="message"
                                    className="text-sm font-medium"
                                >
                                    Message
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Describe your issue or question in detail. Include any relevant booking IDs or dates if applicable."
                                    value={data.message}
                                    onChange={(e) =>
                                        setData('message', e.target.value)
                                    }
                                    rows={5}
                                    required
                                    className="min-h-[120px] resize-y"
                                />
                                {errors.message && (
                                    <p className="text-xs text-destructive">
                                        {errors.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Images (optional)
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Add up to 3 images as proof (e.g. screenshots). Max 5MB each.
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {(data.attachments ?? []).length < maxAttachments && (
                                        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:border-emerald-500/50 hover:bg-muted/50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="sr-only"
                                                onChange={handleAttachmentChange}
                                            />
                                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                        </label>
                                    )}
                                    {(data.attachments ?? []).map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Attachment ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                                                aria-label="Remove image"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {errors.attachments && (
                                    <p className="text-xs text-destructive">
                                        {errors.attachments}
                                    </p>
                                )}
                            </div>
                            {Object.keys(errors).length > 0 &&
                                !errors.subject &&
                                !errors.message && (
                                    <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                        {Object.values(errors).map((err, i) => (
                                            <p key={i}>{String(err)}</p>
                                        ))}
                                    </div>
                                )}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-10 w-full px-6 shadow-sm sm:w-auto"
                            >
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Mail className="mr-2 h-4 w-4" />
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
                        <CardDescription>
                            Find answers to common questions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search FAQs..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => (
                                    <details
                                        key={faq.id}
                                        className="group rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <summary className="flex cursor-pointer list-none items-center justify-between">
                                            <div className="flex-1">
                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    {faq.category}
                                                </span>
                                                <p className="mt-1 text-sm font-medium">
                                                    {faq.question}
                                                </p>
                                            </div>
                                            <AlertCircle className="ml-2 h-4 w-4 shrink-0 text-muted-foreground group-open:hidden" />
                                            <CheckCircle className="ml-2 hidden h-4 w-4 shrink-0 text-emerald-600 group-open:block" />
                                        </summary>
                                        <div className="mt-3 border-t pt-3">
                                            <p className="text-sm text-muted-foreground">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </details>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <Search className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <p className="text-sm text-muted-foreground">
                                        No FAQs found matching your search
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PassengerLayout>
    );
}
