import TriGoLogoImg from '@/components/TriGoLogoImg';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Heart, MapPin, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const ROUTES = {
    dashboard: '/dashboard',
    login: '/login',
    register: '/register',
} as const;

/** Minimum preload display time (ms) based on network — keeps wheel visible and feels responsive. */
function getPreloadMinDurationMs(): number {
    if (
        typeof navigator === 'undefined' ||
        !(navigator as Navigator & { connection?: { effectiveType?: string } })
            .connection
    )
        return 1200;
    const conn = (
        navigator as Navigator & { connection?: { effectiveType?: string } }
    ).connection;
    const effectiveType = conn?.effectiveType;
    switch (effectiveType) {
        case 'slow-2g':
        case '2g':
            return 2000;
        case '3g':
            return 1500;
        case '4g':
            return 1000;
        default:
            return 1200;
    }
}

const PRELOAD_FADEOUT_MS = 350;

const defaultAbout = {
    title: 'About TriGo',
    subtitle: 'Smart tricycle monitoring for modern communities',
    paragraphs: [
        'TriGo is an IoT-based tricycle monitoring system designed to bring real-time tracking and fleet management to local transport operators.',
        'Built to improve efficiency, safety, and transparency in tricycle operations, TriGo provides a smarter, more connected mobility experience for communities.',
    ] as string[],
    highlights: [
        {
            icon: '👤',
            title: 'Passengers',
            desc: 'Book rides, track your tricycle in real time, and pay seamlessly.',
        },
        {
            icon: '🚲',
            title: 'Drivers',
            desc: 'Manage availability, navigate optimized routes, and accept bookings.',
        },
        {
            icon: '📊',
            title: 'Admins',
            desc: 'Oversee the fleet with analytics, smart alerts, and fleet control.',
        },
    ] as { icon: string; title: string; desc: string }[],
};

const defaultTeam = {
    subtitle: 'The people behind TriGo',
    members: [
        {
            name: 'Ray Georpe',
            role: 'Team Member',
            avatar: '👨‍💻',
            location: '',
            description: '',
            isAdviser: false,
        },
        {
            name: 'Team Member 2',
            role: 'Team Member',
            avatar: '👩‍💻',
            location: '',
            description: '',
            isAdviser: false,
        },
        {
            name: 'Team Member 3',
            role: 'Team Member',
            avatar: '👨‍💻',
            location: '',
            description: '',
            isAdviser: false,
        },
        {
            name: 'Adviser Name',
            role: 'Project Adviser',
            avatar: '🎓',
            location: '',
            description: '',
            isAdviser: true,
        },
    ] as {
        name: string;
        role: string;
        avatar: string;
        location?: string;
        description?: string;
        isAdviser: boolean;
    }[],
};

const defaultFeatures = [
    {
        icon: '📍',
        title: 'Real-time Tracking',
        description:
            'Live GPS location tracking with accurate positioning and route history.',
    },
    {
        icon: '📊',
        title: 'Fleet Analytics',
        description:
            'Comprehensive insights into fleet performance and operational metrics.',
    },
    {
        icon: '🔔',
        title: 'Smart Alerts',
        description:
            'Instant notifications for maintenance, speed limits, and geofencing.',
    },
    {
        icon: '🛣️',
        title: 'Route Optimization',
        description:
            'Smart routing to reduce fuel costs and improve delivery times.',
    },
    {
        icon: '📱',
        title: 'Mobile Access',
        description:
            'Monitor your fleet from anywhere with our mobile-friendly dashboard.',
    },
    {
        icon: '💾',
        title: 'Data Export',
        description: 'Export reports and data for analysis and record keeping.',
    },
] as { icon: string; title: string; description: string }[];

const defaultHowItWorks = [
    { step: '1', title: 'Sign Up', desc: 'Create your account' },
    { step: '2', title: 'Add Devices', desc: 'Install IoT trackers' },
    { step: '3', title: 'Monitor', desc: 'View your dashboard' },
    { step: '4', title: 'Optimize', desc: 'Improve operations' },
] as { step: string; title: string; desc: string }[];

