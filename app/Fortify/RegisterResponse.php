<?php

namespace App\Fortify;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

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
            'intended_url' => session()->get('url.intended'),
        ]);

        // Test email: send welcome message to verify Resend works
        if ($user->email) {
            try {
                Mail::raw(
                    "Hi {$user->name},\n\nWelcome to TriGo! Your account has been created. This email confirms that Resend is working.\n\n— TriGo",
                    function ($message) use ($user) {
                        $message->to($user->email)
                            ->subject('Welcome to TriGo');
                    }
                );
            } catch (\Throwable $e) {
                Log::warning('Register welcome email failed', ['error' => $e->getMessage()]);
            }
        }

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
