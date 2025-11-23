<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NavAdmin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'avatar',
        'settings',
        'theme',
        'notification_preferences',
    ];

    protected $casts = [
        'settings' => 'array',
        'notification_preferences' => 'array',
    ];

    /**
     * Get the user that owns the admin profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the avatar URL.
     */
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        
        return null;
    }

    /**
     * Get notification preferences with defaults.
     */
    public function getNotificationPreferencesAttribute($value)
    {
        $defaults = [
            'email' => true,
            'push' => true,
            'security_alerts' => true,
            'system_updates' => true,
        ];

        if (!empty($value) && is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return array_merge($defaults, $decoded);
            }
        }

        return $defaults;
    }

    /**
     * Get settings with defaults.
     */
    public function getSettingsAttribute($value)
    {
        $defaults = [
            'theme' => 'system',
            'language' => 'en',
            'profile_visibility' => 'private',
            'data_collection' => true,
        ];

        if (!empty($value) && is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return array_merge($defaults, $decoded);
            }
        }

        return $defaults;
    }

    /**
     * Set notification preferences attribute.
     */
    public function setNotificationPreferencesAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['notification_preferences'] = json_encode($value);
        } else {
            $this->attributes['notification_preferences'] = $value;
        }
    }

    /**
     * Set settings attribute.
     */
    public function setSettingsAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['settings'] = json_encode($value);
        } else {
            $this->attributes['settings'] = $value;
        }
    }

    /**
     * Scope for admin users.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Create or update admin profile.
     */
    public static function updateOrCreateForUser($userId, $data)
    {
        return static::updateOrCreate(
            ['user_id' => $userId],
            $data
        );
    }
}