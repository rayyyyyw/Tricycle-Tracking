<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google for authentication.
     */
    public function redirect()
    {
        if (empty(config('services.google.client_id'))) {
            Log::warning('Google OAuth: GOOGLE_CLIENT_ID is not set (e.g. missing in production env)');

            return redirect()->route('login')->with('error', 'Sign in with Google is not configured. Please use email and password.');
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google callback: find or create user, log in, send test email.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            Log::warning('Google OAuth error', ['error' => $e->getMessage()]);

            return redirect()->route('login')->with('error', 'Could not sign in with Google. Please try again.');
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            if (empty($user->google_id)) {
                $user->update(['google_id' => $googleUser->getId()]);
            }
            $isNewUser = false;
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? explode('@', $googleUser->getEmail())[0],
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => null,
                'role' => 'passenger',
                'email_verified_at' => now(),
            ]);
            $isNewUser = true;
        }

        Auth::login($user, true);

        $baseUrl = rtrim(config('app.url'), '/');

        // Send sign-in notification to the user's Gmail via Resend (branded HTML email)
        if ($user->email) {
            $resendKey = config('services.resend.key');
            if (empty($resendKey)) {
                Log::warning('Google sign-in email skipped: RESEND_KEY is not set in .env (or config is cached). Set RESEND_KEY and run php artisan config:clear.');
            } else {
                try {
                    $subject = $isNewUser
                        ? 'Welcome to TriGo – you signed up with Google'
                        : 'TriGo – you signed in with Google';

                    $fromAddress = config('mail.from.address', 'noreply@trigo.pro');
                    $fromName = config('mail.from.name', 'TriGo');

                    Mail::mailer('resend')->send('emails.google-sign-in', [
                        'isNewUser' => $isNewUser,
                        'userName' => $user->name,
                        'appUrl' => $baseUrl,
                    ], function ($message) use ($user, $subject, $fromAddress, $fromName) {
                        $message->from($fromAddress, $fromName)
                            ->to($user->email)
                            ->subject($subject);
                    });
                } catch (\Throwable $e) {
                    Log::error('Google sign-in notification email failed', [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id,
                        'to' => $user->email,
                        'exception' => $e,
                    ]);
                }
            }
        }

        // Redirect to canonical APP_URL so user lands on trigo.pro (not onrender.com) and on the correct dashboard
        if ($user->role === 'admin') {
            return redirect()->to($baseUrl.'/dashboard');
        }

        return redirect()->to($baseUrl.'/passenger/dashboard');
    }
}
