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

        // Send sign-in notification to the user's Gmail (via Resend when RESEND_KEY is set)
        if ($user->email) {
            try {
                $subject = $isNewUser
                    ? 'Welcome to TriGo – you signed up with Google'
                    : 'TriGo – you signed in with Google';
                $body = $isNewUser
                    ? "Hi {$user->name},\n\nWelcome to TriGo! You signed up with Google. You can use this email to sign in next time.\n\n— TriGo"
                    : "Hi {$user->name},\n\nYou just signed in to TriGo with Google. If this wasn't you, please secure your account.\n\n— TriGo";

                $mailer = config('services.resend.key') ? 'resend' : config('mail.default');
                Mail::mailer($mailer)->raw($body, function ($message) use ($user, $subject) {
                    $message->to($user->email)->subject($subject);
                });
            } catch (\Throwable $e) {
                Log::warning('Google sign-in notification email failed', ['error' => $e->getMessage()]);
            }
        }

        // Redirect to canonical APP_URL so user lands on trigo.pro (not onrender.com) and on the correct dashboard
        $baseUrl = rtrim(config('app.url'), '/');
        if ($user->role === 'admin') {
            return redirect()->to($baseUrl.'/dashboard');
        }

        return redirect()->to($baseUrl.'/passenger/dashboard');
    }
}
