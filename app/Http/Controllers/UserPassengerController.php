<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class UserPassengerController extends Controller
{
    public function index()
    {
        $passengers = User::where('role', 'passenger')
            ->with(['passengerBookings' => fn ($q) => $q->where('status', 'completed')->with('review')])
            ->get()
            ->map(function ($user) {
                $completedBookings = $user->passengerBookings->where('status', 'completed');
                $totalRides = $completedBookings->count();
                $totalSpent = (float) $completedBookings->sum('total_fare');
                $lastRide = $completedBookings->max('completed_at');

                // Avg rating = average of reviews this passenger gave to drivers (or null if none)
                $reviews = $completedBookings->pluck('review')->filter();
                $avgRatingGiven = $reviews->isNotEmpty()
                    ? round($reviews->avg('rating'), 1)
                    : null;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'avatar_url' => $user->avatar_url,
                    'emergency_contact' => $user->emergency_contact,
                    'joinDate' => $user->created_at->format('Y-m-d'),
                    'totalRides' => $totalRides,
                    'totalSpent' => round($totalSpent, 2),
                    'rating' => $avgRatingGiven,
                    'status' => $user->status ?? 'active',
                    'lastRide' => $lastRide?->format('Y-m-d'),
                ];
            });

        return Inertia::render('PassengerM/Index', [
            'passengers' => $passengers,
        ]);
    }

    public function toggleStatus(Request $request, User $user)
    {
        // Ensure we're only toggling passenger status
        if ($user->role !== 'passenger') {
            return redirect()->back()->with('error', 'Invalid user type');
        }

        // Toggle the status
        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active'
        ]);

        return redirect()->back()->with('success', 'Passenger status updated successfully');
    }
}