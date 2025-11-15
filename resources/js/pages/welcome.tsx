import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="TriGo - Smart Tricycle Monitoring" />
            <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
                {/* Navigation */}
                <nav className="bg-white/80 backdrop-blur-md border-b border-green-50 sticky top-0 z-50">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-green-600">TriGo</span>
                                    <div className="text-xs text-green-400 -mt-1">Tricycle Tracking</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-green-600 hover:text-green-700 px-4 py-2 font-medium transition-colors hover:scale-105"
                                        >
                                            Sign In
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section with Floating Background Blobs */}
                <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 overflow-hidden">
                    {/* Floating Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob-slow"></div>
                    </div>

                    {/* Animated Background Elements */}
                    <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-float"></div>
                    <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-300 rounded-full opacity-30 animate-float-delayed"></div>
                    <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-400 rounded-full opacity-25 animate-float-slow"></div>
                    <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-emerald-400 rounded-full opacity-30 animate-float"></div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                            {/* Left Content */}
                            <div className="flex-1 max-w-2xl">
                                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg border border-green-100 animate-fade-in">
                                    <span className="text-lg">🌱</span>
                                    <span>Smart Mobility Solution</span>
                                </div>
                                
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-slide-up">
                                    Track Your{' '}
                                    <span className="text-green-600 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        Tricycle Ride
                                    </span>
                                    &nbsp;in Real-Time
                                </h1>
                                
                                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed animate-slide-up-delayed">
                                    Real-time GPS tracking and fleet management made simple. 
                                    Monitor your tricycles, optimize routes, and improve efficiency with our intelligent platform.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-center group"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>{auth.user ? 'Go to Dashboard' : 'Start Free Trial'}</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </Link>
                                    <button className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>Watch Demo</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="flex items-center space-x-6 text-sm text-gray-500 animate-fade-in">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="text-yellow-400">⭐</span>
                                            ))}
                                        </div>
                                        <span>4.9/5 Rating</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>99.9% Uptime</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Banner with Floating Animation */}
                            <div className="flex-1 max-w-2xl animate-float-slow">
                                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-green-100/50 hover:shadow-3xl transition-all duration-500">
                                    <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                        {/* Animated map dots */}
                                        <div className="absolute top-4 left-4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <div className="absolute top-8 right-8 w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-75"></div>
                                        <div className="absolute bottom-6 left-12 w-2 h-2 bg-green-600 rounded-full animate-pulse delay-150"></div>
                                        <div className="absolute top-12 left-20 w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-300"></div>
                                        
                                        <div className="text-center relative z-10">
                                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-slow">
                                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-green-700 font-semibold text-lg">Live Fleet Dashboard</p>
                                            <p className="text-green-500 text-sm">Real-time tricycle monitoring</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white relative overflow-hidden">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-slow"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-3000"></div>
                    </div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Everything You Need</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Powerful features to manage your tricycle fleet efficiently
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                                    className="bg-green-50 rounded-2xl p-6 hover:bg-green-100 transition-all duration-300 border border-green-100 hover:shadow-xl hover:scale-105 group backdrop-blur-sm bg-white/60"
                                >
                                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3 text-green-700">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 bg-green-50 relative overflow-hidden">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                        <div className="absolute bottom-20 right-10 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-slow animation-delay-2000"></div>
                    </div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Simple Setup</h2>
                            <p className="text-xl text-gray-600">Get started in just a few steps</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {[
                                { step: "1", title: "Sign Up", desc: "Create your account" },
                                { step: "2", title: "Add Devices", desc: "Install IoT trackers" },
                                { step: "3", title: "Monitor", desc: "View your dashboard" },
                                { step: "4", title: "Optimize", desc: "Improve operations" }
                            ].map((item, index) => (
                                <div key={index} className="text-center group">
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 bg-white border-2 border-green-200 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                                            <span className="text-2xl font-bold text-green-600">{item.step}</span>
                                        </div>
                                        {index < 3 && (
                                            <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-green-200 -z-10 group-hover:bg-green-300 transition-colors"></div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 text-green-700">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials & Social Proof */}
                <section className="py-20 bg-white relative overflow-hidden">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob-slow"></div>
                        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
                    </div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Trusted by Tricycle Operators</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Join hundreds of operators who transformed their business with TriGo
                            </p>
                        </div>

                        {/* Testimonials Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
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
                                    className="bg-green-50 rounded-2xl p-6 border border-green-100 hover:shadow-xl transition-all duration-300 hover:scale-105 group backdrop-blur-sm bg-white/60"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="text-2xl mr-4 group-hover:scale-110 transition-transform">{testimonial.avatar}</div>
                                        <div>
                                            <h4 className="font-semibold text-green-700">{testimonial.name}</h4>
                                            <p className="text-sm text-green-600">{testimonial.role}</p>
                                            <p className="text-xs text-green-500">{testimonial.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex mb-3">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className="text-yellow-400">⭐</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 italic">"{testimonial.content}"</p>
                                </div>
                            ))}
                        </div>

                        {/* Stats Bar */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center max-w-4xl mx-auto shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { number: "50+", label: "Tricycles Managed" },
                                    { number: "24/7", label: "Live Tracking" },
                                    { number: "30%", label: "Cost Reduction" },
                                    { number: "99.9%", label: "Uptime" }
                                ].map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-2xl md:text-3xl font-bold mb-2">{stat.number}</div>
                                        <div className="text-green-100 text-sm">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100 relative overflow-hidden">
                    {/* Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-10 left-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                            <div className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob-slow animation-delay-3000"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-6000"></div>
                        </div>
                    </div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                                Ready to Transform Your <span className="text-green-600">Tricycle Business</span>?
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto backdrop-blur-sm bg-white/30 rounded-lg p-4">
                                Join hundreds of satisfied operators who have revolutionized their fleet management with TriGo's smart tracking solutions.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center space-x-2 group backdrop-blur-sm"
                                >
                                    <span>{auth.user ? 'Go to Dashboard' : 'Start Free Trial'}</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <div className="flex items-center space-x-2 text-gray-600 backdrop-blur-sm bg-white/30 rounded-lg px-4 py-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span className="text-sm">No credit card required • 14-day free trial</span>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500 backdrop-blur-sm bg-white/30 rounded-lg p-4 max-w-2xl mx-auto">
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-400">⭐</span>
                                        ))}
                                    </div>
                                    <span>4.9/5 from 100+ reviews</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>99.9% Uptime Guarantee</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-green-800 text-white py-12 relative overflow-hidden">
                    {/* Footer Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-700 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob-slow"></div>
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-800 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-3000"></div>
                    </div>
                    
                    <div className="container mx-auto px-6 relative z-10">
                        {/* Main Footer Content */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0 mb-8">
                            {/* Brand Section */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                                        <div className="w-6 h-6 bg-green-500 rounded-lg"></div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <span className="text-xl font-bold block">TriGo</span>
                                        <span className="text-green-200 text-sm">Smart Mobility Solutions</span>
                                    </div>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="flex space-x-6 text-center sm:text-left">
                                    <div>
                                        <div className="text-green-300 font-semibold">50+</div>
                                        <div className="text-green-200 text-xs">Tricycles Tracked</div>
                                    </div>
                                    <div>
                                        <div className="text-green-300 font-semibold">24/7</div>
                                        <div className="text-green-200 text-xs">Monitoring</div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8">
                                <div className="text-center sm:text-left">
                                    <h4 className="font-semibold text-green-100 mb-3">Product</h4>
                                    <div className="flex flex-col space-y-2">
                                        <a href="#" className="text-green-200 hover:text-white transition-colors text-sm hover:translate-x-1 transform">
                                            Features
                                        </a>
                                        <a href="#" className="text-green-200 hover:text-white transition-colors text-sm hover:translate-x-1 transform">
                                            Pricing
                                        </a>
                                        <a href="#" className="text-green-200 hover:text-white transition-colors text-sm hover:translate-x-1 transform">
                                            Demo
                                        </a>
                                    </div>
                                </div>
                                
                                <div className="text-center sm:text-left">
                                    <h4 className="font-semibold text-green-100 mb-3">Company</h4>
                                    <div className="flex flex-col space-y-2">
                                        <a href="#" className="text-green-200 hover:text-white transition-colors text-sm hover:translate-x-1 transform">
                                            About
                                        </a>
                                        <a href="#" className="text-green-200 hover:text-white transition-colors text-sm hover:translate-x-1 transform">
                                            Contact
                                        </a>
                                        <a href="#" className="text-green-200 hover:text-white transition-colors text-sm hover:translate-x-1 transform">
                                            Privacy
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="text-center sm:text-left">
                                <h4 className="font-semibold text-green-100 mb-3">Connect</h4>
                                <div className="flex space-x-4 justify-center sm:justify-start">
                                    {[
                                        { 
                                            platform: 'Facebook', 
                                            icon: (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                            ),
                                            href: 'https://facebook.com/yourpage',
                                            hoverColor: 'hover:bg-blue-600'
                                        },
                                        { 
                                            platform: 'GitHub', 
                                            icon: (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                </svg>
                                            ),
                                            href: 'https://github.com/yourusername',
                                            hoverColor: 'hover:bg-gray-800'
                                        },
                                        { 
                                            platform: 'Email', 
                                            icon: (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                </svg>
                                            ),
                                            href: 'mailto:hello@trigo.com',
                                            hoverColor: 'hover:bg-red-500'
                                        }
                                    ].map((social, index) => (
                                        <a 
                                            key={index} 
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-200 hover:text-white transition-all duration-300 transform hover:scale-110 group"
                                            title={`Connect on ${social.platform}`}
                                        >
                                            <div className={`w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center transition-colors duration-300 ${social.hoverColor} group-hover:shadow-lg`}>
                                                {social.icon}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Copyright Bar */}
                        <div className="border-t border-green-700 pt-6 text-center">
                            <p className="text-green-300 text-sm">
                                &copy; 2025 <span className="font-semibold">TriGo</span> - IoT Based Tricycle Monitoring & Management System
                            </p>
                            <p className="text-green-400 text-xs mt-2">
                                Created By <span className="font-medium text-green-200">Ray Georpe</span> • All rights reserved • Capstone Project
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}