<?php

namespace App\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewPassenger implements CreatesNewUsers
{
    /**
     * Validate and create a newly registered user.
     *
     * @param  array  $input
     * @return \App\Models\User
     */
    public function create(array $input)
    {
        Validator::make($input, [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ])->validate();

        // Extract username from email as default name
        $username = explode('@', $input['email'])[0];

        return User::create([
            'name' => $username, // ← ADD THIS LINE - uses email username as default
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'role' => 'passenger',
        ]);
    }
}