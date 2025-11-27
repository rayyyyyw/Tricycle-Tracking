<?php

namespace App\Http\Middleware;

use App\Models\NavAdmin;
use App\Models\DriverApplication;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? $this->getUserData($request->user()) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'adminProfile' => function () use ($request) {
                if ($request->user() && $request->user()->role === 'admin') {
                    // Get or create admin profile
                    return NavAdmin::firstOrCreate(
                        ['user_id' => $request->user()->id],
                        [
                            'theme' => 'system',
                            'settings' => [],
                            'notification_preferences' => [],
                        ]
                    );
                }
                return null;
            },
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }

    /**
     * Get user data with fresh driver application status
     */
    private function getUserData($user): array
    {
        // Force fresh query to get the latest application status
        $hasPendingApplication = DriverApplication::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        $latestApplication = DriverApplication::where('user_id', $user->id)
            ->latest()
            ->first();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'avatar' => $user->avatar_url,
            'role' => $user->role,
            'has_pending_driver_application' => $hasPendingApplication,
            'is_driver' => $user->role === 'driver',
            'driver_application_status' => $latestApplication ? $latestApplication->status : null, // Add this
            'emergency_contact' => $user->emergency_contact,
            'emergency_name' => $user->emergency_name,
            'emergency_phone' => $user->emergency_phone,
            'emergency_relationship' => $user->emergency_relationship,
            'email_verified_at' => $user->email_verified_at,
            'two_factor_enabled' => $user->two_factor_enabled,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }
}