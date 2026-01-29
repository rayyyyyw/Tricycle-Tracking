<?php

use Illuminate\Support\Facades\Route;

Route::post('/chat/store-internal', [\App\Http\Controllers\BookingChatController::class, 'storeInternal'])
    ->name('api.chat.store-internal');
