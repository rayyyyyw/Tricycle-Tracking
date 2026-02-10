<?php

namespace App\Providers;

use App\Support\MaintenanceMode;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS URLs in production to fix mixed content
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // When a driver logs in, set them online automatically so passengers see them as available
        Event::listen(Login::class, function (Login $event): void {
            if ($event->user && $event->user->role === 'driver') {
                $event->user->update([
                    'is_online' => true,
                    'last_activity_at' => now(),
                ]);
            }
        });

        // Failsafe: turn off maintenance when an admin logs out
        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user && $event->user->role === 'admin') {
                MaintenanceMode::disable();
            }
            // When a driver logs out, set them offline so passengers only see actually logged-in drivers
            if ($event->user && $event->user->role === 'driver') {
                $event->user->update([
                    'is_online' => false,
                    'last_activity_at' => null,
                ]);
            }
        });
    }
}
