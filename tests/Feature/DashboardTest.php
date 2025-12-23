<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    // Create user WITH passenger role - THIS IS CRITICAL
    $user = User::factory()->create([
        'role' => 'passenger', // Add this line
    ]);
    
    $this->actingAs($user);
    
    $this->get(route('passenger.dashboard'))->assertOk();
});