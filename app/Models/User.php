<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'facebook_id',
        'email_verified_at',
        'role',
        'phone',
        'address',
        'emergency_contact',
        'avatar',
        'settings',
        'driver_status',
        'status',
        'is_online',
        'last_activity_at',
        'last_latitude',
        'last_longitude',
        'last_location_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'avatar_url',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'last_location_at' => 'datetime',
            'password' => 'hashed',
            'emergency_contact' => 'array',
            'settings' => 'array',
        ];
    }

    // Change to HasMany since users can have multiple applications
    public function driverApplications(): HasMany
    {
        return $this->hasMany(DriverApplication::class);
    }

    // Get the latest driver application
    public function latestDriverApplication(): HasOne
    {
        return $this->hasOne(DriverApplication::class)->latest();
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

    // FIXED: Check if user has pending driver application
    public function hasPendingDriverApplication(): bool
    {
        return $this->driverApplications()
            ->where('status', 'pending')
            ->exists();
    }

    // Check if user has approved driver application
    public function hasApprovedDriverApplication(): bool
    {
        return $this->driverApplications()
            ->where('status', 'approved')
            ->exists();
    }

    // Check if user can apply to become driver
    public function canBecomeDriver(): bool
    {
        return $this->isPassenger() && ! $this->hasPendingDriverApplication();
    }

    // Get the latest application status
    public function getDriverApplicationStatusAttribute()
    {
        $latestApplication = $this->driverApplications()
            ->latest()
            ->first();

        return $latestApplication ? $latestApplication->status : null;
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

    // Get avatar URL (admin uses NavAdmin avatar; others use public disk so R2 works when FILESYSTEM_DISK=s3)
    public function getAvatarUrlAttribute()
    {
        if ($this->role === 'admin') {
            return $this->navAdmin?->avatar_url;
        }
        if (empty($this->avatar)) {
            return null;
        }
        try {
            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = \Illuminate\Support\Facades\Storage::disk('public');

            return $disk->url(ltrim($this->avatar, '/'));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('User avatar_url failed', [
                'user_id' => $this->id,
                'avatar' => $this->avatar,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    // Get driver information from approved application
    public function getDriverInfoAttribute()
    {
        $approvedApplication = $this->driverApplications()
            ->where('status', 'approved')
            ->first();

        if (! $approvedApplication) {
            return null;
        }

        return [
            'license_number' => $approvedApplication->license_number,
            'vehicle_type' => $approvedApplication->vehicle_type,
            'vehicle_plate' => $approvedApplication->vehicle_plate_number,
            'vehicle_year' => $approvedApplication->vehicle_year,
            'vehicle_color' => $approvedApplication->vehicle_color,
            'vehicle_model' => $approvedApplication->vehicle_model,
            'license_expiry' => $approvedApplication->license_expiry,
            'driver_status' => $this->driver_status ?? 'active',
        ];
    }

    // Saved places relationship
    public function savedPlaces(): HasMany
    {
        return $this->hasMany(SavedPlace::class);
    }

    // Favorite drivers relationship (as passenger)
    public function favoriteDrivers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorite_drivers', 'passenger_id', 'driver_id')
            ->withTimestamps();
    }

    // Passengers who favorited this driver (as driver)
    public function favoritedByPassengers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorite_drivers', 'driver_id', 'passenger_id')
            ->withTimestamps();
    }

    // Bookings where user is the driver
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'driver_id');
    }

    // Bookings where user is the passenger
    public function passengerBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'passenger_id');
    }
}
