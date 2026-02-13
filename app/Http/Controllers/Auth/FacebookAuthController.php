<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;

class FacebookAuthController extends Controller
{
    /**
     * Redirect to Facebook for authentication.
     */
    public function redirect()
    {
        if (empty(config('services.facebook.client_id'))) {
            Log::warning('Facebook OAuth: FACEBOOK_CLIENT_ID is not set (e.g. missing in production env)');

            return redirect()->route('login')->with('error', 'Sign in with Facebook is not configured. Please use email and password.');
        }

        return Socialite::driver('facebook')
            ->scopes(['email'])
            ->redirect();
    }

    /**
     * Handle Facebook callback: find or create user, log in, optionally send notification email.
     */
    public function callback()
    {
        try {
            $fbUser = Socialite::driver('facebook')->user();
        } catch (\Throwable $e) {
            Log::warning('Facebook OAuth error', ['error' => $e->getMessage()]);

            return redirect()->route('login')->with('error', 'Could not sign in with Facebook. Please try again.');
        }

        $email = $fbUser->getEmail();
        if (empty($email)) {
            Log::warning('Facebook OAuth: user did not grant email permission', ['id' => $fbUser->getId()]);

            return redirect()->route('login')->with('error', 'We need your email to sign you in with Facebook. Please try again and grant email permission.');
        }

        $user = User::where('facebook_id', $fbUser->getId())
            ->orWhere('email', $email)
            ->first();

        if ($user) {
            if (empty($user->facebook_id)) {
                $user->update(['facebook_id' => $fbUser->getId()]);
            }
            $isNewUser = false;
        } else {
            $user = User::create([
                'name' => $fbUser->getName() ?? explode('@', $email)[0],
                'email' => $email,
                'facebook_id' => $fbUser->getId(),
                'password' => null,
                'role' => 'passenger',
                'email_verified_at' => now(),
            ]);
            $isNewUser = true;
        }

        Auth::login($user, true);

        ActivityLog::log('login', "{$user->name} ({$user->email}) signed in with Facebook.", null, ['method' => 'facebook'], request());

        $baseUrl = rtrim(config('app.url'), '/');

        if ($user->email) {
            $resendKey = config('services.resend.key');
            if (empty($resendKey)) {
                Log::warning('Facebook sign-in email skipped: RESEND_KEY is not set in .env (or config is cached).');
            } else {
                try {
                    $subject = $isNewUser
                        ? 'Welcome to TriGo – you signed up with Facebook'
                        : 'TriGo – you signed in with Facebook';

                    $fromAddress = config('mail.from.address', 'noreply@trigo.pro');
                    $fromName = config('mail.from.name', 'TriGo');

                    Mail::mailer('resend')->send('emails.facebook-sign-in', [
                        'isNewUser' => $isNewUser,
                        'userName' => $user->name,
                        'appUrl' => $baseUrl,
                    ], function ($message) use ($user, $subject, $fromAddress, $fromName) {
                        $message->from($fromAddress, $fromName)
                            ->to($user->email)
                            ->subject($subject);
                    });
                } catch (\Throwable $e) {
                    Log::error('Facebook sign-in notification email failed', [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id,
                        'to' => $user->email,
                        'exception' => $e,
                    ]);
                }
            }
        }

        if ($user->role === 'admin') {
            return redirect()->to($baseUrl.'/dashboard');
        }

        return redirect()->to($baseUrl.'/passenger/dashboard');
    }
}
