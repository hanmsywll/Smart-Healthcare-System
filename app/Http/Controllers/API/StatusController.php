<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    /**
     * @OA\Get(
     *   path="/status",
     *   operationId="getApiStatus",
     *   tags={"Status"},
     *   summary="[PUBLIK] Cek status API",
     *   description="Mengembalikan status sederhana untuk memverifikasi API berjalan.",
     *   @OA\Response(
     *     response=200,
     *     description="API is running",
     *     @OA\JsonContent(
     *       @OA\Property(property="status", type="string", example="success"),
     *       @OA\Property(property="message", type="string", example="API is running")
     *     )
     *   )
     * )
     */
    public function index(): JsonResponse
    {
        return response()->json(['status' => 'success', 'message' => 'API is running']);
    }
}