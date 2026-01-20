<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display messages page with conversations.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get all unique conversations for this user
        $conversations = Message::where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
        })
        ->with(['sender', 'recipient', 'booking'])
        ->get()
        ->groupBy(function ($message) use ($user) {
            // Group by the other person in conversation
            return $message->sender_id == $user->id 
                ? $message->recipient_id 
                : $message->sender_id;
        })
        ->map(function ($messages, $otherUserId) use ($user) {
            $latestMessage = $messages->sortByDesc('created_at')->first();
            $otherUser = $latestMessage->sender_id == $user->id 
                ? $latestMessage->recipient 
                : $latestMessage->sender;
            
            $unreadCount = $messages->where('recipient_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            return [
                'user_id' => $otherUser->id,
                'user_name' => $otherUser->name,
                'user_avatar' => $otherUser->avatar_url,
                'user_role' => $otherUser->role,
                'latest_message' => $latestMessage->message,
                'latest_message_time' => $latestMessage->created_at->diffForHumans(),
                'unread_count' => $unreadCount,
                'booking_id' => $latestMessage->booking_id,
            ];
        })
        ->sortByDesc('latest_message_time')
        ->values();

        // Determine which layout to use based on role
        $layout = $user->isDriver() ? 'DriverSide/Messages' : 'PassengerSide/Messages';

        return Inertia::render($layout, [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Get conversation between current user and another user.
     */
    public function getConversation(Request $request, $userId)
    {
        $currentUser = Auth::user();
        $otherUser = User::findOrFail($userId);
        
        $bookingId = $request->query('booking_id');
        
        $messages = Message::getConversation($currentUser->id, $userId, $bookingId);
        
        // Mark messages as read
        Message::where('sender_id', $userId)
            ->where('recipient_id', $currentUser->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        
        return response()->json([
            'success' => true,
            'messages' => $messages->map(function ($message) {
                return [
                    'id' => $message->id,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name,
                    'message' => $message->message,
                    'type' => $message->type,
                    'is_read' => $message->is_read,
                    'created_at' => $message->created_at->toISOString(),
                    'time_ago' => $message->created_at->diffForHumans(),
                ];
            }),
            'other_user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'avatar' => $otherUser->avatar_url,
                'role' => $otherUser->role,
            ],
        ]);
    }

    /**
     * Store a new message.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
            'booking_id' => 'nullable|exists:bookings,id',
            'type' => 'nullable|string|in:text,image,location',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'recipient_id' => $validated['recipient_id'],
            'message' => $validated['message'],
            'booking_id' => $validated['booking_id'] ?? null,
            'type' => $validated['type'] ?? 'text',
        ]);

        $message->load(['sender', 'recipient']);

        // Create notification for recipient
        \App\Models\Notification::create([
            'user_id' => $validated['recipient_id'],
            'type' => 'new_message',
            'title' => 'New Message',
            'message' => Auth::user()->name . ' sent you a message',
            'data' => [
                'message_id' => $message->id,
                'sender_id' => Auth::id(),
                'sender_name' => Auth::user()->name,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'message' => $message->message,
                'type' => $message->type,
                'created_at' => $message->created_at->toISOString(),
                'time_ago' => $message->created_at->diffForHumans(),
            ],
        ]);
    }

    /**
     * Mark message as read.
     */
    public function markAsRead(Message $message)
    {
        if ($message->recipient_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->markAsRead();

        return response()->json(['success' => true]);
    }
}
