<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\MaintenanceMode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\NavAdmin;
use App\Models\LandingPageContent;

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

        $landingPageContent = LandingPageContent::get();

        return Inertia::render('AdminNav/Settings', [
            'user' => $user,
            'adminProfile' => $adminProfile,
            'maintenanceMode' => MaintenanceMode::isEnabled(),
            'landingPageContent' => $landingPageContent,
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

        // Otherwise update theme, notifications, and maintenance mode
        $request->validate([
            'theme' => 'required|in:light,dark,system',
            'notifications' => 'required|array',
            'notifications.email' => 'boolean',
            'notifications.push' => 'boolean',
            'notifications.security_alerts' => 'boolean',
            'maintenance_mode' => 'sometimes|boolean',
        ]);

        if ($request->has('maintenance_mode')) {
            $request->maintenance_mode ? MaintenanceMode::enable() : MaintenanceMode::disable();
        }

        // Update admin profile with settings
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

    public function toggleMaintenance(Request $request)
    {
        $request->validate(['maintenance_mode' => 'required|boolean']);

        $request->maintenance_mode ? MaintenanceMode::enable() : MaintenanceMode::disable();

        return back()->with('success', $request->maintenance_mode
            ? 'Maintenance mode enabled. Only admins can access the app.'
            : 'Maintenance mode disabled. The app is now accessible.');
    }

    public function updateLandingPage(Request $request)
    {
        $request->validate([
            'about_title' => 'nullable|string|max:255',
            'about_subtitle' => 'nullable|string|max:500',
            'about_paragraphs' => 'nullable|array',
            'about_paragraphs.*' => 'string|max:2000',
            'about_highlights' => 'nullable|array',
            'about_highlights.*.icon' => 'nullable|string|max:20',
            'about_highlights.*.title' => 'nullable|string|max:100',
            'about_highlights.*.desc' => 'nullable|string|max:500',
            'team_subtitle' => 'nullable|string|max:255',
            'team_members' => 'nullable|array',
            'team_members.*.name' => 'nullable|string|max:100',
            'team_members.*.role' => 'nullable|string|max:100',
            'team_members.*.avatar' => 'nullable|string|max:500',
            'team_members.*.location' => 'nullable|string|max:120',
            'team_members.*.description' => 'nullable|string|max:500',
            'team_members.*.isAdviser' => 'boolean',
        ]);

        $content = LandingPageContent::get();
        $content->update($request->only([
            'about_title', 'about_subtitle', 'about_paragraphs', 'about_highlights',
            'team_subtitle', 'team_members',
        ]));

        return back()->with('success', 'Landing page content updated successfully.');
    }

    public function uploadTeamMemberImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $path = $request->file('image')->store('team-members', 'public');

        return response()->json(['path' => $path]);
    }
}