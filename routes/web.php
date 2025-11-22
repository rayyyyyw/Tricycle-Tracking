<?php

use App\Http\Controllers\TricycleManagmentController;
use App\Http\Controllers\UserPassengerController;
use App\Http\Controllers\UserDriverController;
use App\Http\Controllers\PassengerController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\BecomeDriverController;
use App\Http\Controllers\AdminProfileController;
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
        
        // Admin Profile Routes
        Route::get('/AdminNav/Profile', [AdminProfileController::class, 'profile'])->name('admin.profile');
        Route::get('/AdminNav/Settings', [AdminProfileController::class, 'settings'])->name('admin.settings');
        Route::patch('/AdminNav/Profile', [AdminProfileController::class, 'updateProfile'])->name('admin.profile.update');
        Route::patch('/AdminNav/Settings', [AdminProfileController::class, 'updateSettings'])->name('admin.settings.update');
        
        // Tricycle Management
        Route::get('/TricycleM', [TricycleManagmentController::class, 'index'])->name('TricycleM.Index');

        // Passenger Management
        Route::get('/PassengerM', [UserPassengerController::class, 'index'])->name('PassengerM.Index');

        // Driver Management
        Route::get('/DriverM', [UserDriverController::class, 'index'])->name('DriverM.Index');

        // Driver Applications Management
        Route::get('/DriverM/Application', [UserDriverController::class, 'applications'])->name('DriverM.Application');
        Route::patch('/DriverM/Application/{application}', [UserDriverController::class, 'updateApplication'])->name('DriverM.Application.update');

        require __DIR__.'/settings.php';
    });

    // Passenger-only routes
    Route::middleware(['role:passenger'])->group(function () {
        Route::get('passenger/dashboard', [PassengerController::class, 'dashboard'])
             ->name('passenger.dashboard');

        // Book Ride
        Route::get('/BookRide', [PassengerController::class, 'index'])->name('BookRide.Index');
             
        // Settings routes
        Route::get('PassengerSide/settings', [PassengerController::class, 'settings'])
             ->name('PassengerSide.settings');

        // Profile route
        Route::get('PassengerSide/profile', [PassengerController::class, 'profile'])
            ->name('PassengerSide.profile');
             
        // ADD SAVE ROUTES FOR BOTH PERSONAL INFO AND EMERGENCY CONTACT
        Route::patch('passenger/profile', [PassengerController::class, 'updateProfile'])
             ->name('passenger.profile.update');
             
        Route::patch('passenger/emergency-contact', [PassengerController::class, 'updateEmergencyContact'])
             ->name('passenger.emergency-contact.update');
             
        // FIXED: Add separate DELETE route for account deletion
        Route::delete('passenger/profile', [PassengerController::class, 'destroy'])
             ->name('passenger.profile.destroy');
    });

    // Driver Application Routes (Available to all authenticated users)
    Route::get('/become-driver', [BecomeDriverController::class, 'create'])->name('become-driver.create');
    Route::post('/become-driver', [BecomeDriverController::class, 'store'])->name('become-driver.store');
    Route::get('/application-status', [BecomeDriverController::class, 'status'])->name('application.status');

    // Driver-only routes
    Route::middleware(['role:driver'])->group(function () {
        Route::get('driver/dashboard', [DriverController::class, 'dashboard'])
             ->name('driver.dashboard');
    });
});