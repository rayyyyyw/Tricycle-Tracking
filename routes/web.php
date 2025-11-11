<?php

use App\Http\Controllers\TricycleManagmentController;
use App\Http\Controllers\UserPassengerController;
use App\Http\Controllers\PassengerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');
        
        // Tricycle Management
        Route::get('/TricycleM', [TricycleManagmentController::class, 'index'])->name('TricycleM.Index');

        // Passenger Management
        Route::get('/PassengerM', [UserPassengerController::class, 'index'])->name('PassengerM.Index');

        require __DIR__.'/settings.php';
    });

    // Passenger-only routes
    Route::middleware(['role:passenger'])->group(function () {
        Route::get('passenger/dashboard', [PassengerController::class, 'dashboard'])
             ->name('passenger.dashboard');
             
        // FIX: Use controller method instead of closure
        Route::get('PassengerSide/settings', [PassengerController::class, 'settings'])
             ->name('PassengerSide.settings');
             
        // ADD SAVE ROUTES FOR BOTH PERSONAL INFO AND EMERGENCY CONTACT
        Route::patch('passenger/profile', [PassengerController::class, 'updateProfile'])
             ->name('passenger.profile.update');
             
        Route::patch('passenger/emergency-contact', [PassengerController::class, 'updateEmergencyContact'])
             ->name('passenger.emergency-contact.update');
    });
});