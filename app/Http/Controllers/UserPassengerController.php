<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UserPassengerController extends Controller
{
     public function index()
        {
            return Inertia::render('PassengerM/Index');
        }
}
