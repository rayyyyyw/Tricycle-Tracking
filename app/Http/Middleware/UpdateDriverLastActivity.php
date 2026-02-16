<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateDriverLastActivity
{
    /**
     * When any authenticated user makes a request, update their last_activity_at
     * so we can determine if they're actually logged in and active.
     * This works for all users (drivers, passengers, admins).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        if ($user) {
            // Update last_activity_at for all authenticated users
            // This helps determine who is actually logged in
            $user->update(['last_activity_at' => now()]);
        }

        return $response;
    }
}
