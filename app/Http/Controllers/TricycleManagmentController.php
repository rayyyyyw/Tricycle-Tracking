<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TricycleManagmentController extends Controller
{
    public function index()
    {
        $activityThreshold = now()->subMinutes(5);

        $tricycles = User::query()
            ->where('role', 'driver')
            ->whereHas('approvedDriverApplication')
            ->with('approvedDriverApplication')
            ->withCount([
                'bookings as completed_rides_count' => fn ($q) => $q->where('status', 'completed'),
                'bookings as active_rides_count' => fn ($q) => $q->whereIn('status', ['accepted', 'in_progress']),
            ])
            ->orderByDesc('last_activity_at')
            ->get()
            ->map(function (User $driver) use ($activityThreshold) {
                $isOnline = (bool) $driver->is_online
                    && $driver->last_activity_at !== null
                    && $driver->last_activity_at->greaterThanOrEqualTo($activityThreshold);
                $application = $driver->approvedDriverApplication;
                $docs = $application?->documents ?? [];

                $urlResolver = function ($path): string {
                    if (! $path) {
                        return '';
                    }
                    $path = ltrim((string) $path, '/');
                    if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                        return $path;
                    }
                    try {
                        return Storage::url($path);
                    } catch (\Throwable $e) {
                        return asset('storage/'.$path);
                    }
                };

                $documentUrls = [];
                if (is_array($docs) && ! isset($docs[0])) {
                    foreach ($docs as $key => $path) {
                        $documentUrls[$key] = $urlResolver($path);
                    }
                }

                return [
                    'driver_id' => $driver->id,
                    'driver_name' => $driver->name,
                    'driver_email' => $driver->email,
                    'driver_phone' => $driver->phone,
                    'driver_avatar_url' => $driver->avatar_url,
                    'vehicle_type' => $application?->vehicle_type ?? 'tricycle',
                    'vehicle_plate_number' => $application?->vehicle_plate_number ?? 'N/A',
                    'vehicle_model' => $application?->vehicle_model,
                    'vehicle_color' => $application?->vehicle_color,
                    'vehicle_year' => $application?->vehicle_year,
                    'document_urls' => $documentUrls,
                    'completed_rides_count' => (int) $driver->completed_rides_count,
                    'active_rides_count' => (int) $driver->active_rides_count,
                    'is_online' => $isOnline,
                    'last_activity_at' => $driver->last_activity_at?->toIso8601String(),
                    'last_activity_at_human' => $driver->last_activity_at?->diffForHumans(),
                ];
            })
            ->values();

        $stats = [
            'total' => $tricycles->count(),
            'online' => $tricycles->where('is_online', true)->count(),
            'offline' => $tricycles->where('is_online', false)->count(),
            'on_trip' => $tricycles->where('active_rides_count', '>', 0)->count(),
        ];

        return Inertia::render('TricycleM/Index', [
            'tricycles' => $tricycles,
            'stats' => $stats,
        ]);
    }
}
