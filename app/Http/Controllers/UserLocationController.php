<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserLocationController extends Controller
{
    /**
     * Update the authenticated user's last known location (for admin map).
     */
    public function update(Request $request)
    {
        $validated = Validator::make($request->only(['latitude', 'longitude']), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ])->validate();

        $user = $request->user();
        $user->last_latitude = $validated['latitude'];
        $user->last_longitude = $validated['longitude'];
        $user->last_location_at = now();
        $user->save();

        return response()->json(['ok' => true]);
    }
}
