<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ], 401);
        }
        
        $notifications = Notification::where('user_id', $user->id)
            ->where('type', '!=', 'new_message')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'read' => $notification->read,
                    'read_at' => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at->toISOString(),
                    'time_ago' => $notification->created_at->diffForHumans(),
                ];
            });

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->where('type', '!=', 'new_message')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get message notifications only (for Messages dropdown).
     */
    public function messageNotifications(Request $request)
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ], 401);
        }

        $notifications = Notification::where('user_id', $user->id)
            ->where('type', 'new_message')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'read' => $notification->read,
                    'read_at' => $notification->read_at?->toISOString(),
                    'created_at' => $notification->created_at->toISOString(),
                    'time_ago' => $notification->created_at->diffForHumans(),
                ];
            });

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('type', 'new_message')
            ->where('read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark all message notifications as read.
     */
    public function markAllMessagesAsRead()
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->where('type', 'new_message')
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['success' => true]);
    }

    /**
     * Get unread message notification count (for Messages icon badge).
     */
    public function unreadMessageCount()
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json(['count' => 0], 401);
        }

        $count = Notification::where('user_id', $user->id)
            ->where('type', 'new_message')
            ->where('read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get unread count only (excludes message notifications - those show on Messages icon).
     */
    public function unreadCount()
    {
        $user = Auth::user();
        
        $count = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->where('type', '!=', 'new_message')
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();
        
        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a single notification.
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Delete all notifications (excludes message notifications).
     */
    public function destroyAll()
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->where('type', '!=', 'new_message')
            ->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Delete all message notifications.
     */
    public function destroyAllMessages()
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->where('type', 'new_message')
            ->delete();

        return response()->json(['success' => true]);
    }
}
