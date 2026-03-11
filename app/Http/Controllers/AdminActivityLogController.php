<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminActivityLogController extends Controller
{
    /**
     * For each booking_ignored log (driver), compute the ordinal in that driver's consecutive
     * ignore streak. Streak = most recent run of ignores; resets when driver accepts a booking.
     * 3 consecutive ignores = grounds for suspension.
     *
     * @return array<string, array{ordinal: int, total: int}> key "subject_id:user_id" => { ordinal, total }
     */
    private function consecutiveIgnoreOrdinalsForLogs(\Illuminate\Support\Collection $ignoreLogs): array
    {
        if ($ignoreLogs->isEmpty()) {
            return [];
        }

        $driverIds = $ignoreLogs->pluck('user_id')->unique()->filter()->values()->all();
        if (empty($driverIds)) {
            return [];
        }

        $result = [];

        foreach ($driverIds as $driverId) {
            $driverRelevantLogs = ActivityLog::where('user_id', $driverId)
                ->whereIn('action', ['booking_ignored', 'booking_accepted'])
                ->whereNotNull('subject_id')
                ->orderByDesc('created_at')
                ->get(['id', 'action', 'subject_id', 'created_at']);

            $streak = [];
            foreach ($driverRelevantLogs as $log) {
                if ($log->action === 'booking_accepted') {
                    break;
                }
                $streak[] = $log;
            }

            $total = count($streak);
            foreach ($streak as $i => $log) {
                $key = $log->subject_id.':'.$driverId;
                if ($ignoreLogs->contains(fn ($l) => (int) $l->subject_id === (int) $log->subject_id && (int) $l->user_id === (int) $driverId)) {
                    $result[$key] = ['ordinal' => $i + 1, 'total' => $total];
                }
            }
        }

        return $result;
    }

    /**
     * For each booking_cancelled log, compute the ordinal (1st, 2nd, …) in that user's
     * consecutive cancellation streak and the streak total. Counts only cancellations
     * where cancelled_after_acceptance is true (after driver had accepted). Supports
     * both passenger and driver as canceller.
     *
     * @return array<string, array{ordinal: int, total: int}> key "subject_id:user_id" => { ordinal, total }
     */
    private function consecutiveCancellationOrdinalsForLogs(\Illuminate\Support\Collection $cancelledLogs): array
    {
        if ($cancelledLogs->isEmpty()) {
            return [];
        }

        $pairs = $cancelledLogs->map(fn ($log) => ['subject_id' => $log->subject_id, 'user_id' => $log->user_id])
            ->unique('subject_id')
            ->values();
        $bookingIds = $pairs->pluck('subject_id')->unique()->filter()->values()->all();
        $userIds = $pairs->pluck('user_id')->unique()->filter()->values()->all();
        if (empty($bookingIds) || empty($userIds)) {
            return [];
        }

        $result = [];

        foreach ($userIds as $uid) {
            // All bookings this user cancelled (any page) so streak is correct
            $userCancelledIds = ActivityLog::where('action', 'booking_cancelled')
                ->where('user_id', $uid)
                ->whereNotNull('subject_id')
                ->pluck('subject_id')
                ->unique()
                ->values()
                ->all();
            if (empty($userCancelledIds)) {
                continue;
            }

            $endedBookings = Booking::where(function ($q) use ($uid) {
                $q->where('passenger_id', $uid)->orWhere('driver_id', $uid);
            })
                ->whereIn('status', ['cancelled', 'completed'])
                ->orderByRaw('COALESCE(cancelled_at, completed_at) DESC')
                ->get(['id', 'passenger_id', 'driver_id', 'status', 'cancelled_at', 'completed_at', 'cancelled_after_acceptance']);

            $streak = [];
            foreach ($endedBookings as $b) {
                if ($b->status === 'completed') {
                    break;
                }
                if ($b->status === 'cancelled' && $b->cancelled_after_acceptance === true && in_array($b->id, $userCancelledIds, true)) {
                    $streak[] = $b;
                }
            }
            if (empty($streak)) {
                continue;
            }
            usort($streak, fn ($a, $b) => $a->cancelled_at->getTimestamp() <=> $b->cancelled_at->getTimestamp());
            $total = count($streak);
            foreach ($streak as $i => $b) {
                if (in_array($b->id, $bookingIds, true)) {
                    $key = $b->id.':'.$uid;
                    $result[$key] = ['ordinal' => $i + 1, 'total' => $total];
                }
            }
        }

        return $result;
    }

    public function index(Request $request)
    {
        try {
            $query = ActivityLog::with('user:id,name,email,role')
                ->latest();

            if ($request->filled('action')) {
                $query->where('action', $request->action);
            }
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                        ->orWhere('action', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
                });
            }

            $logs = $query->paginate(20)->withQueryString();

            $collection = $logs->getCollection();
            $cancelledLogs = $collection->filter(fn ($log) => $log->action === 'booking_cancelled' && $log->subject_type === Booking::class && $log->subject_id && $log->user_id);
            $ordinalsByKey = $this->consecutiveCancellationOrdinalsForLogs($cancelledLogs);

            $ignoreLogs = $collection->filter(fn ($log) => $log->action === 'booking_ignored' && $log->subject_type === Booking::class && $log->subject_id && $log->user_id);
            $ignoreOrdinalsByKey = $this->consecutiveIgnoreOrdinalsForLogs($ignoreLogs);

            $collection->transform(function ($log) use ($ordinalsByKey, $ignoreOrdinalsByKey) {
                $payload = [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'user_id' => $log->user_id,
                    'user_role' => $log->user_role,
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                        'role' => $log->user->role,
                    ] : null,
                    'subject_type' => $log->subject_type,
                    'subject_id' => $log->subject_id,
                    'properties' => $log->properties,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'created_at' => $log->created_at->toISOString(),
                ];
                $key = $log->subject_id.':'.$log->user_id;
                if ($log->action === 'booking_cancelled' && isset($ordinalsByKey[$key])) {
                    $payload['consecutive_cancellation_ordinal'] = $ordinalsByKey[$key]['ordinal'];
                    $payload['consecutive_cancellation_total'] = $ordinalsByKey[$key]['total'];
                }
                if ($log->action === 'booking_ignored' && isset($ignoreOrdinalsByKey[$key])) {
                    $payload['consecutive_ignore_ordinal'] = $ignoreOrdinalsByKey[$key]['ordinal'];
                    $payload['consecutive_ignore_total'] = $ignoreOrdinalsByKey[$key]['total'];
                }

                return $payload;
            });

            $actions = ActivityLog::select('action')->distinct()->orderBy('action')->pluck('action')->all();

            return Inertia::render('Admin/ActivityLogs', [
                'logs' => $logs,
                'actions' => $actions,
                'filters' => $request->only(['action', 'user_id', 'date_from', 'date_to', 'search']),
            ]);
        } catch (\Throwable $e) {
            return Inertia::render('Admin/ActivityLogs', [
                'logs' => ['data' => [], 'links' => [], 'last_page' => 1],
                'actions' => [],
                'filters' => [],
            ]);
        }
    }

    /**
     * Delete a single activity log entry.
     */
    public function destroy(ActivityLog $log)
    {
        $log->delete();

        return redirect()->back()->with('success', 'Log entry deleted.');
    }

    /**
     * Delete all activity logs (with confirmation on frontend).
     */
    public function destroyAll()
    {
        ActivityLog::query()->delete();

        return redirect()->back()->with('success', 'All activity logs have been deleted.');
    }
}
