<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminActivityLogController extends Controller
{
    /**
     * For each booking_cancelled log we need the ordinal (1st, 2nd, …) in the passenger's
     * consecutive streak, and the streak total. Only counts cancellations where
     * cancelled_after_acceptance is true. Cancels before driver accepted are not in the streak.
     *
     * @param  array<int>  $bookingIds  Activity log subject_ids (booking ids) for booking_cancelled
     * @return array<int, array{ordinal: int, total: int}> booking_id => { ordinal, total }
     */
    private function consecutiveCancellationOrdinalsForBookings(array $bookingIds): array
    {
        if (empty($bookingIds)) {
            return [];
        }

        $bookings = Booking::whereIn('id', $bookingIds)
            ->where('status', 'cancelled')
            ->get(['id', 'passenger_id', 'cancelled_at', 'cancelled_after_acceptance']);

        $passengerIds = $bookings->pluck('passenger_id')->unique()->filter()->values()->all();
        if (empty($passengerIds)) {
            return [];
        }

        $endedBookings = Booking::whereIn('passenger_id', $passengerIds)
            ->whereIn('status', ['cancelled', 'completed'])
            ->orderByRaw('COALESCE(cancelled_at, completed_at) DESC')
            ->get(['id', 'passenger_id', 'status', 'cancelled_at', 'cancelled_after_acceptance']);

        $result = [];
        foreach ($endedBookings->groupBy('passenger_id') as $pid => $list) {
            $streak = [];
            foreach ($list as $b) {
                if ($b->status === 'completed') {
                    break;
                }
                if ($b->status === 'cancelled' && $b->cancelled_after_acceptance === true) {
                    $streak[] = $b;
                }
            }
            if (empty($streak)) {
                continue;
            }
            usort($streak, fn ($a, $b) => $a->cancelled_at->getTimestamp() <=> $b->cancelled_at->getTimestamp());
            $total = count($streak);
            foreach ($streak as $i => $b) {
                $result[$b->id] = ['ordinal' => $i + 1, 'total' => $total];
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
            $bookingIdsForCancellations = $collection
                ->filter(fn ($log) => $log->action === 'booking_cancelled' && $log->subject_type === Booking::class && $log->subject_id)
                ->pluck('subject_id')
                ->unique()
                ->values()
                ->all();
            $ordinalsByBooking = $this->consecutiveCancellationOrdinalsForBookings($bookingIdsForCancellations);

            $collection->transform(function ($log) use ($ordinalsByBooking) {
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
                if ($log->action === 'booking_cancelled' && $log->subject_id !== null && isset($ordinalsByBooking[$log->subject_id])) {
                    $payload['consecutive_cancellation_ordinal'] = $ordinalsByBooking[$log->subject_id]['ordinal'];
                    $payload['consecutive_cancellation_total'] = $ordinalsByBooking[$log->subject_id]['total'];
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
