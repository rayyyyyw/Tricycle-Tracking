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
        $activeDrivers = User::where('role', 'driver')
            ->where('driver_status', 'active')
            ->count();
        
        $totalPassengers = User::where('role', 'passenger')->count();
        $activePassengers = User::where('role', 'passenger')
            ->where(function($query) {
                $query->where('status', 'active')
                      ->orWhereNull('status'); // Include users without status set (defaults to active)
            })
            ->count();
        
        // Fleet status (using driver status as proxy for tricycle status)
        $totalTricycles = $totalDrivers; // Assuming one driver = one tricycle
        $activeTricycles = $activeDrivers;
        $offlineTricycles = $totalTricycles - $activeTricycles;
        
        // Calculate satisfaction rate from reviews
        $totalReviews = Review::count();
        $positiveReviews = Review::where('rating', '>=', 4)->count();
        $satisfactionRate = $totalReviews > 0 
            ? round(($positiveReviews / $totalReviews) * 100, 1) 
            : 0.0;
        
        // Recent activities (last 10 bookings)
        $recentActivities = Booking::with(['passenger', 'driver'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                $statusLabels = [
                    'pending' => 'Pending',
                    'accepted' => 'Accepted',
                    'in_progress' => 'In Progress',
                    'completed' => 'Completed',
                    'cancelled' => 'Cancelled',
                ];
                
                $driverName = $booking->driver ? $booking->driver->name : 'Unassigned';
                $statusLabel = isset($statusLabels[$booking->status]) ? $statusLabels[$booking->status] : $booking->status;
                $action = match($booking->status) {
                    'pending' => "New booking from {$booking->passenger_name}",
                    'accepted' => "Driver {$driverName} accepted booking",
                    'in_progress' => "Driver {$driverName} started trip",
                    'completed' => "Driver {$driverName} completed trip",
                    'cancelled' => "Booking cancelled",
                    default => "Booking status: {$statusLabel}",
                };
                
                return [
                    'driver' => $driverName,
                    'action' => $action,
                    'time' => $booking->created_at->diffForHumans(),
                    'status' => $booking->status === 'completed' ? 'completed' : 
                               ($booking->status === 'cancelled' ? 'issue' : 'active'),
                ];
            });
        
        // Fleet distribution
        $fleetStatus = [
            [
                'status' => 'Active',
                'count' => $activeTricycles,
                'color' => 'bg-green-500',
                'percentage' => $totalTricycles > 0 ? round(($activeTricycles / $totalTricycles) * 100, 1) : 0,
            ],
            [
                'status' => 'Offline',
                'count' => $offlineTricycles,
                'color' => 'bg-red-500',
                'percentage' => $totalTricycles > 0 ? round(($offlineTricycles / $totalTricycles) * 100, 1) : 0,
            ],
        ];
        
        // Calculate revenue growth (compare today with yesterday)
        $yesterdayStart = now()->subDay()->startOfDay();
        $yesterdayEnd = now()->subDay()->endOfDay();
        $yesterdayRevenue = Booking::where('status', 'completed')
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$yesterdayStart, $yesterdayEnd])
            ->sum('total_fare');
        
        $revenueGrowth = $yesterdayRevenue > 0 
            ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
            : 0;
        
        return Inertia::render('dashboard', [
            'stats' => [
                'todayRevenue' => (float) $todayRevenue,
                'revenueGrowth' => $revenueGrowth,
                'activeTrips' => $todayActiveTrips,
                'totalTricycles' => $totalTricycles,
                'activeTricycles' => $activeTricycles,
                'satisfactionRate' => $satisfactionRate . '%',
                'totalDrivers' => $totalDrivers,
                'activeDrivers' => $activeDrivers,
                'totalPassengers' => $totalPassengers,
                'activePassengers' => $activePassengers,
            ],
            'fleetStatus' => $fleetStatus,
            'recentActivities' => $recentActivities,
        ]);
    }
}
