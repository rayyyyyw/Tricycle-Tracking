import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import TriGoLogoImg from '@/components/TriGoLogoImg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
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
            <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center px-4 py-12">
                <div className="relative z-10 w-full max-w-lg space-y-6">
                    {/* Logo */}
                    <div className="text-center">
                        <Link href="/" className="inline-block mb-6">
                            <TriGoLogoImg size="lg" className="mx-auto opacity-90" />
                        </Link>
                    </div>

                    {/* Main message */}
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Account Deactivated
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your account has been deactivated. You cannot access TriGo services at this time.
                        </p>

                        <form onSubmit={handleLogout}>
                            <button
                                type="submit"
                                disabled={isLoggingOut}
                                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Signing out...' : 'Sign out'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Admin card */}
                    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Contact Admin
                            </CardTitle>
                            <CardDescription>
                                Believe this is a mistake? Send a message and an admin will review it in General Queries.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {flash?.success && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                                    {flash.success}
                                </p>
                            )}
                            <form onSubmit={handleContactSubmit} className="space-y-3">
                                <div>
                                    <label htmlFor="subject" className="sr-only">Subject</label>
                                    <Input
                                        id="subject"
                                        value={contactForm.data.subject}
                                        onChange={(e) => contactForm.setData('subject', e.target.value)}
                                        placeholder="Subject"
                                        className="bg-white dark:bg-gray-900"
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
                                        className="min-h-[100px] bg-white dark:bg-gray-900 resize-y"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={contactForm.processing}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {contactForm.processing ? 'Sending...' : 'Send message'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
