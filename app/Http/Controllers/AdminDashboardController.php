<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard with real statistics.
     */
    public function index()
    {
        try {
            return $this->buildDashboardData();
        } catch (\Throwable $e) {
            report($e);

            return $this->dashboardFallback();
        }
    }

    /**
     * Build dashboard data (stats, fleet, activities, etc.).
     */
    private function buildDashboardData()
    {
        // Get all bookings
        $allBookings = Booking::all();

        // Today's statistics
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        // Today's revenue from completed bookings
        $todayRevenue = Booking::where('status', 'completed')
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$todayStart, $todayEnd])
            ->sum('total_fare');

        // Active trips (currently in progress, regardless of when created)
        $todayActiveTrips = Booking::whereIn('status', ['accepted', 'in_progress'])
            ->count();

        // Total statistics
        $totalDrivers = User::where('role', 'driver')->count();

        // Count online drivers using the same logic as user list (is_online AND recent activity within 5 minutes)
        $activityThreshold = now()->subMinutes(5);
        $onlineDrivers = User::where('role', 'driver')
            ->where('is_online', true)
            ->whereNotNull('last_activity_at')
            ->get()
            ->filter(function ($driver) use ($activityThreshold) {
                $lastActivity = $driver->last_activity_at instanceof \Carbon\Carbon
                    ? $driver->last_activity_at
                    : \Carbon\Carbon::parse($driver->last_activity_at);

                return $lastActivity->greaterThan($activityThreshold);
            })
            ->count();

        $totalPassengers = User::where('role', 'passenger')->count();
        $activePassengers = User::where('role', 'passenger')
            ->where(function ($query) {
                $query->where('status', 'active')
                    ->orWhereNull('status');
            })
            ->count();

        // Fleet status (keeping for backward compatibility)
        $totalTricycles = $totalDrivers;
        $activeTricycles = $onlineDrivers;
        $offlineTricycles = $totalTricycles - $activeTricycles;

        // Booking status distribution (more useful than fleet distribution)
        $totalBookingsCount = $allBookings->count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $inProgressBookings = Booking::whereIn('status', ['accepted', 'in_progress'])->count();
        $completedBookings = Booking::where('status', 'completed')->count();
        $cancelledBookings = Booking::where('status', 'cancelled')->count();

        // Calculate satisfaction rate from reviews
        $totalReviews = Review::count();
        $positiveReviews = Review::where('rating', '>=', 4)->count();
        $satisfactionRate = $totalReviews > 0
            ? round(($positiveReviews / $totalReviews) * 100, 1)
            : 0.0;

        $locationThreshold = now()->subMinutes(5);

        // Map: only show users with real GPS (accurate location). No simulated positions.
        // Drivers: must be actually online (recent activity) AND have sent location in last 5 min
        $onlineDriversWithGps = User::where('role', 'driver')
            ->where('is_online', true)
            ->whereNotNull('last_activity_at')
            ->where('last_activity_at', '>=', $locationThreshold)
            ->whereNotNull('last_latitude')
            ->whereNotNull('last_longitude')
            ->whereNotNull('last_location_at')
            ->where('last_location_at', '>=', $locationThreshold)
            ->with('approvedDriverApplication')
            ->get()
            ->map(function ($driver) {
                $driverApp = $driver->approvedDriverApplication;

                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'role' => 'driver',
                    'lat' => (float) $driver->last_latitude,
                    'lng' => (float) $driver->last_longitude,
                    'vehicle_plate' => $driverApp->vehicle_plate_number ?? null,
                    'barangay' => null,
                ];
            })
            ->values()
            ->all();

        // Passengers: only with real recent GPS
        $passengersWithLocation = User::where('role', 'passenger')
            ->whereNotNull('last_latitude')
            ->whereNotNull('last_longitude')
            ->whereNotNull('last_location_at')
            ->where('last_location_at', '>=', $locationThreshold)
            ->where('last_activity_at', '>=', $locationThreshold)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => 'passenger',
                'lat' => (float) $u->last_latitude,
                'lng' => (float) $u->last_longitude,
                'vehicle_plate' => null,
                'barangay' => null,
            ]);

        $onlineUsersWithLocation = array_merge($onlineDriversWithGps, $passengersWithLocation->all());

        // List of online drivers (same as map: only those with recent activity; list has real GPS only to avoid wrong map pins)
        $onlineDriversList = User::where('role', 'driver')
            ->where('is_online', true)
            ->whereNotNull('last_activity_at')
            ->where('last_activity_at', '>=', $locationThreshold)
            ->whereNotNull('last_latitude')
            ->whereNotNull('last_longitude')
            ->whereNotNull('last_location_at')
            ->where('last_location_at', '>=', $locationThreshold)
            ->with('approvedDriverApplication')
            ->get()
            ->map(function ($driver) {
                $driverApp = $driver->approvedDriverApplication;

                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'lat' => (float) $driver->last_latitude,
                    'lng' => (float) $driver->last_longitude,
                    'status' => 'online',
                    'vehicle_type' => $driverApp->vehicle_type ?? 'Tricycle',
                    'vehicle_plate' => $driverApp->vehicle_plate_number ?? 'N/A',
                    'barangay' => null,
                ];
            })
            ->values()
            ->all();

        // Get active bookings with routes
        $activeBookings = Booking::whereIn('status', ['accepted', 'in_progress'])
            ->with(['passenger', 'driver'])
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_id' => $booking->booking_id,
                    'passenger_name' => $booking->passenger_name,
                    'driver_name' => $booking->driver->name ?? 'Unassigned',
                    'pickup' => [
                        'lat' => $booking->pickup_lat,
                        'lng' => $booking->pickup_lng,
                        'address' => $booking->pickup_address,
                        'barangay' => $booking->pickup_barangay,
                    ],
                    'destination' => [
                        'lat' => $booking->destination_lat,
                        'lng' => $booking->destination_lng,
                        'address' => $booking->destination_address,
                        'barangay' => $booking->destination_barangay,
                    ],
                    'status' => $booking->status,
                ];
            });

        // Recent activities (last 15 bookings)
        $recentActivities = Booking::with(['passenger', 'driver'])
            ->latest()
            ->limit(15)
            ->get()
            ->map(function ($booking) {
                $driverName = $booking->driver ? $booking->driver->name : 'Unassigned';
                $action = match ($booking->status) {
                    'pending' => "New booking from {$booking->passenger_name}",
                    'accepted' => "Driver {$driverName} accepted booking",
                    'in_progress' => "Driver {$driverName} started trip",
                    'completed' => "Driver {$driverName} completed trip",
                    'cancelled' => 'Booking cancelled',
                    default => "Booking status: {$booking->status}",
                };

                return [
                    'driver' => $driverName,
                    'action' => $action,
                    'time' => $booking->created_at->diffForHumans(),
                    'status' => $booking->status === 'completed' ? 'completed' :
                               ($booking->status === 'cancelled' ? 'issue' : 'active'),
                    'route' => ($booking->pickup_barangay ?? 'Unknown').' → '.($booking->destination_barangay ?? 'Unknown'),
                    'fare' => $booking->total_fare,
                ];
            });

        // Fleet distribution (keeping for backward compatibility)
        $fleetStatus = [
            [
                'status' => 'Online',
                'count' => $activeTricycles,
                'color' => 'bg-green-500',
                'percentage' => $totalTricycles > 0 ? round(($activeTricycles / $totalTricycles) * 100, 1) : 0,
            ],
            [
                'status' => 'Offline',
                'count' => $offlineTricycles,
                'color' => 'bg-gray-500',
                'percentage' => $totalTricycles > 0 ? round(($offlineTricycles / $totalTricycles) * 100, 1) : 0,
            ],
        ];

        // Booking status distribution (more useful metric)
        $bookingStatusDistribution = [];
        if ($totalBookingsCount > 0) {
            $bookingStatusDistribution = [
                [
                    'status' => 'Completed',
                    'count' => $completedBookings,
                    'color' => 'bg-green-500',
                    'percentage' => round(($completedBookings / $totalBookingsCount) * 100, 1),
                ],
                [
                    'status' => 'In Progress',
                    'count' => $inProgressBookings,
                    'color' => 'bg-blue-500',
                    'percentage' => round(($inProgressBookings / $totalBookingsCount) * 100, 1),
                ],
                [
                    'status' => 'Pending',
                    'count' => $pendingBookings,
                    'color' => 'bg-yellow-500',
                    'percentage' => round(($pendingBookings / $totalBookingsCount) * 100, 1),
                ],
                [
                    'status' => 'Cancelled',
                    'count' => $cancelledBookings,
                    'color' => 'bg-red-500',
                    'percentage' => round(($cancelledBookings / $totalBookingsCount) * 100, 1),
                ],
            ];
        } else {
            $bookingStatusDistribution = [
                [
                    'status' => 'No Bookings',
                    'count' => 0,
                    'color' => 'bg-gray-500',
                    'percentage' => 0,
                ],
            ];
        }

        // Revenue growth
        $yesterdayStart = now()->subDay()->startOfDay();
        $yesterdayEnd = now()->subDay()->endOfDay();
        $yesterdayRevenue = Booking::where('status', 'completed')
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$yesterdayStart, $yesterdayEnd])
            ->sum('total_fare');

        $revenueGrowth = $yesterdayRevenue > 0
            ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
            : 0;

        // Hourly bookings for today (for chart)
        $hourlyBookings = Booking::whereDate('created_at', today())
            ->get()
            ->groupBy(function ($booking) {
                return $booking->created_at->format('H');
            })
            ->map(function ($bookings, $hour) {
                return [
                    'hour' => (int) $hour,
                    'count' => $bookings->count(),
                ];
            })
            ->values();

        // Popular routes (top 5)
        $popularRoutes = Booking::where('status', 'completed')
            ->whereDate('completed_at', '>=', now()->subDays(7))
            ->get()
            ->groupBy(function ($booking) {
                return ($booking->pickup_barangay ?? 'Unknown').' → '.($booking->destination_barangay ?? 'Unknown');
            })
            ->map(function ($bookings, $route) {
                return [
                    'route' => $route,
                    'count' => $bookings->count(),
                ];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values();

        // Get all users (drivers and passengers) with online/offline status and avatars
        // Online status is determined by last_activity_at within the last 5 minutes
        // This ensures we only show users who are actually logged in and active
        $activityThreshold = now()->subMinutes(5);

        $allUsers = User::whereIn('role', ['driver', 'passenger'])
            ->select('id', 'name', 'email', 'role', 'avatar', 'is_online', 'last_activity_at', 'status')
            ->orderByRaw('last_activity_at DESC NULLS LAST, name ASC')
            ->get()
            ->map(function ($user) use ($activityThreshold) {
                // Determine if user is actually online based on recent activity
                // For drivers: must have is_online=true AND recent activity
                // For passengers: must have recent activity (within 5 minutes)
                $isActuallyOnline = false;

                // Ensure last_activity_at is a Carbon instance and not null
                if ($user->last_activity_at) {
                    // Make sure it's a Carbon instance (should be from the cast, but ensure it)
                    $lastActivity = $user->last_activity_at instanceof \Carbon\Carbon
                        ? $user->last_activity_at
                        : \Carbon\Carbon::parse($user->last_activity_at);

                    if ($user->role === 'driver') {
                        // Drivers need both is_online flag AND recent activity
                        $isActuallyOnline = $user->is_online &&
                                           $lastActivity->greaterThan($activityThreshold);
                    } else {
                        // Passengers just need recent activity (within 5 minutes)
                        $isActuallyOnline = $lastActivity->greaterThan($activityThreshold);
                    }
                }
                // Note: If last_activity_at is null, user is offline (never logged in or activity cleared)

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'avatar_url' => $user->avatar_url,
                    'is_online' => $isActuallyOnline,
                    'last_activity_at' => $user->last_activity_at?->toIso8601String(), // Send ISO string for frontend formatting
                    'last_activity_at_human' => $user->last_activity_at?->diffForHumans(), // Also send human-readable for convenience
                    'status' => $user->status,
                ];
            });

        // Separate online and offline users based on actual login status
        $onlineUsers = $allUsers->where('is_online', true)->values();
        $offlineUsers = $allUsers->where('is_online', false)->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'todayRevenue' => (float) $todayRevenue,
                'revenueGrowth' => $revenueGrowth,
                'activeTrips' => $todayActiveTrips,
                'totalTricycles' => $totalTricycles,
                'activeTricycles' => $activeTricycles,
                'satisfactionRate' => $satisfactionRate,
                'totalDrivers' => $totalDrivers,
                'onlineDrivers' => $onlineDrivers,
                'totalPassengers' => $totalPassengers,
                'activePassengers' => $activePassengers,
                'totalBookings' => $allBookings->count(),
                'completedToday' => Booking::where('status', 'completed')
                    ->whereDate('completed_at', today())
                    ->count(),
            ],
            'fleetStatus' => $fleetStatus,
            'bookingStatusDistribution' => $bookingStatusDistribution,
            'recentActivities' => $recentActivities,
            'onlineDrivers' => $onlineDriversList,
            'onlineUsersWithLocation' => $onlineUsersWithLocation,
            'activeBookings' => $activeBookings,
            'hourlyBookings' => $hourlyBookings,
            'popularRoutes' => $popularRoutes,
            'users' => [
                'online' => $onlineUsers,
                'offline' => $offlineUsers,
                'all' => $allUsers,
            ],
        ]);
    }

    /**
     * Fallback payload when dashboard data fails to build.
     */
    private function dashboardFallback()
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'todayRevenue' => 0,
                'revenueGrowth' => 0,
                'activeTrips' => 0,
                'totalTricycles' => 0,
                'activeTricycles' => 0,
                'satisfactionRate' => 0,
                'totalDrivers' => 0,
                'onlineDrivers' => 0,
                'totalPassengers' => 0,
                'activePassengers' => 0,
                'totalBookings' => 0,
                'completedToday' => 0,
            ],
            'fleetStatus' => [
                ['status' => 'Online', 'count' => 0, 'color' => 'bg-green-500', 'percentage' => 0],
                ['status' => 'Offline', 'count' => 0, 'color' => 'bg-gray-500', 'percentage' => 0],
            ],
            'bookingStatusDistribution' => [
                ['status' => 'No Bookings', 'count' => 0, 'color' => 'bg-gray-500', 'percentage' => 0],
            ],
            'recentActivities' => [],
            'onlineDrivers' => [],
            'onlineUsersWithLocation' => [],
            'activeBookings' => [],
            'hourlyBookings' => [],
            'popularRoutes' => [],
            'users' => [
                'online' => [],
                'offline' => [],
                'all' => [],
            ],
        ]);
    }
}
