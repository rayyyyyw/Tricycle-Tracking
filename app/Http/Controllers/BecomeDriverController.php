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
     * Show the become driver application form or status page
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        
        // Check if user is already a driver
        if ($user->role === 'driver') {
            return redirect()->route('driver.dashboard')
                ->with('info', 'You are already a driver.');
        }

        // Check if user has any existing application
        $latestApplication = DriverApplication::where('user_id', $user->id)
            ->latest()
            ->first();

        // If user has a pending application, redirect to status page
        if ($latestApplication && $latestApplication->status === 'pending') {
            return redirect()->route('application.status')
                ->with('info', 'You already have a pending application.');
        }

        // If user has a rejected application but is NOT coming from "Apply Again", redirect to status
        if ($latestApplication && $latestApplication->status === 'rejected' && !$request->has('reapply')) {
            return redirect()->route('application.status')
                ->with('info', 'Please check your application status.');
        }

        // Get previous application data for rejected users reapplying
        $previousData = [];
        if ($latestApplication && $latestApplication->status === 'rejected' && $request->has('reapply')) {
            $previousData = [
                'license_number' => $latestApplication->license_number,
                'license_expiry' => $latestApplication->license_expiry,
                'vehicle_type' => $latestApplication->vehicle_type,
                'vehicle_plate_number' => $latestApplication->vehicle_plate_number,
                'vehicle_year' => $latestApplication->vehicle_year,
                'vehicle_color' => $latestApplication->vehicle_color,
                'vehicle_model' => $latestApplication->vehicle_model,
                'admin_notes' => $latestApplication->admin_notes,
            ];
        }

        return Inertia::render('BecomeDriver/Application', [
            'previousData' => $previousData
        ]);
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

        // Check for existing pending application
        if (DriverApplication::where('user_id', $user->id)->where('status', 'pending')->exists()) {
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
        $application = DriverApplication::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$application) {
            return redirect()->route('become-driver.create');
        }

        return Inertia::render('BecomeDriver/Status', [
            'application' => $application
        ]);
    }
}