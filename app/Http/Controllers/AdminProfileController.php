<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminProfileController extends Controller
{
    public function profile()
    {
        return Inertia::render('AdminNav/Profile', [
            'user' => Auth::user(),
        ]);
    }

    public function settings()
    {
        return Inertia::render('AdminNav/Settings', [
            'user' => Auth::user(),
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

        $data = $request->only('name', 'email');

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
        }

        $user->update($data);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        
        // Check if password change is requested
        if ($request->filled('current_password')) {
            $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
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

        // Store settings in database
        $user->update([
            'settings' => json_encode($request->only('theme', 'notifications'))
        ]);

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}