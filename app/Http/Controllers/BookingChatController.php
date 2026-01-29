<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use App\Services\ChatTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingChatController extends Controller
{
    public function __construct(
        protected ChatTokenService $chatToken
    ) {}

    /**
     * Return a signed chat token for the given booking (passenger or driver only).
     */
    public function token(Request $request, Booking $booking)
    {
        $user = Auth::user();
        if (!$this->canAccessBookingChat($user, $booking)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $token = $this->chatToken->create($user->id, $booking->id);

        return response()->json(['token' => $token]);
    }

    /**
     * List messages for this booking (passenger–driver only).
     * Marks messages where current user is recipient as delivered & read, then returns them.
     */
    public function index(Request $request, Booking $booking)
    {
        $user = Auth::user();
        if (!$this->canAccessBookingChat($user, $booking)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = Message::where('booking_id', $booking->id)
            ->whereIn('sender_id', [$booking->passenger_id, $booking->driver_id])
            ->whereIn('recipient_id', [$booking->passenger_id, $booking->driver_id])
            ->with('sender:id,name,avatar')
            ->orderBy('created_at')
            ->get();

        foreach ($messages as $m) {
            if ((int) $m->recipient_id !== (int) $user->id) {
                continue;
            }
            $updates = [];
            if ($m->delivered_at === null) {
                $updates['delivered_at'] = now();
            }
            if (!$m->is_read) {
                $updates['is_read'] = true;
                $updates['read_at'] = now();
            }
            if ($updates !== []) {
                $m->update($updates);
                $m->refresh();
            }
        }

        return response()->json([
            'messages' => $messages->map(fn (Message $m) => $this->formatMessage($m)),
        ]);
    }

    /**
     * Store a new message. Accepts Bearer token (from Socket server) or session auth.
     */
    public function store(Request $request, Booking $booking)
    {
        $user = null;
        $bearer = $request->bearerToken();
        if ($bearer) {
            $payload = $this->chatToken->validate($bearer);
            if (!$payload || $payload['booking_id'] !== $booking->id) {
                return response()->json(['error' => 'Invalid or expired token'], 403);
            }
            $user = User::find($payload['user_id']);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 403);
            }
        } else {
            $user = Auth::user();
        }

        if (!$user || !$this->canAccessBookingChat($user, $booking)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $recipientId = $user->id === $booking->passenger_id
            ? $booking->driver_id
            : $booking->passenger_id;
        if (!$recipientId) {
            return response()->json(['error' => 'No recipient for this booking'], 422);
        }

        $message = Message::create([
            'booking_id' => $booking->id,
            'sender_id' => $user->id,
            'recipient_id' => $recipientId,
            'message' => $validated['message'],
            'type' => 'text',
        ]);
        $message->load('sender:id,name,avatar');

        Notification::create([
            'user_id' => $recipientId,
            'type' => 'new_message',
            'title' => 'New message',
            'message' => $user->name . ' sent you a message',
            'data' => [
                'message_id' => $message->id,
                'booking_id' => $booking->id,
                'sender_id' => $user->id,
            ],
        ]);

        return response()->json([
            'message' => $this->formatMessage($message),
        ]);
    }

    /**
     * Internal: store message (called by Socket server). Requires X-Internal-Secret.
     */
    public function storeInternal(Request $request)
    {
        $secret = config('services.chat.internal_secret');
        if (empty($secret) || $request->header('X-Internal-Secret') !== $secret) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'booking_id' => 'required|integer|exists:bookings,id',
            'user_id' => 'required|integer|exists:users,id',
            'message' => 'required|string|max:1000',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);
        $user = User::findOrFail($validated['user_id']);

        if (!$this->canAccessBookingChat($user, $booking)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $recipientId = $user->id === $booking->passenger_id ? $booking->driver_id : $booking->passenger_id;
        if (!$recipientId) {
            return response()->json(['error' => 'No recipient'], 422);
        }

        $message = Message::create([
            'booking_id' => $booking->id,
            'sender_id' => $user->id,
            'recipient_id' => $recipientId,
            'message' => $validated['message'],
            'type' => 'text',
        ]);
        $message->load('sender:id,name,avatar');

        Notification::create([
            'user_id' => $recipientId,
            'type' => 'new_message',
            'title' => 'New message',
            'message' => $user->name . ' sent you a message',
            'data' => [
                'message_id' => $message->id,
                'booking_id' => $booking->id,
                'sender_id' => $user->id,
            ],
        ]);

        return response()->json([
            'message' => $this->formatMessage($message),
        ]);
    }

    /**
     * Mark messages as delivered. Recipient only; only messages to current user in this booking.
     */
    public function markDelivered(Request $request, Booking $booking)
    {
        $user = Auth::user();
        if (!$this->canAccessBookingChat($user, $booking)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate(['message_ids' => 'required|array', 'message_ids.*' => 'integer']);
        $ids = array_filter(array_map('intval', $validated['message_ids']));

        Message::where('booking_id', $booking->id)
            ->where('recipient_id', $user->id)
            ->whereNull('delivered_at')
            ->whereIn('id', $ids)
            ->update(['delivered_at' => now()]);

        return response()->json(['ok' => true]);
    }

    /**
     * Mark messages as read. Recipient only; only messages to current user in this booking.
     */
    public function markRead(Request $request, Booking $booking)
    {
        $user = Auth::user();
        if (!$this->canAccessBookingChat($user, $booking)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate(['message_ids' => 'required|array', 'message_ids.*' => 'integer']);
        $ids = array_filter(array_map('intval', $validated['message_ids']));

        Message::where('booking_id', $booking->id)
            ->where('recipient_id', $user->id)
            ->where('is_read', false)
            ->whereIn('id', $ids)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    private function formatMessage(Message $m): array
    {
        return [
            'id' => $m->id,
            'sender_id' => $m->sender_id,
            'sender_name' => $m->sender->name ?? '',
            'message' => $m->message,
            'type' => $m->type,
            'created_at' => $m->created_at->toISOString(),
            'delivered_at' => $m->delivered_at?->toISOString(),
            'read_at' => $m->read_at?->toISOString(),
        ];
    }

    private function canAccessBookingChat($user, Booking $booking): bool
    {
        if (!$user) {
            return false;
        }
        if (!$booking->driver_id) {
            return false;
        }
        return (int) $user->id === (int) $booking->passenger_id
            || (int) $user->id === (int) $booking->driver_id;
    }
}
