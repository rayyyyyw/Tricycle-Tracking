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
        return Inertia::render('DriverM/Index');
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
}