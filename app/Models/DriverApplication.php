<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DriverApplication extends Model
{
    protected $fillable = [
        'user_id',
        'license_number',
        'license_expiry',
        'vehicle_type',
        'vehicle_plate_number',
        'vehicle_year',
        'vehicle_color',
        'vehicle_model',
        'documents',
        'status',
        'admin_notes',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'application_attempt',
        'previous_application_id',
        'reapplied_at',
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'documents' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'reapplied_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Relationship to get ALL applications by the same user (including current one)
    public function allUserApplications(): HasMany
    {
        return $this->hasMany(DriverApplication::class, 'user_id', 'user_id')
            ->orderBy('created_at', 'desc');
    }

    // Relationship to get previous applications by the same user (excluding current one)
    public function previousApplications(): HasMany
    {
        return $this->hasMany(DriverApplication::class, 'user_id', 'user_id')
            ->where('id', '!=', $this->id)
            ->orderBy('created_at', 'desc');
    }

    // Scope for pending applications
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Check if application is pending
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // Check if user can apply (no pending application)
    public static function canApply($userId): bool
    {
        return !self::where('user_id', $userId)
            ->whereIn('status', ['pending'])
            ->exists();
    }

    // Calculate application attempt number
    public function getApplicationAttemptAttribute(): int
    {
        return $this->allUserApplications()
            ->where('created_at', '<=', $this->created_at)
            ->count();
    }
}