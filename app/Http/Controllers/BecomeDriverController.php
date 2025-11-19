<?php
// app/Http/Controllers/BecomeDriverController.php

namespace App\Http\Controllers;

use App\Models\DriverApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BecomeDriverController extends Controller
{
    /**
     * Show the become driver application form
     */
    public function create()
    {
        $user = Auth::user();
        
        // Check if user already has a pending application (safe method)
        if ($this->hasPendingDriverApplication($user)) {
            return redirect()->route('application.status')
                ->with('error', 'You already have a pending driver application.');
        }

        // Check if user is already a driver (safe method)
        if ($this->isDriver($user)) {
            return redirect()->route('driver.dashboard')
                ->with('info', 'You are already a driver.');
        }

        return Inertia::render('BecomeDriver/Application');
    }

    /**
     * Store a new driver application
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'license_number' => 'required|string|max:255',
            'license_expiry' => 'required|date|after:today',
            'vehicle_type' => 'required|string|in:tricycle,motorcycle,car',
            'vehicle_plate_number' => 'required|string|max:20',
            'vehicle_year' => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'vehicle_color' => 'required|string|max:50',
            'vehicle_model' => 'required|string|max:100',
            'license_front' => 'required|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'license_back' => 'required|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'vehicle_registration' => 'required|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);
        
        $user = Auth::user();

        // Check for existing pending application (safe method)
        if ($this->hasPendingDriverApplication($user)) {
            return back()->with('error', 'You already have a pending application.');
        }

        // Use transaction to ensure data consistency
        return DB::transaction(function () use ($request, $validated, $user) {
            $documents = [];

            try {
                // Handle file uploads
                $documents['license_front'] = $request->file('license_front')->store('driver-documents', 'public');
                $documents['license_back'] = $request->file('license_back')->store('driver-documents', 'public');
                $documents['vehicle_registration'] = $request->file('vehicle_registration')->store('driver-documents', 'public');

                // Create application
                DriverApplication::create([
                    'user_id' => $user->id,
                    'license_number' => $validated['license_number'],
                    'license_expiry' => $validated['license_expiry'],
                    'vehicle_type' => $validated['vehicle_type'],
                    'vehicle_plate_number' => $validated['vehicle_plate_number'],
                    'vehicle_year' => $validated['vehicle_year'],
                    'vehicle_color' => $validated['vehicle_color'],
                    'vehicle_model' => $validated['vehicle_model'],
                    'documents' => $documents,
                    'status' => 'pending',
                    'submitted_at' => now(),
                ]);

                return redirect()->route('application.status')
                    ->with('success', 'Driver application submitted successfully! We will review your application within 24-48 hours.');

            } catch (\Exception $e) {
                // Clean up uploaded files if something goes wrong
                foreach ($documents as $document) {
                    if (Storage::disk('public')->exists($document)) {
                        Storage::disk('public')->delete($document);
                    }
                }

                return back()->with('error', 'Failed to submit application. Please try again.');
            }
        });
    }

    /**
     * Show application status
     */
    public function status()
    {
        $user = Auth::user();
        $application = DriverApplication::where('user_id', $user->id)->first();

        if (!$application) {
            return redirect()->route('become-driver.create');
        }

        return Inertia::render('BecomeDriver/Status', [
            'application' => $application
        ]);
    }

    /**
     * Safe method to check if user has pending driver application
     */
    private function hasPendingDriverApplication(User $user): bool
    {
        // Method 1: Try using the relationship if it exists
        if (method_exists($user, 'driverApplication') && $user->driverApplication) {
            return $user->driverApplication->status === 'pending';
        }

        // Method 2: Direct database query as fallback
        return DriverApplication::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();
    }

    /**
     * Safe method to check if user is a driver
     */
    private function isDriver(User $user): bool
    {
        // Method 1: Try using the method if it exists
        if (method_exists($user, 'isDriver')) {
            return $user->isDriver();
        }

        // Method 2: Direct property check as fallback
        return $user->role === 'driver';
    }
}