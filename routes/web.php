<?php

use App\Http\Controllers\TricycleManagmentController;
use App\Http\Controllers\UserPassengerController;
use App\Http\Controllers\UserDriverController;
use App\Http\Controllers\PassengerController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\BecomeDriverController;
use App\Http\Controllers\AdminProfileController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Notification routes (available to all authenticated users)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        // Admin Profile Routes
        Route::get('/AdminNav/Profile', [AdminProfileController::class, 'profile'])->name('admin.profile');
        Route::get('/AdminNav/Settings', [AdminProfileController::class, 'settings'])->name('admin.settings');
        Route::post('/AdminNav/Profile', [AdminProfileController::class, 'updateProfile'])->name('admin.profile.update');
        Route::put('/AdminNav/Settings', [AdminProfileController::class, 'updateSettings'])->name('admin.settings.update');
        
        // Tricycle Management
        Route::get('/TricycleM', [TricycleManagmentController::class, 'index'])->name('TricycleM.Index');

        // Passenger Management
        Route::get('/PassengerM', [UserPassengerController::class, 'index'])->name('PassengerM.Index');
        // Passenger routes
        Route::post('/passengers/{user}/toggle-status', [UserPassengerController::class, 'toggleStatus'])->name('passengers.toggle-status');

        // Driver Management
        Route::get('/DriverM', [UserDriverController::class, 'index'])->name('DriverM.Index');
        Route::put('/drivers/{driver}/status', [UserDriverController::class, 'updateDriverStatus'])->name('drivers.update-status');
        Route::delete('/drivers/{driver}', [UserDriverController::class, 'destroy'])->name('drivers.destroy');

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
        
        // Booking routes
        Route::post('/bookings', [\App\Http\Controllers\BookingController::class, 'store'])->name('bookings.store');
        Route::post('/bookings/{booking}/cancel', [\App\Http\Controllers\BookingController::class, 'cancel'])->name('bookings.cancel');
        Route::post('/bookings/{booking}/review', [\App\Http\Controllers\ReviewController::class, 'store'])->name('bookings.review');
        
        // Ride History
        Route::get('/passenger/ride-history', [PassengerController::class, 'rideHistory'])->name('passenger.ride-history');
        
        // Payment Methods
        Route::get('/passenger/payment-methods', [PassengerController::class, 'paymentMethods'])->name('passenger.payment-methods');
        
        // Support
        Route::get('/passenger/support', [PassengerController::class, 'support'])->name('passenger.support');
        
        // Safety
        Route::get('/passenger/safety', [PassengerController::class, 'safety'])->name('passenger.safety');
             
        // Settings routes
        Route::get('PassengerSide/settings', [PassengerController::class, 'settings'])
             ->name('PassengerSide.settings');

        // Profile route
        Route::get('PassengerSide/profile', [PassengerController::class, 'profile'])
            ->name('PassengerSide.profile');
             
        // Profile update routes
        Route::patch('passenger/profile', [PassengerController::class, 'updateProfile'])
             ->name('passenger.profile.update');
             
        Route::patch('passenger/emergency-contact', [PassengerController::class, 'updateEmergencyContact'])
             ->name('passenger.emergency-contact.update');
        
        // Avatar routes
        Route::post('passenger/profile', [PassengerController::class, 'updateAvatar'])
             ->name('passenger.avatar.update');
             
        Route::delete('passenger/profile', [PassengerController::class, 'deleteAvatar'])
             ->name('passenger.avatar.delete');
             
        // Account deletion
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

        // Driver Bookings Page
        Route::get('driver/bookings', [DriverController::class, 'bookings'])
             ->name('driver.bookings');

        // Driver Earnings Page
        Route::get('driver/earnings', [DriverController::class, 'earnings'])
             ->name('driver.earnings');

        // Driver Ride History Page
        Route::get('driver/ride-history', [DriverController::class, 'rideHistory'])
             ->name('driver.ride-history');

        // Driver Analytics Page
        Route::get('driver/analytics', [DriverController::class, 'analytics'])
             ->name('driver.analytics');
        
        // Driver Messages Page
        Route::get('driver/messages', [DriverController::class, 'messages'])
             ->name('driver.messages');
        
        // Driver Safety Page
        Route::get('driver/safety', [DriverController::class, 'safety'])
             ->name('driver.safety');

        // Driver Profile Routes
        Route::get('DriverSide/Profile', [DriverController::class, 'profile'])
             ->name('DriverSide.Profile');
        Route::post('DriverSide/Profile', [DriverController::class, 'updateProfile'])
             ->name('DriverSide.profile.update');

        // Driver Settings Routes
        Route::get('DriverSide/Settings', [DriverController::class, 'settings'])
             ->name('DriverSide.Settings');
        Route::put('DriverSide/Settings', [DriverController::class, 'updateSettings'])
             ->name('DriverSide.settings.update');
        Route::delete('DriverSide/Settings', [DriverController::class, 'destroy'])
             ->name('driver.settings.destroy');
        
        // Booking routes for drivers
        Route::get('/bookings', [\App\Http\Controllers\BookingController::class, 'index'])->name('bookings.index');
        Route::post('/bookings/{booking}/accept', [\App\Http\Controllers\BookingController::class, 'accept'])->name('bookings.accept');
        Route::post('/bookings/{booking}/complete', [\App\Http\Controllers\BookingController::class, 'complete'])->name('bookings.complete');
        Route::get('/bookings/{booking}', [\App\Http\Controllers\BookingController::class, 'show'])->name('bookings.show');
    });
});