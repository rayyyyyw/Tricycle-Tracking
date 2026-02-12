<?php

namespace App\Fortify;

use App\Models\ActivityLog;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        ActivityLog::log('login', "{$user->name} ({$user->email}) signed in with email/password.", null, ['method' => 'email'], $request);

        // Redirect based on role
        if ($user->role === 'admin') {
            return redirect()->intended('/dashboard');
        } else {
            return redirect()->intended('/passenger/dashboard');
        }
    }
}
