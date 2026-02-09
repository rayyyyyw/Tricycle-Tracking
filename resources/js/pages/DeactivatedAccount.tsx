import TriGoLogoImg from '@/components/TriGoLogoImg';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { LogOut, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function DeactivatedAccount() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const contactForm = useForm({
        subject: 'Account Deactivation Inquiry',
        message: '',
    });

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingOut(true);
        router.post('/logout');
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        contactForm.post('/deactivated-contact', {
            onSuccess: () => contactForm.reset('message'),
        });
    };

    return (
        <>
            <Head title="Account Deactivated | TriGo" />
            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 via-white to-gray-100 px-4 py-12 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
                {/* Subtle background blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl dark:bg-amber-900/20" />
                    <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl dark:bg-emerald-900/20" />
                </div>

                <div className="animate-fade-in relative z-10 w-full max-w-4xl">
                    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-12">
                        {/* Left: Logo + message + sign out */}
                        <div className="flex flex-1 flex-col items-center text-center lg:min-w-[300px] lg:justify-center">
                            <Link
                                href="/"
                                className="mb-6 inline-block opacity-90 transition-opacity hover:opacity-100"
                            >
                                <TriGoLogoImg
                                    size="2xl"
                                    className="mx-auto drop-shadow-sm"
                                />
                            </Link>

                            {/* Prohibition icon - red circle with slash */}
                            <div className="mb-6 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100 dark:bg-red-950/50 dark:ring-red-900/50">
                                <svg
                                    className="h-12 w-12 text-red-500 dark:text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        strokeWidth={1.5}
                                    />
                                    <path
                                        d="M4.93 4.93l14.14 14.14"
                                        strokeWidth={2}
                                    />
                                </svg>
                            </div>

                            <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                                Account Deactivated
                            </h1>
                            <p className="mb-8 max-w-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                Your account has been deactivated. You cannot
                                access TriGo services at this time.
                            </p>

                            <form onSubmit={handleLogout}>
                                <button
                                    type="submit"
                                    disabled={isLoggingOut}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-medium text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {isLoggingOut
                                        ? 'Signing out...'
                                        : 'Sign out'}
                                </button>
                            </form>
                        </div>

                        {/* Right: Contact Admin card */}
                        <Card className="w-full max-w-md flex-1 overflow-hidden rounded-2xl border-emerald-200/80 bg-white/80 shadow-xl shadow-emerald-500/5 backdrop-blur-sm lg:max-w-none dark:border-emerald-800/80 dark:bg-gray-900/80 dark:shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                                    <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/40">
                                        <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    Contact Admin
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Believe this is a mistake? Send a message
                                    and an admin will review it in General
                                    Queries.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {flash?.success && (
                                    <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        {flash.success}
                                    </p>
                                )}
                                <form
                                    onSubmit={handleContactSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="subject"
                                            className="sr-only"
                                        >
                                            Subject
                                        </label>
                                        <Input
                                            id="subject"
                                            value={contactForm.data.subject}
                                            onChange={(e) =>
                                                contactForm.setData(
                                                    'subject',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Subject"
                                            className="border-gray-200 bg-white focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="sr-only"
                                        >
                                            Message
                                        </label>
                                        <Textarea
                                            id="message"
                                            value={contactForm.data.message}
                                            onChange={(e) =>
                                                contactForm.setData(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Describe why you believe your account should be reactivated..."
                                            className="min-h-[120px] resize-y border-gray-200 bg-white focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-900"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={contactForm.processing}
                                        className="w-full bg-emerald-600 font-medium text-white shadow-md transition-shadow hover:bg-emerald-700 hover:shadow-lg"
                                    >
                                        {contactForm.processing
                                            ? 'Sending...'
                                            : 'Send message'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
