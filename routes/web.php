<?php

use App\Http\Controllers\AdminActivityLogController;
use App\Http\Controllers\AdminBookingsController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminProfileController;
use App\Http\Controllers\AdminRatingsController;
use App\Http\Controllers\Auth\FacebookAuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\BecomeDriverController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PassengerController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\TricycleManagmentController;
use App\Http\Controllers\UserDriverController;
use App\Http\Controllers\UserPassengerController;
use App\Models\LandingPageContent;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $landing = LandingPageContent::get();

    // Fetch 3 feedbacks: 1 per user, each user's best (highest-rated) feedback
    $feedbacks = \App\Models\Feedback::with('user')
        ->whereNotNull('feedback')
        ->where('feedback', '!=', '')
        ->latest()
        ->get()
        ->groupBy('user_id')
        ->map(fn ($group) => $group->sortByDesc('rating')->first())
        ->sortByDesc('rating')
        ->take(3)
        ->values()
        ->map(function ($feedback) {
            $user = $feedback->user;
            $avatar = $user?->avatar_url ?? null;

            return [
                'id' => $feedback->id,
                'name' => $user?->name ?? 'Anonymous',
                'avatar' => $avatar,
                'role' => ucfirst($feedback->user_role),
                'company' => 'TriGo User',
                'content' => $feedback->feedback ?? 'Great TriGo experience!',
                'rating' => (int) $feedback->rating,
            ];
        })
        ->values()
        ->all();

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'landingAbout' => [
            'title' => $landing->about_title,
            'subtitle' => $landing->about_subtitle,
            'paragraphs' => $landing->about_paragraphs ?? [],
            'highlights' => $landing->about_highlights ?? [],
        ],
        'landingTeam' => [
            'subtitle' => $landing->team_subtitle,
            'members' => collect($landing->team_members ?? [])->map(function ($m) {
                $avatar = $m['avatar'] ?? null;
                if ($avatar && (str_starts_with($avatar, 'http') || str_starts_with($avatar, '/'))) {
                    return $m;
                }
                if ($avatar && (preg_match('/\.(jpe?g|png|gif|webp)$/i', $avatar) || str_starts_with($avatar, 'team-members/'))) {
                    $m['avatar'] = asset('storage/'.ltrim($avatar, '/'));
                }

                return $m;
            })->values()->all(),
        ],
        'landingFeatures' => $landing->features ?? [],
        'landingHowItWorks' => $landing->how_it_works ?? [],
        'landingReviews' => $feedbacks,
    ]);
})->name('home');

// Google OAuth (guest only)
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

// Facebook OAuth (guest only)
Route::get('/auth/facebook', [FacebookAuthController::class, 'redirect'])->name('auth.facebook');
Route::get('/auth/facebook/callback', [FacebookAuthController::class, 'callback'])->name('auth.facebook.callback');

