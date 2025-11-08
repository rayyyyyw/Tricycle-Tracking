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
            <div className="min-h-screen bg-white text-gray-800">
                {/* Navigation */}
                <nav className="bg-white border-b border-green-50">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
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
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-green-600 hover:text-green-700 px-4 py-2 font-medium transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
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

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-16">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                                <span>🌱</span>
                                <span>Smart Mobility Solution</span>
                            </div>
                            
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                Track Your{' '}
                                <span className="text-green-600">Tricycle Fleet</span>
                                <br />
                                with Ease
                            </h1>
                            
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                                Real-time GPS tracking and fleet management made simple. 
                                Monitor your tricycles, optimize routes, and improve efficiency.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {auth.user ? 'Go to Dashboard' : 'Start Free Trial'}
                                </Link>
                                <button className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all">
                                    Watch Demo
                                </button>
                            </div>

                            {/* Preview Image/Placeholder */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto border border-green-100">
                                <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-green-700 font-medium">Live Fleet Dashboard Preview</p>
                                        <p className="text-green-500 text-sm">Real-time tricycle monitoring interface</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
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
                                <div key={index} className="bg-green-50 rounded-2xl p-6 hover:bg-green-100 transition-all duration-300 border border-green-100">
                                    <div className="text-3xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3 text-green-700">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 bg-green-50">
                    <div className="container mx-auto px-6">
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
                                <div key={index} className="text-center">
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 bg-white border-2 border-green-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                            <span className="text-2xl font-bold text-green-600">{item.step}</span>
                                        </div>
                                        {index < 3 && (
                                            <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-green-200 -z-10"></div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2 text-green-700">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
              {/* Hero Section */}
                <section className="bg-gradient-to-br from-white via-green-50 to-emerald-50 py-12 md:py-20">
                    <div className="container mx-auto px-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                                {/* Left Content */}
                                <div className="flex-1 text-center lg:text-left">
                                    <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                        <span>🚀</span>
                                        <span>Smart Fleet Management</span>
                                    </div>
                                    
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                        Track Your 
                                        <span className="text-green-600"> Tricycle Fleet</span> 
                                        in Real-Time
                                    </h1>
                                    
                                    <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl">
                                        Monitor locations, optimize routes, and manage your entire tricycle fleet from one simple dashboard. 
                                        Save time and reduce costs with intelligent IoT solutions.
                                    </p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
                                        <Link
                                            href={auth.user ? dashboard() : register()}
                                            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                                        >
                                            <span>{auth.user ? 'Go to Dashboard' : 'Start Free Trial'}</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                        <button className="border-2 border-green-200 text-green-700 hover:bg-green-50 px-8 py-3 rounded-lg font-semibold text-lg transition-all flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Watch Demo</span>
                                        </button>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex flex-wrap gap-6 mt-12 justify-center lg:justify-start">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                                            <div className="text-sm text-gray-500">Live Tracking</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 mb-1">99%</div>
                                            <div className="text-sm text-gray-500">Accuracy</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600 mb-1">50+</div>
                                            <div className="text-sm text-gray-500">Tricycles Managed</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Content - Dashboard Preview */}
                                <div className="flex-1 max-w-lg">
                                    <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 transform hover:scale-105 transition-transform duration-300">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <div className="flex space-x-1">
                                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            </div>
                                            <div className="text-sm text-gray-500">Live Dashboard Preview</div>
                                        </div>
                                        
                                        {/* Mock Dashboard */}
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                                    <div className="text-2xl font-bold text-green-600">12</div>
                                                    <div className="text-xs text-gray-500">Active</div>
                                                </div>
                                                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                                    <div className="text-2xl font-bold text-green-600">3</div>
                                                    <div className="text-xs text-gray-500">Idle</div>
                                                </div>
                                            </div>
                                            
                                            {/* Map Placeholder */}
                                            <div className="bg-white rounded-lg p-4 h-48 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-green-700 font-medium">Live GPS Tracking</p>
                                                    <p className="text-green-500 text-sm">Real-time fleet locations</p>
                                                </div>
                                            </div>
                                            
                                            {/* Status Bar */}
                                            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                    <span>All Systems Online</span>
                                                </div>
                                                <span>Updated just now</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Footer */}
            <footer className="bg-green-800 text-white py-8">
                <div className="container mx-auto px-6">
                    {/* Main Footer Content */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
                        {/* Brand Section */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
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
                                        <div className="text-green-200 text-xs">Up to Tricycles Tracked</div>
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
                                    <a href="#" className="text-green-200 hover:text-white transition-colors text-sm">
                                        Features
                                    </a>
                                    <a href="#" className="text-green-200 hover:text-white transition-colors text-sm">
                                        Pricing
                                    </a>
                                    <a href="#" className="text-green-200 hover:text-white transition-colors text-sm">
                                        Demo
                                    </a>
                                </div>
                            </div>
                            
                            <div className="text-center sm:text-left">
                                <h4 className="font-semibold text-green-100 mb-3">Company</h4>
                                <div className="flex flex-col space-y-2">
                                    <a href="#" className="text-green-200 hover:text-white transition-colors text-sm">
                                        About
                                    </a>
                                    <a href="#" className="text-green-200 hover:text-white transition-colors text-sm">
                                        Contact
                                    </a>
                                    <a href="#" className="text-green-200 hover:text-white transition-colors text-sm">
                                        Privacy
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="text-center sm:text-left">
                            <h4 className="font-semibold text-green-100 mb-3">Connect</h4>
                            <div className="flex space-x-4 justify-center sm:justify-start">
                                <a href="#" className="text-green-200 hover:text-white transition-colors transform hover:scale-110">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-green-200 hover:text-white transition-colors transform hover:scale-110">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-green-200 hover:text-white transition-colors transform hover:scale-110">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Copyright Bar */}
                    <div className="border-t border-green-700 mt-8 pt-6 text-center">
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