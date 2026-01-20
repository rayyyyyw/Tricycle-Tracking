<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PricingRule;

class PricingRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PricingRule::create([
            'name' => 'Regular Ride - Standard Rate',
            'ride_type' => 'regular',
            'base_fare' => 20.00,
            'per_km_rate' => 10.00,
            'per_minute_rate' => 2.00,
            'minimum_fare' => 30.00,
            'surge_multiplier_percent' => 0,
            'peak_hour_start' => '07:00:00',
            'peak_hour_end' => '09:00:00',
            'peak_hour_multiplier_percent' => 20,
            'is_active' => true,
            'priority' => 10,
        ]);

        PricingRule::create([
            'name' => 'Regular Ride - Evening Peak',
            'ride_type' => 'regular',
            'base_fare' => 20.00,
            'per_km_rate' => 10.00,
            'per_minute_rate' => 2.00,
            'minimum_fare' => 30.00,
            'surge_multiplier_percent' => 0,
            'peak_hour_start' => '17:00:00',
            'peak_hour_end' => '19:00:00',
            'peak_hour_multiplier_percent' => 25,
            'is_active' => true,
            'priority' => 10,
        ]);

        PricingRule::create([
            'name' => 'Special Ride - Premium Service',
            'ride_type' => 'special',
            'base_fare' => 50.00,
            'per_km_rate' => 15.00,
            'per_minute_rate' => 3.00,
            'minimum_fare' => 70.00,
            'surge_multiplier_percent' => 0,
            'is_active' => true,
            'priority' => 5,
        ]);

        PricingRule::create([
            'name' => 'Delivery Service',
            'ride_type' => 'delivery',
            'base_fare' => 30.00,
            'per_km_rate' => 12.00,
            'per_minute_rate' => 1.50,
            'minimum_fare' => 40.00,
            'surge_multiplier_percent' => 0,
            'is_active' => true,
            'priority' => 5,
        ]);
    }
}
