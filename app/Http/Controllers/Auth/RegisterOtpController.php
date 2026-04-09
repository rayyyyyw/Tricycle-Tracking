<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class RegisterOtpController
{
    private const OTP_EXPIRY_MINUTES = 10;
    private const OTP_LENGTH = 6;

    public function send(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please check the form fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $otp = (string) random_int(100000, 999999);
        $email = $validated['email'];
        $cacheKey = $this->getOtpCacheKey($email);

        Cache::put($cacheKey, [
            'otp' => $otp,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ], now()->addMinutes(self::OTP_EXPIRY_MINUTES));

        try {
            $html = <<<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TriGo Registration OTP</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#059669);padding:18px 24px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.2;">TriGo Registration OTP</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 14px 0;font-size:15px;color:#374151;">Use this one-time code to complete your account registration:</p>
              <div style="margin:0 0 16px 0;padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;text-align:center;">
                <span style="font-size:30px;letter-spacing:6px;font-weight:700;color:#047857;">{$otp}</span>
              </div>
              <p style="margin:0 0 14px 0;font-size:14px;color:#4b5563;">This {$this->otpLengthLabel()} code expires in <strong>{$this->expiryMinutesLabel()}</strong>.</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">If you did not request this OTP, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

            Mail::html($html, function ($message) use ($email) {
                $message->to($email)
                    ->subject('Your TriGo verification code');
            });
        } catch (\Throwable $e) {
            Log::warning('Failed to send registration OTP email', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to send OTP right now. Please try again.',
            ], 500);
        }

        return response()->json([
            'message' => 'OTP has been sent to your email.',
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'otp' => ['required', 'digits:6'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please check the form fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $cacheKey = $this->getOtpCacheKey($validated['email']);
        $payload = Cache::get($cacheKey);

        if (
            ! is_array($payload) ||
            ! isset($payload['otp']) ||
            ! is_string($payload['otp']) ||
            $payload['otp'] !== $validated['otp']
        ) {
            return response()->json([
                'message' => 'Invalid or expired OTP.',
                'errors' => ['otp' => ['Invalid or expired OTP.']],
            ], 422);
        }

        if (User::where('email', $validated['email'])->exists()) {
            Cache::forget($cacheKey);

            return response()->json([
                'message' => 'This email is already registered.',
                'errors' => ['email' => ['This email is already registered.']],
            ], 422);
        }

        $name = isset($payload['name']) ? (string) $payload['name'] : '';
        $email = isset($payload['email']) ? (string) $payload['email'] : '';
        $password = isset($payload['password']) ? (string) $payload['password'] : '';

        if ($name === '' || $email === '' || $password === '') {
            Cache::forget($cacheKey);

            return response()->json([
                'message' => 'Registration session expired. Please resend OTP.',
                'errors' => ['otp' => ['Registration session expired. Please resend OTP.']],
            ], 422);
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'passenger',
        ]);
        Cache::forget($cacheKey);

        event(new Registered($user));
        Auth::login($user);

        return response()->json([
            'message' => 'Account created successfully.',
            'redirect' => '/passenger/dashboard',
        ]);
    }

    private function otpLengthLabel(): string
    {
        return self::OTP_LENGTH.'-digit';
    }

    private function expiryMinutesLabel(): string
    {
        return self::OTP_EXPIRY_MINUTES.' minutes';
    }

    private function getOtpCacheKey(string $email): string
    {
        return 'register_otp:'.strtolower($email);
    }
}
