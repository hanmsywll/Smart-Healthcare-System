<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\PatientController;
use App\Http\Controllers\API\DoctorScheduleController;
use App\Http\Controllers\API\JanjiTemuController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\RekamMedisController;

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
Route::get('/janji/ketersediaan', [JanjiTemuController::class, 'getKetersediaan']);

Route::get('/status', function () {
    return response()->json(['status' => 'success', 'message' => 'API is running']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/doctors/schedules', [DoctorScheduleController::class, 'index']);

    Route::get('/patients/{id}', [PatientController::class, 'show']);

    Route::apiResource('janji', JanjiTemuController::class);
});

Route::prefix('rekam-medis')->group(function () {
    Route::get('/', [RekamMedisController::class, 'index']);
    Route::post('/', [RekamMedisController::class, 'store']);
    Route::get('/{id}', [RekamMedisController::class, 'show']);
    Route::put('/{id}', [RekamMedisController::class, 'update']);
    Route::delete('/{id}', [RekamMedisController::class, 'destroy']);
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
