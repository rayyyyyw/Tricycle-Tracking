<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class PassengerController extends Controller
{
    /**
     * Display the passenger dashboard.
     */
    public function dashboard(Request $request)
    {
        return Inertia::render('PassengerSide/Index');
    }

    public function Index(Request $request)
    {
        return Inertia::render('BookRide/Index', [
            'auth' => [
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'address' => $request->user()->address,
                    'emergency_contact' => $request->user()->emergency_contact,
                    // Include the accessor values
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
            'user' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone,
                'address' => $request->user()->address,
                'emergency_contact' => $request->user()->emergency_contact,
                // Include the accessor values
                'emergency_name' => $request->user()->emergency_name,
                'emergency_phone' => $request->user()->emergency_phone,
                'emergency_relationship' => $request->user()->emergency_relationship,
            ]
        ]);
    }

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
}