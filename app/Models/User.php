<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'avatar', // Keep this for profile avatars
        'settings', // Keep this for user settings
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
            'settings' => 'array', // Keep this
        ];
    }

    // Add driver application relationship
    public function driverApplication(): HasOne
    {
        return $this->hasOne(DriverApplication::class);
    }

    // Add approved driver application relationship
    public function approvedDriverApplication(): HasOne
    {
        return $this->hasOne(DriverApplication::class)->where('status', 'approved');
    }

    // Add NavAdmin relationship
    public function navAdmin(): HasOne
    {
        return $this->hasOne(NavAdmin::class);
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

    // Check if user has approved driver application
    public function hasApprovedDriverApplication(): bool
    {
        return $this->driverApplication && $this->driverApplication->status === 'approved';
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

    // Check if user has admin profile
    public function hasAdminProfile(): bool
    {
        return $this->navAdmin !== null;
    }

    // Get admin avatar URL
    public function getAdminAvatarUrlAttribute()
    {
        return $this->navAdmin?->avatar_url;
    }

    // Get admin settings
    public function getAdminSettingsAttribute()
    {
        return $this->navAdmin?->settings ?? [
            'theme' => 'system',
            'language' => 'en',
            'profile_visibility' => 'private',
            'data_collection' => true,
        ];
    }

    // Get admin notification preferences
    public function getAdminNotificationPreferencesAttribute()
    {
        return $this->navAdmin?->notification_preferences ?? [
            'email' => true,
            'push' => true,
            'security_alerts' => true,
            'system_updates' => true,
        ];
    }

    // Get avatar URL
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return \Illuminate\Support\Facades\Storage::url($this->avatar);
        }
        return null;
    }

    // Get driver information from approved application
    public function getDriverInfoAttribute()
    {
        if (!$this->hasApprovedDriverApplication()) {
            return null;
        }

        return [
            'license_number' => $this->driverApplication->license_number,
            'vehicle_type' => $this->driverApplication->vehicle_type,
            'vehicle_plate' => $this->driverApplication->vehicle_plate_number,
            'vehicle_year' => $this->driverApplication->vehicle_year,
            'vehicle_color' => $this->driverApplication->vehicle_color,
            'vehicle_model' => $this->driverApplication->vehicle_model,
            'license_expiry' => $this->driverApplication->license_expiry,
        ];
    }
}