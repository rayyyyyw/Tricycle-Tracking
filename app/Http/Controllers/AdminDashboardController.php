<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use App\Models\Review;
use App\Models\DriverApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard with real statistics.
     */
    public function index()
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
        $onlineDrivers = User::where('role', 'driver')
            ->where('is_online', true)
            ->count();
        
        $totalPassengers = User::where('role', 'passenger')->count();
        $activePassengers = User::where('role', 'passenger')
            ->where(function($query) {
                $query->where('status', 'active')
                      ->orWhereNull('status');
            })
            ->count();
        
        // Fleet status
        $totalTricycles = $totalDrivers;
        $activeTricycles = $onlineDrivers;
        $offlineTricycles = $totalTricycles - $activeTricycles;
        
        // Calculate satisfaction rate from reviews
        $totalReviews = Review::count();
        $positiveReviews = Review::where('rating', '>=', 4)->count();
        $satisfactionRate = $totalReviews > 0 
            ? round(($positiveReviews / $totalReviews) * 100, 1) 
            : 0.0;
        
        // Get online drivers with locations (simulate locations based on Hinobaan area)
        $onlineDriversList = User::where('role', 'driver')
            ->where('is_online', true)
            ->with('approvedDriverApplication')
            ->get()
            ->map(function ($driver, $index) {
                // Hinobaan coordinates: 9.5925, 122.4706
                // Create locations spread across Hinobaan's 13 barangays
                $barangays = [
                    ['name' => 'Poblacion', 'lat' => 9.5925, 'lng' => 122.4706],
                    ['name' => 'Nabulao', 'lat' => 9.6050, 'lng' => 122.4580],
                    ['name' => 'Culipapa', 'lat' => 9.5800, 'lng' => 122.4820],
                    ['name' => 'Mansalanao', 'lat' => 9.6200, 'lng' => 122.4900],
                    ['name' => 'Mahalang', 'lat' => 9.5650, 'lng' => 122.4550],
                    ['name' => 'Bacuyangan', 'lat' => 9.6100, 'lng' => 122.5000],
                    ['name' => 'Cabadiangan', 'lat' => 9.5700, 'lng' => 122.4450],
                    ['name' => 'Cartagena', 'lat' => 9.5500, 'lng' => 122.4650],
                    ['name' => 'Gintubhan', 'lat' => 9.5400, 'lng' => 122.4900],
                ];
                
                $barangay = $barangays[$index % count($barangays)];
                // Add small random offset to spread drivers within barangay
                $lat = $barangay['lat'] + (mt_rand(-30, 30) / 10000);
                $lng = $barangay['lng'] + (mt_rand(-30, 30) / 10000);
                
                $driverApp = $driver->approvedDriverApplication;
                
                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'lat' => $lat,
                    'lng' => $lng,
                    'status' => 'online',
                    'vehicle_type' => $driverApp->vehicle_type ?? 'Tricycle',
                    'vehicle_plate' => $driverApp->vehicle_plate_number ?? 'N/A',
                    'barangay' => $barangay['name'],
                ];
            });
        
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
                $action = match($booking->status) {
                    'pending' => "New booking from {$booking->passenger_name}",
                    'accepted' => "Driver {$driverName} accepted booking",
                    'in_progress' => "Driver {$driverName} started trip",
                    'completed' => "Driver {$driverName} completed trip",
                    'cancelled' => "Booking cancelled",
                    default => "Booking status: {$booking->status}",
                };
                
                return [
                    'driver' => $driverName,
                    'action' => $action,
                    'time' => $booking->created_at->diffForHumans(),
                    'status' => $booking->status === 'completed' ? 'completed' : 
                               ($booking->status === 'cancelled' ? 'issue' : 'active'),
                    'route' => $booking->pickup_barangay . ' → ' . $booking->destination_barangay,
                    'fare' => $booking->total_fare,
                ];
            });
        
        // Fleet distribution
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
                return $booking->pickup_barangay . ' → ' . $booking->destination_barangay;
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
            'recentActivities' => $recentActivities,
            'onlineDrivers' => $onlineDriversList,
            'activeBookings' => $activeBookings,
            'hourlyBookings' => $hourlyBookings,
            'popularRoutes' => $popularRoutes,
        ]);
    }
}
