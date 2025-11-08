<?php

namespace App\Fortify;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();
        
        // Add detailed logging
        Log::info('=== CUSTOM REGISTER RESPONSE TRIGGERED ===', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_email' => $user->email,
            'intended_url' => session()->get('url.intended')
        ]);

        // Redirect based on role
        if ($user->role === 'admin') {
            Log::info('Redirecting ADMIN to dashboard');
            return redirect()->intended('/dashboard');
        } else {
            Log::info('Redirecting PASSENGER to passenger dashboard');
            return redirect()->intended('/passenger/dashboard');
        }
    }
}