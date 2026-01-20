<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    protected $fillable = [
        'name',
        'ride_type',
        'base_fare',
        'per_km_rate',
        'per_minute_rate',
        'minimum_fare',
        'surge_multiplier_percent',
        'peak_hour_start',
        'peak_hour_end',
        'peak_hour_multiplier_percent',
        'is_active',
        'priority',
        'conditions',
    ];

    protected $casts = [
        'base_fare' => 'decimal:2',
        'per_km_rate' => 'decimal:2',
        'per_minute_rate' => 'decimal:2',
        'minimum_fare' => 'decimal:2',
        'is_active' => 'boolean',
        'conditions' => 'array',
    ];

    /**
     * Get the applicable pricing rule for a given ride type.
     */
    public static function getApplicableRule($rideType = 'regular')
    {
        return self::where('ride_type', $rideType)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->first();
    }

    /**
     * Calculate fare based on distance and time.
     */
    public function calculateFare($distanceKm, $durationMinutes = 0)
    {
        $baseFare = $this->base_fare;
        $distanceFare = $distanceKm * $this->per_km_rate;
        $timeFare = $this->per_minute_rate ? ($durationMinutes * $this->per_minute_rate) : 0;
        
        $totalFare = $baseFare + $distanceFare + $timeFare;
        
        // Apply surge pricing if set
        if ($this->surge_multiplier_percent > 0) {
            $totalFare = $totalFare * (1 + ($this->surge_multiplier_percent / 100));
        }
        
        // Apply peak hour pricing if applicable
        if ($this->isPeakHour() && $this->peak_hour_multiplier_percent > 0) {
            $totalFare = $totalFare * (1 + ($this->peak_hour_multiplier_percent / 100));
        }
        
        // Ensure minimum fare
        return max($totalFare, $this->minimum_fare);
    }

    /**
     * Check if current time is within peak hours.
     */
    public function isPeakHour()
    {
        if (!$this->peak_hour_start || !$this->peak_hour_end) {
            return false;
        }
        
        $now = now()->format('H:i:s');
        return $now >= $this->peak_hour_start && $now <= $this->peak_hour_end;
    }
}
