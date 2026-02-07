<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountStatus
{
    /**
     * If the user's account is deactivated (passenger status=inactive or driver
     * driver_status=inactive/suspended), show a restricted page. They can still
     * log in but cannot perform any actions except logout.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Not authenticated - pass through
        if (! $user) {
            return $next($request);
        }

        // Admins are never restricted
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Allow logout so deactivated users can sign out
        if ($request->is('logout') || $request->routeIs('logout')) {
            return $next($request);
        }

        // Allow deactivated users to submit Contact Admin form
        if ($request->is('deactivated-contact') || $request->routeIs('deactivated-contact')) {
            return $next($request);
        }

        // Passenger with inactive status
        if ($user->role === 'passenger' && $user->status === 'inactive') {
            return $this->deactivatedResponse($request);
        }

        // Driver with inactive or suspended status
        if ($user->role === 'driver') {
            $driverStatus = $user->driver_status ?? 'active';
            if (in_array($driverStatus, ['inactive', 'suspended'])) {
                return $this->deactivatedResponse($request);
            }
        }

        return $next($request);
    }

    private function deactivatedResponse(Request $request): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        return Inertia::render('DeactivatedAccount')->toResponse($request)->setStatusCode(403);
    }
}
