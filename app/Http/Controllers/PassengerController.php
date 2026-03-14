<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\SavedPlace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PassengerController extends Controller
{
    /**
     * Display the passenger dashboard.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Get all completed bookings for this passenger
        $completedBookings = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->with(['driver', 'review'])
            ->latest()
            ->get();

        // Calculate statistics
        $totalRides = $completedBookings->count();
        $totalSpent = $completedBookings->sum('total_fare');

        // Calculate average rating from reviews
        $reviews = $completedBookings->filter(function ($booking) {
            return $booking->review !== null;
        });
        $averageRating = $reviews->count() > 0
            ? $reviews->avg(function ($booking) {
                return $booking->review->rating;
            })
            : 0;

        // Calculate total time saved (sum of durations in minutes)
        $totalTimeSaved = $completedBookings->sum(function ($booking) {
            if ($booking->duration) {
                // Extract minutes from duration string (e.g., "15 mins" -> 15)
                preg_match('/(\d+)/', $booking->duration, $matches);

                return isset($matches[1]) ? (int) $matches[1] : 0;
            }

            return 0;
        });

        // Get recent 5 rides
        $recentRides = $completedBookings->take(5)->map(function ($booking) {
            return [
                'id' => $booking->id,
                'booking_id' => $booking->booking_id,
                'pickup_address' => $booking->pickup_address,
                'destination_address' => $booking->destination_address,
                'total_fare' => (float) $booking->total_fare,
                'completed_at' => $booking->completed_at->toISOString(),
            ];
        });

        // Get favorite drivers (drivers with most rides from this passenger, ordered by average rating)
        $favoriteDrivers = $completedBookings
            ->whereNotNull('driver_id')
            ->groupBy('driver_id')
            ->map(function ($bookings, $driverId) {
                $driver = $bookings->first()->driver;
                $reviews = $bookings->filter(function ($booking) {
                    return $booking->review !== null;
                });
                $avgRating = $reviews->count() > 0
                    ? $reviews->avg(function ($booking) {
                        return $booking->review->rating;
                    })
                    : 0;

                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'avatar' => $driver->avatar_url,
                    'rides' => $bookings->count(),
                    'rating' => round($avgRating, 1),
                ];
            })
            ->sortByDesc(function ($driver) {
                // Sort by rating first, then by number of rides
                return [$driver['rating'], $driver['rides']];
            })
            ->take(3)
            ->values();

        // Calculate month-over-month growth for total rides
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $thisMonthStart = now()->startOfMonth();

        $lastMonthRides = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $lastMonthStart)
            ->where('completed_at', '<=', $lastMonthEnd)
            ->count();

        $thisMonthRides = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $thisMonthStart)
            ->count();

        $ridesGrowth = $lastMonthRides > 0
            ? round((($thisMonthRides - $lastMonthRides) / $lastMonthRides) * 100, 1)
            : 0;

        // Calculate month-over-month spending growth
        $lastMonthSpent = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $lastMonthStart)
            ->where('completed_at', '<=', $lastMonthEnd)
            ->sum('total_fare');

        $thisMonthSpent = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $thisMonthStart)
            ->sum('total_fare');

        $spendingGrowth = $lastMonthSpent > 0
            ? round((($thisMonthSpent - $lastMonthSpent) / $lastMonthSpent) * 100, 1)
            : 0;

        // Drivers who are online, recently active (so browser closed = offline), and have approved application
        $onlineUsers = User::where('role', 'driver')
            ->where('is_online', true)
            ->where('last_activity_at', '>=', now()->subSeconds(15))
            ->with('approvedDriverApplication')
            ->get()
            ->filter(fn ($u) => $u->approvedDriverApplication !== null);
        $busyDriverIds = Booking::whereIn('status', ['accepted', 'in_progress'])
            ->whereNotNull('driver_id')
            ->pluck('driver_id')
            ->flip()
            ->all();
        $onlineDrivers = $onlineUsers->map(fn ($driver) => [
            'id' => $driver->id,
            'name' => $driver->name,
            'avatar' => $driver->avatar_url,
            'vehicle_plate' => $driver->approvedDriverApplication?->vehicle_plate_number ?? 'N/A',
            'vehicle_type' => $driver->approvedDriverApplication?->vehicle_type ?? 'Tricycle',
            'is_online' => true,
            'has_active_booking' => isset($busyDriverIds[$driver->id]),
        ])->values();

        // Active ride (pending, accepted, or in_progress) for "View ride" card on dashboard
        $activeBooking = Booking::where('passenger_id', $user->id)
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->with('driver')
            ->latest()
            ->first();

        $activeBookingData = null;
        if ($activeBooking) {
            $buildFullAddress = function ($address, $barangay) {
                if (str_contains($address ?? '', 'Negros Occidental')) {
                    return $address;
                }
                if (! empty($barangay)) {
                    return $address.', '.$barangay.', Hinobaan, Negros Occidental';
                }

                return $address ?? '';
            };
            $activeBookingData = [
                'id' => $activeBooking->id,
                'booking_id' => $activeBooking->booking_id,
                'status' => $activeBooking->status,
                'pickup_address' => $buildFullAddress($activeBooking->pickup_address, $activeBooking->pickup_barangay),
                'destination_address' => $buildFullAddress($activeBooking->destination_address, $activeBooking->destination_barangay),
                'driver_name' => $activeBooking->driver?->name,
                'total_fare' => (float) $activeBooking->total_fare,
            ];
        }

        return Inertia::render('PassengerSide/Index', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'avatar' => $user->avatar_url,
                    'role' => $user->role,
                    'has_pending_driver_application' => $user->hasPendingDriverApplication(),
                    'is_driver' => $user->isDriver(),
                    'emergency_contact' => $user->emergency_contact,
                    'emergency_name' => $user->emergency_name,
                    'emergency_phone' => $user->emergency_phone,
                    'emergency_relationship' => $user->emergency_relationship,
                ],
            ],
            'stats' => [
                'totalRides' => $totalRides,
                'totalSpent' => (float) $totalSpent,
                'averageRating' => round($averageRating, 1),
                'totalTimeSaved' => $totalTimeSaved,
                'ridesGrowth' => $ridesGrowth,
                'spendingGrowth' => $spendingGrowth,
                'reviewedRides' => $reviews->count(),
            ],
            'recentRides' => $recentRides,
            'favoriteDrivers' => $favoriteDrivers,
            'onlineDrivers' => $onlineDrivers,
            'activeBooking' => $activeBookingData,
        ]);
    }

    public function Index(Request $request)
    {
        $user = $request->user();

        // Get active booking (pending, accepted, in_progress, or completed without review) for this passenger
        $activeBooking = Booking::where('passenger_id', $user->id)
            ->where(function ($query) {
                // Include pending, accepted, or in_progress bookings
                $query->whereIn('status', ['pending', 'accepted', 'in_progress'])
                    // Or include completed bookings only if they don't have a review yet
                    ->orWhere(function ($q) {
                        $q->where('status', 'completed')
                            ->doesntHave('review');
                    });
            })
            ->with(['passenger', 'driver', 'review'])
            ->latest()
            ->first();

        $bookingData = null;
        if ($activeBooking) {
            $pickupLat = $activeBooking->pickup_lat !== null ? (float) $activeBooking->pickup_lat : null;
            $pickupLng = $activeBooking->pickup_lng !== null ? (float) $activeBooking->pickup_lng : null;
            $destLat = $activeBooking->destination_lat !== null ? (float) $activeBooking->destination_lat : null;
            $destLng = $activeBooking->destination_lng !== null ? (float) $activeBooking->destination_lng : null;

            $bookingData = [
                'id' => $activeBooking->id,
                'booking_id' => $activeBooking->booking_id,
                'status' => $activeBooking->status,
                'pickup' => ($pickupLat !== null && $pickupLng !== null) ? [
                    'lat' => $pickupLat,
                    'lng' => $pickupLng,
                    'address' => $activeBooking->pickup_address ?? '',
                    'barangay' => $activeBooking->pickup_barangay,
                    'purok' => $activeBooking->pickup_purok,
                    'designation' => $activeBooking->pickup_designation,
                ] : null,
                'destination' => ($destLat !== null && $destLng !== null) ? [
                    'lat' => $destLat,
                    'lng' => $destLng,
                    'address' => $activeBooking->destination_address ?? '',
                    'barangay' => $activeBooking->destination_barangay,
                    'purok' => $activeBooking->destination_purok,
                    'designation' => $activeBooking->destination_designation,
                ] : null,
                'driver' => $activeBooking->driver ? [
                    'id' => $activeBooking->driver->id,
                    'name' => $activeBooking->driver->name,
                    'phone' => $activeBooking->driver->phone,
                    'avatar' => $activeBooking->driver->avatar_url,
                    'location' => $activeBooking->driver->last_latitude !== null && $activeBooking->driver->last_longitude !== null
                        ? ['lat' => (float) $activeBooking->driver->last_latitude, 'lng' => (float) $activeBooking->driver->last_longitude]
                        : null,
                ] : null,
                'driver_application' => $activeBooking->driver && $activeBooking->driver->approvedDriverApplication ? [
                    'vehicle_plate_number' => $activeBooking->driver->approvedDriverApplication->vehicle_plate_number,
                ] : null,
                'review' => $activeBooking->review ? [
                    'id' => $activeBooking->review->id,
                    'rating' => $activeBooking->review->rating,
                    'comment' => $activeBooking->review->comment,
                ] : null,
                'created_at' => $activeBooking->created_at->toISOString(),
            ];
        }

        // Get user's saved places for quick selection
        $savedPlaces = $user->savedPlaces()
            ->orderBy('is_primary', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(6) // Limit to 6 most recent/primary places
            ->get()
            ->map(function ($place) {
                return [
                    'id' => $place->id,
                    'type' => $place->type,
                    'name' => $place->name,
                    'address' => $place->address,
                    'latitude' => $place->latitude,
                    'longitude' => $place->longitude,
                    'barangay' => $place->barangay,
                    'purok' => $place->purok,
                    'is_primary' => $place->is_primary,
                ];
            });

        return Inertia::render('BookRide/Index', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'avatar' => $user->avatar_url,
                    'role' => $user->role,
                    'has_pending_driver_application' => $user->hasPendingDriverApplication(),
                    'is_driver' => $user->isDriver(),
                    'emergency_contact' => $user->emergency_contact,
                    'emergency_name' => $user->emergency_name,
                    'emergency_phone' => $user->emergency_phone,
                    'emergency_relationship' => $user->emergency_relationship,
                ],
            ],
            'activeBooking' => $bookingData,
            'savedPlaces' => $savedPlaces,
        ]);
    }

    /**
     * Display the passenger profile page.
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        $completedBookings = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->with(['driver', 'review'])
            ->get();

        $totalRides = $completedBookings->count();
        $memberSince = $user->created_at ? (string) $user->created_at->year : date('Y');

        $favoriteDriver = $user->favoriteDrivers()->first();
        $favoriteDriverName = $favoriteDriver ? $favoriteDriver->name : '—';

        $reviews = $completedBookings->filter(fn ($b) => $b->review !== null);
        $safetyScore = $reviews->count() > 0
            ? round($reviews->avg(fn ($b) => $b->review->rating), 1)
            : 0;

        return Inertia::render('PassengerSide/profile', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'avatar' => $user->avatar_url,
                    'role' => $user->role,
                    'has_pending_driver_application' => $user->hasPendingDriverApplication(),
                    'is_driver' => $user->isDriver(),
                    'emergency_contact' => $user->emergency_contact,
                    'emergency_name' => $user->emergency_name,
                    'emergency_phone' => $user->emergency_phone,
                    'emergency_relationship' => $user->emergency_relationship,
                ],
            ],
            'stats' => [
                'totalRides' => $totalRides,
                'memberSince' => $memberSince,
                'favoriteDriverName' => $favoriteDriverName,
                'safetyScore' => $safetyScore,
            ],
        ]);
    }

    /**
     * Display the passenger settings page.
     */
    public function settings(Request $request)
    {
        $user = $request->user();

        // Default settings structure
        $defaultSettings = [
            'notifications' => [
                'ride_updates' => true,
                'promotions' => true,
                'safety_updates' => true,
            ],
            'appearance' => [
                'theme' => 'light',
            ],
            'language' => 'en',
        ];

        // Merge with user settings if they exist
        $settings = $user->settings ? array_merge($defaultSettings, $user->settings) : $defaultSettings;

        return Inertia::render('PassengerSide/settings', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar_url,
                    'role' => $user->role,
                    'has_pending_driver_application' => $user->hasPendingDriverApplication(),
                    'is_driver' => $user->isDriver(),
                ],
            ],
            'settings' => $settings,
        ]);
    }

    /**
     * Update the passenger's settings.
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'notifications' => 'sometimes|array',
            'notifications.ride_updates' => 'sometimes|boolean',
            'notifications.promotions' => 'sometimes|boolean',
            'notifications.safety_updates' => 'sometimes|boolean',
            'appearance' => 'sometimes|array',
            'appearance.theme' => 'sometimes|in:light,dark,system',
            'language' => 'sometimes|in:en,fil',
        ]);

        // Update settings if provided
        if (isset($validated['notifications']) || isset($validated['appearance']) || isset($validated['language'])) {
            $currentSettings = $user->settings ?? [];

            // Merge notifications if provided
            if (isset($validated['notifications'])) {
                $currentSettings['notifications'] = array_merge(
                    $currentSettings['notifications'] ?? [],
                    $validated['notifications']
                );
            }

            // Merge appearance if provided
            if (isset($validated['appearance'])) {
                $currentSettings['appearance'] = array_merge(
                    $currentSettings['appearance'] ?? [],
                    $validated['appearance']
                );
            }

            // Update language if provided
            if (isset($validated['language'])) {
                $currentSettings['language'] = $validated['language'];
            }

            $user->update([
                'settings' => $currentSettings,
            ]);
        }

        return back()->with('success', 'Settings updated successfully!');
    }

    // ... rest of your controller methods remain the same
    /**
     * Update the passenger's profile information.
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
        ]);

        $request->user()->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update the passenger's emergency contact information.
     */
    public function updateEmergencyContact(Request $request)
    {
        $request->validate([
            'emergency_name' => 'required|string|max:255',
            'emergency_phone' => 'required|string|max:20',
            'emergency_relationship' => 'required|string|max:100',
        ]);

        $user = $request->user();
        $user->update([
            'emergency_contact' => [
                'name' => $request->emergency_name,
                'phone' => $request->emergency_phone,
                'relationship' => $request->emergency_relationship,
            ],
        ]);

        // Refresh to ensure the update is persisted and accessible immediately
        $user->refresh();

        return back()->with('success', 'Emergency contact updated successfully.');
    }

    /**
     * Update the passenger's avatar.
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $avatarPath = $request->file('avatar')->store('avatars', 'public');

        $user->update([
            'avatar' => $avatarPath,
        ]);

        return back()->with('success', 'Profile picture updated successfully.');
    }

    /**
     * Delete the passenger's avatar.
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);

            $user->update([
                'avatar' => null,
            ]);

            return back()->with('success', 'Profile picture removed successfully.');
        }

        return back()->with('error', 'No profile picture to remove.');
    }

    /**
     * Delete the passenger's account.
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
     * Display passenger ride history with completed bookings and reviews.
     */
    public function rideHistory(Request $request)
    {
        $user = $request->user();

        $completedBookings = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->with(['driver', 'review'])
            ->latest()
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_id' => $booking->booking_id,
                    'driver' => $booking->driver ? [
                        'id' => $booking->driver->id,
                        'name' => $booking->driver->name,
                        'avatar' => $booking->driver->avatar_url,
                    ] : null,
                    'pickup_address' => $booking->pickup_address,
                    'destination_address' => $booking->destination_address,
                    'total_fare' => $booking->total_fare,
                    'completed_at' => $booking->completed_at->toISOString(),
                    'review' => $booking->review ? [
                        'id' => $booking->review->id,
                        'rating' => $booking->review->rating,
                        'comment' => $booking->review->comment,
                    ] : null,
                ];
            });

        return Inertia::render('RideHistory/RideHistory', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'avatar' => $user->avatar_url,
                    'role' => $user->role,
                    'has_pending_driver_application' => $user->hasPendingDriverApplication(),
                    'is_driver' => $user->isDriver(),
                    'emergency_contact' => $user->emergency_contact,
                    'emergency_name' => $user->emergency_name,
                    'emergency_phone' => $user->emergency_phone,
                    'emergency_relationship' => $user->emergency_relationship,
                ],
            ],
            'completedBookings' => $completedBookings,
        ]);
    }

    /**
     * Display the saved places and favorites page.
     */
    public function savedPlaces(Request $request)
    {
        $user = $request->user();

        // Get user's saved places
        $savedPlaces = $user->savedPlaces()
            ->orderBy('is_primary', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($place) {
                return [
                    'id' => $place->id,
                    'type' => $place->type,
                    'name' => $place->name,
                    'address' => $place->address,
                    'latitude' => $place->latitude,
                    'longitude' => $place->longitude,
                    'barangay' => $place->barangay,
                    'purok' => $place->purok,
                    'is_primary' => $place->is_primary,
                ];
            });

        // Get favorite drivers with stats
        $favoriteDrivers = $user->favoriteDrivers()
            ->with('approvedDriverApplication')
            ->get()
            ->map(function ($driver) use ($user) {
                // Get booking stats for this driver with this passenger
                $bookings = Booking::where('passenger_id', $user->id)
                    ->where('driver_id', $driver->id)
                    ->where('status', 'completed')
                    ->with('review')
                    ->get();

                $totalRides = $bookings->count();

                // Calculate average rating from reviews
                $reviews = $bookings->filter(fn ($booking) => $booking->review !== null);
                $averageRating = $reviews->count() > 0
                    ? round($reviews->avg(fn ($booking) => $booking->review->rating), 1)
                    : 0;

                $driverApp = $driver->approvedDriverApplication;

                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'avatar' => $driver->avatar_url,
                    'rating' => $averageRating,
                    'total_rides' => $totalRides,
                    'vehicle_type' => $driverApp?->vehicle_type ?? 'N/A',
                    'plate_number' => $driverApp?->vehicle_plate_number ?? 'N/A',
                ];
            });

        // Get recent places from completed bookings (last 10 unique destinations)
        $recentPlaces = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->whereNotNull('destination_address')
            ->select('destination_address', 'destination_lat', 'destination_lng', 'destination_barangay', 'destination_purok', 'completed_at')
            ->orderBy('completed_at', 'desc')
            ->take(20)
            ->get()
            ->unique('destination_address')
            ->take(10)
            ->map(function ($booking) {
                $timestamp = $booking->completed_at;
                $timeAgo = $timestamp->diffForHumans();

                return [
                    'id' => $booking->id,
                    'address' => $booking->destination_address,
                    'latitude' => $booking->destination_lat,
                    'longitude' => $booking->destination_lng,
                    'barangay' => $booking->destination_barangay,
                    'purok' => $booking->destination_purok,
                    'timestamp' => $timeAgo,
                ];
            })
            ->values();

        // Drivers from completed rides (not yet in favorites) for "Add to favorites"
        $favoriteDriverIds = $user->favoriteDrivers()->pluck('users.id')->toArray();
        $driversFromRides = Booking::where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->whereNotNull('driver_id')
            ->whereNotIn('driver_id', $favoriteDriverIds)
            ->with(['driver.approvedDriverApplication', 'review'])
            ->get()
            ->groupBy('driver_id')
            ->map(function ($bookings) {
                $booking = $bookings->first();
                $driver = $booking->driver;
                $driverApp = $driver->approvedDriverApplication ?? null;
                $reviews = $bookings->filter(fn ($b) => $b->review !== null);
                $avgRating = $reviews->count() > 0
                    ? round($reviews->avg(fn ($b) => $b->review->rating), 1)
                    : 0;

                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'avatar' => $driver->avatar_url,
                    'rating' => $avgRating,
                    'total_rides' => $bookings->count(),
                    'vehicle_type' => $driverApp?->vehicle_type ?? 'N/A',
                    'plate_number' => $driverApp?->vehicle_plate_number ?? 'N/A',
                ];
            })
            ->values()
            ->toArray();

        // 13 barangays in Hinobaan for saved places (match BookRide frontend)
        $barangays = self::hinobaanBarangays();

        return Inertia::render('PassengerSide/SavedPlaces', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'avatar' => $user->avatar_url,
                    'role' => $user->role,
                    'has_pending_driver_application' => $user->hasPendingDriverApplication(),
                    'is_driver' => $user->isDriver(),
                    'emergency_contact' => $user->emergency_contact,
                    'emergency_name' => $user->emergency_name,
                    'emergency_phone' => $user->emergency_phone,
                    'emergency_relationship' => $user->emergency_relationship,
                ],
            ],
            'savedPlaces' => $savedPlaces,
            'favoriteDrivers' => $favoriteDrivers,
            'driversFromRides' => $driversFromRides,
            'recentPlaces' => $recentPlaces,
            'barangays' => $barangays,
        ]);
    }

    /**
     * 13 barangays in Hinobaan municipality (match BookRide frontend).
     */
    public static function hinobaanBarangays(): array
    {
        return [
            ['id' => 'alim', 'name' => 'Alim', 'lat' => 9.5648, 'lng' => 122.4911],
            ['id' => 'asia', 'name' => 'Asia', 'lat' => 9.5506, 'lng' => 122.5164],
            ['id' => 'bacuyangan', 'name' => 'Bacuyangan', 'lat' => 9.6268, 'lng' => 122.4685],
            ['id' => 'barangay1', 'name' => 'Barangay I (Poblacion)', 'lat' => 9.5989, 'lng' => 122.4676],
            ['id' => 'barangay2', 'name' => 'Barangay II (Poblacion)', 'lat' => 9.6001, 'lng' => 122.4726],
            ['id' => 'bulwangan', 'name' => 'Bulwangan', 'lat' => 9.5165, 'lng' => 122.5355],
            ['id' => 'culipapa', 'name' => 'Culipapa', 'lat' => 9.4726, 'lng' => 122.5616],
            ['id' => 'damutan', 'name' => 'Damutan', 'lat' => 9.601, 'lng' => 122.6194],
            ['id' => 'daug', 'name' => 'Daug', 'lat' => 9.4881, 'lng' => 122.5454],
            ['id' => 'pook', 'name' => 'Po-ok', 'lat' => 9.582, 'lng' => 122.4776],
            ['id' => 'sanrafael', 'name' => 'San Rafael', 'lat' => 9.6083, 'lng' => 122.5137],
            ['id' => 'sangke', 'name' => 'Sangke', 'lat' => 9.4455, 'lng' => 122.5888],
            ['id' => 'talacagay', 'name' => 'Talacagay', 'lat' => 9.6382, 'lng' => 122.4701],
        ];
    }

    /**
     * Add a driver to favorites (must have completed at least one ride with them).
     */
    public function addFavoriteDriver(Request $request, User $driver)
    {
        $user = $request->user();
        $hasRidden = Booking::where('passenger_id', $user->id)
            ->where('driver_id', $driver->id)
            ->where('status', 'completed')
            ->exists();
        if (! $hasRidden) {
            return back()->withErrors(['driver' => 'You can only add drivers you have completed a ride with.']);
        }
        $user->favoriteDrivers()->syncWithoutDetaching([$driver->id]);

        return redirect()->route('passenger.saved-places')->with('success', 'Driver added to favorites.');
    }

    /**
     * Remove a driver from favorites.
     */
    public function removeFavoriteDriver(Request $request, User $driver)
    {
        $request->user()->favoriteDrivers()->detach($driver->id);

        return redirect()->route('passenger.saved-places')->with('success', 'Driver removed from favorites.');
    }

    /**
     * Store a new saved place (barangay-based, with label: home, school, other).
     */
    public function storeSavedPlace(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:home,school,work,other',
            'name' => 'required|string|max:255',
            'barangay_id' => 'required|string|max:64',
            'address' => 'nullable|string|max:500',
            'purok' => 'nullable|string|max:128',
            'is_primary' => 'boolean',
        ]);

        $barangays = collect(self::hinobaanBarangays());
        $barangay = $barangays->firstWhere('id', $validated['barangay_id']);
        if (! $barangay) {
            return back()->withErrors(['barangay_id' => 'Invalid barangay.']);
        }

        $address = $validated['address'] ?? ($barangay['name'].', Hinobaan, Negros Occidental');
        $user = $request->user();

        $user->savedPlaces()->create([
            'type' => $validated['type'],
            'name' => $validated['name'],
            'address' => $address,
            'latitude' => $barangay['lat'],
            'longitude' => $barangay['lng'],
            'barangay' => $barangay['name'],
            'purok' => $validated['purok'] ?? null,
            'is_primary' => $validated['is_primary'] ?? false,
        ]);

        return redirect()->route('passenger.saved-places')->with('success', 'Place saved.');
    }

    /**
     * Update a saved place.
     */
    public function updateSavedPlace(Request $request, SavedPlace $savedPlace)
    {
        if ($savedPlace->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'sometimes|in:home,school,work,other',
            'name' => 'sometimes|string|max:255',
            'barangay_id' => 'sometimes|string|max:64',
            'address' => 'nullable|string|max:500',
            'purok' => 'nullable|string|max:128',
            'is_primary' => 'boolean',
        ]);

        $data = array_filter($validated);
        if (isset($validated['barangay_id'])) {
            $barangays = collect(self::hinobaanBarangays());
            $barangay = $barangays->firstWhere('id', $validated['barangay_id']);
            if (! $barangay) {
                return back()->withErrors(['barangay_id' => 'Invalid barangay.']);
            }
            $data['latitude'] = $barangay['lat'];
            $data['longitude'] = $barangay['lng'];
            $data['barangay'] = $barangay['name'];
            $data['address'] = $data['address'] ?? ($barangay['name'].', Hinobaan, Negros Occidental');
        }
        unset($data['barangay_id']);

        $savedPlace->update($data);

        return redirect()->route('passenger.saved-places')->with('success', 'Place updated.');
    }

    /**
     * Delete a saved place.
     */
    public function destroySavedPlace(Request $request, SavedPlace $savedPlace)
    {
        if ($savedPlace->user_id !== $request->user()->id) {
            abort(403);
        }
        $savedPlace->delete();

        return redirect()->route('passenger.saved-places')->with('success', 'Place removed.');
    }

    /**
     * Display the support page.
     */
    public function support(Request $request)
    {
        return Inertia::render('PassengerSide/Support', [
            'auth' => [
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'address' => $request->user()->address,
                    'avatar' => $request->user()->avatar_url,
                    'role' => $request->user()->role,
                    'has_pending_driver_application' => $request->user()->hasPendingDriverApplication(),
                    'is_driver' => $request->user()->isDriver(),
                    'emergency_contact' => $request->user()->emergency_contact,
                    'emergency_name' => $request->user()->emergency_name,
                    'emergency_phone' => $request->user()->emergency_phone,
                    'emergency_relationship' => $request->user()->emergency_relationship,
                ],
            ],
        ]);
    }

    /**
     * Display the safety page.
     */
    public function safety(Request $request)
    {
        return Inertia::render('PassengerSide/Safety', [
            'auth' => [
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'address' => $request->user()->address,
                    'avatar' => $request->user()->avatar_url,
                    'role' => $request->user()->role,
                    'has_pending_driver_application' => $request->user()->hasPendingDriverApplication(),
                    'is_driver' => $request->user()->isDriver(),
                    'emergency_contact' => $request->user()->emergency_contact,
                    'emergency_name' => $request->user()->emergency_name,
                    'emergency_phone' => $request->user()->emergency_phone,
                    'emergency_relationship' => $request->user()->emergency_relationship,
                ],
            ],
        ]);
    }
}
