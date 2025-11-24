<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\DriverApplication;

class DriverController extends Controller
{
    public function dashboard(Request $request)
    {
        return Inertia::render('DriverSide/Index', [
            'auth' => [
                'user' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ]
            ]
        ]);
    }

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
                'user' => [
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
                    'avatar' => $user->avatar ?? '',
                ]
            ],
            'driver_application' => $driverApplication
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string|max:20|nullable',
            'address' => 'sometimes|string|max:500|nullable',
        ]);

        // Remove null values to avoid overwriting with empty strings
        $validated = array_filter($validated, function($value) {
            return $value !== null && $value !== '';
        });

        $user->update($validated);

        return back()->with('success', 'Profile updated successfully!');
    }

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
            ]
        ];

        // Merge with user settings if they exist
        $settings = $user->settings ? array_merge($defaultSettings, $user->settings) : $defaultSettings;

        return Inertia::render('DriverSide/Settings', [
            'auth' => [
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ],
            'settings' => $settings
        ]);
    }

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
            'current_password' => 'sometimes|required_with:password|current_password',
            'password' => 'sometimes|required|min:8|confirmed',
        ]);

        // Update settings if provided
        if (isset($validated['notifications']) || isset($validated['preferences'])) {
            $currentSettings = $user->settings ?? [];
            
            $newSettings = array_merge($currentSettings, [
                'notifications' => $validated['notifications'] ?? $currentSettings['notifications'] ?? [],
                'preferences' => $validated['preferences'] ?? $currentSettings['preferences'] ?? [],
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

    // Optional: Add a method to update driver-specific information through a new application
    public function updateDriverInfo(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'license_number' => 'required|string|max:50',
            'vehicle_type' => 'required|string|max:100',
            'vehicle_plate_number' => 'required|string|max:20',
            'vehicle_year' => 'required|string',
            'vehicle_color' => 'required|string|max:50',
            'vehicle_model' => 'required|string|max:100',
        ]);

        // Create a new driver application for the updates
        $application = DriverApplication::create([
            'user_id' => $user->id,
            'license_number' => $validated['license_number'],
            'license_expiry' => now()->addYears(5), // Default expiry
            'vehicle_type' => $validated['vehicle_type'],
            'vehicle_plate_number' => $validated['vehicle_plate_number'],
            'vehicle_year' => $validated['vehicle_year'],
            'vehicle_color' => $validated['vehicle_color'],
            'vehicle_model' => $validated['vehicle_model'],
            'documents' => [], // You might want to handle document updates separately
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return back()->with('success', 'Driver information update submitted for review!');
    }
}