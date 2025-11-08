// resources/js/Pages/PassengerSide/Index.tsx

import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function PassengerIndex({ auth }: { auth: any }) {
    const { user } = auth;

    return (
        <AppLayout>
            <Head title="Passenger Dashboard" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Welcome to TriGo! 🚗
                        </h1>
                        <p className="text-xl text-gray-600 mb-2">
                            Hello, {user.name || 'Passenger'}!
                        </p>
                        <p className="text-gray-500">
                            Your smart tricycle booking platform
                        </p>
                    </div>

                    {/* Debug Info - You can remove this later */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-800 mb-2">Registration Successful! ✅</h3>
                        <div className="text-yellow-700 text-sm space-y-1">
                            <p>📧 Email: {user.email}</p>
                            <p>👤 Role: <span className="font-bold">{user.role}</span></p>
                            <p>🆔 User ID: {user.id}</p>
                        </div>
                    </div>

                    {/* Profile Completion */}
                    {!user.name && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                        Complete Your Profile
                                    </h3>
                                    <p className="text-blue-700 mb-4">
                                        Add your name and contact information to start booking rides and access all features.
                                    </p>
                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                        Set Up Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Book Ride Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Book a Ride</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Find available tricycles near you and book your ride instantly.
                            </p>
                            <button 
                                disabled={!user.name}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                    user.name 
                                        ? 'bg-green-600 text-white hover:bg-green-700' 
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {user.name ? '🚗 Find Tricycles' : 'Complete Profile to Book'}
                            </button>
                        </div>

                        {/* Become Driver Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Become a Driver</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Want to earn by driving? Apply to become a TriGo driver partner.
                            </p>
                            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                🚙 Apply as Driver
                            </button>
                        </div>
                    </div>

                    {/* Getting Started Guide */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</div>
                                <span className="text-gray-700">Complete your profile</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</div>
                                <span className="text-gray-700">Book your first ride</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</div>
                                <span className="text-gray-700">Track your tricycle in real-time</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}