<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class UserPassengerController extends Controller
{
    public function index()
    {
        // Get all users with passenger role including all real data
        $passengers = User::where('role', 'passenger')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar_url' => $user->avatar_url, // Add this line
                'emergency_contact' => $user->emergency_contact,
                'joinDate' => $user->created_at->format('Y-m-d'),
                'totalRides' => $user->total_rides ?? 0,
                'totalSpent' => $user->total_spent ?? 0,
                'rating' => $user->average_rating ?? 4.5,
                'status' => $user->status ?? 'active',
                'lastRide' => $user->last_ride ?? null,
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

        $user->update([
            'status' => $user->status === 'active' ? 'inactive' : 'active'
        ]);

        return redirect()->back()->with('success', 'Passenger status updated successfully');
    }
}