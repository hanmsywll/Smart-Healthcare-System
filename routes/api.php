<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\JanjiTemuController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\StatusController;

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

// Authentication
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register/pasien', [AuthController::class, 'registerPasien']);
Route::post('/auth/register/dokter', [AuthController::class, 'registerDokter']);
// Public Change Password by Email (guarded by env)
Route::post('/auth/change-password-public', [AuthController::class, 'changePasswordPublicByEmail']);

// Public routes
Route::get('/janji/ketersediaan-all', [JanjiTemuController::class, 'getAllKetersediaan']);

Route::get('/status', [StatusController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'getUserProfile']);

    Route::post('/janji/booking-cepat', [JanjiTemuController::class, 'bookingCepat']);
    
    // Janji Temu CRUD Routes
    Route::get('/janji', [JanjiTemuController::class, 'getAllJanjiTemu']);
    Route::get('/janji/stats', [JanjiTemuController::class, 'getJanjiStats']);
    Route::get('/janji/search', [JanjiTemuController::class, 'searchJanjiTemu']);
    Route::get('/janji/{id}', [JanjiTemuController::class, 'getJanjiTemuById']);
    Route::put('/janji/{id}', [JanjiTemuController::class, 'updateJanjiTemu']);
    Route::delete('/janji/{id}', [JanjiTemuController::class, 'deleteJanjiTemu']);
    
    // Logout route
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // (Dihapus) Endpoint change-password dan change-password-by-email dipangkas, gunakan /auth/change-password-public jika diperlukan untuk dev/demo.
});
