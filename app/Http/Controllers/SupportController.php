<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    /**
     * Display the passenger support page
     */
    public function passengerIndex(): Response
    {
        $tickets = SupportTicket::where('user_id', auth()->id())
            ->where('user_type', 'passenger')
            ->latest()
            ->get();

        return Inertia::render('PassengerSide/Support', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Display the driver support page
     */
    public function driverIndex(): Response
    {
        $tickets = SupportTicket::where('user_id', auth()->id())
            ->where('user_type', 'driver')
            ->latest()
            ->get();

        return Inertia::render('DriverSide/Support', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Display the admin support management page
     */
    public function adminIndex(Request $request): Response
    {
        $query = SupportTicket::with(['user', 'respondedBy'])
            ->latest();

        // Filter by status (default to open so admin sees new tickets first)
        $status = $request->get('status', 'open');
        if ($status === 'resolved') {
            $query->whereIn('status', ['resolved', 'closed']);
        } else {
            $query->where('status', $status);
        }

        // Filter by user type if provided
        if ($request->has('user_type') && $request->user_type !== 'all') {
            $query->where('user_type', $request->user_type);
        }

        // Search by subject or user name
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', '%'.$request->search.'%')
                    ->orWhere('message', 'like', '%'.$request->search.'%')
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('name', 'like', '%'.$request->search.'%');
                    });
            });
        }

        $tickets = $query->paginate(20);

        $stats = [
            'total' => SupportTicket::count(),
            'open' => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved' => SupportTicket::whereIn('status', ['resolved', 'closed'])->count(),
        ];

        return Inertia::render('Admin/Support', [
            'tickets' => $tickets,
            'stats' => $stats,
            'filters' => array_merge(
                ['status' => $status],
                $request->only(['user_type', 'search']),
            ),
        ]);
    }

    /**
     * Store a support ticket from a deactivated user (Contact Admin)
     * Allowed even when account is deactivated.
     */
    public function storeFromDeactivated(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $user = auth()->user();
        $userType = $user->role === 'driver' ? 'driver' : 'passenger';

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'user_type' => $userType,
            'category' => 'general',
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'open',
        ]);

        $this->notifyAdminsNewSupportTicket($ticket, $user->name, $userType);

        return back()->with('success', 'Your message has been sent. An admin will review it shortly.');
    }

    /**
     * Store a new support ticket
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|in:general,booking,payment,safety,technical,other',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'user_type' => 'required|in:passenger,driver',
        ]);

        $ticket = SupportTicket::create([
            'user_id' => auth()->id(),
            'user_type' => $validated['user_type'],
            'category' => $validated['category'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'open',
        ]);

        $user = auth()->user();
        $this->notifyAdminsNewSupportTicket($ticket, $user->name, $validated['user_type']);

        return back()->with('success', 'Your support ticket has been submitted successfully. We will get back to you soon.');
    }

    /**
     * Update ticket status (Admin only)
     */
    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        $ticket->update([
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Ticket status updated successfully.');
    }

    /**
     * Respond to a ticket (Admin only)
     */
    public function respond(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'admin_response' => 'required|string',
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        $ticket->update([
            'admin_response' => $validated['admin_response'],
            'status' => $validated['status'],
            'responded_at' => now(),
            'responded_by' => auth()->id(),
        ]);

        $this->notifyUserTicketResponse($ticket);

        return back()->with('success', 'Response sent successfully.');
    }

    /**
     * Delete a ticket (Passenger: own tickets only)
     */
    public function destroyForPassenger(SupportTicket $ticket)
    {
        if ($ticket->user_id !== auth()->id() || $ticket->user_type !== 'passenger') {
            abort(403, 'You can only delete your own tickets.');
        }
        $ticket->delete();

        return back()->with('success', 'Ticket deleted.');
    }

    /**
     * Delete all tickets for the current passenger (scoped by status: open, in_progress, or resolved).
     */
    public function destroyAllForPassenger(Request $request)
    {
        $status = $request->query('status', $request->input('status', 'open'));
        if (! in_array($status, ['open', 'in_progress', 'resolved'], true)) {
            $status = 'open';
        }
        $query = SupportTicket::where('user_id', auth()->id())
            ->where('user_type', 'passenger');

        $this->scopeStatus($query, $status);
        $query->delete();

        return back()->with('success', 'Tickets deleted.');
    }

    /**
     * Delete a ticket (Driver: own tickets only)
     */
    public function destroyForDriver(SupportTicket $ticket)
    {
        if ($ticket->user_id !== auth()->id() || $ticket->user_type !== 'driver') {
            abort(403, 'You can only delete your own tickets.');
        }
        $ticket->delete();

        return back()->with('success', 'Ticket deleted.');
    }

    /**
     * Delete all tickets for the current driver (scoped by status: open, in_progress, or resolved).
     */
    public function destroyAllForDriver(Request $request)
    {
        $status = $request->query('status', $request->input('status', 'open'));
        if (! in_array($status, ['open', 'in_progress', 'resolved'], true)) {
            $status = 'open';
        }
        $query = SupportTicket::where('user_id', auth()->id())
            ->where('user_type', 'driver');

        $this->scopeStatus($query, $status);
        $query->delete();

        return back()->with('success', 'Tickets deleted.');
    }

    /**
     * Delete a ticket (Admin: any ticket)
     */
    public function destroy(SupportTicket $ticket)
    {
        $ticket->delete();

        return back()->with('success', 'Ticket deleted.');
    }

    /**
     * Delete all tickets in the current status tab (Admin only). Status: open, in_progress, or resolved.
     */
    public function destroyAll(Request $request)
    {
        $status = $request->query('status', $request->input('status', 'open'));
        if (! in_array($status, ['open', 'in_progress', 'resolved'], true)) {
            $status = 'open';
        }
        $query = SupportTicket::query();
        $this->scopeStatus($query, $status);
        $query->delete();

        return back()->with('success', 'Tickets deleted.');
    }

    /**
     * Scope a ticket query by status tab (open, in_progress, or resolved).
     */
    private function scopeStatus($query, string $status): void
    {
        if ($status === 'resolved') {
            $query->whereIn('status', ['resolved', 'closed']);
        } else {
            $query->where('status', $status);
        }
    }

    /**
     * Notify the ticket submitter (passenger or driver) when admin responds.
     */
    private function notifyUserTicketResponse(SupportTicket $ticket): void
    {
        $ticket->load('user');
        $subject = Str::limit($ticket->subject, 50);

        Notification::create([
            'user_id' => $ticket->user_id,
            'type' => 'support_ticket_response',
            'title' => 'Support ticket reply',
            'message' => "An admin replied to your support request: \"{$subject}\"",
            'data' => [
                'ticket_id' => $ticket->id,
                'subject' => $ticket->subject,
            ],
        ]);
    }

    /**
     * Notify all admins when a new support ticket is submitted.
     */
    private function notifyAdminsNewSupportTicket(SupportTicket $ticket, string $userName, string $userType): void
    {
        $roleLabel = $userType === 'driver' ? 'Driver' : 'Passenger';
        $title = 'New support ticket';
        $message = "{$userName} ({$roleLabel}) submitted a support request: \"".Str::limit($ticket->subject, 50).'"';

        $admins = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            Notification::create([
                'user_id' => $adminId,
                'type' => 'new_support_ticket',
                'title' => $title,
                'message' => $message,
                'data' => [
                    'ticket_id' => $ticket->id,
                    'user_name' => $userName,
                    'user_type' => $userType,
                    'subject' => $ticket->subject,
                ],
            ]);
        }
    }
}
