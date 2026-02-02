<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Display comprehensive analytics dashboard.
     */
    public function index(Request $request)
    {
        $period = (string) $request->query('period', '30');
        $days = max(1, (int) $period);
        $startDate = now()->subDays($days);
        
        // Revenue Analytics
        $revenueData = $this->getRevenueAnalytics($startDate);
        
        // Booking Analytics
        $bookingData = $this->getBookingAnalytics($startDate);
        
        // Driver Performance
        $driverPerformance = $this->getDriverPerformance($startDate);
        
        // Passenger Analytics
        $passengerAnalytics = $this->getPassengerAnalytics($startDate);
        
        // Peak Hours Analysis
        $peakHours = $this->getPeakHoursAnalysis($startDate);
        
        // Popular Routes
        $popularRoutes = $this->getPopularRoutes($startDate);
        
        // Growth Metrics
        $growthMetrics = $this->getGrowthMetrics();

        return Inertia::render('Admin/Analytics', [
            'period' => (string) $days,
            'revenue' => $revenueData,
            'bookings' => $bookingData,
            'drivers' => $driverPerformance,
            'passengers' => $passengerAnalytics,
            'peakHours' => $peakHours,
            'popularRoutes' => $popularRoutes,
            'growth' => $growthMetrics,
        ]);
    }

    /**
     * Get revenue analytics.
     */
    private function getRevenueAnalytics($startDate)
    {
        $completedBookings = Booking::where('status', 'completed')
            ->where('completed_at', '>=', $startDate)
            ->get();

        $totalRevenue = $completedBookings->sum('total_fare');
        $averageRideRevenue = $completedBookings->avg('total_fare');
        
        // Revenue by day
        $dailyRevenue = $completedBookings->groupBy(function ($booking) {
            return $booking->completed_at->format('Y-m-d');
        })->map(function ($dayBookings) {
            return [
                'revenue' => $dayBookings->sum('total_fare'),
                'rides' => $dayBookings->count(),
            ];
        });

        // Revenue by ride type
        $revenueByType = $completedBookings->groupBy('ride_type')
            ->map(function ($bookings, $type) {
                return [
                    'type' => $type,
                    'revenue' => $bookings->sum('total_fare'),
                    'count' => $bookings->count(),
                    'percentage' => 0, // Will calculate after
                ];
            });

        return [
            'total' => (float) ($totalRevenue ?? 0),
            'average_per_ride' => (float) ($averageRideRevenue ?? 0),
            'daily' => $dailyRevenue ?? [],
            'by_type' => $revenueByType->values() ?? [],
        ];
    }

    /**
     * Get booking analytics.
     */
    private function getBookingAnalytics($startDate)
    {
        $allBookings = Booking::where('created_at', '>=', $startDate)->get();
        
        $completed = $allBookings->where('status', 'completed')->count();
        $cancelled = $allBookings->where('status', 'cancelled')->count();
        $pending = $allBookings->where('status', 'pending')->count();
        $total = $allBookings->count();
        
        $completionRate = $total > 0 ? ($completed / $total) * 100 : 0;
        $cancellationRate = $total > 0 ? ($cancelled / $total) * 100 : 0;

        // Average metrics
        $avgDistance = $allBookings->where('status', 'completed')->avg(function ($booking) {
            return floatval(str_replace(' km', '', $booking->distance ?? '0'));
        }) ?? 0;

        $avgDuration = $allBookings->where('status', 'completed')->avg(function ($booking) {
            return floatval(str_replace(' mins', '', $booking->duration ?? '0'));
        }) ?? 0;

        return [
            'total' => $total,
            'completed' => $completed,
            'cancelled' => $cancelled,
            'pending' => $pending,
            'completion_rate' => round($completionRate, 1),
            'cancellation_rate' => round($cancellationRate, 1),
            'avg_distance_km' => round($avgDistance ?? 0, 2),
            'avg_duration_minutes' => round($avgDuration ?? 0, 1),
        ];
    }

    /**
     * Get driver performance metrics.
     */
    private function getDriverPerformance($startDate)
    {
        $drivers = User::where('role', 'driver')
            ->withCount(['bookings as completed_rides' => function ($query) use ($startDate) {
                $query->where('status', 'completed')
                      ->where('completed_at', '>=', $startDate);
            }])
            ->get()
            ->map(function ($driver) use ($startDate) {
                $completedBookings = Booking::where('driver_id', $driver->id)
                    ->where('status', 'completed')
                    ->where('completed_at', '>=', $startDate)
                    ->with('review')
                    ->get();

                $revenue = $completedBookings->sum('total_fare');
                
                $reviews = $completedBookings->filter(fn($b) => $b->review !== null);
                $avgRating = $reviews->count() > 0
                    ? $reviews->avg(fn($b) => $b->review->rating)
                    : 0;

                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'completed_rides' => $driver->completed_rides,
                    'revenue' => (float) $revenue,
                    'avg_rating' => round($avgRating, 2),
                    'reviews_count' => $reviews->count(),
                ];
            })
            ->sortByDesc('revenue')
            ->take(10)
            ->values();

        return [
            'top_earners' => $drivers,
            'total_active' => User::where('role', 'driver')->where('is_online', true)->count(),
            'total_drivers' => User::where('role', 'driver')->count(),
        ];
    }

    /**
     * Get passenger analytics.
     */
    private function getPassengerAnalytics($startDate)
    {
        $passengers = User::where('role', 'passenger')
            ->withCount(['bookings as total_rides' => function ($query) use ($startDate) {
                $query->where('status', 'completed')
                      ->where('completed_at', '>=', $startDate);
            }])
            ->get();

        $totalPassengers = $passengers->count();
        $activePassengers = $passengers->filter(fn($p) => $p->total_rides > 0)->count();

        // Top passengers by ride count
        $topPassengers = $passengers->sortByDesc('total_rides')
            ->take(10)
            ->map(function ($passenger) use ($startDate) {
                $bookings = Booking::where('passenger_id', $passenger->id)
                    ->where('status', 'completed')
                    ->where('completed_at', '>=', $startDate)
                    ->get();

                return [
                    'id' => $passenger->id,
                    'name' => $passenger->name,
                    'total_rides' => $bookings->count(),
                    'total_spent' => (float) $bookings->sum('total_fare'),
                ];
            })
            ->values();

        return [
            'total' => $totalPassengers,
            'active' => $activePassengers,
            'top_passengers' => $topPassengers,
        ];
    }

    /**
     * Get peak hours analysis.
     */
    private function getPeakHoursAnalysis($startDate)
    {
        $bookings = Booking::where('created_at', '>=', $startDate)->get();
        
        $hourlyData = $bookings->groupBy(function ($booking) {
            return $booking->created_at->format('H');
        })->map(function ($hourBookings, $hour) {
            return [
                'hour' => intval($hour),
                'bookings' => $hourBookings->count(),
                'label' => sprintf('%02d:00', $hour),
            ];
        })->sortBy('hour')->values();

        return $hourlyData;
    }

    /**
     * Get popular routes.
     */
    private function getPopularRoutes($startDate)
    {
        $routes = Booking::where('status', 'completed')
            ->where('completed_at', '>=', $startDate)
            ->get()
            ->groupBy(function ($booking) {
                $from = $booking->pickup_barangay ?? 'Unknown';
                $to = $booking->destination_barangay ?? 'Unknown';
                return $from . ' → ' . $to;
            })
            ->map(function ($routeBookings, $route) {
                return [
                    'route' => $route,
                    'count' => $routeBookings->count(),
                    'avg_fare' => round($routeBookings->avg('total_fare'), 2),
                    'total_revenue' => (float) $routeBookings->sum('total_fare'),
                ];
            })
            ->sortByDesc('count')
            ->take(10)
            ->values();

        return $routes;
    }

    /**
     * Get growth metrics (comparing periods).
     */
    private function getGrowthMetrics()
    {
        $thisMonth = Booking::where('status', 'completed')
            ->whereBetween('completed_at', [now()->startOfMonth(), now()])
            ->get();

        $lastMonth = Booking::where('status', 'completed')
            ->whereBetween('completed_at', [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth()
            ])
            ->get();

        $rideGrowth = $lastMonth->count() > 0
            ? (($thisMonth->count() - $lastMonth->count()) / $lastMonth->count()) * 100
            : 0;

        $revenueGrowth = $lastMonth->sum('total_fare') > 0
            ? (($thisMonth->sum('total_fare') - $lastMonth->sum('total_fare')) / $lastMonth->sum('total_fare')) * 100
            : 0;

        return [
            'ride_growth_percent' => round($rideGrowth, 1),
            'revenue_growth_percent' => round($revenueGrowth, 1),
            'this_month_rides' => $thisMonth->count(),
            'last_month_rides' => $lastMonth->count(),
            'this_month_revenue' => (float) $thisMonth->sum('total_fare'),
            'last_month_revenue' => (float) $lastMonth->sum('total_fare'),
        ];
    }

    /**
     * Export analytics data as CSV.
     */
    public function export(Request $request)
    {
        $period = (string) $request->query('period', '30');
        $days = max(1, (int) $period);
        $startDate = now()->subDays($days);
        
        $bookings = Booking::where('completed_at', '>=', $startDate)
            ->where('status', 'completed')
            ->with(['passenger', 'driver'])
            ->get();

        $filename = 'analytics_export_' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($bookings) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, [
                'Booking ID',
                'Date',
                'Passenger',
                'Driver',
                'Pickup',
                'Destination',
                'Distance',
                'Duration',
                'Fare',
                'Status'
            ]);

            // Add data
            foreach ($bookings as $booking) {
                fputcsv($file, [
                    $booking->booking_id,
                    $booking->completed_at->format('Y-m-d H:i'),
                    $booking->passenger->name ?? 'N/A',
                    $booking->driver->name ?? 'N/A',
                    $booking->pickup_address,
                    $booking->destination_address,
                    $booking->distance,
                    $booking->duration,
                    $booking->total_fare,
                    $booking->status,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
