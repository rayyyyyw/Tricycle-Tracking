<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\Request;
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

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by user type if provided
        if ($request->has('user_type') && $request->user_type !== 'all') {
            $query->where('user_type', $request->user_type);
        }

        // Search by subject or user name
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('subject', 'like', '%' . $request->search . '%')
                  ->orWhere('message', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $tickets = $query->paginate(20);

        $stats = [
            'total' => SupportTicket::count(),
            'open' => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved' => SupportTicket::where('status', 'resolved')->count(),
        ];

        return Inertia::render('Admin/Support', [
            'tickets' => $tickets,
            'stats' => $stats,
            'filters' => $request->only(['status', 'user_type', 'search']),
        ]);
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

        return back()->with('success', 'Response sent successfully.');
    }
}
