<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'passenger_id',
        'driver_id',
        'ride_type',
        'passenger_count',
        'pickup_lat',
        'pickup_lng',
        'pickup_address',
        'pickup_barangay',
        'pickup_purok',
        'destination_lat',
        'destination_lng',
        'destination_address',
        'destination_barangay',
        'destination_purok',
        'distance',
        'duration',
        'fare',
        'total_fare',
        'estimated_arrival',
        'passenger_name',
        'passenger_phone',
        'special_instructions',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'status',
        'booking_id',
        'accepted_at',
        'completed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'pickup_lat' => 'decimal:8',
        'pickup_lng' => 'decimal:8',
        'destination_lat' => 'decimal:8',
        'destination_lng' => 'decimal:8',
        'fare' => 'decimal:2',
        'total_fare' => 'decimal:2',
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function passenger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
