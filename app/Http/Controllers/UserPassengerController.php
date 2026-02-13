<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class UserPassengerController extends Controller
{
    public function index()
    {
        $users = User::where('role', 'passenger')->get();
        $passengerIds = $users->pluck('id')->all();

        // Bookings that ended (cancelled or completed), most recent first. Count resets when passenger completes a ride.
        $endedBookings = Booking::whereIn('passenger_id', $passengerIds)
            ->whereIn('status', ['cancelled', 'completed'])
            ->orderByRaw('COALESCE(cancelled_at, completed_at) DESC')
            ->get(['passenger_id', 'status', 'cancelled_after_acceptance']);

        // Consecutive cancellations after driver accepted only. Stops at first completed → count resets to 0 after a successful ride.
        $consecutiveByPassenger = [];
        foreach ($endedBookings->groupBy('passenger_id') as $pid => $bookings) {
            $count = 0;
            foreach ($bookings as $b) {
                if ($b->status === 'completed') {
                    break; // streak resets: passenger completed a ride
                }
                if ($b->status === 'cancelled' && $b->cancelled_after_acceptance === true) {
                    $count++;
                }
            }
            $consecutiveByPassenger[$pid] = $count;
        }

        $passengers = User::where('role', 'passenger')
            ->with(['passengerBookings' => fn ($q) => $q->where('status', 'completed')->with('review')])
            ->get()
            ->map(function ($user) use ($consecutiveByPassenger) {
                $completedBookings = $user->passengerBookings->where('status', 'completed');
                $totalRides = $completedBookings->count();
                $totalSpent = (float) $completedBookings->sum('total_fare');
                $lastRide = $completedBookings->max('completed_at');

                // Avg rating = average of reviews this passenger gave to drivers (or null if none)
                $reviews = $completedBookings->pluck('review')->filter();
                $avgRatingGiven = $reviews->isNotEmpty()
                    ? round($reviews->avg('rating'), 1)
                    : null;

                $consecutiveCancellations = $consecutiveByPassenger[$user->id] ?? 0;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'avatar_url' => $user->avatar_url,
                    'emergency_contact' => $user->emergency_contact,
                    'joinDate' => $user->created_at->format('Y-m-d'),
                    'totalRides' => $totalRides,
                    'totalSpent' => round($totalSpent, 2),
                    'rating' => $avgRatingGiven,
                    'status' => $user->status ?? 'active',
                    'lastRide' => $lastRide?->format('Y-m-d'),
                    'consecutiveCancellationCount' => $consecutiveCancellations,
                ];
            });

        return Inertia::render('PassengerM/Index', [
            'passengers' => $passengers,
        ]);
    }

    public function toggleStatus(Request $request, User $user)
    {
        if ($user->role !== 'passenger') {
            return redirect()->back()->with('error', 'Invalid user type');
        }

        $wasActive = $user->status === 'active';
        $user->update([
            'status' => $wasActive ? 'inactive' : 'active',
        ]);

        if ($wasActive && $user->email) {
            $reason = $request->input('reason', 'No reason provided.');
            $appUrl = rtrim(config('app.url'), '/');
            $fromAddress = config('mail.from.address', 'noreply@trigo.pro');
            $fromName = config('mail.from.name', 'TriGo');
            try {
                Mail::mailer('resend')->send('emails.account-deactivated', [
                    'userName' => $user->name ?? 'User',
                    'reason' => $reason,
                    'appUrl' => $appUrl,
                ], function ($message) use ($user, $fromAddress, $fromName) {
                    $message->from($fromAddress, $fromName)
                        ->to($user->email)
                        ->subject('Your TriGo account has been deactivated');
                });
            } catch (\Throwable $e) {
                Log::warning('Deactivation email failed', ['error' => $e->getMessage(), 'user_id' => $user->id]);
            }
        }

        return redirect()->back()->with('success', 'Passenger status updated successfully');
    }

    /**
     * Permanently delete a passenger account.
     */
    public function destroy(Request $request, User $user)
    {
        if ($user->role !== 'passenger') {
            return redirect()->back()->with('error', 'Invalid user type.');
        }
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $reason = $request->input('reason', 'No reason provided.');
        if ($user->email) {
            $appUrl = rtrim(config('app.url'), '/');
            $fromAddress = config('mail.from.address', 'noreply@trigo.pro');
            $fromName = config('mail.from.name', 'TriGo');
            $userName = $user->name ?? 'User';
            $userEmail = $user->email;
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
                Log::warning('Account deleted notification email failed', ['error' => $e->getMessage(), 'user_id' => $user->id]);
            }
        }

        $user->delete();

        return redirect()->back()->with('success', 'Passenger account has been permanently deleted.');
    }
}
