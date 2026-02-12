<?php

namespace App\Fortify;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        ActivityLog::log('login', "{$user->name} ({$user->email}) signed in with email/password.", null, ['method' => 'email'], $request);

        // Add some logging to check if this is called
        Log::info('Custom LoginResponse called', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_email' => $user->email,
        ]);

        // Test email: send a quick "you logged in" message to verify Resend works
        if ($user->email) {
            try {
                Mail::raw(
                    "Hi {$user->name},\n\nYou just logged in to TriGo. This email confirms that Resend is working.\n\n— TriGo",
                    function ($message) use ($user) {
                        $message->to($user->email)
                            ->subject('TriGo – You logged in');
                    }
                );
            } catch (\Throwable $e) {
                Log::warning('Login test email failed', ['error' => $e->getMessage()]);
            }
        }

        // Redirect based on role
        if ($user->role === 'admin') {
            return redirect()->intended('/dashboard');
        } else {
            return redirect()->intended('/passenger/dashboard');
        }
    }
}
