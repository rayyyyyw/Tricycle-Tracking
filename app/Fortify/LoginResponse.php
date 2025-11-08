<?php

namespace App\Fortify;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();
        
        // Add some logging to check if this is called
        Log::info('Custom LoginResponse called', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_email' => $user->email
        ]);

        // Redirect based on role
        if ($user->role === 'admin') {
            return redirect()->intended('/dashboard');
        } else {
            return redirect()->intended('/passenger/dashboard');
        }
    }
}