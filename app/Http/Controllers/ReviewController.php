<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request, Booking $booking)
    {
        $user = Auth::user();

        // Only passengers can review their completed bookings
        if ($booking->passenger_id !== $user->id) {
            return back()->with('error', 'You can only review your own bookings');
        }

        if ($booking->status !== 'completed') {
            return back()->with('error', 'You can only review completed bookings');
        }

        if ($booking->hasReview()) {
            return back()->with('error', 'You have already reviewed this booking');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'reviewer_id' => $user->id,
            'reviewed_id' => $booking->driver_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return back()->with('success', 'Thank you for your review!');
    }
}
