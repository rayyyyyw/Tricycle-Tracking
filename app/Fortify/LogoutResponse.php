<?php

namespace App\Fortify;

use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LogoutResponse implements LogoutResponseContract
{
    public function toResponse($request): Response
    {
        return redirect('/')->with('success', 'You have been logged out successfully.');
    }
}
