<?php

use App\Http\Controllers\TricycleManagmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Admin dashboard
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Passenger dashboard ← ADD THIS ROUTE
    Route::get('passenger/dashboard', function () {
        return Inertia::render('PassengerSide/Index');
    })->name('passenger.dashboard');
});

// Tricycle Management
Route::get('/TricycleM', [TricycleManagmentController::class, 'index'])->name('TricycleM.Index');

require __DIR__.'/settings.php';