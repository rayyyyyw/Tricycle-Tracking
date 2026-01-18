<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use App\Models\Booking;

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
                return isset($matches[1]) ? (int)$matches[1] : 0;
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
                ]
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
            $bookingData = [
                'id' => $activeBooking->id,
                'booking_id' => $activeBooking->booking_id,
                'status' => $activeBooking->status,
                'driver' => $activeBooking->driver ? [
                    'id' => $activeBooking->driver->id,
                    'name' => $activeBooking->driver->name,
                    'phone' => $activeBooking->driver->phone,
                    'avatar' => $activeBooking->driver->avatar_url,
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
                ]
            ],
            'activeBooking' => $bookingData
        ]);
    }

    /**
     * Display the passenger profile page.
     */
    public function profile(Request $request)
    {
        return Inertia::render('PassengerSide/profile', [
            'auth' => [
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'address' => $request->user()->address,
                    'avatar' => $request->user()->avatar_url, // Add avatar URL
                    'role' => $request->user()->role,
                    'has_pending_driver_application' => $request->user()->hasPendingDriverApplication(),
                    'is_driver' => $request->user()->isDriver(),
                    'emergency_contact' => $request->user()->emergency_contact,
                    'emergency_name' => $request->user()->emergency_name,
                    'emergency_phone' => $request->user()->emergency_phone,
                    'emergency_relationship' => $request->user()->emergency_relationship,
                ]
            ]
        ]);
    }

    /**
     * Display the passenger settings page.
     */
    public function settings(Request $request)
    {
        return Inertia::render('PassengerSide/settings', [
            'auth' => [
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'avatar' => $request->user()->avatar_url, // Add avatar URL
                    'role' => $request->user()->role,
                    'has_pending_driver_application' => $request->user()->hasPendingDriverApplication(),
                    'is_driver' => $request->user()->isDriver(),
                ]
            ]
        ]);
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

        $request->user()->update([
            'emergency_contact' => [
                'name' => $request->emergency_name,
                'phone' => $request->emergency_phone,
                'relationship' => $request->emergency_relationship,
            ],
        ]);

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
                ]
            ],
            'completedBookings' => $completedBookings,
        ]);
    }
}