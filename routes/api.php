<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Default user route (Laravel default)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Smart Healthcare System API Routes
|--------------------------------------------------------------------------
|
| API routes akan dikembangkan oleh tim:
| - Auth Service: Izza
| - Appointment Service: Raihan  
| - Prescription & Pharmacy Service: Dini
| - Electronic Health Record Service: Fanial
|
| Untuk saat ini, file ini dibiarkan kosong untuk development awal.
|
*/

// API Status Check
Route::get('/status', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Smart Healthcare System API is running',
        'version' => '1.0.0',
        'timestamp' => now()
    ]);
});