import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    // Mock data - replace with actual API calls
    const dashboardData = {
        totalTricycles: 24,
        activeTricycles: 18,
        totalDrivers: 22,
        activeDrivers: 20,
        totalPassengers: 156,
        todayTrips: 47,
        totalRevenue: 12540,
        systemStatus: 'online'
    };

    const recentActivities = [
        { id: 1, driver: 'Juan Dela Cruz', action: 'Started trip', time: '2 mins ago', status: 'active' },
        { id: 2, driver: 'Maria Santos', action: 'Completed trip', time: '5 mins ago', status: 'completed' },
        { id: 3, driver: 'Pedro Reyes', action: 'Went offline', time: '12 mins ago', status: 'offline' },
        { id: 4, driver: 'Ana Lopez', action: 'Started trip', time: '15 mins ago', status: 'active' },
    ];

    const tricycleStatus = [
        { status: 'Active', count: 18, color: 'bg-green-500' },
        { status: 'Maintenance', count: 3, color: 'bg-yellow-500' },
        { status: 'Offline', count: 3, color: 'bg-red-500' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time monitoring of your tricycle fleet</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                            System {dashboardData.systemStatus}
                        </span>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Tricycles Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tricycles</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {dashboardData.totalTricycles}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    {dashboardData.activeTricycles} active
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Active Drivers Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Drivers</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {dashboardData.activeDrivers}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    of {dashboardData.totalDrivers} total
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Today's Trips Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Trips</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {dashboardData.todayTrips}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    +12% from yesterday
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Revenue Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    ₱{dashboardData.totalRevenue.toLocaleString()}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    This month
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts and Additional Data */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tricycle Status Chart */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tricycle Status</h3>
                        <div className="space-y-4">
                            {tricycleStatus.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {item.status}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {item.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            activity.status === 'active' ? 'bg-green-500' : 
                                            activity.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {activity.driver}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {activity.action}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {activity.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Fleet Map</h3>
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">Live GPS Tracking Map</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Real-time tricycle locations will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}