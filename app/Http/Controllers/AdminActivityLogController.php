<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminActivityLogController extends Controller
{
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

            $logs->getCollection()->transform(function ($log) {
                return [
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
