<?php
// app/Models/DriverApplication.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'documents' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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
}