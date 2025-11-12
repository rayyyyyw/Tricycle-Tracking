<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UserDriverController extends Controller
{
    public function index()
        {
            return Inertia::render('DriverM/Index');
        }
}
