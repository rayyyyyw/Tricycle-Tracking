<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateDriverLastActivity
{
    /**
     * When a driver makes any request, update their last_activity_at
     * so we can treat "browser closed" as offline (no activity = not shown as online).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        if ($user && $user->role === 'driver') {
            $user->update(['last_activity_at' => now()]);
        }

        return $response;
    }
}