export default function Welcome({
    canRegister = true,
    landingAbout,
    landingTeam,
    landingFeatures,
    landingHowItWorks,
    landingReviews = [],
}: {
    canRegister?: boolean;
    landingAbout?: {
        title?: string;
        subtitle?: string;
        paragraphs?: string[];
        highlights?: { icon: string; title: string; desc: string }[];
    };
    landingTeam?: {
        subtitle?: string;
        members?: {
            name: string;
            role: string;
            avatar: string;
            location?: string;
            description?: string;
            isAdviser: boolean;
        }[];
    };
    landingFeatures?: { icon: string; title: string; description: string }[];
    landingHowItWorks?: { step: string; title: string; desc: string }[];
    landingReviews?: {
        id: number;
        name: string;
        avatar: string | null;
        role: string;
        company: string;
        content: string;
        rating: number;
    }[];
}) {
    const about = { ...defaultAbout, ...landingAbout };
    const team = { ...defaultTeam, ...landingTeam };
    const features =
        Array.isArray(landingFeatures) && landingFeatures.length > 0
            ? landingFeatures
            : defaultFeatures;
    const howItWorks =
        Array.isArray(landingHowItWorks) && landingHowItWorks.length > 0
            ? landingHowItWorks
            : defaultHowItWorks;
    const { auth } = usePage<SharedData>().props;

    // Carousel state for testimonials
    const shouldCarousel = landingReviews.length >= 4;
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = 3;
    const totalSlides = Math.ceil(landingReviews.length / itemsPerView);

    // Auto carousel effect
    useEffect(() => {
        if (!shouldCarousel) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalSlides);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [shouldCarousel, totalSlides]);

    // Use separate localStorage key for landing page - never touches 'appearance' (user account mode)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('landing-theme');
            return savedTheme === 'dark';
        }
        return false;
    });
    const [isAnimating, setIsAnimating] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [preloadTarget, setPreloadTarget] = useState<string | null>(null);
    const [preloadExiting, setPreloadExiting] = useState(false);
    const preloadStartRef = useRef<number>(0);

    const handleAuthClick = useCallback(
        (href: string) => (e: React.MouseEvent) => {
            e.preventDefault();
            preloadStartRef.current = Date.now();
            setPreloadTarget(href);
            setPreloadExiting(false);
            router.visit(href, {
                onFinish: () => {
                    const elapsed = Date.now() - preloadStartRef.current;
                    const minMs = getPreloadMinDurationMs();
                    const remaining = Math.max(0, minMs - elapsed);
                    setTimeout(() => {
                        setPreloadExiting(true);
                        setTimeout(() => {
                            setPreloadTarget(null);
                            setPreloadExiting(false);
                        }, PRELOAD_FADEOUT_MS);
                    }, remaining);
                },
            });
        },
        [],
    );

    const showPreloadOverlay = preloadTarget !== null || preloadExiting;

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsAnimating(true);
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('landing-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('landing-theme', 'light');
        }

        setTimeout(() => setIsAnimating(false), 600);
    };

    const scrollToSection = (sectionId: string) => {
        setMobileMenuOpen(false);
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80; // Adjust for fixed navbar height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    return (
        <>
            <Head title="TriGo - Smart Tricycle Monitoring" />

            {/* Preload overlay: stays until page loads, then smooth fade-out */}
            {showPreloadOverlay && (
                <div
                    className={`fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-white/94 backdrop-blur-xl [--preload-wheel-bg:#f9fafb] [--wheel-hub:#059669] [--wheel-rim:#059669] [--wheel-spoke:#10b981] [--wheel-tire:#047857] dark:bg-gray-900/95 dark:[--preload-wheel-bg:#111827] dark:[--wheel-hub:#10b981] dark:[--wheel-rim:#34d399] dark:[--wheel-spoke:#6ee7b7] dark:[--wheel-tire:#064e3b] ${preloadExiting ? 'animate-preload-fade-out' : 'animate-preload-fade-in'}`}
                    aria-hidden="true"
                >
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/50 blur-[100px] dark:bg-emerald-900/20" />
                    </div>

                    <div className="relative flex flex-col items-center justify-center gap-8">
                        <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
                            <div className="animate-preload-pulse-ring absolute inset-0 rounded-full bg-emerald-100/60 dark:bg-emerald-900/30" />
                            <svg
                                className="animate-preload-wheel-spin h-24 w-24 sm:h-28 sm:w-28"
                                viewBox="0 0 80 80"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden
                            >
                                {/* Tire (rubber) — theme: emerald */}
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="36"
                                    fill="var(--wheel-tire)"
                                />
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="28"
                                    fill="var(--preload-wheel-bg)"
                                />
                                {/* Rim */}
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="26"
                                    stroke="var(--wheel-rim)"
                                    strokeWidth="2.5"
                                    fill="none"
                                />
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="22"
                                    stroke="var(--wheel-rim)"
                                    strokeWidth="1"
                                    strokeOpacity="0.6"
                                    fill="none"
                                />
                                {/* Spokes */}
                                {[0, 60, 120, 180, 240, 300].map((deg) => {
                                    const rad = (deg * Math.PI) / 180;
                                    const x1 = 40 + 6 * Math.cos(rad);
                                    const y1 = 40 + 6 * Math.sin(rad);
                                    const x2 = 40 + 24 * Math.cos(rad);
                                    const y2 = 40 + 24 * Math.sin(rad);
                                    return (
                                        <line
                                            key={deg}
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke="var(--wheel-spoke)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                                {/* Hub */}
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="6"
                                    fill="var(--wheel-hub)"
                                />
                                <circle
                                    cx="40"
                                    cy="40"
                                    r="3"
                                    fill="var(--wheel-tire)"
                                />
                            </svg>
                        </div>
                        <p className="text-[11px] font-medium tracking-[0.2em] text-emerald-700 uppercase opacity-100 sm:text-xs dark:text-emerald-300">
                            Taking you there
                        </p>
                    </div>
                </div>
            )}
            <div
                className={`dark-mode-transition min-h-screen overflow-x-hidden bg-white text-gray-800 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : ''}`}
            >
                {/* Navigation */}
                <nav className="sticky top-0 z-50 border-b border-green-100 bg-white/90 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
                    <div className="container mx-auto px-3 py-2.5 sm:px-6 sm:py-4">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                            {/* Logo + name - compact on mobile */}
                            <Link
                                href="/"
                                className="flex min-w-0 shrink-0 items-center gap-2"
                            >
                                <div className="flex w-10 shrink-0 items-center sm:w-12">
                                    <TriGoLogoImg
                                        size="sm"
                                        className="w-10 min-w-0 sm:w-12"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <span className="block truncate bg-linear-to-r from-emerald-500 to-green-600 bg-clip-text text-base font-bold text-transparent sm:text-2xl dark:from-emerald-400 dark:to-green-500">
                                        TriGo
                                    </span>
                                    <div className="-mt-0.5 hidden text-[10px] text-emerald-600 sm:block sm:text-xs dark:text-emerald-400">
                                        Tricycle Tracking
                                    </div>
                                </div>
                            </Link>

                            {/* Desktop Navigation Links */}
                            <div className="hidden items-center space-x-6 lg:flex xl:space-x-8">
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="text-sm font-medium text-green-600 transition-all duration-200 hover:scale-105 hover:text-green-700 xl:text-base dark:text-green-400 dark:hover:text-green-300"
                                >
                                    Features
                                </button>
                                <button
                                    onClick={() =>
                                        scrollToSection('how-it-works')
                                    }
                                    className="text-sm font-medium text-green-600 transition-all duration-200 hover:scale-105 hover:text-green-700 xl:text-base dark:text-green-400 dark:hover:text-green-300"
                                >
                                    How It Works
                                </button>
                                <button
                                    onClick={() => scrollToSection('about')}
                                    className="text-sm font-medium text-green-600 transition-all duration-200 hover:scale-105 hover:text-green-700 xl:text-base dark:text-green-400 dark:hover:text-green-300"
                                >
                                    About
                                </button>
                                <button
                                    onClick={() =>
                                        scrollToSection('testimonials')
                                    }
                                    className="text-sm font-medium text-green-600 transition-all duration-200 hover:scale-105 hover:text-green-700 xl:text-base dark:text-green-400 dark:hover:text-green-300"
                                >
                                    Testimonials
                                </button>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                                {/* Day/Night Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className={`relative h-6 w-10 shrink-0 rounded-full p-1 transition-all duration-500 sm:h-8 sm:w-14 ${
                                        isDarkMode
                                            ? 'bg-linear-to-r from-blue-900 to-purple-900'
                                            : 'bg-linear-to-r from-yellow-300 to-orange-400'
                                    } ${isAnimating ? (isDarkMode ? 'animate-switch-night' : 'animate-switch-day') : ''}`}
                                    aria-label={
                                        isDarkMode
                                            ? 'Switch to light mode'
                                            : 'Switch to dark mode'
                                    }
                                >
                                    <div
                                        className={`relative h-4 w-4 transform rounded-full transition-all duration-500 sm:h-6 sm:w-6 ${
                                            isDarkMode
                                                ? 'translate-x-4 sm:translate-x-6'
                                                : 'translate-x-0'
                                        }`}
                                    >
                                        {/* Sun */}
                                        <div
                                            className={`absolute inset-0 rounded-full bg-white transition-all duration-500 ${
                                                isDarkMode
                                                    ? 'scale-0 opacity-0'
                                                    : 'animate-sun-glow scale-100 opacity-100'
                                            }`}
                                        >
                                            <div className="animate-rotate-sun absolute inset-0 rounded-full bg-yellow-300">
                                                <div className="absolute top-0.5 left-1/2 h-1 w-0.5 -translate-x-1/2 transform bg-yellow-400"></div>
                                                <div className="absolute top-1.5 right-1 h-0.5 w-1 bg-yellow-400"></div>
                                                <div className="absolute right-1 bottom-1.5 h-0.5 w-1 bg-yellow-400"></div>
                                                <div className="absolute bottom-0.5 left-1/2 h-1 w-0.5 -translate-x-1/2 transform bg-yellow-400"></div>
                                                <div className="absolute bottom-1.5 left-1 h-0.5 w-1 bg-yellow-400"></div>
                                                <div className="absolute top-1.5 left-1 h-0.5 w-1 bg-yellow-400"></div>
                                            </div>
                                        </div>

                                        {/* Moon */}
                                        <div
                                            className={`absolute inset-0 rounded-full transition-all duration-500 ${
                                                isDarkMode
                                                    ? 'animate-moon-glow scale-100 bg-gray-200 opacity-100'
                                                    : 'scale-0 opacity-0'
                                            }`}
                                        >
                                            {/* Moon craters */}
                                            <div className="absolute top-1 left-2 h-1 w-1 rounded-full bg-gray-400"></div>
                                            <div className="absolute right-2 bottom-2 h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                                            <div className="absolute top-3 right-1 h-1 w-1 rounded-full bg-gray-400"></div>
                                        </div>

                                        {/* Stars for night mode */}
                                        {isDarkMode && (
                                            <>
                                                <div
                                                    className="animate-star-twinkle absolute -top-1 -left-1 h-1 w-1 rounded-full bg-white"
                                                    style={{
                                                        animationDelay: '0s',
                                                    }}
                                                ></div>
                                                <div
                                                    className="animate-star-twinkle absolute -top-1 -right-1 h-1 w-1 rounded-full bg-white"
                                                    style={{
                                                        animationDelay: '1s',
                                                    }}
                                                ></div>
                                                <div
                                                    className="animate-star-twinkle absolute -bottom-1 -left-1 h-1 w-1 rounded-full bg-white"
                                                    style={{
                                                        animationDelay: '0.5s',
                                                    }}
                                                ></div>
                                                <div
                                                    className="animate-star-twinkle absolute -right-1 -bottom-1 h-1 w-1 rounded-full bg-white"
                                                    style={{
                                                        animationDelay: '1.5s',
                                                    }}
                                                ></div>
                                            </>
                                        )}
                                    </div>
                                </button>

                                {auth.user ? (
                                    <Link
                                        href={ROUTES.dashboard}
                                        className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg sm:px-6 sm:py-2 sm:text-base dark:bg-green-600 dark:hover:bg-green-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleAuthClick(
                                                ROUTES.login,
                                            )}
                                            className="px-3 py-1.5 text-sm font-medium whitespace-nowrap text-green-600 transition-colors hover:text-green-700 sm:px-4 sm:py-2 sm:text-base dark:text-green-400 dark:hover:text-green-300"
                                        >
                                            Sign In
                                        </button>
                                        {canRegister && (
                                            <button
                                                type="button"
                                                onClick={handleAuthClick(
                                                    ROUTES.register,
                                                )}
                                                className="hidden rounded-lg bg-green-500 px-4 py-1.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg sm:px-6 sm:py-2 sm:text-base md:inline-flex dark:bg-green-600 dark:hover:bg-green-700"
                                            >
                                                Get Started
                                            </button>
                                        )}
                                    </>
                                )}
                                {/* Mobile Hamburger Menu - rightmost */}
                                <button
                                    onClick={() =>
                                        setMobileMenuOpen(!mobileMenuOpen)
                                    }
                                    className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 lg:hidden dark:text-green-400 dark:hover:bg-gray-800"
                                    aria-label={
                                        mobileMenuOpen
                                            ? 'Close menu'
                                            : 'Open menu'
                                    }
                                >
                                    {mobileMenuOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Navigation Dropdown */}
                        {mobileMenuOpen && (
                            <div className="mt-2 rounded-b-lg border-t border-green-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:mt-3 lg:hidden dark:border-gray-700 dark:bg-gray-900/95">
                                <div className="flex flex-col gap-0.5">
                                    <button
                                        onClick={() =>
                                            scrollToSection('features')
                                        }
                                        className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-gray-800 dark:hover:text-green-300"
                                    >
                                        Features
                                    </button>
                                    <button
                                        onClick={() =>
                                            scrollToSection('how-it-works')
                                        }
                                        className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-gray-800 dark:hover:text-green-300"
                                    >
                                        How It Works
                                    </button>
                                    <button
                                        onClick={() => scrollToSection('about')}
                                        className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-gray-800 dark:hover:text-green-300"
                                    >
                                        About
                                    </button>
                                    <button
                                        onClick={() =>
                                            scrollToSection('testimonials')
                                        }
                                        className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-gray-800 dark:hover:text-green-300"
                                    >
                                        Testimonials
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section with Floating Background Blobs */}
                <section className="relative overflow-hidden bg-linear-to-br from-green-50 via-white to-emerald-50 py-12 sm:py-16 lg:py-20 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
                    {/* Floating Background Blobs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="animate-blob absolute -top-20 -left-20 h-48 w-48 rounded-full bg-green-200 opacity-20 mix-blend-multiply blur-xl filter sm:h-72 sm:w-72 dark:bg-green-800"></div>
                        <div className="animate-blob animation-delay-2000 absolute -top-20 -right-20 h-48 w-48 rounded-full bg-emerald-300 opacity-20 mix-blend-multiply blur-xl filter sm:h-72 sm:w-72 dark:bg-emerald-700"></div>
                        <div className="animate-blob animation-delay-4000 absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-green-400 opacity-20 mix-blend-multiply blur-xl filter sm:h-72 sm:w-72 dark:bg-green-600"></div>
                        <div className="animate-blob-slow absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-emerald-200 opacity-15 mix-blend-multiply blur-xl filter sm:h-96 sm:w-96 dark:bg-emerald-800"></div>
                    </div>

                    {/* Animated Background Elements - pointer-events-none so they don't block clicks */}
                    <div className="animate-float pointer-events-none absolute top-10 left-10 h-12 w-12 rounded-full bg-green-200 opacity-20 sm:h-20 sm:w-20 dark:bg-green-700"></div>
                    <div className="animate-float-delayed pointer-events-none absolute top-40 right-20 h-10 w-10 rounded-full bg-emerald-300 opacity-30 sm:h-16 sm:w-16 dark:bg-emerald-600"></div>
                    <div className="animate-float-slow pointer-events-none absolute bottom-20 left-1/4 h-8 w-8 rounded-full bg-green-400 opacity-25 sm:h-12 sm:w-12 dark:bg-green-500"></div>
                    <div className="animate-float pointer-events-none absolute top-1/3 right-1/4 h-6 w-6 rounded-full bg-emerald-400 opacity-30 sm:h-8 sm:w-8 dark:bg-emerald-500"></div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-12">
                            {/* Left Content */}
                            <div className="max-w-2xl flex-1 text-center lg:text-left">
                                <div className="animate-fade-in mb-6 inline-flex items-center space-x-2 rounded-full border border-green-100 bg-white/80 px-3 py-1.5 text-xs font-medium text-green-700 shadow-md backdrop-blur-sm sm:mb-8 sm:px-4 sm:py-2 sm:text-sm dark:border-green-800 dark:bg-gray-800/80 dark:text-green-300">
                                    <span className="text-base sm:text-lg">
                                        🌱
                                    </span>
                                    <span>
                                        IoT-Based Tricycle Tracking and
                                        Monitoring System
                                    </span>
                                </div>

                                <h1 className="animate-slide-up mb-4 text-3xl leading-tight font-bold sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
                                    Track Your{' '}
                                    <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                                        Tricycle Ride
                                    </span>{' '}
                                    in Real-Time
                                </h1>

                                <p className="animate-slide-up-delayed mb-6 text-base leading-relaxed text-gray-600 sm:mb-8 sm:text-lg md:text-xl dark:text-gray-300">
                                    Real-time GPS tracking and fleet management
                                    made simple. Monitor your tricycles,
                                    optimize routes, and improve efficiency with
                                    our intelligent platform.
                                </p>

                                <div className="animate-fade-in-up mb-6 flex w-full flex-col justify-center gap-3 sm:mb-8 sm:w-auto sm:flex-row sm:gap-4 lg:justify-start">
                                    {/* Always show Start Now so hero looks the same before/after refresh; Dashboard is in the nav when logged in */}
                                    <button
                                        type="button"
                                        onClick={handleAuthClick(
                                            ROUTES.register,
                                        )}
                                        className="group flex min-h-[48px] w-full transform items-center justify-center rounded-xl bg-green-500 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-green-600 hover:shadow-xl sm:min-h-0 sm:w-auto sm:px-8 sm:py-4 sm:text-lg dark:bg-green-600 dark:hover:bg-green-700"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>Start Now</span>
                                            <svg
                                                className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            scrollToSection('connect')
                                        }
                                        className="group flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border-2 border-green-200 px-6 py-3 text-base font-semibold text-green-700 transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:shadow-lg sm:min-h-0 sm:w-auto sm:px-8 sm:py-4 sm:text-lg dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>Support Us</span>
                                            <Heart className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
                                        </span>
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="animate-fade-in flex flex-col items-center justify-center space-y-2 text-xs text-gray-500 sm:flex-row sm:space-y-0 sm:space-x-4 sm:text-sm lg:justify-start lg:space-x-6 dark:text-gray-400">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-0.5 sm:space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs text-yellow-400 sm:text-sm"
                                                >
                                                    ⭐
                                                </span>
                                            ))}
                                        </div>
                                        <span>4.9/5 Rating</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 rounded-full bg-green-400 dark:bg-green-500"></div>
                                        <span>99.9% Uptime</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Banner with Floating Animation */}
                            <div className="animate-float-slow w-full max-w-2xl flex-1">
                                <div className="sm:hover:shadow-3xl rounded-2xl border border-green-100/50 bg-white/80 p-4 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl sm:rounded-3xl sm:p-6 sm:shadow-2xl lg:p-8 dark:border-green-800/50 dark:bg-gray-800/80">
                                    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-green-100 to-emerald-100 sm:rounded-2xl dark:from-green-900 dark:to-emerald-900">
                                        {/* Animated map dots */}
                                        <div className="absolute top-4 left-4 h-2 w-2 animate-pulse rounded-full bg-green-500 sm:h-3 sm:w-3 dark:bg-green-400"></div>
                                        <div className="absolute top-8 right-8 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 delay-75 sm:h-2 sm:w-2 dark:bg-emerald-300"></div>
                                        <div className="absolute bottom-6 left-12 h-1.5 w-1.5 animate-pulse rounded-full bg-green-600 delay-150 sm:h-2 sm:w-2 dark:bg-green-500"></div>
                                        <div className="absolute top-12 left-20 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 delay-300 sm:h-2 sm:w-2 dark:bg-emerald-400"></div>

                                        <div className="relative z-10 text-center">
                                            <div className="animate-bounce-slow mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg sm:mb-4 sm:h-20 sm:w-20 dark:bg-green-600">
                                                <svg
                                                    className="h-8 w-8 text-white sm:h-10 sm:w-10"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-semibold text-green-700 sm:text-lg dark:text-green-300">
                                                Live Fleet Dashboard
                                            </p>
                                            <p className="text-xs text-green-500 sm:text-sm dark:text-green-400">
                                                Real-time tricycle monitoring
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section
                    id="features"
                    className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20 dark:bg-gray-900"
                >
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-blob-slow absolute -top-40 -right-40 h-64 w-64 rounded-full bg-green-100 opacity-20 mix-blend-multiply blur-xl filter sm:h-80 sm:w-80 dark:bg-green-800"></div>
                        <div className="animate-blob animation-delay-3000 absolute -bottom-40 -left-40 h-64 w-64 rounded-full bg-emerald-100 opacity-20 mix-blend-multiply blur-xl filter sm:h-80 sm:w-80 dark:bg-emerald-800"></div>
                    </div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
                            <h2 className="mb-3 text-2xl font-bold text-gray-800 sm:mb-4 sm:text-3xl lg:text-4xl dark:text-white">
                                Everything You Need
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg lg:text-xl dark:text-gray-300">
                                Powerful features to manage your tricycle fleet
                                efficiently
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group rounded-xl border border-green-100 bg-white/60 p-4 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-green-50 hover:shadow-lg sm:rounded-2xl sm:p-6 dark:border-green-800 dark:bg-gray-800/60 dark:hover:bg-green-900/20"
                                >
                                    <div className="mb-3 text-2xl transition-transform duration-200 group-hover:scale-110 sm:mb-4 sm:text-3xl">
                                        {feature.icon}
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-green-700 sm:mb-3 sm:text-xl dark:text-green-400">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section
                    id="how-it-works"
                    className="relative overflow-hidden bg-green-50 py-12 sm:py-16 lg:py-20 dark:bg-gray-800"
                >
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-blob absolute top-20 left-10 h-48 w-48 rounded-full bg-emerald-200 opacity-20 mix-blend-multiply blur-xl filter sm:h-64 sm:w-64 dark:bg-emerald-700"></div>
                        <div className="animate-blob-slow animation-delay-2000 absolute right-10 bottom-20 h-48 w-48 rounded-full bg-green-300 opacity-20 mix-blend-multiply blur-xl filter sm:h-64 sm:w-64 dark:bg-green-600"></div>
                    </div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
                            <h2 className="mb-3 text-2xl font-bold text-gray-800 sm:mb-4 sm:text-3xl lg:text-4xl dark:text-white">
                                Simple Setup
                            </h2>
                            <p className="text-base text-gray-600 sm:text-lg lg:text-xl dark:text-gray-300">
                                Get started in just a few steps
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 lg:gap-8">
                            {howItWorks.map((item, index) => (
                                <div key={index} className="group text-center">
                                    <div className="relative mb-4 sm:mb-6">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 bg-white shadow-md backdrop-blur-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg sm:h-20 sm:w-20 dark:border-green-600 dark:bg-gray-700">
                                            <span className="text-xl font-bold text-green-600 sm:text-2xl dark:text-green-400">
                                                {item.step}
                                            </span>
                                        </div>
                                        {index < howItWorks.length - 1 && (
                                            <div className="absolute top-8 left-1/2 -z-10 hidden h-0.5 w-full bg-green-200 transition-colors group-hover:bg-green-300 sm:top-10 sm:block dark:bg-green-700 dark:group-hover:bg-green-600"></div>
                                        )}
                                    </div>
                                    <h3 className="mb-1 text-sm font-semibold text-green-700 sm:mb-2 sm:text-base lg:text-lg dark:text-green-400">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section
                    id="about"
                    className="relative overflow-hidden bg-linear-to-b from-green-50/50 to-white py-12 sm:py-16 lg:py-24 dark:from-gray-800/50 dark:to-gray-900"
                >
                    {/* Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-blob absolute -top-40 -right-40 h-72 w-72 rounded-full bg-emerald-200/40 mix-blend-multiply blur-3xl filter sm:h-96 sm:w-96 dark:bg-emerald-900/30"></div>
                        <div className="animate-blob-slow absolute -bottom-40 -left-40 h-72 w-72 rounded-full bg-green-200/40 mix-blend-multiply blur-3xl filter sm:h-96 sm:w-96 dark:bg-green-900/30"></div>
                        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/30 mix-blend-multiply blur-3xl filter dark:bg-emerald-900/20"></div>
                    </div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="mx-auto max-w-5xl">
                            {/* Section Header */}
                            <div className="mb-12 text-center sm:mb-16">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100/80 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>Our Platform</span>
                                </div>
                                <h2 className="mb-4 text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl dark:text-white">
                                    {about.title ?? 'About TriGo'}
                                </h2>
                                {about.subtitle ? (
                                    <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl dark:text-gray-400">
                                        {about.subtitle}
                                    </p>
                                ) : null}
                            </div>

                            {/* About Content - Two Column Layout */}
                            <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
                                {/* Left: Description */}
                                <div className="flex-1 space-y-6">
                                    <div className="rounded-2xl border border-green-100/80 bg-white/80 p-6 shadow-xl shadow-green-100/50 backdrop-blur-md sm:rounded-3xl sm:p-8 lg:p-10 dark:border-green-800/50 dark:bg-gray-800/80 dark:shadow-none">
                                        {(about.paragraphs ?? [])
                                            .filter(Boolean)
                                            .map((para, idx) => (
                                                <p
                                                    key={idx}
                                                    className="text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300"
                                                >
                                                    {para}
                                                </p>
                                            ))}
                                    </div>
                                </div>

                                {/* Right: Role Highlights */}
                                <div className="w-full flex-1 space-y-4 lg:max-w-md">
                                    {(about.highlights ?? []).map((item, i) => (
                                        <div
                                            key={i}
                                            className="group flex gap-4 rounded-xl border border-green-100/80 bg-white/80 p-4 shadow-lg shadow-green-50/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-100/50 sm:rounded-2xl sm:p-5 dark:border-green-800/50 dark:bg-gray-800/80 dark:shadow-none dark:hover:shadow-green-900/20"
                                        >
                                            <div
                                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-lg transition-transform group-hover:scale-110 sm:h-14 sm:w-14 ${
                                                    i === 0
                                                        ? 'bg-linear-to-br from-emerald-500 to-green-600'
                                                        : i === 1
                                                          ? 'bg-linear-to-br from-green-500 to-emerald-600'
                                                          : 'bg-linear-to-br from-teal-500 to-emerald-600'
                                                }`}
                                            >
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="mb-1 font-semibold text-gray-800 dark:text-white">
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Meet Our Team - outside max-w-5xl so columns are wide enough for normal paragraphs */}
                        <div className="mt-16 w-full sm:mt-20">
                            <div className="mb-12 text-center sm:mb-16">
                                <h3 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
                                    Meet Our Team
                                </h3>
                                {team.subtitle ? (
                                    <p className="mx-auto max-w-2xl text-base text-gray-500 sm:text-lg dark:text-gray-400">
                                        {team.subtitle}
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid w-full grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
                                {(team.members ?? []).map((member, index) => (
                                    <div
                                        key={index}
                                        className="group flex h-full min-h-[320px] w-full min-w-0 flex-col items-center rounded-xl border border-transparent bg-white/50 p-4 text-center transition-all duration-300 hover:scale-105 hover:border-green-200 hover:bg-white hover:shadow-lg hover:shadow-green-100/50 dark:bg-gray-800/50 dark:hover:border-green-700 dark:hover:bg-gray-800 dark:hover:shadow-green-900/20"
                                    >
                                        {/* Avatar, name, role, location - centered */}
                                        <div className="flex min-h-[200px] w-full flex-col items-center text-center">
                                            <div className="mb-4 flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-4xl ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-4 group-hover:ring-green-400 sm:h-40 sm:w-40 sm:text-5xl lg:h-44 lg:w-44 dark:bg-gray-700 dark:ring-gray-600 dark:group-hover:ring-green-500">
                                                {member.avatar &&
                                                (member.avatar.startsWith(
                                                    'http',
                                                ) ||
                                                    member.avatar.startsWith(
                                                        '/',
                                                    )) ? (
                                                    <img
                                                        src={member.avatar}
                                                        alt={member.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : member.avatar &&
                                                  /\.(jpe?g|png|gif|webp)$/i.test(
                                                      member.avatar,
                                                  ) ? (
                                                    <img
                                                        src={`/storage/${member.avatar}`}
                                                        alt={member.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    member.avatar || null
                                                )}
                                            </div>
                                            <h4 className="mb-1 px-1 text-lg font-bold tracking-wide text-gray-900 uppercase transition-colors duration-300 group-hover:text-green-600 sm:text-xl dark:text-white dark:group-hover:text-green-400">
                                                {member.name}
                                            </h4>
                                            <p className="mb-1 text-base text-gray-900 transition-colors duration-300 group-hover:text-green-700 sm:text-lg dark:text-white dark:group-hover:text-green-300">
                                                {member.role}
                                            </p>
                                            {member.location ? (
                                                <p className="mb-0 flex items-center justify-center gap-1.5 text-base text-gray-600 dark:text-gray-400">
                                                    <MapPin className="h-4 w-4 shrink-0" />
                                                    <span>
                                                        {member.location}
                                                    </span>
                                                </p>
                                            ) : (
                                                <div
                                                    className="h-6"
                                                    aria-hidden
                                                />
                                            )}
                                        </div>
                                        {/* Description: left-aligned paragraph, full column width, comfortable line height */}
                                        <div className="mt-5 w-full text-left">
                                            {member.description ? (
                                                <p className="text-[15px] leading-relaxed text-gray-600 sm:text-base sm:leading-loose dark:text-gray-400">
                                                    {member.description}
                                                </p>
                                            ) : (
                                                <p className="min-h-12 text-base leading-relaxed text-gray-400 dark:text-gray-500">
                                                    &nbsp;
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials & Social Proof */}
                <section
                    id="testimonials"
                    className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20 dark:bg-gray-900"
                >
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-blob-slow absolute -top-20 -left-20 h-64 w-64 rounded-full bg-green-100 opacity-15 mix-blend-multiply blur-xl filter sm:h-96 sm:w-96 dark:bg-green-800"></div>
                        <div className="animate-blob animation-delay-4000 absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-100 opacity-15 mix-blend-multiply blur-xl filter sm:h-96 sm:w-96 dark:bg-emerald-800"></div>
                    </div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
                            <h2 className="mb-3 text-2xl font-bold text-gray-800 sm:mb-4 sm:text-3xl lg:text-4xl dark:text-white">
                                Trusted by Tricycle Operators
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg lg:text-xl dark:text-gray-300">
                                Join hundreds of operators who transformed their
                                business with TriGo
                            </p>
                        </div>

                        {/* Testimonials Grid - real user feedbacks or empty state */}
                        {(() => {
                            return (
                                <div className="relative mx-auto mb-10 max-w-5xl sm:mb-12 lg:mb-16">
                                    {shouldCarousel ? (
                                        <>
                                            <div className="overflow-hidden">
                                                <div
                                                    className="flex transition-transform duration-700 ease-in-out"
                                                    style={{
                                                        transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                                                    }}
                                                >
                                                    {landingReviews.length >
                                                    0 ? (
                                                        landingReviews.map(
                                                            (testimonial) => (
                                                                <div
                                                                    key={
                                                                        testimonial.id
                                                                    }
                                                                    className="min-w-0 shrink-0 px-2"
                                                                    style={{
                                                                        width: `${100 / itemsPerView}%`,
                                                                    }}
                                                                >
                                                                    <div className="group h-full rounded-xl border border-green-100 bg-white/60 p-4 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg sm:rounded-2xl sm:p-6 dark:border-green-800 dark:bg-gray-800/60">
                                                                        <div className="mb-3 flex items-center sm:mb-4">
                                                                            <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 transition-transform group-hover:scale-110 sm:mr-4 sm:h-12 sm:w-12 dark:bg-green-800">
                                                                                {testimonial.avatar ? (
                                                                                    <img
                                                                                        src={
                                                                                            testimonial.avatar
                                                                                        }
                                                                                        alt={
                                                                                            testimonial.name
                                                                                        }
                                                                                        className="h-full w-full object-cover"
                                                                                        onError={(
                                                                                            e,
                                                                                        ) => {
                                                                                            (
                                                                                                e.target as HTMLImageElement
                                                                                            ).style.display =
                                                                                                'none';
                                                                                            (
                                                                                                e.target as HTMLImageElement
                                                                                            ).nextElementSibling?.classList.remove(
                                                                                                'hidden',
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                ) : null}
                                                                                <span
                                                                                    className={
                                                                                        testimonial.avatar
                                                                                            ? 'hidden text-xl sm:text-2xl'
                                                                                            : 'text-xl sm:text-2xl'
                                                                                    }
                                                                                >
                                                                                    👤
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="text-sm font-semibold text-green-700 sm:text-base dark:text-green-400">
                                                                                    {
                                                                                        testimonial.name
                                                                                    }
                                                                                </h4>
                                                                                <p className="text-xs text-green-600 sm:text-sm dark:text-green-500">
                                                                                    {
                                                                                        testimonial.role
                                                                                    }
                                                                                </p>
                                                                                <p className="text-[10px] text-green-500 sm:text-xs dark:text-green-600">
                                                                                    {
                                                                                        testimonial.company
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mb-2 flex sm:mb-3">
                                                                            {[
                                                                                ...Array(
                                                                                    Math.min(
                                                                                        5,
                                                                                        Math.max(
                                                                                            1,
                                                                                            testimonial.rating,
                                                                                        ),
                                                                                    ),
                                                                                ),
                                                                            ].map(
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            i
                                                                                        }
                                                                                        className="text-xs text-yellow-400 sm:text-sm"
                                                                                    >
                                                                                        ⭐
                                                                                    </span>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-gray-600 italic sm:text-sm dark:text-gray-300">
                                                                            "
                                                                            {
                                                                                testimonial.content
                                                                            }
                                                                            "
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )
                                                    ) : (
                                                        <div className="w-full">
                                                            <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-green-100 bg-white/60 p-8 text-center backdrop-blur-sm sm:rounded-2xl sm:p-12 dark:border-green-800 dark:bg-gray-800/60">
                                                                <div className="mb-4 text-5xl sm:text-6xl">
                                                                    💬
                                                                </div>
                                                                <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl dark:text-white">
                                                                    No feedbacks
                                                                    yet
                                                                </h3>
                                                                <p className="mb-6 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                                                    Be the first
                                                                    to share
                                                                    your TriGo
                                                                    experience!
                                                                    Give us your
                                                                    feedback to
                                                                    help others
                                                                    discover how
                                                                    TriGo makes
                                                                    tricycle
                                                                    travel
                                                                    simpler and
                                                                    safer.
                                                                </p>
                                                                {!auth.user && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleAuthClick(
                                                                            ROUTES.register,
                                                                        )}
                                                                        className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                                                                    >
                                                                        Get
                                                                        Started
                                                                        <svg
                                                                            className="h-4 w-4"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Carousel indicators */}
                                            {totalSlides > 1 && (
                                                <div className="mt-6 flex justify-center gap-2">
                                                    {Array.from({
                                                        length: totalSlides,
                                                    }).map((_, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() =>
                                                                setCurrentIndex(
                                                                    index,
                                                                )
                                                            }
                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                index ===
                                                                currentIndex
                                                                    ? 'w-8 bg-green-500'
                                                                    : 'w-2 bg-green-300 dark:bg-green-700'
                                                            }`}
                                                            aria-label={`Go to slide ${index + 1}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                                            {landingReviews.length > 0 ? (
                                                landingReviews
                                                    .slice(0, 3)
                                                    .map((testimonial) => (
                                                        <div
                                                            key={testimonial.id}
                                                            className="group rounded-xl border border-green-100 bg-white/60 p-4 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg sm:rounded-2xl sm:p-6 dark:border-green-800 dark:bg-gray-800/60"
                                                        >
                                                            <div className="mb-3 flex items-center sm:mb-4">
                                                                <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 transition-transform group-hover:scale-110 sm:mr-4 sm:h-12 sm:w-12 dark:bg-green-800">
                                                                    {testimonial.avatar ? (
                                                                        <img
                                                                            src={
                                                                                testimonial.avatar
                                                                            }
                                                                            alt={
                                                                                testimonial.name
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                            onError={(
                                                                                e,
                                                                            ) => {
                                                                                (
                                                                                    e.target as HTMLImageElement
                                                                                ).style.display =
                                                                                    'none';
                                                                                (
                                                                                    e.target as HTMLImageElement
                                                                                ).nextElementSibling?.classList.remove(
                                                                                    'hidden',
                                                                                );
                                                                            }}
                                                                        />
                                                                    ) : null}
                                                                    <span
                                                                        className={
                                                                            testimonial.avatar
                                                                                ? 'hidden text-xl sm:text-2xl'
                                                                                : 'text-xl sm:text-2xl'
                                                                        }
                                                                    >
                                                                        👤
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-green-700 sm:text-base dark:text-green-400">
                                                                        {
                                                                            testimonial.name
                                                                        }
                                                                    </h4>
                                                                    <p className="text-xs text-green-600 sm:text-sm dark:text-green-500">
                                                                        {
                                                                            testimonial.role
                                                                        }
                                                                    </p>
                                                                    <p className="text-[10px] text-green-500 sm:text-xs dark:text-green-600">
                                                                        {
                                                                            testimonial.company
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mb-2 flex sm:mb-3">
                                                                {[
                                                                    ...Array(
                                                                        Math.min(
                                                                            5,
                                                                            Math.max(
                                                                                1,
                                                                                testimonial.rating,
                                                                            ),
                                                                        ),
                                                                    ),
                                                                ].map(
                                                                    (_, i) => (
                                                                        <span
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="text-xs text-yellow-400 sm:text-sm"
                                                                        >
                                                                            ⭐
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 italic sm:text-sm dark:text-gray-300">
                                                                "
                                                                {
                                                                    testimonial.content
                                                                }
                                                                "
                                                            </p>
                                                        </div>
                                                    ))
                                            ) : (
                                                <div className="col-span-full">
                                                    <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-green-100 bg-white/60 p-8 text-center backdrop-blur-sm sm:rounded-2xl sm:p-12 dark:border-green-800 dark:bg-gray-800/60">
                                                        <div className="mb-4 text-5xl sm:text-6xl">
                                                            💬
                                                        </div>
                                                        <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl dark:text-white">
                                                            No feedbacks yet
                                                        </h3>
                                                        <p className="mb-6 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                                            Be the first to
                                                            share your TriGo
                                                            experience! Give us
                                                            your feedback to
                                                            help others discover
                                                            how TriGo makes
                                                            tricycle travel
                                                            simpler and safer.
                                                        </p>
                                                        {!auth.user && (
                                                            <button
                                                                type="button"
                                                                onClick={handleAuthClick(
                                                                    ROUTES.register,
                                                                )}
                                                                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                                                            >
                                                                Get Started
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Stats Bar */}
                        <div className="sm:hover:shadow-3xl mx-auto max-w-4xl rounded-xl bg-linear-to-r from-green-500 to-emerald-600 p-6 text-center text-white shadow-xl backdrop-blur-sm transition-all duration-200 hover:shadow-2xl sm:rounded-2xl sm:p-8 sm:shadow-2xl dark:from-green-600 dark:to-emerald-700">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                                {[
                                    {
                                        number: '50+',
                                        label: 'Tricycles Managed',
                                    },
                                    { number: '24/7', label: 'Live Tracking' },
                                    { number: '30%', label: 'Cost Reduction' },
                                    { number: '99.9%', label: 'Uptime' },
                                ].map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="mb-1 text-xl font-bold sm:mb-2 sm:text-2xl lg:text-3xl">
                                            {stat.number}
                                        </div>
                                        <div className="text-xs text-green-100 sm:text-sm">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="relative overflow-hidden bg-linear-to-br from-green-50 to-emerald-100 py-12 sm:py-16 lg:py-20 dark:from-gray-800 dark:to-emerald-900">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full">
                            <div className="animate-blob absolute top-10 left-10 h-48 w-48 rounded-full bg-green-200 opacity-20 mix-blend-multiply blur-xl filter sm:h-64 sm:w-64 dark:bg-green-700"></div>
                            <div className="animate-blob-slow animation-delay-3000 absolute right-10 bottom-10 h-48 w-48 rounded-full bg-emerald-300 opacity-20 mix-blend-multiply blur-xl filter sm:h-64 sm:w-64 dark:bg-emerald-600"></div>
                            <div className="animate-blob animation-delay-6000 absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-green-400 opacity-15 mix-blend-multiply blur-xl filter sm:h-80 sm:w-80 dark:bg-green-500"></div>
                        </div>
                    </div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="mx-auto max-w-4xl text-center">
                            <h2 className="mb-4 text-2xl font-bold text-gray-800 sm:mb-6 sm:text-3xl lg:text-4xl xl:text-5xl dark:text-white">
                                Ready to Transform Your{' '}
                                <span className="text-green-600 dark:text-green-400">
                                    Tricycle Business
                                </span>
                                ?
                            </h2>
                            <p className="mx-auto mb-6 max-w-2xl rounded-lg bg-white/30 p-3 text-base text-gray-600 backdrop-blur-sm sm:mb-8 sm:p-4 sm:text-lg lg:text-xl dark:bg-gray-800/30 dark:text-gray-300">
                                Join hundreds of satisfied operators who have
                                revolutionized their fleet management with
                                TriGo's smart tracking solutions.
                            </p>

                            <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:mb-8 sm:flex-row sm:gap-4">
                                <button
                                    type="button"
                                    onClick={handleAuthClick(
                                        ROUTES.register,
                                    )}
                                    className="sm:hover:shadow-3xl group flex transform items-center space-x-2 rounded-xl bg-green-500 px-6 py-3 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-green-600 hover:shadow-xl sm:px-8 sm:py-4 sm:text-lg sm:shadow-2xl dark:bg-green-600 dark:hover:bg-green-700"
                                >
                                    <span>Start Now</span>
                                    <svg
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </button>
                                <div className="flex items-center space-x-2 rounded-lg bg-white/30 px-3 py-2 text-gray-600 backdrop-blur-sm sm:px-4 dark:bg-gray-800/30 dark:text-gray-300">
                                    <svg
                                        className="h-4 w-4 text-green-500 sm:h-5 sm:w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    <span className="text-xs sm:text-sm">
                                        No credit card required • 14-day free
                                        trial
                                    </span>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center space-y-3 rounded-lg bg-white/30 p-3 text-xs text-gray-500 backdrop-blur-sm sm:flex-row sm:space-y-0 sm:space-x-4 sm:p-4 sm:text-sm lg:space-x-8 dark:bg-gray-800/30 dark:text-gray-300">
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-0.5 sm:space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className="text-xs text-yellow-400 sm:text-sm"
                                            >
                                                ⭐
                                            </span>
                                        ))}
                                    </div>
                                    <span>4.9/5 from 100+ feedbacks</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="h-3 w-3 text-green-500 sm:h-4 sm:w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>99.9% Uptime</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg
                                        className="h-3 w-3 text-green-500 sm:h-4 sm:w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer
                    id="connect"
                    className="relative bg-green-800 py-6 text-white sm:py-8 dark:bg-gray-900"
                >
                    {/* Simplified background */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 h-24 w-24 rounded-full bg-green-600 blur-3xl sm:h-32 sm:w-32"></div>
                        <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full bg-emerald-700 blur-3xl sm:h-32 sm:w-32"></div>
                    </div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        {/* Main content aligned in a single row */}
                        <div className="flex flex-col items-center justify-between space-y-4 sm:space-y-6 md:flex-row md:space-y-0">
                            {/* Left side - Brand with stats inline */}
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:gap-6">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
                                        <TriGoLogoImg
                                            size="lg"
                                            className="w-14 sm:w-16"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold sm:text-xl">
                                            TriGo
                                        </div>
                                        <div className="text-xs text-green-200 sm:text-sm dark:text-green-300">
                                            Smart Mobility Solutions
                                        </div>
                                    </div>
                                </div>

                                {/* Simple stats - now inline with brand */}
                                <div className="flex space-x-4 text-xs sm:space-x-6 sm:text-sm">
                                    <div className="text-center">
                                        <div className="font-semibold text-green-300 dark:text-green-400">
                                            50+
                                        </div>
                                        <div className="text-[10px] text-green-200 sm:text-xs dark:text-green-300">
                                            Users
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-green-300 dark:text-green-400">
                                            24/7
                                        </div>
                                        <div className="text-[10px] text-green-200 sm:text-xs dark:text-green-300">
                                            Monitoring
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Social links */}
                            <div className="flex flex-col items-center md:items-end">
                                <h4 className="mb-2 text-sm font-semibold text-green-100 sm:mb-3 sm:text-base dark:text-green-200">
                                    Connect With Us
                                </h4>
                                <div className="flex space-x-2 sm:space-x-3">
                                    {[
                                        {
                                            platform: 'Facebook',
                                            href: 'https://web.facebook.com/georperay',
                                            icon: (
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                            ),
                                        },
                                        {
                                            platform: 'GitHub',
                                            href: 'https://github.com/rayyyyyw',
                                            icon: (
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                            ),
                                        },
                                        {
                                            platform: 'Email',
                                            href: 'mailto:hello@trigo.com',
                                            icon: (
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            ),
                                        },
                                    ].map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-200 transition-colors hover:text-white"
                                            title={social.platform}
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 transition-colors hover:bg-green-600 sm:h-10 sm:w-10 dark:bg-gray-800 dark:hover:bg-gray-700">
                                                {social.icon}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom copyright - simplified */}
                        <div className="mt-6 border-t border-green-700 pt-4 text-center sm:mt-8 sm:pt-6 dark:border-gray-700">
                            <p className="text-xs text-green-300 sm:text-sm dark:text-green-400">
                                &copy; 2025 TriGo - IOT Tricycle Monitoring
                                System
                            </p>
                            <p className="mt-1 text-[10px] text-green-400 sm:text-xs dark:text-green-500">
                                Created by Ray Georpe • Capstone Project
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
