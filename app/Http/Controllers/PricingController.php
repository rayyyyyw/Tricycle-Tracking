<?php

namespace App\Http\Controllers;

use App\Models\PricingRule;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PricingController extends Controller
{
    /**
     * Calculate fare for a ride (API endpoint).
     */
    public function calculateFare(Request $request)
    {
        $validated = $request->validate([
            'distance_km' => 'required|numeric|min:0',
            'duration_minutes' => 'nullable|numeric|min:0',
            'ride_type' => 'required|string|in:regular,special,delivery',
        ]);

        $distanceKm = $validated['distance_km'];
        $durationMinutes = $validated['duration_minutes'] ?? 0;
        $rideType = $validated['ride_type'];

        // Get applicable pricing rule
        $pricingRule = PricingRule::getApplicableRule($rideType);

        if (!$pricingRule) {
            return response()->json([
                'error' => 'No pricing rule found for ride type: ' . $rideType
            ], 404);
        }

        // Calculate fare
        $fare = $pricingRule->calculateFare($distanceKm, $durationMinutes);
        
        // Get surge status
        $surgeActive = $pricingRule->surge_multiplier_percent > 0;
        $peakHourActive = $pricingRule->isPeakHour();

        return response()->json([
            'success' => true,
            'fare' => round($fare, 2),
            'breakdown' => [
                'base_fare' => (float) $pricingRule->base_fare,
                'distance_fare' => round($distanceKm * $pricingRule->per_km_rate, 2),
                'time_fare' => $pricingRule->per_minute_rate ? round($durationMinutes * $pricingRule->per_minute_rate, 2) : 0,
                'surge_percent' => $pricingRule->surge_multiplier_percent,
                'peak_hour_percent' => $peakHourActive ? $pricingRule->peak_hour_multiplier_percent : 0,
                'minimum_fare' => (float) $pricingRule->minimum_fare,
            ],
            'surge_active' => $surgeActive,
            'peak_hour_active' => $peakHourActive,
            'ride_type' => $rideType,
        ]);
    }

    /**
     * Display pricing rules management page (Admin).
     */
    public function index()
    {
        $pricingRules = PricingRule::orderBy('priority', 'desc')
            ->orderBy('ride_type')
            ->get();

        // Calculate demand statistics
        $recentBookingsCount = Booking::where('created_at', '>=', now()->subHour())
            ->count();
        
        $activeDriversCount = \App\Models\User::where('role', 'driver')
            ->where('is_online', true)
            ->count();
        
        $demandLevel = $this->calculateDemandLevel($recentBookingsCount, $activeDriversCount);

        return Inertia::render('Admin/Pricing', [
            'pricingRules' => $pricingRules,
            'demandStats' => [
                'recent_bookings' => $recentBookingsCount,
                'active_drivers' => $activeDriversCount,
                'demand_level' => $demandLevel,
            ],
        ]);
    }

    /**
     * Store new pricing rule.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ride_type' => 'required|string|in:regular,special,delivery',
            'base_fare' => 'required|numeric|min:0',
            'per_km_rate' => 'required|numeric|min:0',
            'per_minute_rate' => 'nullable|numeric|min:0',
            'minimum_fare' => 'required|numeric|min:0',
            'surge_multiplier_percent' => 'nullable|integer|min:0|max:300',
            'peak_hour_start' => 'nullable|date_format:H:i',
            'peak_hour_end' => 'nullable|date_format:H:i',
            'peak_hour_multiplier_percent' => 'nullable|integer|min:0|max:100',
            'is_active' => 'boolean',
            'priority' => 'nullable|integer',
        ]);

        PricingRule::create($validated);

        return back()->with('success', 'Pricing rule created successfully');
    }

    /**
     * Update pricing rule.
     */
    public function update(Request $request, PricingRule $pricingRule)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ride_type' => 'required|string|in:regular,special,delivery',
            'base_fare' => 'required|numeric|min:0',
            'per_km_rate' => 'required|numeric|min:0',
            'per_minute_rate' => 'nullable|numeric|min:0',
            'minimum_fare' => 'required|numeric|min:0',
            'surge_multiplier_percent' => 'nullable|integer|min:0|max:300',
            'peak_hour_start' => 'nullable|date_format:H:i',
            'peak_hour_end' => 'nullable|date_format:H:i',
            'peak_hour_multiplier_percent' => 'nullable|integer|min:0|max:100',
            'is_active' => 'boolean',
            'priority' => 'nullable|integer',
        ]);

        $pricingRule->update($validated);

        return back()->with('success', 'Pricing rule updated successfully');
    }

    /**
     * Toggle surge pricing.
     */
    public function toggleSurge(Request $request, PricingRule $pricingRule)
    {
        $validated = $request->validate([
            'surge_multiplier_percent' => 'required|integer|min:0|max:300',
        ]);

        $pricingRule->update([
            'surge_multiplier_percent' => $validated['surge_multiplier_percent'],
        ]);

        return back()->with('success', 'Surge pricing updated');
    }

    /**
     * Delete pricing rule.
     */
    public function destroy(PricingRule $pricingRule)
    {
        $pricingRule->delete();
        return back()->with('success', 'Pricing rule deleted successfully');
    }

    /**
     * Calculate demand level.
     */
    private function calculateDemandLevel($bookings, $drivers)
    {
        if ($drivers == 0) return 'very_high';
        
        $ratio = $bookings / max($drivers, 1);
        
        if ($ratio >= 3) return 'very_high';
        if ($ratio >= 2) return 'high';
        if ($ratio >= 1) return 'medium';
        return 'low';
    }
}
