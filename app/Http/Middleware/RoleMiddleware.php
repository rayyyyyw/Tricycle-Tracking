<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Alternative using Auth facade
        if (!Auth::check()) {
            return redirect('/login');
        }

        $user = Auth::user();
        
        // Check role
        $hasRole = match($role) {
            'admin' => $user->isAdmin(),
            'passenger' => $user->isPassenger(),
            'driver' => $user->isDriver(),
            default => false
        };

        if (!$hasRole) {
            // Redirect based on actual role
            if ($user->isAdmin()) return redirect('/dashboard');
            if ($user->isPassenger()) return redirect('/passenger/dashboard');
            if ($user->isDriver()) return redirect('/driver/dashboard');
            return redirect('/');
        }

        return $next($request);
    }
}