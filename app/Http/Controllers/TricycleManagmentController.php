<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TricycleManagmentController extends Controller
{
 public function index()
 {
     return Inertia::render('TricycleM/Index');
 }
}
