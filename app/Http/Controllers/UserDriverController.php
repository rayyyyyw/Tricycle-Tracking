<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\DriverApplication;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserDriverController extends Controller
{
    public function index()
    {
        // Get all users with driver role who have approved applications
        $drivers = User::where('role', 'driver')
            ->with(['approvedDriverApplication'])
            ->latest()
            ->get()
            ->map(function ($user) {
                $application = $user->approvedDriverApplication;
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? 'No phone',
                    'licenseNumber' => $application?->license_number ?? 'N/A',
                    'vehicle_plate_number' => $application?->vehicle_plate_number ?? 'N/A',
                    'vehicle_model' => $application?->vehicle_model ?? 'N/A',
                    'vehicle_year' => $application?->vehicle_year ?? 'N/A',
                    'vehicle_color' => $application?->vehicle_color ?? 'N/A',
                    'address' => $user->address ?? 'No address provided',
                    'avatar' => $user->avatar_url,
                    'status' => $user->driver_status ?? 'active',
                    'tricycleAssigned' => 'TRIC-' . str_pad($user->id, 3, '0', STR_PAD_LEFT), // Example assignment
                    'joinDate' => $application?->created_at?->toISOString() ?? $user->created_at->toISOString(),
                ];
            })
            ->filter(function ($driver) {
                // Filter out drivers without proper application data
                return $driver['licenseNumber'] !== 'N/A';
            })
            ->values();

        $statistics = [
            'total' => count($drivers),
            'active' => collect($drivers)->where('status', 'active')->count(),
            'inactive' => collect($drivers)->where('status', 'inactive')->count(),
            'available' => collect($drivers)->where('status', 'active')->count(), // For now, all active are available
            'pending_applications' => DriverApplication::where('status', 'pending')->count(),
        ];

        return Inertia::render('DriverM/Index', [
            'drivers' => $drivers,
            'statistics' => $statistics,
        ]);
    }

    public function applications(Request $request)
    {
        $applications = DriverApplication::with(['user', 'allUserApplications'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->get()
            ->map(function ($application) {
                // Calculate application_attempt for each application
                $application->application_attempt = $application->allUserApplications
                    ->where('created_at', '<=', $application->created_at)
                    ->count();
                
                // Get previous applications (all applications by same user except current one)
                $application->previous_applications = $application->allUserApplications
                    ->where('id', '!=', $application->id)
                    ->values();
                
                return $application;
            });

        return Inertia::render('DriverM/Application', [
            'applications' => $applications,
        ]);
    }

    public function updateApplication(Request $request, DriverApplication $application)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $application->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        // If approved, update user role to driver
        if ($request->status === 'approved') {
            $user = User::find($application->user_id);
            $user->update(['role' => 'driver']);
        }

        return back()->with('success', 'Application updated successfully!');
    }

    public function updateDriverStatus(Request $request, User $driver)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $driver->update([
            'driver_status' => $request->status,
        ]);

        return back()->with('success', 'Driver status updated successfully!');
    }

    public function destroy(User $driver)
    {
        // Remove driver role but keep user
        $driver->update([
            'role' => 'passenger',
            'driver_status' => null,
        ]);

        return back()->with('success', 'Driver removed successfully!');
    }
}