<?php

namespace App\Http\Middleware;

use App\Models\NavAdmin;
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
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'address' => $request->user()->address,
                    'avatar' => $request->user()->avatar_url,
                    'role' => $request->user()->role,
                    'has_pending_driver_application' => $request->user()->hasPendingDriverApplication(),
                    'is_driver' => $request->user()->isDriver(),
                    'emergency_contact' => $request->user()->emergency_contact,
                    'emergency_name' => $request->user()->emergency_name,
                    'emergency_phone' => $request->user()->emergency_phone,
                    'emergency_relationship' => $request->user()->emergency_relationship,
                    'email_verified_at' => $request->user()->email_verified_at,
                    'two_factor_enabled' => $request->user()->two_factor_enabled,
                    'created_at' => $request->user()->created_at,
                    'updated_at' => $request->user()->updated_at,
                ] : null,
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
        ];
    }
}