Route::middleware(['auth'])->group(function () {
    // Deactivated users can contact admin (allowed even when account is deactivated)
    Route::post('/deactivated-contact', [SupportController::class, 'storeFromDeactivated'])->name('deactivated-contact');

    // Notification routes (available to all authenticated users)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::get('/notifications/unread-message-count', [NotificationController::class, 'unreadMessageCount'])->name('notifications.unread-message-count');
    Route::get('/notifications/messages', [NotificationController::class, 'messageNotifications'])->name('notifications.messages');
    Route::post('/notifications/mark-all-messages-read', [NotificationController::class, 'markAllMessagesAsRead'])->name('notifications.mark-all-messages-read');
    Route::delete('/notifications/messages', [NotificationController::class, 'destroyAllMessages'])->name('notifications.destroy-all-messages');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])->name('notifications.destroy-all');

    // Pricing API (available to all authenticated users)
    Route::post('/api/calculate-fare', [\App\Http\Controllers\PricingController::class, 'calculateFare'])->name('api.calculate-fare');

    // Booking chat (passenger/driver only; controller enforces access)
    Route::get('/api/bookings/{booking}/chat-token', [\App\Http\Controllers\BookingChatController::class, 'token'])->name('api.bookings.chat-token');
    Route::get('/api/bookings/{booking}/messages', [\App\Http\Controllers\BookingChatController::class, 'index'])->name('api.bookings.messages');
    Route::post('/api/bookings/{booking}/messages/upload-image', [\App\Http\Controllers\BookingChatController::class, 'uploadImage'])->name('api.bookings.messages.upload-image');
    Route::post('/api/bookings/{booking}/messages/mark-delivered', [\App\Http\Controllers\BookingChatController::class, 'markDelivered'])->name('api.bookings.messages.mark-delivered');
    Route::post('/api/bookings/{booking}/messages/mark-read', [\App\Http\Controllers\BookingChatController::class, 'markRead'])->name('api.bookings.messages.mark-read');
    Route::get('/api/bookings/{booking}/status', [\App\Http\Controllers\BookingController::class, 'status'])->name('api.bookings.status');

    // Messaging routes (available to drivers and passengers)
    Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store'])->name('messages.store');
    Route::post('/messages/{message}/read', [\App\Http\Controllers\MessageController::class, 'markAsRead'])->name('messages.read');
    Route::get('/messages/conversation/{userId}', [\App\Http\Controllers\MessageController::class, 'getConversation'])->name('messages.conversation');

    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Admin Profile Routes
        Route::get('/AdminNav/Profile', [AdminProfileController::class, 'profile'])->name('admin.profile');
        Route::get('/AdminNav/Settings', [AdminProfileController::class, 'settings'])->name('admin.settings');
        Route::post('/AdminNav/Profile', [AdminProfileController::class, 'updateProfile'])->name('admin.profile.update');
        Route::put('/AdminNav/Settings', [AdminProfileController::class, 'updateSettings'])->name('admin.settings.update');
        Route::post('/admin/settings/maintenance', [AdminProfileController::class, 'toggleMaintenance'])->name('admin.settings.maintenance');
        Route::match(['put', 'post'], '/admin/settings/landing-page', [AdminProfileController::class, 'updateLandingPage'])->name('admin.settings.landing-page');
        Route::post('/admin/settings/team-member-image', [AdminProfileController::class, 'uploadTeamMemberImage'])->name('admin.settings.team-member-image');

        // Tricycle Management
        Route::get('/TricycleM', [TricycleManagmentController::class, 'index'])->name('TricycleM.Index');

        // Passenger Management
        Route::get('/PassengerM', [UserPassengerController::class, 'index'])->name('PassengerM.Index');
        // Passenger routes
        Route::post('/passengers/{user}/toggle-status', [UserPassengerController::class, 'toggleStatus'])->name('passengers.toggle-status');
        Route::delete('/passengers/{user}', [UserPassengerController::class, 'destroy'])->name('passengers.destroy');

        // Driver Management
        Route::get('/DriverM', [UserDriverController::class, 'index'])->name('DriverM.Index');
        Route::put('/drivers/{driver}/status', [UserDriverController::class, 'updateDriverStatus'])->name('drivers.update-status');
        Route::delete('/drivers/{driver}', [UserDriverController::class, 'destroy'])->name('drivers.destroy');
        Route::delete('/drivers/{driver}/account', [UserDriverController::class, 'destroyAccount'])->name('drivers.destroy-account');

        // Driver Applications Management
        Route::get('/DriverM/Application', [UserDriverController::class, 'applications'])->name('DriverM.Application');
        Route::patch('/DriverM/Application/{application}', [UserDriverController::class, 'updateApplication'])->name('DriverM.Application.update');

        // Bookings Management
        Route::get('/admin/bookings', [AdminBookingsController::class, 'index'])->name('admin.bookings.index');
        Route::get('/admin/bookings/{booking}/receipt', [AdminBookingsController::class, 'receipt'])->name('admin.bookings.receipt');
        Route::post('/admin/bookings/{booking}/cancel', [AdminBookingsController::class, 'cancel'])->name('admin.bookings.cancel');
        Route::delete('/admin/bookings/{booking}', [AdminBookingsController::class, 'destroy'])->name('admin.bookings.destroy');
        Route::post('/admin/bookings/destroy-all', [AdminBookingsController::class, 'destroyAll'])->name('admin.bookings.destroy-all');

        // Activity Logs
        Route::get('/admin/activity-logs', [AdminActivityLogController::class, 'index'])->name('admin.activity-logs.index');
        Route::delete('/admin/activity-logs/{log}', [AdminActivityLogController::class, 'destroy'])->name('admin.activity-logs.destroy');
        Route::post('/admin/activity-logs/destroy-all', [AdminActivityLogController::class, 'destroyAll'])->name('admin.activity-logs.destroy-all');

        // Analytics Routes
        Route::get('/admin/analytics', [\App\Http\Controllers\AnalyticsController::class, 'index'])->name('admin.analytics');
        Route::get('/admin/analytics/export', [\App\Http\Controllers\AnalyticsController::class, 'export'])->name('admin.analytics.export');

        // Admin Support Routes
        Route::get('/admin/support', [SupportController::class, 'adminIndex'])->name('admin.support');
        Route::patch('/admin/support/{ticket}/status', [SupportController::class, 'updateStatus'])->name('admin.support.update-status');
        Route::post('/admin/support/{ticket}/respond', [SupportController::class, 'respond'])->name('admin.support.respond');

        // Admin Ratings/Feedback Routes
        Route::get('/admin/ratings', [AdminRatingsController::class, 'index'])->name('admin.ratings');
        Route::patch('/admin/ratings/{feedback}/status', [AdminRatingsController::class, 'updateStatus'])->name('admin.ratings.update-status');
        Route::delete('/admin/ratings/{feedback}', [AdminRatingsController::class, 'destroy'])->name('admin.ratings.destroy');

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
        Route::post('/bookings/sos', [\App\Http\Controllers\BookingController::class, 'sendSOS'])->name('bookings.sos');

        // Ride History
        Route::get('/passenger/ride-history', [PassengerController::class, 'rideHistory'])->name('passenger.ride-history');

        // Saved Places & Favorites
        Route::get('/passenger/saved-places', [PassengerController::class, 'savedPlaces'])->name('passenger.saved-places');
        Route::post('/passenger/favorite-drivers/{driver}', [PassengerController::class, 'addFavoriteDriver'])->name('passenger.favorite-drivers.add');
        Route::delete('/passenger/favorite-drivers/{driver}', [PassengerController::class, 'removeFavoriteDriver'])->name('passenger.favorite-drivers.remove');
        Route::post('/passenger/saved-places', [PassengerController::class, 'storeSavedPlace'])->name('passenger.saved-places.store');
        Route::put('/passenger/saved-places/{savedPlace}', [PassengerController::class, 'updateSavedPlace'])->name('passenger.saved-places.update');
        Route::delete('/passenger/saved-places/{savedPlace}', [PassengerController::class, 'destroySavedPlace'])->name('passenger.saved-places.destroy');

        // Support
        Route::get('/passenger/support', [SupportController::class, 'passengerIndex'])->name('passenger.support');
        Route::post('/passenger/support', [SupportController::class, 'store'])->name('passenger.support.store');

        // Safety
        Route::get('/passenger/safety', [PassengerController::class, 'safety'])->name('passenger.safety');

        // Feedback
        Route::get('/passenger/feedback', [FeedbackController::class, 'index'])->name('passenger.feedback');
        Route::post('/passenger/feedback', [FeedbackController::class, 'store'])->name('passenger.feedback.store');

        // Settings routes
        Route::get('PassengerSide/settings', [PassengerController::class, 'settings'])
            ->name('PassengerSide.settings');
        Route::put('PassengerSide/settings', [PassengerController::class, 'updateSettings'])
            ->name('PassengerSide.settings.update');

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

    // Driver-only routes (activity tracked so "browser closed" = offline for passengers)
    Route::middleware(['role:driver', 'driver.activity'])->group(function () {
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

        // Driver Support Page
        Route::get('driver/support', [SupportController::class, 'driverIndex'])
            ->name('driver.support');
        Route::post('driver/support', [SupportController::class, 'store'])
            ->name('driver.support.store');

        // Driver Feedback
        Route::get('driver/feedback', [FeedbackController::class, 'index'])
            ->name('driver.feedback');
        Route::post('driver/feedback', [FeedbackController::class, 'store'])
            ->name('driver.feedback.store');

        // Toggle online status
        Route::post('driver/toggle-online', [DriverController::class, 'toggleOnlineStatus'])
            ->name('driver.toggle-online');

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
