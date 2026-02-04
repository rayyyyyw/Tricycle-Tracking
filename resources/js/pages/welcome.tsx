import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { dashboard, login, register } from '@/routes';
import { useState, useEffect } from 'react';
import TriGoLogo from '@/components/TriGoLogo';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    // Use separate localStorage key for landing page to avoid conflicts with authenticated pages
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('landing-theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
        }
        return false;
    });
    const [isAnimating, setIsAnimating] = useState(false);

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
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80; // Adjust for fixed navbar height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            <Head title="TriGo - Smart Tricycle Monitoring" />
            <div className={`min-h-screen bg-white text-gray-800 overflow-x-hidden dark-mode-transition ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : ''}`}>
                {/* Navigation */}
                <nav className="bg-white/90 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 shadow-sm dark:bg-gray-900/90 dark:border-gray-800">
                    <div className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-4">
                        <div className="flex items-center justify-between gap-2 min-w-0">
                            {/* Logo + name - compact on mobile */}
                            <Link href="/" className="flex items-center gap-2 min-w-0 shrink-0">
                                <div className="w-9 sm:w-11 shrink-0 flex items-center">
                                    <TriGoLogo showText={false} size="sm" className="w-9 min-w-0 sm:w-11" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-base sm:text-2xl font-bold bg-linear-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-500 truncate">TriGo</span>
                                    <div className="hidden sm:block text-[10px] sm:text-xs text-emerald-600 -mt-0.5 dark:text-emerald-400">Tricycle Tracking</div>
                                </div>
                            </Link>
                            
                            {/* Desktop Navigation Links */}
                            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="text-green-600 hover:text-green-700 font-medium transition-all duration-200 hover:scale-105 text-sm xl:text-base dark:text-green-400 dark:hover:text-green-300"
                                >
                                    Features
                                </button>
                                <button
                                    onClick={() => scrollToSection('how-it-works')}
                                    className="text-green-600 hover:text-green-700 font-medium transition-all duration-200 hover:scale-105 text-sm xl:text-base dark:text-green-400 dark:hover:text-green-300"
                                >
                                    How It Works
                                </button>
                                <button
                                    onClick={() => scrollToSection('about')}
                                    className="text-green-600 hover:text-green-700 font-medium transition-all duration-200 hover:scale-105 text-sm xl:text-base dark:text-green-400 dark:hover:text-green-300"
                                >
                                    About
                                </button>
                                <button
                                    onClick={() => scrollToSection('testimonials')}
                                    className="text-green-600 hover:text-green-700 font-medium transition-all duration-200 hover:scale-105 text-sm xl:text-base dark:text-green-400 dark:hover:text-green-300"
                                >
                                    Testimonials
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                                {/* Day/Night Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className={`relative w-10 h-6 sm:w-14 sm:h-8 rounded-full p-1 transition-all duration-500 shrink-0 ${
                                        isDarkMode 
                                            ? 'bg-linear-to-r from-blue-900 to-purple-900' 
                                            : 'bg-linear-to-r from-yellow-300 to-orange-400'
                                    } ${isAnimating ? (isDarkMode ? 'animate-switch-night' : 'animate-switch-day') : ''}`}
                                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                                >
                                    <div className={`relative w-4 h-4 sm:w-6 sm:h-6 rounded-full transition-all duration-500 transform ${
                                        isDarkMode ? 'translate-x-4 sm:translate-x-6' : 'translate-x-0'
                                    }`}>
                                        {/* Sun */}
                                        <div className={`absolute inset-0 rounded-full bg-white transition-all duration-500 ${
                                            isDarkMode ? 'opacity-0 scale-0' : 'opacity-100 scale-100 animate-sun-glow'
                                        }`}>
                                            <div className="absolute inset-0 rounded-full bg-yellow-300 animate-rotate-sun">
                                                <div className="absolute top-0.5 left-1/2 w-0.5 h-1 bg-yellow-400 transform -translate-x-1/2"></div>
                                                <div className="absolute top-1.5 right-1 w-1 h-0.5 bg-yellow-400"></div>
                                                <div className="absolute bottom-1.5 right-1 w-1 h-0.5 bg-yellow-400"></div>
                                                <div className="absolute bottom-0.5 left-1/2 w-0.5 h-1 bg-yellow-400 transform -translate-x-1/2"></div>
                                                <div className="absolute bottom-1.5 left-1 w-1 h-0.5 bg-yellow-400"></div>
                                                <div className="absolute top-1.5 left-1 w-1 h-0.5 bg-yellow-400"></div>
                                            </div>
                                        </div>
                                        
                                        {/* Moon */}
                                        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                                            isDarkMode ? 'opacity-100 scale-100 bg-gray-200 animate-moon-glow' : 'opacity-0 scale-0'
                                        }`}>
                                            {/* Moon craters */}
                                            <div className="absolute top-1 left-2 w-1 h-1 bg-gray-400 rounded-full"></div>
                                            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                            <div className="absolute top-3 right-1 w-1 h-1 bg-gray-400 rounded-full"></div>
                                        </div>

                                        {/* Stars for night mode */}
                                        {isDarkMode && (
                                            <>
                                                <div className="absolute -top-1 -left-1 w-1 h-1 bg-white rounded-full animate-star-twinkle" style={{animationDelay: '0s'}}></div>
                                                <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-star-twinkle" style={{animationDelay: '1s'}}></div>
                                                <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-star-twinkle" style={{animationDelay: '0.5s'}}></div>
                                                <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-white rounded-full animate-star-twinkle" style={{animationDelay: '1.5s'}}></div>
                                            </>
                                        )}
                                    </div>
                                </button>

                                {auth.user ? (
                                    <Link
                                        href={dashboard().url}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base dark:bg-green-600 dark:hover:bg-green-700 whitespace-nowrap"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-green-600 hover:text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition-colors text-sm sm:text-base dark:text-green-400 dark:hover:text-green-300 whitespace-nowrap"
                                        >
                                            Sign In
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="hidden md:inline-flex bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base dark:bg-green-600 dark:hover:bg-green-700"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Navigation Menu */}
                        <div className="lg:hidden mt-2 sm:mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 border-t border-green-100 pt-2.5 sm:pt-3 dark:border-gray-700">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="text-green-600 hover:text-green-700 font-medium transition-colors text-xs sm:text-sm dark:text-green-400 dark:hover:text-green-300 py-1"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className="text-green-600 hover:text-green-700 font-medium transition-colors text-xs sm:text-sm dark:text-green-400 dark:hover:text-green-300 py-1"
                            >
                                How It Works
                            </button>
                            <button
                                onClick={() => scrollToSection('about')}
                                className="text-green-600 hover:text-green-700 font-medium transition-colors text-xs sm:text-sm dark:text-green-400 dark:hover:text-green-300 py-1"
                            >
                                About
                            </button>
                            <button
                                onClick={() => scrollToSection('testimonials')}
                                className="text-green-600 hover:text-green-700 font-medium transition-colors text-xs sm:text-sm dark:text-green-400 dark:hover:text-green-300 py-1"
                            >
                                Testimonials
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hero Section with Floating Background Blobs */}
                <section className="relative bg-linear-to-br from-green-50 via-white to-emerald-50 py-12 sm:py-16 lg:py-20 overflow-hidden dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
                    {/* Floating Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-48 sm:w-72 h-48 sm:h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-green-800"></div>
                        <div className="absolute -top-20 -right-20 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-emerald-700"></div>
                        <div className="absolute -bottom-20 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-green-600"></div>
                        <div className="absolute top-1/2 right-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob-slow dark:bg-emerald-800"></div>
                    </div>

                    {/* Animated Background Elements */}
                    <div className="absolute top-10 left-10 w-12 sm:w-20 h-12 sm:h-20 bg-green-200 rounded-full opacity-20 animate-float dark:bg-green-700"></div>
                    <div className="absolute top-40 right-20 w-10 sm:w-16 h-10 sm:h-16 bg-emerald-300 rounded-full opacity-30 animate-float-delayed dark:bg-emerald-600"></div>
                    <div className="absolute bottom-20 left-1/4 w-8 sm:w-12 h-8 sm:h-12 bg-green-400 rounded-full opacity-25 animate-float-slow dark:bg-green-500"></div>
                    <div className="absolute top-1/3 right-1/4 w-6 sm:w-8 h-6 sm:h-8 bg-emerald-400 rounded-full opacity-30 animate-float dark:bg-emerald-500"></div>
                    
                    <div className="container mx-auto px-4 sm:px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                            {/* Left Content */}
                            <div className="flex-1 max-w-2xl text-center lg:text-left">
                                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-md border border-green-100 animate-fade-in dark:bg-gray-800/80 dark:text-green-300 dark:border-green-800">
                                    <span className="text-base sm:text-lg">🌱</span>
                                    <span>Smart Mobility Solution</span>
                                </div>
                                
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight animate-slide-up dark:text-white">
                                    Track Your{' '}
                                    <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                                        Tricycle Ride
                                    </span>
                                    {' '}in Real-Time
                                </h1>
                                
                                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed animate-slide-up-delayed dark:text-gray-300">
                                    Real-time GPS tracking and fleet management made simple. 
                                    Monitor your tricycles, optimize routes, and improve efficiency with our intelligent platform.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fade-in-up justify-center lg:justify-start">
                                    <Link
                                        href={auth.user ? dashboard().url : register()}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-center group dark:bg-green-600 dark:hover:bg-green-700"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>{auth.user ? 'Go to Dashboard' : 'Start Now'}</span>
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </Link>
                                    <button className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/50">
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>Support Us</span>
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-500 animate-fade-in dark:text-gray-400">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-0.5 sm:space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="text-yellow-400 text-xs sm:text-sm">⭐</span>
                                            ))}
                                        </div>
                                        <span>4.9/5 Rating</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full dark:bg-green-500"></div>
                                        <span>99.9% Uptime</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Banner with Floating Animation */}
                            <div className="flex-1 max-w-2xl w-full animate-float-slow">
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-green-100/50 hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-300 dark:bg-gray-800/80 dark:border-green-800/50">
                                    <div className="aspect-video bg-linear-to-br from-green-100 to-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden dark:from-green-900 dark:to-emerald-900">
                                        {/* Animated map dots */}
                                        <div className="absolute top-4 left-4 w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full animate-pulse dark:bg-green-400"></div>
                                        <div className="absolute top-8 right-8 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-400 rounded-full animate-pulse delay-75 dark:bg-emerald-300"></div>
                                        <div className="absolute bottom-6 left-12 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-600 rounded-full animate-pulse delay-150 dark:bg-green-500"></div>
                                        <div className="absolute top-12 left-20 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-500 rounded-full animate-pulse delay-300 dark:bg-emerald-400"></div>
                                        
                                        <div className="text-center relative z-10">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg animate-bounce-slow dark:bg-green-600">
                                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-green-700 font-semibold text-sm sm:text-lg dark:text-green-300">Live Fleet Dashboard</p>
                                            <p className="text-green-500 text-xs sm:text-sm dark:text-green-400">Real-time tricycle monitoring</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden dark:bg-gray-900">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-64 sm:w-80 h-64 sm:h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-slow dark:bg-green-800"></div>
                        <div className="absolute -bottom-40 -left-40 w-64 sm:w-80 h-64 sm:h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-3000 dark:bg-emerald-800"></div>
                    </div>
                    
                    <div className="container mx-auto px-4 sm:px-6 relative z-10">
                        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">Everything You Need</h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                                Powerful features to manage your tricycle fleet efficiently
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
                            {[
                                {
                                    icon: '📍',
                                    title: 'Real-time Tracking',
                                    description: 'Live GPS location tracking with accurate positioning and route history.'
                                },
                                {
                                    icon: '📊',
                                    title: 'Fleet Analytics',
                                    description: 'Comprehensive insights into fleet performance and operational metrics.'
                                },
                                {
                                    icon: '🔔',
                                    title: 'Smart Alerts',
                                    description: 'Instant notifications for maintenance, speed limits, and geofencing.'
                                },
                                {
                                    icon: '🛣️',
                                    title: 'Route Optimization',
                                    description: 'Smart routing to reduce fuel costs and improve delivery times.'
                                },
                                {
                                    icon: '📱',
                                    title: 'Mobile Access',
                                    description: 'Monitor your fleet from anywhere with our mobile-friendly dashboard.'
                                },
                                {
                                    icon: '💾',
                                    title: 'Data Export',
                                    description: 'Export reports and data for analysis and record keeping.'
                                }
                            ].map((feature, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 border border-green-100 hover:shadow-lg hover:scale-[1.02] group dark:bg-gray-800/60 dark:border-green-800"
                                >
                                    <div className="text-2xl sm:text-3xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">{feature.icon}</div>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-green-700 dark:text-green-400">{feature.title}</h3>
                                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed dark:text-gray-300">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-green-50 relative overflow-hidden dark:bg-gray-800">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 left-10 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-emerald-700"></div>
                        <div className="absolute bottom-20 right-10 w-48 sm:w-64 h-48 sm:h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-slow animation-delay-2000 dark:bg-green-600"></div>
                    </div>
                    
                    <div className="container mx-auto px-4 sm:px-6 relative z-10">
                        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">Simple Setup</h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300">Get started in just a few steps</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
                            {[
                                { step: "1", title: "Sign Up", desc: "Create your account" },
                                { step: "2", title: "Add Devices", desc: "Install IoT trackers" },
                                { step: "3", title: "Monitor", desc: "View your dashboard" },
                                { step: "4", title: "Optimize", desc: "Improve operations" }
                            ].map((item, index) => (
                                <div key={index} className="text-center group">
                                    <div className="relative mb-4 sm:mb-6">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-green-200 rounded-full flex items-center justify-center mx-auto shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 backdrop-blur-sm dark:bg-gray-700 dark:border-green-600">
                                            <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{item.step}</span>
                                        </div>
                                        {index < 3 && (
                                            <div className="hidden sm:block absolute top-8 sm:top-10 left-1/2 w-full h-0.5 bg-green-200 -z-10 group-hover:bg-green-300 transition-colors dark:bg-green-700 dark:group-hover:bg-green-600"></div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 text-green-700 dark:text-green-400">{item.title}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-12 sm:py-16 lg:py-24 bg-linear-to-b from-green-50/50 to-white relative overflow-hidden dark:from-gray-800/50 dark:to-gray-900">
                    {/* Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob dark:bg-emerald-900/30"></div>
                        <div className="absolute -bottom-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-green-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob-slow dark:bg-green-900/30"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/30 rounded-full mix-blend-multiply filter blur-3xl dark:bg-emerald-900/20"></div>
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 relative z-10">
                        <div className="max-w-5xl mx-auto">
                            {/* Section Header */}
                            <div className="text-center mb-12 sm:mb-16">
                                <div className="inline-flex items-center gap-2 bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Our Platform</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-800 dark:text-white">
                                    About <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">TriGo</span>
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                    Smart tricycle monitoring for modern communities
                                </p>
                            </div>

                            {/* About Content - Two Column Layout */}
                            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                                {/* Left: Description */}
                                <div className="flex-1 space-y-6">
                                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-green-100/50 dark:shadow-none border border-green-100/80 dark:border-green-800/50">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
                                            TriGo is an IoT-based tricycle monitoring system designed to bring real-time tracking and fleet management to local transport operators.
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
                                            Built to improve efficiency, safety, and transparency in tricycle operations, TriGo provides a smarter, more connected mobility experience for communities.
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Role Highlights */}
                                <div className="flex-1 w-full lg:max-w-md space-y-4">
                                    {[
                                        { icon: '👤', title: 'Passengers', desc: 'Book rides, track your tricycle in real time, and pay seamlessly.' },
                                        { icon: '🚲', title: 'Drivers', desc: 'Manage availability, navigate optimized routes, and accept bookings.' },
                                        { icon: '📊', title: 'Admins', desc: 'Oversee the fleet with analytics, smart alerts, and fleet control.' },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="group flex gap-4 p-4 sm:p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-green-100/80 dark:border-green-800/50 shadow-lg shadow-green-50/50 dark:shadow-none hover:shadow-xl hover:shadow-green-100/50 dark:hover:shadow-green-900/20 transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform ${
                                                i === 0 ? 'bg-linear-to-br from-emerald-500 to-green-600' : i === 1 ? 'bg-linear-to-br from-green-500 to-emerald-600' : 'bg-linear-to-br from-teal-500 to-emerald-600'
                                            }`}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{item.title}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Our Team */}
                            <div className="mt-16 sm:mt-20">
                                <div className="text-center mb-10 sm:mb-12">
                                    <div className="inline-block w-12 h-1 bg-linear-to-r from-green-500 to-emerald-500 rounded-full mb-4"></div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Meet Our Team</h3>
                                    <p className="text-gray-600 dark:text-gray-400">The people behind TriGo</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                                    {[
                                        { name: 'Ray Georpe', role: 'Team Member', avatar: '👨‍💻', isAdviser: false },
                                        { name: 'Team Member 2', role: 'Team Member', avatar: '👩‍💻', isAdviser: false },
                                        { name: 'Team Member 3', role: 'Team Member', avatar: '👨‍💻', isAdviser: false },
                                        { name: 'Adviser Name', role: 'Project Adviser', avatar: '🎓', isAdviser: true },
                                    ].map((member, index) => (
                                        <div
                                            key={index}
                                            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${
                                                member.isAdviser
                                                    ? 'ring-2 ring-emerald-400/60 dark:ring-emerald-500/50 shadow-lg shadow-emerald-200/30 dark:shadow-emerald-900/20'
                                                    : 'ring-1 ring-green-200/80 dark:ring-green-800/50 shadow-lg shadow-green-100/30 dark:shadow-green-900/10'
                                            }`}
                                        >
                                            {/* Card background */}
                                            <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md ${
                                                member.isAdviser ? 'border-2 border-emerald-300/50 dark:border-emerald-600/50' : ''
                                            }`}>
                                                {/* Avatar - larger, centered */}
                                                <div className="pt-6 sm:pt-8 pb-4 px-4 flex flex-col items-center">
                                                    <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-lg ring-4 ring-white/50 dark:ring-gray-700/50 ${
                                                        member.isAdviser
                                                            ? 'bg-linear-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700'
                                                            : 'bg-linear-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700'
                                                    }`}>
                                                        {member.avatar}
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base text-center mb-0.5 truncate w-full px-1">{member.name}</h4>
                                                    <p className={`text-xs sm:text-sm font-medium ${
                                                        member.isAdviser ? 'text-emerald-600 dark:text-emerald-400' : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                        {member.role}
                                                    </p>
                                                </div>
                                                {/* Header bar at bottom for visual polish */}
                                                <div className={`h-1.5 ${
                                                    member.isAdviser
                                                        ? 'bg-linear-to-r from-emerald-500 to-teal-600'
                                                        : 'bg-linear-to-r from-green-500 to-emerald-600'
                                                }`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials & Social Proof */}
                <section id="testimonials" className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden dark:bg-gray-900">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-64 sm:w-96 h-64 sm:h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob-slow dark:bg-green-800"></div>
                        <div className="absolute -bottom-20 -right-20 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000 dark:bg-emerald-800"></div>
                    </div>
                    
                    <div className="container mx-auto px-4 sm:px-6 relative z-10">
                        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">Trusted by Tricycle Operators</h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                                Join hundreds of operators who transformed their business with TriGo
                            </p>
                        </div>

                        {/* Testimonials Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-10 sm:mb-12 lg:mb-16">
                            {[
                                {
                                    name: "Maria Santos",
                                    role: "Fleet Manager",
                                    company: "Manila Tricycle Co-op",
                                    content: "TriGo reduced our fuel costs by 30% and improved response times significantly. Game changer for our operations!",
                                    avatar: "👩‍💼",
                                    rating: 5
                                },
                                {
                                    name: "Juan Dela Cruz",
                                    role: "Owner",
                                    company: "QC Transit Services",
                                    content: "The real-time tracking helped us optimize routes and serve more customers. Our drivers love the simplicity.",
                                    avatar: "👨‍💼",
                                    rating: 5
                                },
                                {
                                    name: "Andrea Reyes",
                                    role: "Operations Head",
                                    company: "Metro Transport Solutions",
                                    content: "From maintenance alerts to route optimization, TriGo covers everything we need. Customer support is excellent!",
                                    avatar: "👩‍🚀",
                                    rating: 5
                                }
                            ].map((testimonial, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group dark:bg-gray-800/60 dark:border-green-800"
                                >
                                    <div className="flex items-center mb-3 sm:mb-4">
                                        <div className="text-xl sm:text-2xl mr-3 sm:mr-4 group-hover:scale-110 transition-transform">{testimonial.avatar}</div>
                                        <div>
                                            <h4 className="font-semibold text-sm sm:text-base text-green-700 dark:text-green-400">{testimonial.name}</h4>
                                            <p className="text-xs sm:text-sm text-green-600 dark:text-green-500">{testimonial.role}</p>
                                            <p className="text-[10px] sm:text-xs text-green-500 dark:text-green-600">{testimonial.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex mb-2 sm:mb-3">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-xs sm:text-sm">⭐</span>
                                        ))}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 italic dark:text-gray-300">"{testimonial.content}"</p>
                                </div>
                            ))}
                        </div>

                        {/* Stats Bar */}
                        <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center max-w-4xl mx-auto shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-200 backdrop-blur-sm dark:from-green-600 dark:to-emerald-700">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                                {[
                                    { number: "50+", label: "Tricycles Managed" },
                                    { number: "24/7", label: "Live Tracking" },
                                    { number: "30%", label: "Cost Reduction" },
                                    { number: "99.9%", label: "Uptime" }
                                ].map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{stat.number}</div>
                                        <div className="text-green-100 text-xs sm:text-sm">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-12 sm:py-16 lg:py-20 bg-linear-to-br from-green-50 to-emerald-100 relative overflow-hidden dark:from-gray-800 dark:to-emerald-900">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-10 left-10 w-48 sm:w-64 h-48 sm:h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-green-700"></div>
                            <div className="absolute bottom-10 right-10 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-slow animation-delay-3000 dark:bg-emerald-600"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-6000 dark:bg-green-500"></div>
                        </div>
                    </div>
                    
                    <div className="container mx-auto px-4 sm:px-6 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white">
                                Ready to Transform Your <span className="text-green-600 dark:text-green-400">Tricycle Business</span>?
                            </h2>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto backdrop-blur-sm bg-white/30 rounded-lg p-3 sm:p-4 dark:bg-gray-800/30 dark:text-gray-300">
                                Join hundreds of satisfied operators who have revolutionized their fleet management with TriGo's smart tracking solutions.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
                                <Link
                                    href={auth.user ? dashboard().url : register()}
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg sm:shadow-2xl hover:shadow-xl sm:hover:shadow-3xl transform hover:scale-105 flex items-center space-x-2 group backdrop-blur-sm dark:bg-green-600 dark:hover:bg-green-700"
                                >
                                    <span>{auth.user ? 'Go to Dashboard' : 'Start Now'}</span>
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <div className="flex items-center space-x-2 text-gray-600 backdrop-blur-sm bg-white/30 rounded-lg px-3 sm:px-4 py-2 dark:bg-gray-800/30 dark:text-gray-300">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span className="text-xs sm:text-sm">No credit card required • 14-day free trial</span>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-8 text-xs sm:text-sm text-gray-500 backdrop-blur-sm bg-white/30 rounded-lg p-3 sm:p-4 max-w-2xl mx-auto dark:bg-gray-800/30 dark:text-gray-300">
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-0.5 sm:space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-xs sm:text-sm">⭐</span>
                                        ))}
                                    </div>
                                    <span>4.9/5 from 100+ reviews</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>99.9% Uptime</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
            <footer className="bg-green-800 text-white py-6 sm:py-8 relative dark:bg-gray-900">
                {/* Simplified background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-green-600 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-emerald-700 rounded-full blur-3xl"></div>
                </div>
                
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    {/* Main content aligned in a single row */}
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 sm:space-y-6 md:space-y-0">
                        
                        {/* Left side - Brand with stats inline */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                                    <TriGoLogo showText={false} size="sm" className="w-12 sm:w-14" />
                                </div>
                                <div>
                                    <div className="text-lg sm:text-xl font-bold">TriGo</div>
                                    <div className="text-green-200 text-xs sm:text-sm dark:text-green-300">Smart Mobility Solutions</div>
                                </div>
                            </div>
                            
                            {/* Simple stats - now inline with brand */}
                            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
                                <div className="text-center">
                                    <div className="text-green-300 font-semibold dark:text-green-400">50+</div>
                                    <div className="text-green-200 text-[10px] sm:text-xs dark:text-green-300">Users</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-green-300 font-semibold dark:text-green-400">24/7</div>
                                    <div className="text-green-200 text-[10px] sm:text-xs dark:text-green-300">Monitoring</div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Social links */}
                        <div className="flex flex-col items-center md:items-end">
                            <h4 className="font-semibold text-green-100 mb-2 sm:mb-3 text-sm sm:text-base dark:text-green-200">Connect With Us</h4>
                            <div className="flex space-x-2 sm:space-x-3">
                                {[
                                    { 
                                        platform: 'Facebook',
                                        href: 'https://web.facebook.com/georperay',
                                        icon: (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                        )
                                    },
                                    { 
                                        platform: 'GitHub',
                                        href: 'https://github.com/rayyyyyw',
                                        icon: (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                            </svg>
                                        )
                                    },
                                    { 
                                        platform: 'Email',
                                        href: 'mailto:hello@trigo.com',
                                        icon: (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                            </svg>
                                        )
                                    }
                                ].map((social, index) => (
                                    <a 
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-200 hover:text-white transition-colors"
                                        title={social.platform}
                                    >
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-700 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700">
                                            {social.icon}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom copyright - simplified */}
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-green-700 dark:border-gray-700 text-center">
                        <p className="text-green-300 text-xs sm:text-sm dark:text-green-400">
                            &copy; 2025 TriGo - IOT Tricycle Monitoring System
                        </p>
                        <p className="text-green-400 text-[10px] sm:text-xs mt-1 dark:text-green-500">
                            Created by Ray Georpe • Capstone Project
                        </p>
                    </div>
                </div>
            </footer>
            </div>
        </>
    );
}