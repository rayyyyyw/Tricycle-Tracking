<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Feedback;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    /**
     * Display the feedback form page.
     */
    public function index(Request $request)
    {
        return Inertia::render('Feedback/Index');
    }

    /**
     * Store a new feedback submission.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:5000',
        ]);

        $user = $request->user();

        $feedback = Feedback::create([
            'user_id' => $user->id,
            'user_role' => $user->role,
            'rating' => $validated['rating'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => 'new',
        ]);

        $roleLabel = $user->role === 'driver' ? 'Driver' : 'Passenger';
        $stars = $validated['rating'].' star'.($validated['rating'] > 1 ? 's' : '');
        ActivityLog::log(
            'feedback_submitted',
            "{$user->name} ({$roleLabel}) submitted feedback: {$stars}.",
            $feedback,
            ['feedback_id' => $feedback->id, 'user_role' => $user->role, 'rating' => $validated['rating']],
            $request
        );

        $stars = $validated['rating'].' star'.($validated['rating'] > 1 ? 's' : '');
        $title = 'New feedback received';
        $message = "{$user->name} ({$roleLabel}) left {$stars} feedback.";

        $admins = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            Notification::create([
                'user_id' => $adminId,
                'type' => 'new_feedback',
                'title' => $title,
                'message' => $message,
                'data' => [
                    'feedback_id' => $feedback->id,
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_role' => $user->role,
                    'rating' => $validated['rating'],
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Thank you for your feedback! We appreciate your input.');
    }
}
