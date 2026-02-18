import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Heart, Loader2, MessageSquare, Star, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import DriverLayout from '@/layouts/DriverLayout';
import PassengerLayout from '@/layouts/PassengerLayout';
import TriGoLogoImg from '@/components/TriGoLogoImg';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
}

interface Props {
    auth: {
        user: User;
    };
}

export default function FeedbackIndex() {
    const { auth } = usePage<SharedData & Props>().props;
    const user = auth.user;
    const isDriver = user.role === 'driver';
    const Layout = isDriver ? DriverLayout : PassengerLayout;

    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    
    // Check sessionStorage on mount to see if feedback was already submitted
    const [showThankYou, setShowThankYou] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('feedbackSubmitted') === 'true';
        }
        return false;
    });

    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm({
            rating: 0,
            feedback: '',
        });

    // Sync selectedRating with form data
    useEffect(() => {
        setData('rating', selectedRating);
    }, [selectedRating, setData]);

    // Save to sessionStorage when feedback is successfully submitted
    useEffect(() => {
        if (recentlySuccessful) {
            setShowThankYou(true);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('feedbackSubmitted', 'true');
            }
        }
    }, [recentlySuccessful]);

    // Check sessionStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const feedbackSubmitted = sessionStorage.getItem('feedbackSubmitted') === 'true';
            if (feedbackSubmitted) {
                setShowThankYou(true);
            }
        }
    }, []);

    const handleSubmitAnother = () => {
        setShowThankYou(false);
        setSelectedRating(0);
        setHoveredRating(0);
        setData('rating', 0);
        setData('feedback', '');
        // Clear sessionStorage when submitting another feedback
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('feedbackSubmitted');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRating === 0 || data.rating === 0) {
            return;
        }
        const route = isDriver ? '/driver/feedback' : '/passenger/feedback';
        post(route, {
            preserveScroll: true,
        });
    };

    const renderStars = () => {
        return (
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => {
                            setSelectedRating(star);
                            setData('rating', star);
                        }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 active:scale-95"
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                        <Star
                            className={`h-10 w-10 transition-colors ${
                                star <= (hoveredRating || selectedRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                            }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    // Thank You Screen
    if (showThankYou) {
        return (
            <Layout>
                <Head title="Thank You for Your Feedback" />

                <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
                    {/* Thank You Card */}
                    <Card className="border-0 bg-linear-to-r from-emerald-500 to-emerald-600 shadow-lg">
                        <CardHeader className="text-center text-white py-4 sm:py-6">
                            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                                Thank You!
                            </CardTitle>
                            <CardDescription className="text-emerald-50 text-sm sm:text-base">
                                We truly appreciate your feedback
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Thank You Content */}
                    <Card>
                        <CardContent className="p-4 sm:p-6 lg:p-8">
                            <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                                <div className="flex items-center justify-center">
                                    <TriGoLogoImg 
                                        size="2xl" 
                                        className="h-24 w-24 sm:h-32 sm:w-32 object-contain"
                                        alt="TriGo Logo"
                                    />
                                </div>
                                
                                <div className="space-y-2 sm:space-y-3 max-w-md">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                        Your Feedback Matters
                                    </h2>
                                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                                        Thank you for taking the time to share your experience with us. 
                                        Your feedback helps us improve TriGo and provide better service 
                                        for everyone in our community.
                                    </p>
                                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                                        We read every submission carefully and use your insights to make 
                                        continuous improvements to our platform.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full sm:w-auto">
                                    <Button
                                        onClick={handleSubmitAnother}
                                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                                        size="lg"
                                    >
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        Submit Another Feedback
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const dashboardRoute = isDriver 
                                                ? '/driver/dashboard' 
                                                : '/passenger/dashboard';
                                            router.visit(dashboardRoute);
                                        }}
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        size="lg"
                                    >
                                        Go to Dashboard
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Info */}
                    <Card className="border-dashed">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                                    <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">
                                        We're here to help
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        If you have any urgent concerns or questions, please don't hesitate 
                                        to reach out through our support system. We're always here to assist you.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Head title="Give Us Feedback" />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
                {/* Header Card */}
                <Card className="border-0 bg-linear-to-r from-emerald-500 to-emerald-600 shadow-lg">
                    <CardHeader className="text-center text-white">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                            <Heart className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold">
                            Give Us Feedback
                        </CardTitle>
                        <CardDescription className="text-emerald-50">
                            Your opinion matters! Help us improve TriGo by
                            sharing your experience.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Feedback Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Share Your Thoughts
                        </CardTitle>
                        <CardDescription>
                            Rate your experience and tell us what you think
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating Section */}
                            <div className="space-y-3">
                                <Label htmlFor="rating" className="text-base">
                                    How would you rate your experience?{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/50 p-6">
                                    {renderStars()}
                                    {selectedRating > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            {selectedRating === 5 && 'Excellent!'}
                                            {selectedRating === 4 && 'Great!'}
                                            {selectedRating === 3 && 'Good'}
                                            {selectedRating === 2 && 'Fair'}
                                            {selectedRating === 1 && 'Poor'}
                                        </p>
                                    )}
                                    {selectedRating === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Click on a star to rate
                                        </p>
                                    )}
                                </div>
                                {errors.rating && (
                                    <p className="text-sm text-red-500">
                                        {errors.rating}
                                    </p>
                                )}
                            </div>

                            {/* Feedback Text */}
                            <div className="space-y-3">
                                <Label htmlFor="feedback">
                                    Tell us more (optional)
                                </Label>
                                <Textarea
                                    id="feedback"
                                    value={data.feedback}
                                    onChange={(e) =>
                                        setData('feedback', e.target.value)
                                    }
                                    placeholder="Share your thoughts, suggestions, or any issues you encountered..."
                                    className="min-h-[120px] resize-none"
                                    maxLength={5000}
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {data.feedback.length} / 5000 characters
                                    </span>
                                </div>
                                {errors.feedback && (
                                    <p className="text-sm text-red-500">
                                        {errors.feedback}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing || selectedRating === 0}
                                    className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Submit Feedback
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-dashed">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                                <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                    Why your feedback matters
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Your feedback helps us improve TriGo for
                                    everyone. We read every submission and use
                                    your insights to make our service better.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
