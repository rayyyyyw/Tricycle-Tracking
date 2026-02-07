import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import TriGoLogoImg from '@/components/TriGoLogoImg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, LogOut } from 'lucide-react';
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
            <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative">
                {/* Subtle background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-100/50 dark:bg-amber-900/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-4xl animate-fade-in">
                    <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12">
                        {/* Left: Logo + message + sign out */}
                        <div className="flex-1 flex flex-col items-center text-center lg:justify-center lg:min-w-[300px]">
                            <Link href="/" className="inline-block mb-6 hover:opacity-100 transition-opacity opacity-90">
                                <TriGoLogoImg size="2xl" className="mx-auto drop-shadow-sm" />
                            </Link>

                            {/* Prohibition icon - red circle with slash */}
                            <div className="w-24 h-24 mb-6 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center shrink-0 ring-4 ring-red-100 dark:ring-red-900/50">
                                <svg className="w-12 h-12 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                                    <path d="M4.93 4.93l14.14 14.14" strokeWidth={2} />
                                </svg>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                Account Deactivated
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">
                                Your account has been deactivated. You cannot access TriGo services at this time.
                            </p>

                            <form onSubmit={handleLogout}>
                                <button
                                    type="submit"
                                    disabled={isLoggingOut}
                                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 disabled:opacity-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                                </button>
                            </form>
                        </div>

                        {/* Right: Contact Admin card */}
                        <Card className="flex-1 w-full max-w-md lg:max-w-none border-emerald-200/80 dark:border-emerald-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl shadow-emerald-500/5 dark:shadow-none rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                                        <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    Contact Admin
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Believe this is a mistake? Send a message and an admin will review it in General Queries.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {flash?.success && (
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg">
                                        {flash.success}
                                    </p>
                                )}
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="subject" className="sr-only">Subject</label>
                                        <Input
                                            id="subject"
                                            value={contactForm.data.subject}
                                            onChange={(e) => contactForm.setData('subject', e.target.value)}
                                            placeholder="Subject"
                                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-emerald-500/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="sr-only">Message</label>
                                        <Textarea
                                            id="message"
                                            value={contactForm.data.message}
                                            onChange={(e) => contactForm.setData('message', e.target.value)}
                                            placeholder="Describe why you believe your account should be reactivated..."
                                            className="min-h-[120px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-emerald-500/20 resize-y"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={contactForm.processing}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        {contactForm.processing ? 'Sending...' : 'Send message'}
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
