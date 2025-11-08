<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class PassengerController extends Controller
{
    /**
     * Display the passenger dashboard.
     */
    public function dashboard(Request $request)
    {
        return Inertia::render('PassengerSide/Index');
    }
}