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
                'emergency_contact' => $user->emergency_contact,
                'joinDate' => $user->created_at->format('Y-m-d'),
                'totalRides' => 0, // Will compute later when you have ride data
                'totalSpent' => 0, // Will compute later when you have ride data
                'rating' => 4.5, // Default for now
                'status' => 'active', // Default for now
                'lastRide' => null, // Will add later
            ];
        });

        return Inertia::render('PassengerM/Index', [
            'passengers' => $passengers,
        ]);
    }
}