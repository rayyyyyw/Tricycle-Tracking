<?php
// database/seeders/AdminUserSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        // Update your existing account to be admin
        User::where('email', 'raymarlou06@gmail.com') // ← Replace with your actual email
            ->update(['role' => 'admin']);
    }
}