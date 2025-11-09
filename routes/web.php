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

Route::middleware(['auth'])->group(function () { // REMOVE 'verified'
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');
        
        // Tricycle Management
        Route::get('/TricycleM', [TricycleManagmentController::class, 'index'])->name('TricycleM.Index');


        // Passenger Management
        Route::get('/PassengerM', [UserPassengerController::class, 'index'])->name('PassengerM.Index');
    });




    // Passenger-only routes
    Route::middleware(['role:passenger'])->group(function () {
        Route::get('passenger/dashboard', [PassengerController::class, 'dashboard'])
             ->name('passenger.dashboard');
    });
});

require __DIR__.'/settings.php';