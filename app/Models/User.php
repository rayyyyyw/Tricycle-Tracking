<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne; // ADD THIS

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email', 
        'password',
        'role',
        'phone',
        'address',
        'emergency_contact',
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
            'emergency_contact' => 'array',
        ];
    }

    // Add driver application relationship
    public function driverApplication(): HasOne
    {
        return $this->hasOne(DriverApplication::class);
    }

    // Helper methods
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

    // Check if user has pending driver application
    public function hasPendingDriverApplication(): bool
    {
        return $this->driverApplication && $this->driverApplication->status === 'pending';
    }

    // Check if user can apply to become driver
    public function canBecomeDriver(): bool
    {
        return $this->isPassenger() && !$this->hasPendingDriverApplication();
    }

    // Emergency contact helpers
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