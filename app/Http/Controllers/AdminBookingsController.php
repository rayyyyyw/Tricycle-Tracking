<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Message;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminBookingsController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['passenger', 'driver'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
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
                $q->where('booking_id', 'like', "%{$search}%")
                    ->orWhere('passenger_name', 'like', "%{$search}%")
                    ->orWhereHas('passenger', fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                    ->orWhereHas('driver', fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $bookings = $query->paginate(15)->withQueryString();

        $bookings->getCollection()->transform(function ($booking) {
            return [
                'id' => $booking->id,
                'booking_id' => $booking->booking_id,
                'status' => $booking->status,
                'passenger_name' => $booking->passenger_name,
                'passenger_id' => $booking->passenger_id,
                'driver_name' => $booking->driver?->name,
                'driver_id' => $booking->driver_id,
                'pickup_address' => $booking->pickup_address,
                'pickup_barangay' => $booking->pickup_barangay,
                'destination_address' => $booking->destination_address,
                'destination_barangay' => $booking->destination_barangay,
                'total_fare' => (float) $booking->total_fare,
                'created_at' => $booking->created_at->toISOString(),
                'accepted_at' => $booking->accepted_at?->toISOString(),
                'completed_at' => $booking->completed_at?->toISOString(),
                'cancelled_at' => $booking->cancelled_at?->toISOString(),
            ];
        });

        $bookingDetail = null;
        if ($request->filled('detail')) {
            $detailBooking = Booking::with(['passenger', 'driver'])->find($request->detail);
            if ($detailBooking) {
                $bookingDetail = [
                    'id' => $detailBooking->id,
                    'booking_id' => $detailBooking->booking_id,
                    'status' => $detailBooking->status,
                    'ride_type' => $detailBooking->ride_type,
                    'passenger_count' => $detailBooking->passenger_count,
                    'passenger' => $detailBooking->passenger ? [
                        'id' => $detailBooking->passenger->id,
                        'name' => $detailBooking->passenger->name,
                        'email' => $detailBooking->passenger->email,
                        'phone' => $detailBooking->passenger->phone,
                    ] : null,
                    'driver' => $detailBooking->driver ? [
                        'id' => $detailBooking->driver->id,
                        'name' => $detailBooking->driver->name,
                        'email' => $detailBooking->driver->email,
                        'phone' => $detailBooking->driver->phone,
                    ] : null,
                    'pickup' => [
                        'address' => $detailBooking->pickup_address,
                        'barangay' => $detailBooking->pickup_barangay,
                        'lat' => $detailBooking->pickup_lat,
                        'lng' => $detailBooking->pickup_lng,
                    ],
                    'destination' => [
                        'address' => $detailBooking->destination_address,
                        'barangay' => $detailBooking->destination_barangay,
                        'lat' => $detailBooking->destination_lat,
                        'lng' => $detailBooking->destination_lng,
                    ],
                    'distance' => $detailBooking->distance,
                    'duration' => $detailBooking->duration,
                    'fare' => (float) $detailBooking->fare,
                    'total_fare' => (float) $detailBooking->total_fare,
                    'created_at' => $detailBooking->created_at->toISOString(),
                    'accepted_at' => $detailBooking->accepted_at?->toISOString(),
                    'completed_at' => $detailBooking->completed_at?->toISOString(),
                    'cancelled_at' => $detailBooking->cancelled_at?->toISOString(),
                    'special_instructions' => $detailBooking->special_instructions,
                ];
            }
        }

        return Inertia::render('Admin/Bookings', [
            'bookings' => $bookings,
            'bookingDetail' => $bookingDetail,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function cancel(Request $request, Booking $booking)
    {
        if (! in_array($booking->status, ['pending', 'accepted'])) {
            return redirect()->back()->with('error', 'This booking cannot be cancelled.');
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $admin = Auth::user();
        ActivityLog::log('booking_cancelled_by_admin', "Admin {$admin->name} cancelled booking {$booking->booking_id}.", $booking, ['booking_id' => $booking->booking_id], $request);

        Notification::create([
            'user_id' => $booking->passenger_id,
            'type' => 'booking_cancelled',
            'title' => 'Booking Cancelled by Admin',
            'message' => "Your booking {$booking->booking_id} has been cancelled by the administrator.",
            'data' => [
                'booking_id' => $booking->id,
                'booking_identifier' => $booking->booking_id,
            ],
        ]);

        if ($booking->driver_id) {
            Notification::create([
                'user_id' => $booking->driver_id,
                'type' => 'booking_cancelled',
                'title' => 'Booking Cancelled by Admin',
                'message' => "Booking {$booking->booking_id} has been cancelled by the administrator.",
                'data' => [
                    'booking_id' => $booking->id,
                    'booking_identifier' => $booking->booking_id,
                ],
            ]);

            Message::create([
                'booking_id' => $booking->id,
                'sender_id' => $admin->id,
                'recipient_id' => $booking->driver_id,
                'message' => 'Booking was cancelled by admin.',
                'type' => 'system',
            ]);
        }

        return redirect()->back()->with('success', 'Booking cancelled successfully.');
    }

    /**
     * Permanently delete a booking (admin only). Related messages/reviews cascade.
     */
    public function destroy(Booking $booking)
    {
        $bookingId = $booking->booking_id;
        $admin = Auth::user();
        ActivityLog::log('booking_deleted_by_admin', "Admin {$admin->name} permanently deleted booking {$bookingId}.", null, ['booking_id' => $bookingId]);

        $booking->delete();

        return redirect()->back()->with('success', 'Booking deleted.');
    }

    /**
     * Permanently delete all bookings (admin only). Use with caution.
     */
    public function destroyAll()
    {
        $admin = Auth::user();
        $count = Booking::count();
        ActivityLog::log('bookings_deleted_all_by_admin', "Admin {$admin->name} permanently deleted all {$count} booking(s).", null, []);

        Booking::query()->delete();

        return redirect()->back()->with('success', 'All bookings have been deleted.');
    }

    /**
     * Show a print-friendly receipt for a booking (open in new tab, user can print/save as PDF).
     */
    public function receipt(Booking $booking)
    {
        $booking->load(['passenger', 'driver']);

        return view('receipts.booking', [
            'booking' => $booking,
        ]);
    }
}
