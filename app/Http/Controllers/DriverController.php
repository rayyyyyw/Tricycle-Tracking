<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\DriverApplication;
use App\Models\Booking;

class DriverController extends Controller
{
    // Helper method to get driver data
    private function getDriverData($user)
    {
        // Get the latest approved driver application for this user
        $driverApplication = DriverApplication::where('user_id', $user->id)
            ->where('status', 'approved')
            ->latest()
            ->first();

        return [
            'id' => $user->id,
            'name' => $user->name ?? '',
            'email' => $user->email ?? '',
            'phone' => $user->phone ?? '',
            'address' => $user->address ?? '',
            // Get driver-specific data from the application
            'license_number' => $driverApplication->license_number ?? '',
            'vehicle_type' => $driverApplication->vehicle_type ?? '',
            'vehicle_plate' => $driverApplication->vehicle_plate_number ?? '',
            'vehicle_year' => $driverApplication->vehicle_year ?? '',
            'vehicle_color' => $driverApplication->vehicle_color ?? '',
            'vehicle_model' => $driverApplication->vehicle_model ?? '',
            'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
        ];
    }

    /**
     * Display the driver dashboard.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        // Get pending bookings (exclude cancelled)
        $pendingBookings = Booking::where('status', 'pending')
            ->with('passenger')
            ->latest()
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_id' => $booking->booking_id,
                    'passenger' => [
                        'id' => $booking->passenger->id,
                        'name' => $booking->passenger_name,
                        'phone' => $booking->passenger_phone,
                        'avatar' => $booking->passenger->avatar_url,
                    ],
                    'pickup' => [
                        'lat' => $booking->pickup_lat,
                        'lng' => $booking->pickup_lng,
                        'address' => $booking->pickup_address,
                        'barangay' => $booking->pickup_barangay,
                        'purok' => $booking->pickup_purok,
                    ],
                    'destination' => [
                        'lat' => $booking->destination_lat,
                        'lng' => $booking->destination_lng,
                        'address' => $booking->destination_address,
                        'barangay' => $booking->destination_barangay,
                        'purok' => $booking->destination_purok,
                    ],
                    'ride_type' => $booking->ride_type,
                    'passenger_count' => $booking->passenger_count,
                    'distance' => $booking->distance,
                    'duration' => $booking->duration,
                    'fare' => (float) $booking->fare,
                    'total_fare' => (float) $booking->total_fare,
                    'estimated_arrival' => $booking->estimated_arrival,
                    'special_instructions' => $booking->special_instructions,
                    'emergency_contact' => [
                        'name' => $booking->emergency_contact_name,
                        'phone' => $booking->emergency_contact_phone,
                        'relationship' => $booking->emergency_contact_relationship,
                    ],
                    'created_at' => $booking->created_at->toISOString(),
                ];
            });
        
        // Calculate real statistics
        $completedBookings = Booking::where('status', 'completed')
            ->where('driver_id', $user->id)
            ->with('review')
            ->get();
        
        $totalEarnings = $completedBookings->sum('total_fare');
        $completedRides = $completedBookings->count();
        
        // Calculate average rating
        $ratedBookings = $completedBookings->filter(function ($booking) {
            return $booking->review !== null;
        });
        $averageRating = $ratedBookings->count() > 0
            ? $ratedBookings->avg(function ($booking) {
                return $booking->review->rating;
            })
            : 0;
        
        // Weekly rides (this week)
        $weekStart = now()->startOfWeek();
        $weeklyRides = $completedBookings
            ->filter(function ($booking) use ($weekStart) {
                return $booking->completed_at && $booking->completed_at->gte($weekStart);
            })
            ->count();
        
        // Calculate week-over-week growth
        $lastWeekStart = now()->subWeek()->startOfWeek();
        $lastWeekEnd = now()->subWeek()->endOfWeek();
        $lastWeekRides = Booking::where('status', 'completed')
            ->where('driver_id', $user->id)
            ->whereBetween('completed_at', [$lastWeekStart, $lastWeekEnd])
            ->count();
        
        $ridesGrowth = $lastWeekRides > 0
            ? round((($weeklyRides - $lastWeekRides) / $lastWeekRides) * 100, 1)
            : 0;
        
        // Calculate earnings growth
        $lastWeekEarnings = Booking::where('status', 'completed')
            ->where('driver_id', $user->id)
            ->whereBetween('completed_at', [$lastWeekStart, $lastWeekEnd])
            ->sum('total_fare');
        
        $earningsGrowth = $lastWeekEarnings > 0
            ? round((($totalEarnings - $lastWeekEarnings) / $lastWeekEarnings) * 100, 1)
            : 0;
        
        // Recent activity (last 5 completed rides)
        $recentActivity = $completedBookings
            ->take(5)
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'type' => 'ride',
                    'description' => "Completed ride to {$booking->destination_address}",
                    'time' => $booking->completed_at->diffForHumans(),
                    'amount' => (float) $booking->total_fare,
                ];
            });
        
        // Add recent ratings
        $recentRatings = $ratedBookings
            ->take(3)
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'type' => 'rating',
                    'description' => "Received {$booking->review->rating}-star rating",
                    'time' => $booking->review->created_at->diffForHumans(),
                    'amount' => null,
                ];
            });
        
        $allRecentActivity = $recentActivity->merge($recentRatings)
            ->sortByDesc(function ($item) {
                return $item['time'];
            })
            ->take(5)
            ->values();
        
        return Inertia::render('DriverSide/Index', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
            'pendingBookings' => $pendingBookings,
            'newBookingsCount' => $pendingBookings->count(),
            'stats' => [
                'totalEarnings' => (float) $totalEarnings,
                'completedRides' => $completedRides,
                'rating' => round($averageRating, 1),
                'weeklyRides' => $weeklyRides,
                'ridesGrowth' => $ridesGrowth,
                'earningsGrowth' => $earningsGrowth,
                'ratedRides' => $ratedBookings->count(),
            ],
            'recentActivity' => $allRecentActivity,
        ]);
    }

    /**
     * Display the driver bookings page.
     */
    public function bookings(Request $request)
    {
        $user = $request->user();
        
        // Get all bookings with different statuses (exclude cancelled from pending)
        $pendingBookings = Booking::where('status', 'pending')
            ->with('passenger')
            ->latest()
            ->get()
            ->map(function ($booking) {
                return $this->formatBooking($booking);
            });

        $acceptedBookings = Booking::whereIn('status', ['accepted', 'in_progress'])
            ->where('driver_id', $user->id)
            ->with('passenger')
            ->latest()
            ->get()
            ->map(function ($booking) {
                return $this->formatBooking($booking);
            });

        $completedBookings = Booking::where('status', 'completed')
            ->where('driver_id', $user->id)
            ->with(['passenger', 'review'])
            ->latest()
            ->get()
            ->map(function ($booking) {
                return $this->formatBooking($booking);
            });
        
        return Inertia::render('DriverSide/Bookings', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
            'pendingBookings' => $pendingBookings,
            'acceptedBookings' => $acceptedBookings,
            'completedBookings' => $completedBookings
        ]);
    }

    /**
     * Format booking data for frontend.
     */
    private function formatBooking($booking)
    {
        $data = [
            'id' => $booking->id,
            'booking_id' => $booking->booking_id,
            'status' => $booking->status,
            'passenger' => [
                'id' => $booking->passenger->id,
                'name' => $booking->passenger_name,
                'phone' => $booking->passenger_phone,
                'avatar' => $booking->passenger->avatar_url,
            ],
            'pickup' => [
                'lat' => $booking->pickup_lat,
                'lng' => $booking->pickup_lng,
                'address' => $booking->pickup_address,
                'barangay' => $booking->pickup_barangay,
                'purok' => $booking->pickup_purok,
            ],
            'destination' => [
                'lat' => $booking->destination_lat,
                'lng' => $booking->destination_lng,
                'address' => $booking->destination_address,
                'barangay' => $booking->destination_barangay,
                'purok' => $booking->destination_purok,
            ],
            'ride_type' => $booking->ride_type,
            'passenger_count' => $booking->passenger_count,
            'distance' => $booking->distance,
            'duration' => $booking->duration,
            'total_fare' => (float) $booking->total_fare,
            'estimated_arrival' => $booking->estimated_arrival,
            'special_instructions' => $booking->special_instructions,
            'created_at' => $booking->created_at->toISOString(),
            'accepted_at' => $booking->accepted_at ? $booking->accepted_at->toISOString() : null,
            'completed_at' => $booking->completed_at ? $booking->completed_at->toISOString() : null,
        ];
        
        // Add review data for completed bookings
        if ($booking->status === 'completed') {
            $data['review'] = $booking->review ? [
                'id' => $booking->review->id,
                'rating' => $booking->review->rating,
                'comment' => $booking->review->comment,
            ] : null;
        }
        
        return $data;
    }

    /**
     * Display driver earnings page.
     */
    public function earnings(Request $request)
    {
        $user = $request->user();
        
        // Get all completed bookings for this driver
        $completedBookings = Booking::where('status', 'completed')
            ->where('driver_id', $user->id)
            ->with('review')
            ->latest()
            ->get();
        
        // Calculate earnings
        $totalEarnings = $completedBookings->sum('total_fare');
        
        // Today's earnings
        $todayEarnings = $completedBookings
            ->filter(function ($booking) {
                return $booking->completed_at && $booking->completed_at->format('Y-m-d') === now()->format('Y-m-d');
            })
            ->sum('total_fare');
        
        // This week's earnings
        $weekStart = now()->startOfWeek();
        $weekEarnings = $completedBookings
            ->filter(function ($booking) use ($weekStart) {
                return $booking->completed_at && $booking->completed_at->gte($weekStart);
            })
            ->sum('total_fare');
        
        // This month's earnings
        $monthStart = now()->startOfMonth();
        $monthEarnings = $completedBookings
            ->filter(function ($booking) use ($monthStart) {
                return $booking->completed_at && $booking->completed_at->gte($monthStart);
            })
            ->sum('total_fare');
        
        // Calculate average rating
        $ratedBookings = $completedBookings->filter(function ($booking) {
            return $booking->review !== null;
        });
        
        $averageRating = $ratedBookings->count() > 0
            ? $ratedBookings->avg(function ($booking) {
                return $booking->review->rating;
            })
            : 0;
        
        // Format earnings data
        $earnings = $completedBookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'booking_id' => $booking->booking_id,
                'passenger_name' => $booking->passenger_name,
                'total_fare' => (float) $booking->total_fare,
                'completed_at' => $booking->completed_at->toISOString(),
                'review' => $booking->review ? [
                    'rating' => $booking->review->rating,
                ] : null,
            ];
        });
        
        return Inertia::render('DriverEarnings/Index', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
            'earningsData' => [
                'totalEarnings' => (float) $totalEarnings,
                'todayEarnings' => (float) $todayEarnings,
                'weekEarnings' => (float) $weekEarnings,
                'monthEarnings' => (float) $monthEarnings,
                'totalRides' => $completedBookings->count(),
                'averageRating' => (float) $averageRating,
                'ratedRides' => $ratedBookings->count(),
                'earnings' => $earnings,
            ],
        ]);
    }

    /**
     * Display driver ride history page.
     */
    public function rideHistory(Request $request)
    {
        $user = $request->user();
        
        // Get completed bookings - use updated_at as fallback if completed_at is null
        $completedBookings = Booking::where('status', 'completed')
            ->where('driver_id', $user->id)
            ->with(['passenger', 'review'])
            ->orderByRaw('COALESCE(completed_at, updated_at) DESC')
            ->get()
            ->map(function ($booking) {
                // Use completed_at if available, otherwise use updated_at
                $completedDate = $booking->completed_at ?? $booking->updated_at;
                
                return [
                    'id' => $booking->id,
                    'booking_id' => $booking->booking_id,
                    'passenger' => $booking->passenger ? [
                        'id' => $booking->passenger->id,
                        'name' => $booking->passenger_name,
                        'phone' => $booking->passenger_phone,
                        'avatar' => $booking->passenger->avatar_url,
                    ] : null,
                    'pickup_address' => $booking->pickup_address,
                    'destination_address' => $booking->destination_address,
                    'total_fare' => $booking->total_fare,
                    'completed_at' => $completedDate ? $completedDate->toISOString() : null,
                    'review' => $booking->review ? [
                        'id' => $booking->review->id,
                        'rating' => $booking->review->rating,
                        'comment' => $booking->review->comment,
                    ] : null,
                ];
            })
            ->values(); // Reset array keys
        
        return Inertia::render('DriverHistory/Index', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
            'completedBookings' => $completedBookings,
        ]);
    }

    /**
     * Display the driver profile page.
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        // Get the latest approved driver application for this user
        $driverApplication = DriverApplication::where('user_id', $user->id)
            ->where('status', 'approved')
            ->latest()
            ->first();
        
        return Inertia::render('DriverSide/Profile', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
            'driver_application' => $driverApplication
        ]);
    }

    /**
     * Update the driver's profile information.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'sometimes|string|max:20|nullable',
            'address' => 'sometimes|string|max:500|nullable',
            'avatar' => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:2048|nullable',
        ]);

        // Check if any data actually changed
        $hasChanges = false;
        $updateData = [];

        if ($user->name !== $validated['name']) {
            $updateData['name'] = $validated['name'];
            $hasChanges = true;
        }

        if ($user->phone !== ($validated['phone'] ?? null)) {
            $updateData['phone'] = $validated['phone'] ?? null;
            $hasChanges = true;
        }

        if ($user->address !== ($validated['address'] ?? null)) {
            $updateData['address'] = $validated['address'] ?? null;
            $hasChanges = true;
        }

        // Handle avatar upload
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::exists($user->avatar)) {
                Storage::delete($user->avatar);
            }
            
            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars/drivers/' . $user->id, 'public');
            $updateData['avatar'] = $avatarPath;
            $hasChanges = true;
        }

        // Only update if there are changes
        if ($hasChanges && !empty($updateData)) {
            $user->update($updateData);
            return back()->with('success', 'Profile updated successfully!');
        }

        return back()->with('info', 'No changes were made.');
    }

    /**
     * Display the driver settings page.
     */
    public function settings(Request $request)
    {
        $user = $request->user();
        
        // Default settings structure
        $defaultSettings = [
            'notifications' => [
                'new_rides' => true,
                'ride_updates' => true,
                'promotions' => false,
                'security_alerts' => true,
            ],
            'preferences' => [
                'auto_accept' => false,
                'preferred_areas' => ['Hinoba-an', 'City Center'],
                'max_ride_distance' => 10,
            ],
            'appearance' => [
                'theme' => 'system',
            ]
        ];

        // Merge with user settings if they exist
        $settings = $user->settings ? array_merge($defaultSettings, $user->settings) : $defaultSettings;

        return Inertia::render('DriverSide/Settings', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
            'settings' => $settings
        ]);
    }

    /**
     * Update the driver's settings.
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'notifications' => 'sometimes|array',
            'notifications.new_rides' => 'sometimes|boolean',
            'notifications.ride_updates' => 'sometimes|boolean',
            'notifications.promotions' => 'sometimes|boolean',
            'notifications.security_alerts' => 'sometimes|boolean',
            'preferences' => 'sometimes|array',
            'preferences.auto_accept' => 'sometimes|boolean',
            'preferences.max_ride_distance' => 'sometimes|integer|min:1|max:50',
            'appearance' => 'sometimes|array',
            'appearance.theme' => 'sometimes|in:light,dark,system',
            'current_password' => 'sometimes|required_with:password|current_password',
            'password' => 'sometimes|required|min:8|confirmed',
        ]);

        // Update settings if provided
        if (isset($validated['notifications']) || isset($validated['preferences']) || isset($validated['appearance'])) {
            $currentSettings = $user->settings ?? [];
            
            $newSettings = array_merge($currentSettings, [
                'notifications' => $validated['notifications'] ?? $currentSettings['notifications'] ?? [],
                'preferences' => $validated['preferences'] ?? $currentSettings['preferences'] ?? [],
                'appearance' => $validated['appearance'] ?? $currentSettings['appearance'] ?? [],
            ]);

            $user->update([
                'settings' => $newSettings
            ]);
        }

        // Update password if provided
        if ($request->filled('password')) {
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return back()->with('success', 'Settings updated successfully!');
    }

    /**
     * Delete the driver's account.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required|string|current_password',
        ]);

        $user = $request->user();

        // Delete avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Delete driver application if exists
        DriverApplication::where('user_id', $user->id)->delete();

        // Logout the user using the Auth facade
        Auth::logout();

        // Delete the user
        $user->delete();

        // Invalidate session and regenerate CSRF token
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Your account has been permanently deleted.');
    }

    /**
     * Display driver analytics page.
     */
    public function analytics(Request $request)
    {
        $user = $request->user();
        
        // Get all completed bookings for analytics
        $completedBookings = Booking::where('status', 'completed')
            ->where('driver_id', $user->id)
            ->with('review')
            ->get();
        
        // Calculate statistics
        $totalEarnings = $completedBookings->sum('total_fare');
        $totalRides = $completedBookings->count();
        
        // Earnings by period
        $todayEarnings = $completedBookings
            ->filter(function ($booking) {
                return $booking->completed_at && $booking->completed_at->format('Y-m-d') === now()->format('Y-m-d');
            })
            ->sum('total_fare');
        
        $weekEarnings = $completedBookings
            ->filter(function ($booking) {
                return $booking->completed_at && $booking->completed_at->gte(now()->startOfWeek());
            })
            ->sum('total_fare');
        
        $monthEarnings = $completedBookings
            ->filter(function ($booking) {
                return $booking->completed_at && $booking->completed_at->gte(now()->startOfMonth());
            })
            ->sum('total_fare');
        
        // Average rating
        $ratedBookings = $completedBookings->filter(function ($booking) {
            return $booking->review !== null;
        });
        $averageRating = $ratedBookings->count() > 0
            ? $ratedBookings->avg(function ($booking) {
                return $booking->review->rating;
            })
            : 0;
        
        // Earnings by day (last 7 days)
        $dailyEarnings = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayEarnings = $completedBookings
                ->filter(function ($booking) use ($date) {
                    return $booking->completed_at && $booking->completed_at->format('Y-m-d') === $date;
                })
                ->sum('total_fare');
            $dailyEarnings[] = [
                'date' => $date,
                'day' => now()->subDays($i)->format('D'),
                'earnings' => (float) $dayEarnings,
            ];
        }
        
        // Rides by day (last 7 days)
        $dailyRides = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayRides = $completedBookings
                ->filter(function ($booking) use ($date) {
                    return $booking->completed_at && $booking->completed_at->format('Y-m-d') === $date;
                })
                ->count();
            $dailyRides[] = [
                'date' => $date,
                'day' => now()->subDays($i)->format('D'),
                'rides' => $dayRides,
            ];
        }
        
        // Top earning days
        $topDays = collect($dailyEarnings)
            ->sortByDesc('earnings')
            ->take(3)
            ->values();
        
        return Inertia::render('DriverSide/Analytics', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
            'analytics' => [
                'totalEarnings' => (float) $totalEarnings,
                'totalRides' => $totalRides,
                'todayEarnings' => (float) $todayEarnings,
                'weekEarnings' => (float) $weekEarnings,
                'monthEarnings' => (float) $monthEarnings,
                'averageRating' => round($averageRating, 1),
                'ratedRides' => $ratedBookings->count(),
                'dailyEarnings' => $dailyEarnings,
                'dailyRides' => $dailyRides,
                'topDays' => $topDays,
            ],
        ]);
    }

    /**
     * Display driver messages page (placeholder).
     */
    public function messages(Request $request)
    {
        $user = $request->user();
        
        return Inertia::render('DriverSide/Messages', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
        ]);
    }

    /**
     * Display driver safety page (placeholder).
     */
    public function safety(Request $request)
    {
        $user = $request->user();
        
        return Inertia::render('DriverSide/Safety', [
            'auth' => [
                'user' => $this->getDriverData($user)
            ],
        ]);
    }
}