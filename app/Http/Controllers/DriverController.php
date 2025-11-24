<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\DriverApplication;

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

    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        return Inertia::render('DriverSide/Index', [
            'auth' => [
                'user' => $this->getDriverData($user)
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
                'user' => $this->getDriverData($user)
            ],
            'driver_application' => $driverApplication
        ]);
    }

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
                'user' => $this->getDriverData($user)
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
}