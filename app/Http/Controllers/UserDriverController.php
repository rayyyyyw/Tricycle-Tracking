<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\DriverApplication;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserDriverController extends Controller
{
    public function index()
    {
        // Get all users with driver role who have approved applications
        $drivers = User::where('role', 'driver')
            ->with(['approvedDriverApplication', 'bookings' => fn ($q) => $q->where('status', 'completed')->with('review')])
            ->latest()
            ->get()
            ->map(function ($user) {
                $application = $user->approvedDriverApplication;
                $completedBookings = $user->bookings->where('status', 'completed');
                $totalRides = $completedBookings->count();
                $totalEarned = (float) $completedBookings->sum('total_fare');
                $lastRide = $completedBookings->max('completed_at');
                $reviews = $completedBookings->pluck('review')->filter();
                $avgRating = $reviews->isNotEmpty() ? round($reviews->avg('rating'), 1) : null;

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
                    'tricycleAssigned' => 'TRIC-'.str_pad($user->id, 3, '0', STR_PAD_LEFT),
                    'joinDate' => $application?->created_at?->toISOString() ?? $user->created_at->toISOString(),
                    'license_expiry' => $application?->license_expiry?->format('Y-m-d'),
                    'vehicle_type' => $application?->vehicle_type,
                    'totalRides' => $totalRides,
                    'totalEarned' => round($totalEarned, 2),
                    'rating' => $avgRating,
                    'lastRide' => $lastRide?->format('Y-m-d'),
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
        try {
            $applications = DriverApplication::with(['user', 'allUserApplications'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->get()
            ->map(function ($application) {
                try {
                    // Calculate application_attempt for each application
                    $application->application_attempt = $application->allUserApplications
                        ->where('created_at', '<=', $application->created_at)
                        ->count();

                    // Get previous applications (all applications by same user except current one)
                    $application->previous_applications = $application->allUserApplications
                        ->where('id', '!=', $application->id)
                        ->values();

                    // Resolve document paths to full URLs (R2/S3 or local storage)
                    $docs = $application->documents ?? [];
                    $document_urls = [];
                    $urlResolver = function ($p) {
                        if (! $p) {
                            return '';
                        }
                        $p = ltrim((string) $p, '/');
                        // Already a full URL (e.g. from R2) – use as-is
                        if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) {
                            return $p;
                        }
                        try {
                            return Storage::disk('public')->url($p);
                        } catch (\Throwable $e) {
                            Log::warning('Driver document URL failed', [
                                'path' => $p,
                                'error' => $e->getMessage(),
                            ]);

                            return asset('storage/'.$p);
                        }
                    };
                    if (is_array($docs) && ! isset($docs[0])) {
                        foreach ($docs as $key => $path) {
                            $document_urls[$key] = $urlResolver(ltrim((string) $path, '/'));
                        }
                    } elseif (is_array($docs)) {
                        foreach ($docs as $idx => $path) {
                            $document_urls[$idx] = $urlResolver(ltrim((string) $path, '/'));
                        }
                    }
                    $application->document_urls = $document_urls;

                    // Ensure admin can identify applicant: explicit user payload with avatar and profile info
                    $u = $application->user;
                    if (! $u) {
                        $application->user = [
                            'id' => 0,
                            'name' => 'Unknown',
                            'email' => '',
                            'phone' => null,
                            'address' => null,
                            'avatar_url' => null,
                            'emergency_contact' => null,
                        ];
                    } else {
                        $application->user = [
                            'id' => $u->id,
                            'name' => $u->name,
                            'email' => $u->email,
                            'phone' => $u->phone,
                            'address' => $u->address,
                            'avatar_url' => $u->avatar_url,
                            'emergency_contact' => $u->emergency_contact,
                        ];
                    }

                    return $application;
                } catch (\Throwable $e) {
                    Log::error('Driver application mapping failed', [
                        'application_id' => $application->id ?? null,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    try {
                        // Return a safe fallback so the application still appears (no empty list)
                        $u = $application->user;
                        $application->application_attempt = $application->allUserApplications
                            ? $application->allUserApplications->where('created_at', '<=', $application->created_at)->count()
                            : 1;
                        $application->previous_applications = $application->allUserApplications
                            ? $application->allUserApplications->where('id', '!=', $application->id)->values()
                            : collect();
                        $docs = $application->documents ?? [];
                        $document_urls = [];
                        if (is_array($docs) && ! isset($docs[0])) {
                            foreach ($docs as $key => $path) {
                                $p = ltrim((string) $path, '/');
                                $document_urls[$key] = $p ? asset('storage/'.$p) : '';
                            }
                        } elseif (is_array($docs)) {
                            foreach ($docs as $idx => $path) {
                                $p = ltrim((string) $path, '/');
                                $document_urls[$idx] = $p ? asset('storage/'.$p) : '';
                            }
                        }
                        $application->document_urls = $document_urls;
                        $application->user = $u ? [
                            'id' => $u->id,
                            'name' => $u->name ?? 'Unknown',
                            'email' => $u->email ?? '',
                            'phone' => $u->phone ?? null,
                            'address' => $u->address ?? null,
                            'avatar_url' => null,
                            'emergency_contact' => $u->emergency_contact ?? null,
                        ] : [
                            'id' => 0,
                            'name' => 'Unknown',
                            'email' => '',
                            'phone' => null,
                            'address' => null,
                            'avatar_url' => null,
                            'emergency_contact' => null,
                        ];

                        return $application;
                    } catch (\Throwable $e2) {
                        Log::error('Driver application fallback failed', [
                            'application_id' => $application->id ?? null,
                            'error' => $e2->getMessage(),
                        ]);
                        $application->application_attempt = 1;
                        $application->previous_applications = collect();
                        $application->document_urls = [];
                        $application->user = [
                            'id' => 0,
                            'name' => 'Unknown',
                            'email' => '',
                            'phone' => null,
                            'address' => null,
                            'avatar_url' => null,
                            'emergency_contact' => null,
                        ];

                        return $application;
                    }
                }
            });

            return Inertia::render('DriverM/Application', [
                'applications' => $applications,
            ]);
        } catch (\Throwable $e) {
            Log::error('Driver applications page failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Inertia::render('DriverM/Application', [
                'applications' => collect(),
            ]);
        }
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

        // If approved, update user role to driver and send congratulations notification + email
        if ($request->status === 'approved') {
            $user = User::find($application->user_id);
            $user->update(['role' => 'driver']);

            ActivityLog::log('driver_approved', 'Admin approved driver application for '.$user->name.' ('.$user->email.').', $application, ['user_id' => $user->id], $request);

            Notification::create([
                'user_id' => $user->id,
                'type' => 'driver_approved',
                'title' => 'Congratulations!',
                'message' => 'Your driver application has been approved. You are now a driver! Welcome to the team.',
                'data' => [
                    'application_id' => $application->id,
                ],
            ]);

            if ($user->email) {
                $appUrl = rtrim(config('app.url'), '/');
                $fromAddress = config('mail.from.address', 'noreply@trigo.pro');
                $fromName = config('mail.from.name', 'TriGo');
                try {
                    Mail::mailer('resend')->send('emails.driver-approved', [
                        'userName' => $user->name ?? 'Driver',
                        'appUrl' => $appUrl,
                    ], function ($message) use ($user, $fromAddress, $fromName) {
                        $message->from($fromAddress, $fromName)
                            ->to($user->email)
                            ->subject('Congratulations! You\'re now a TriGo Driver');
                    });
                } catch (\Throwable $e) {
                    Log::warning('Driver approved email failed', [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id,
                        'email' => $user->email,
                    ]);
                }
            }
        }

        return back()->with('success', 'Application updated successfully!');
    }

    public function updateDriverStatus(Request $request, User $driver)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,suspended',
            'reason' => 'nullable|string|max:1000',
        ]);

        $driver->update([
            'driver_status' => $request->status,
        ]);

        $deactivated = in_array($request->status, ['inactive', 'suspended'], true);
        if ($deactivated && $driver->email) {
            $reason = $request->input('reason', 'No reason provided.');
            $appUrl = rtrim(config('app.url'), '/');
            $fromAddress = config('mail.from.address', 'noreply@trigo.pro');
            $fromName = config('mail.from.name', 'TriGo');
            try {
                Mail::mailer('resend')->send('emails.account-deactivated', [
                    'userName' => $driver->name ?? 'User',
                    'reason' => $reason,
                    'appUrl' => $appUrl,
                ], function ($message) use ($driver, $fromAddress, $fromName) {
                    $message->from($fromAddress, $fromName)
                        ->to($driver->email)
                        ->subject('Your TriGo driver account has been deactivated');
                });
            } catch (\Throwable $e) {
                Log::warning('Driver deactivation email failed', ['error' => $e->getMessage(), 'user_id' => $driver->id]);
            }
        }

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

    /**
     * Permanently delete a driver account.
     */
    public function destroyAccount(Request $request, User $driver)
    {
        if ($driver->role !== 'driver') {
            return back()->with('error', 'Invalid user type.');
        }
        if ($driver->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $reason = $request->input('reason', 'No reason provided.');
        if ($driver->email) {
            $appUrl = rtrim(config('app.url'), '/');
            $fromAddress = config('mail.from.address', 'noreply@trigo.pro');
            $fromName = config('mail.from.name', 'TriGo');
            $userEmail = $driver->email;
            $userName = $driver->name ?? 'User';
            try {
                Mail::mailer('resend')->send('emails.account-deleted', [
                    'userName' => $userName,
                    'reason' => $reason,
                    'appUrl' => $appUrl,
                ], function ($message) use ($userEmail, $fromAddress, $fromName) {
                    $message->from($fromAddress, $fromName)
                        ->to($userEmail)
                        ->subject('Your TriGo account has been deleted');
                });
            } catch (\Throwable $e) {
                Log::warning('Account deleted notification email failed', ['error' => $e->getMessage(), 'user_id' => $driver->id]);
            }
        }

        $driver->delete();

        return back()->with('success', 'Driver account has been permanently deleted.');
    }
}
