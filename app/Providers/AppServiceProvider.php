<?php

namespace App\Providers;

use App\Support\MaintenanceMode;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

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

        // Failsafe: turn off maintenance when an admin logs out
        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user && $event->user->role === 'admin') {
                MaintenanceMode::disable();
            }
        });
    }
}
