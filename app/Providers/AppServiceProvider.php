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
            } elseif ($event->user) {
                // For all other users (passengers, admins), just update last_activity_at
                $event->user->update(['last_activity_at' => now()]);
            }
        });

        // Failsafe: turn off maintenance when an admin logs out
        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user && $event->user->role === 'admin') {
                MaintenanceMode::disable();
            }
            // When any user logs out, mark them offline immediately
            // Set last_activity_at to 6 minutes ago so they appear offline right away
            // but we still keep the timestamp to show "Active X ago"
            if ($event->user) {
                $logoutTime = now()->subMinutes(6); // 6 minutes ago to ensure they're outside the 5-minute window

                if ($event->user->role === 'driver') {
                    // For drivers, set is_online to false and update last_activity_at
                    $event->user->update([
                        'is_online' => false,
                        'last_activity_at' => $logoutTime, // Set to 6 minutes ago so they appear offline immediately
                    ]);
                } else {
                    // For passengers, set last_activity_at to 6 minutes ago
                    // This makes them appear offline immediately while preserving the logout time
                    $event->user->update([
                        'last_activity_at' => $logoutTime, // Set to 6 minutes ago so they appear offline immediately
                    ]);
                }
            }
        });
    }
}
