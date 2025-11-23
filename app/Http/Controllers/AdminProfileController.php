<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\NavAdmin;

class AdminProfileController extends Controller
{
    public function profile()
    {
        $user = Auth::user();
        
        // Get or create admin profile - REMOVE json_encode
        $adminProfile = NavAdmin::firstOrCreate(
            ['user_id' => $user->id],
            [
                'theme' => 'system',
                'settings' => [], // Pass empty array directly
                'notification_preferences' => [], // Pass empty array directly
            ]
        );

        return Inertia::render('AdminNav/Profile', [
            'user' => $user,
            'adminProfile' => $adminProfile,
        ]);
    }

    public function settings()
    {
        $user = Auth::user();
        
        // Get or create admin profile - REMOVE json_encode
        $adminProfile = NavAdmin::firstOrCreate(
            ['user_id' => $user->id],
            [
                'theme' => 'system',
                'settings' => [], // Pass empty array directly
                'notification_preferences' => [], // Pass empty array directly
            ]
        );

        return Inertia::render('AdminNav/Settings', [
            'user' => $user,
            'adminProfile' => $adminProfile,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $userData = $request->only('name', 'email');
        $adminData = [];

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $adminProfile = $user->navAdmin;

            // Delete old avatar if exists
            if ($adminProfile && $adminProfile->avatar) {
                Storage::disk('public')->delete($adminProfile->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('admin-avatars', 'public');
            $adminData['avatar'] = $avatarPath;
        }

        // Update user data
        $user->update($userData);

        // Update or create admin profile data
        if (!empty($adminData)) {
            NavAdmin::updateOrCreate(
                ['user_id' => $user->id],
                $adminData
            );
        }

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        
        // Check if password change is requested
        if ($request->filled('current_password')) {
            $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', 'confirmed', Password::defaults()],
            ]);

            $user->update([
                'password' => Hash::make($request->password),
            ]);

            return redirect()->back()->with('success', 'Password updated successfully.');
        }

        // Otherwise update theme and notification settings
        $request->validate([
            'theme' => 'required|in:light,dark,system',
            'notifications' => 'required|array',
            'notifications.email' => 'boolean',
            'notifications.push' => 'boolean',
            'notifications.security_alerts' => 'boolean',
        ]);

        // Update admin profile with settings - REMOVE json_encode
        NavAdmin::updateOrCreate(
            ['user_id' => $user->id],
            [
                'theme' => $request->theme,
                'settings' => $request->only('theme'), // Pass as array
                'notification_preferences' => $request->notifications, // Pass as array
            ]
        );

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}