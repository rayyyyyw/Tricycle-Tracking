<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    /**
     * Display the feedback form page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Feedback/Index', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar_url,
                    'role' => $user->role,
                ],
            ],
        ]);
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

        Feedback::create([
            'user_id' => $user->id,
            'user_role' => $user->role,
            'rating' => $validated['rating'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => 'new',
        ]);

        return redirect()->back()->with('success', 'Thank you for your feedback! We appreciate your input.');
    }
}
