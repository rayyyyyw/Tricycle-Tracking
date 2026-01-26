<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use App\Models\Notification;
use App\Services\IprogSmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Store a new booking.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'ride_type' => 'required|string',
            'passenger_count' => 'required|integer|min:1',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'pickup_address' => 'required|string',
            'pickup_barangay' => 'nullable|string',
            'pickup_purok' => 'nullable|string',
            'destination_lat' => 'required|numeric',
            'destination_lng' => 'required|numeric',
            'destination_address' => 'required|string',
            'destination_barangay' => 'nullable|string',
            'destination_purok' => 'nullable|string',
            'distance' => 'nullable|string',
            'duration' => 'nullable|string',
            'fare' => 'required|numeric',
            'total_fare' => 'required|numeric',
            'estimated_arrival' => 'nullable|string',
            'passenger_name' => 'required|string',
            'passenger_phone' => 'required|string',
            'special_instructions' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
            'emergency_contact_relationship' => 'nullable|string',
        ]);

        // Generate unique booking ID
        $bookingId = 'BK-' . strtoupper(Str::random(8)) . '-' . time();

        $booking = Booking::create([
            'passenger_id' => $user->id,
            'ride_type' => $validated['ride_type'],
            'passenger_count' => $validated['passenger_count'],
            'pickup_lat' => $validated['pickup_lat'],
            'pickup_lng' => $validated['pickup_lng'],
            'pickup_address' => $validated['pickup_address'],
            'pickup_barangay' => $validated['pickup_barangay'] ?? null,
            'pickup_purok' => $validated['pickup_purok'] ?? null,
            'destination_lat' => $validated['destination_lat'],
            'destination_lng' => $validated['destination_lng'],
            'destination_address' => $validated['destination_address'],
            'destination_barangay' => $validated['destination_barangay'] ?? null,
            'destination_purok' => $validated['destination_purok'] ?? null,
            'distance' => $validated['distance'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'fare' => $validated['fare'],
            'total_fare' => $validated['total_fare'],
            'estimated_arrival' => $validated['estimated_arrival'] ?? null,
            'passenger_name' => $validated['passenger_name'],
            'passenger_phone' => $validated['passenger_phone'],
            'special_instructions' => $validated['special_instructions'] ?? null,
            'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
            'emergency_contact_relationship' => $validated['emergency_contact_relationship'] ?? null,
            'status' => 'pending',
            'booking_id' => $bookingId,
        ]);

        $booking->load('passenger');
        
        // Create notification for all drivers about new booking
        // Note: In a real app, you might want to notify only nearby drivers
        $drivers = User::where('role', 'driver')->get();
        
        foreach ($drivers as $driver) {
            Notification::create([
                'user_id' => $driver->id,
                'type' => 'new_booking',
                'title' => 'New Booking Request',
                'message' => "New booking from {$validated['pickup_address']} to {$validated['destination_address']} - ₱" . number_format($validated['total_fare'], 2),
                'data' => [
                    'booking_id' => $booking->id,
                    'booking_identifier' => $booking->booking_id,
                    'passenger_id' => $user->id,
                    'passenger_name' => $user->name,
                    'pickup_address' => $validated['pickup_address'],
                    'destination_address' => $validated['destination_address'],
                    'total_fare' => $validated['total_fare'],
                ],
            ]);
        }
        
        // Check if this is an Inertia request
        if ($request->header('X-Inertia')) {
            // Return back with booking data in flash for Inertia
            return redirect()->back()->with([
                'success' => 'Booking created successfully',
                'booking' => [
                    'id' => $booking->id,
                    'booking_id' => $booking->booking_id,
                    'status' => $booking->status,
                    'passenger' => [
                        'id' => $booking->passenger->id,
                        'name' => $booking->passenger->name,
                        'phone' => $booking->passenger->phone,
                        'avatar' => $booking->passenger->avatar_url,
                    ],
                ]
            ]);
        }

        // Return JSON for API/fetch requests
        return response()->json([
            'success' => true,
            'booking' => $booking,
            'message' => 'Booking created successfully'
        ]);
    }

    /**
     * Get pending bookings for drivers.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Only drivers can see pending bookings
        if (!$user->isDriver()) {
            // Check if this is an Inertia request
            if ($request->header('X-Inertia')) {
                return redirect()->route('driver.dashboard');
            }
            return response()->json(['bookings' => []]);
        }

        $bookings = Booking::where('status', 'pending')
            ->with('passenger')
            ->latest()
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_id' => $booking->booking_id,
                    'passenger' => [
                        'id' => $booking->passenger->id,
                        'name' => $booking->passenger_name,
                        'phone' => $booking->passenger_phone,
                        'avatar' => $booking->passenger->avatar_url,
                    ],
                    'pickup' => [
                        'lat' => $booking->pickup_lat,
                        'lng' => $booking->pickup_lng,
                        'address' => $booking->pickup_address,
                        'barangay' => $booking->pickup_barangay,
                        'purok' => $booking->pickup_purok,
                    ],
                    'destination' => [
                        'lat' => $booking->destination_lat,
                        'lng' => $booking->destination_lng,
                        'address' => $booking->destination_address,
                        'barangay' => $booking->destination_barangay,
                        'purok' => $booking->destination_purok,
                    ],
                    'ride_type' => $booking->ride_type,
                    'passenger_count' => $booking->passenger_count,
                    'distance' => $booking->distance,
                    'duration' => $booking->duration,
                    'total_fare' => $booking->total_fare,
                    'estimated_arrival' => $booking->estimated_arrival,
                    'special_instructions' => $booking->special_instructions,
                    'created_at' => $booking->created_at->toISOString(),
                ];
            });

        // Check if this is an Inertia request
        if ($request->header('X-Inertia')) {
            return redirect()->route('driver.dashboard');
        }

        // Return JSON for API requests
        return response()->json(['bookings' => $bookings]);
    }

    /**
     * Accept a booking by a driver.
     */
    public function accept(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if (!$user->isDriver()) {
            if ($request->header('X-Inertia')) {
                return redirect()->route('driver.dashboard')->with('error', 'Only drivers can accept bookings');
            }
            return response()->json(['error' => 'Only drivers can accept bookings'], 403);
        }

        if ($booking->status !== 'pending') {
            if ($request->header('X-Inertia')) {
                return redirect()->route('driver.dashboard')->with('error', 'Booking is not available');
            }
            return response()->json(['error' => 'Booking is not available'], 400);
        }

        $booking->update([
            'driver_id' => $user->id,
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        // Create notification for passenger
        Notification::create([
            'user_id' => $booking->passenger_id,
            'type' => 'driver_assigned',
            'title' => 'Driver Found!',
            'message' => "Driver {$user->name} has accepted your booking. Your ride is on the way!",
            'data' => [
                'booking_id' => $booking->id,
                'booking_identifier' => $booking->booking_id,
                'driver_id' => $user->id,
                'driver_name' => $user->name,
                'pickup_address' => $booking->pickup_address,
                'destination_address' => $booking->destination_address,
            ],
        ]);

        // Check if this is an Inertia request
        if ($request->header('X-Inertia')) {
            return redirect()->route('driver.dashboard')->with('success', 'Booking accepted successfully');
        }

        // Return JSON for API requests
        return response()->json([
            'success' => true,
            'booking' => $booking->load(['passenger', 'driver']),
            'message' => 'Booking accepted successfully'
        ]);
    }

    /**
     * Get a specific booking.
     */
    public function show(Request $request, Booking $booking)
    {
        $booking->load(['passenger', 'driver', 'review']);
        
        // Format booking with driver application if driver exists
        $bookingData = $booking->toArray();
        
        if ($booking->driver) {
            $driverApplication = $booking->driver->approvedDriverApplication;
            $bookingData['driver']['avatar'] = $booking->driver->avatar_url;
            $bookingData['driver']['approvedDriverApplication'] = $driverApplication ? [
                'license_number' => $driverApplication->license_number,
                'vehicle_type' => $driverApplication->vehicle_type,
                'vehicle_plate_number' => $driverApplication->vehicle_plate_number,
                'vehicle_year' => $driverApplication->vehicle_year,
                'vehicle_color' => $driverApplication->vehicle_color,
                'vehicle_model' => $driverApplication->vehicle_model,
            ] : null;
        }

        // Include review if exists
        if ($booking->review) {
            $bookingData['review'] = [
                'id' => $booking->review->id,
                'rating' => $booking->review->rating,
                'comment' => $booking->review->comment,
            ];
        }
        
        // Check if this is an Inertia request
        if ($request->header('X-Inertia')) {
            return redirect()->route('driver.dashboard');
        }
        
        // Return JSON for API requests
        return response()->json(['booking' => $bookingData]);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Request $request, Booking $booking)
    {
        $user = Auth::user();

        // Only the passenger who created the booking can cancel it
        if ($booking->passenger_id !== $user->id) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'You can only cancel your own bookings');
            }
            return response()->json(['error' => 'You can only cancel your own bookings'], 403);
        }

        // Only allow cancellation if booking is pending or accepted (not completed or already cancelled)
        if (!in_array($booking->status, ['pending', 'accepted'])) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'This booking cannot be cancelled');
            }
            return response()->json(['error' => 'This booking cannot be cancelled'], 400);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // Create notifications
        // Notify driver if booking was accepted
        if ($booking->driver_id) {
            Notification::create([
                'user_id' => $booking->driver_id,
                'type' => 'booking_cancelled',
                'title' => 'Booking Cancelled',
                'message' => "The booking {$booking->booking_id} has been cancelled by the passenger.",
                'data' => [
                    'booking_id' => $booking->id,
                    'booking_identifier' => $booking->booking_id,
                    'passenger_id' => $booking->passenger_id,
                ],
            ]);
        }

        // Check if this is an Inertia request
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Booking cancelled successfully');
        }

        // Return JSON for API requests
        return response()->json([
            'success' => true,
            'booking' => $booking->load(['passenger', 'driver']),
            'message' => 'Booking cancelled successfully'
        ]);
    }

    /**
     * Complete a booking by a driver.
     */
    public function complete(Request $request, Booking $booking)
    {
        $user = Auth::user();

        // Only the assigned driver can complete the booking
        if ($booking->driver_id !== $user->id) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'You are not authorized to complete this booking.');
            }
            return response()->json(['error' => 'You are not authorized to complete this booking.'], 403);
        }

        // Only accepted or in-progress bookings can be completed
        if (!in_array($booking->status, ['accepted', 'in_progress'])) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Booking cannot be completed as it is already ' . $booking->status . '.');
            }
            return response()->json(['error' => 'Booking cannot be completed as it is already ' . $booking->status . '.'], 400);
        }

        $booking->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Ride completed successfully.');
        }

        return response()->json([
            'success' => true,
            'booking' => $booking->load(['passenger', 'driver']),
            'message' => 'Ride completed successfully'
        ]);
    }

    /**
     * Send SOS alert for a booking.
     */
    public function sendSOS(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|integer|exists:bookings,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'address' => 'required|string',
            'driver_id' => 'nullable|integer',
            'driver_name' => 'nullable|string',
            'driver_phone' => 'nullable|string',
            'vehicle_number' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        // Get fresh user data from database to ensure we have latest emergency_contact
        // (Auth::user() might be cached; fresh query ensures profile updates are reflected)
        $user = User::findOrFail(Auth::id());

        // Verify the booking belongs to the current user (passenger-only; route is under role:passenger)
        if ($booking->passenger_id !== $user->id) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'You can only send SOS for your own bookings');
            }
            return response()->json(['error' => 'You can only send SOS for your own bookings'], 403);
        }

        // Use only the passenger's profile emergency contact (PassengerSide profile settings).
        // SMS is sent to this contact only; no one else receives the SOS SMS.
        $passenger = $user;
        $emergencyContact = is_array($passenger->emergency_contact) ? $passenger->emergency_contact : [];

        // Create SOS notification for admin
        Notification::create([
            'user_id' => User::where('role', 'admin')->first()?->id ?? 1, // Notify first admin
            'type' => 'sos_alert',
            'title' => '🚨 SOS Alert',
            'message' => "SOS alert from {$passenger->name} (Booking: {$booking->booking_id})",
            'data' => [
                'booking_id' => $booking->id,
                'booking_identifier' => $booking->booking_id,
                'passenger_id' => $passenger->id,
                'passenger_name' => $passenger->name,
                'passenger_phone' => $passenger->phone,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'address' => $validated['address'],
                'driver_id' => $validated['driver_id'],
                'driver_name' => $validated['driver_name'],
                'driver_phone' => $validated['driver_phone'],
                'vehicle_number' => $validated['vehicle_number'],
                'emergency_contact_name' => $emergencyContact['name'] ?? null,
                'emergency_contact_phone' => $emergencyContact['phone'] ?? null,
            ],
        ]);

        // Notify driver if exists
        if ($booking->driver_id) {
            Notification::create([
                'user_id' => $booking->driver_id,
                'type' => 'sos_alert',
                'title' => '🚨 SOS Alert',
                'message' => "SOS alert from passenger {$passenger->name}",
                'data' => [
                    'booking_id' => $booking->id,
                    'booking_identifier' => $booking->booking_id,
                    'passenger_id' => $passenger->id,
                    'passenger_name' => $passenger->name,
                    'passenger_phone' => $passenger->phone,
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'address' => $validated['address'],
                ],
            ]);
        }

        // Log SOS alert
        Log::emergency('SOS Alert', [
            'booking_id' => $booking->id,
            'passenger' => $passenger->name,
            'location' => $validated['address'],
            'coordinates' => [$validated['latitude'], $validated['longitude']],
            'driver' => $validated['driver_name'] ?? 'N/A',
            'emergency_contact' => !empty($emergencyContact) ? [
                'name' => $emergencyContact['name'] ?? null,
                'phone' => $emergencyContact['phone'] ?? null,
            ] : null,
        ]);

        // Send SOS SMS only to the passenger's profile emergency_contact phone (passenger-side only).
        // Uses whatever the user set in PassengerSide profile → emergency contact. No other recipients.
        $emergencyPhone = $emergencyContact['phone'] ?? null;
        $smsSent = false;

        if (!empty($emergencyPhone)) {
            $sms = app(IprogSmsService::class);
            $sosData = [
                'booking_id' => $booking->id,
                'booking_identifier' => $booking->booking_id,
                'passenger_id' => $passenger->id,
                'passenger_name' => $passenger->name,
                'passenger_phone' => $passenger->phone ?? 'N/A',
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'address' => $validated['address'],
                'driver_id' => $validated['driver_id'],
                'driver_name' => $validated['driver_name'],
                'driver_phone' => $validated['driver_phone'],
                'vehicle_number' => $validated['vehicle_number'],
                'timestamp' => now()->format('M j, Y g:i A'),
            ];
            $result = $sms->sendSos($emergencyPhone, $sosData);
            $smsSent = $result['success'];
            
            if (!$result['success']) {
                Log::warning('SOS SMS to emergency contact failed', [
                    'booking_id' => $booking->id,
                    'passenger_id' => $passenger->id,
                    'phone' => $emergencyPhone,
                    'error' => $result['error'] ?? 'unknown',
                ]);
            } else {
                Log::info('SOS SMS sent successfully', [
                    'booking_id' => $booking->id,
                    'passenger_id' => $passenger->id,
                    'phone' => $emergencyPhone,
                    'message_id' => $result['message_id'] ?? null,
                ]);
            }
        } else {
            Log::warning('SOS alert triggered but no emergency contact phone found', [
                'booking_id' => $booking->id,
                'passenger_id' => $passenger->id,
                'emergency_contact' => $emergencyContact,
            ]);
        }

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'SOS alert sent successfully! Emergency contacts and authorities have been notified.');
        }

        return response()->json([
            'success' => true,
            'message' => 'SOS alert sent successfully',
            'booking_id' => $booking->id,
        ]);
    }
}
