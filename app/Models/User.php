<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email', 
        'password',
        'role',
        'phone',           // ADD THIS
        'address',         // ADD THIS
        'emergency_contact', // ADD THIS
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'emergency_contact' => 'array', // ADD THIS
        ];
    }

    // Add these helper methods
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isDriver(): bool
    {
        return $this->role === 'driver';
    }

    public function isPassenger(): bool
    {
        return $this->role === 'passenger';
    }

    // ADD THESE HELPER METHODS FOR EMERGENCY CONTACT
    public function getEmergencyNameAttribute()
    {
        return $this->emergency_contact['name'] ?? null;
    }

    public function getEmergencyPhoneAttribute()
    {
        return $this->emergency_contact['phone'] ?? null;
    }

    public function getEmergencyRelationshipAttribute()
    {
        return $this->emergency_contact['relationship'] ?? null;
    }
}