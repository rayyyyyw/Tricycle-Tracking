<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRatingsController extends Controller
{
    /**
     * Display all feedback/ratings for admin.
     */
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        $role = $request->get('role', 'all');
        $rating = $request->get('rating', 'all');

        $query = Feedback::with('user')
            ->latest();

        // Filter by status - need to handle time-based "new" status
        if ($status !== 'all') {
            $threeMinutesAgo = now()->subMinutes(3);
            if ($status === 'new') {
                // Filter for feedbacks created within last 3 minutes
                $query->where('created_at', '>', $threeMinutesAgo);
            } elseif ($status === 'read') {
                // Filter for feedbacks older than 3 minutes and not archived
                $query->where('created_at', '<=', $threeMinutesAgo)
                    ->where('status', '!=', 'archived');
            } elseif ($status === 'archived') {
                $query->where('status', 'archived');
            }
        }

        // Filter by role
        if ($role !== 'all') {
            $query->where('user_role', $role);
        }

        // Filter by rating
        if ($rating !== 'all') {
            $query->where('rating', $rating);
        }

        $threeMinutesAgo = now()->subMinutes(3);

        $feedbacks = $query->paginate(20)->through(function ($feedback) use ($threeMinutesAgo) {
            // Calculate status based on time: "new" if created within last 3 minutes
            $calculatedStatus = $feedback->created_at->greaterThan($threeMinutesAgo)
                ? 'new'
                : ($feedback->status === 'archived' ? 'archived' : 'read');

            return [
                'id' => $feedback->id,
                'user_name' => $feedback->user->name ?? 'Unknown User',
                'user_email' => $feedback->user->email ?? 'N/A',
                'user_avatar' => $feedback->user->avatar_url ?? null,
                'user_role' => $feedback->user_role,
                'rating' => $feedback->rating,
                'feedback' => $feedback->feedback,
                'status' => $calculatedStatus,
                'created_at' => $feedback->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $feedback->created_at->diffForHumans(),
            ];
        });

        // Statistics - calculate "new" based on time (within last 3 minutes)
        $threeMinutesAgo = now()->subMinutes(3);
        $allFeedbacks = Feedback::all();

        $stats = [
            'total' => $allFeedbacks->count(),
            'new' => $allFeedbacks->filter(function ($feedback) use ($threeMinutesAgo) {
                return $feedback->created_at->greaterThan($threeMinutesAgo);
            })->count(),
            'read' => $allFeedbacks->filter(function ($feedback) use ($threeMinutesAgo) {
                return ! $feedback->created_at->greaterThan($threeMinutesAgo)
                    && $feedback->status !== 'archived';
            })->count(),
            'archived' => $allFeedbacks->where('status', 'archived')->count(),
            'average_rating' => round(Feedback::avg('rating') ?? 0, 1),
            'by_role' => [
                'driver' => Feedback::where('user_role', 'driver')->count(),
                'passenger' => Feedback::where('user_role', 'passenger')->count(),
            ],
            'by_rating' => [
                '5' => Feedback::where('rating', 5)->count(),
                '4' => Feedback::where('rating', 4)->count(),
                '3' => Feedback::where('rating', 3)->count(),
                '2' => Feedback::where('rating', 2)->count(),
                '1' => Feedback::where('rating', 1)->count(),
            ],
        ];

        return Inertia::render('Admin/Ratings', [
            'feedbacks' => $feedbacks,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'role' => $role,
                'rating' => $rating,
            ],
        ]);
    }

    /**
     * Update feedback status (mark as read, archive, etc.).
     */
    public function updateStatus(Request $request, Feedback $feedback)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,read,archived',
        ]);

        $feedback->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Feedback status updated successfully.');
    }

    /**
     * Delete a feedback.
     */
    public function destroy(Feedback $feedback)
    {
        $feedback->delete();

        return redirect()->back()->with('success', 'Feedback deleted successfully.');
    }
}
