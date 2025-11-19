<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('DriverSide/Index');
    }
}