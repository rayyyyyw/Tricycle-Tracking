<?php

namespace App\Http\Middleware;

use App\Support\MaintenanceMode;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! MaintenanceMode::isEnabled()) {
            return $next($request);
        }

        // Only admins can access when maintenance is on
        $user = $request->user();
        if ($user && $user->role === 'admin') {
            return $next($request);
        }

        // Allow login so admins can sign in to turn off maintenance
        if ($request->is('login', 'register', 'forgot-password', 'reset-password', 'reset-password/*', 'two-factor-challenge', 'email/verify', 'email/verify/*')) {
            return $next($request);
        }

        // Block everything else - landing page, dashboard, etc.
        return response()->view('maintenance', [], 503);
    }
}
