<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * @OA\Schema(
 * schema="UserProfile",
 * title="User Profile",
 * description="User profile response",
 * @OA\Property(property="id_pengguna", type="integer"),
 * @OA\Property(property="nama_lengkap", type="string"),
 * @OA\Property(property="email", type="string", format="email"),
 * @OA\Property(property="role", type="string", enum={"pasien", "dokter", "admin"}),
 * @OA\Property(property="created_at", type="string", format="date-time"),
 * @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 * schema="UserProfileResponse",
 * title="User Profile Response",
 * description="Response untuk user profile",
 * @OA\Property(property="data", ref="#/components/schemas/UserProfile")
 * )
 */
class UserController extends Controller
{
    /**
     * @OA\Get(
     * path="/user",
     * operationId="getUserProfile",
     * tags={"User Profile"},
     * summary="[AMAN] Get user profile",
     * description="Get current authenticated user profile",
     * security={{"sanctum":{}}},
     * @OA\Response(
     * response=200,
     * description="User profile retrieved successfully",
     * @OA\JsonContent(ref="#/components/schemas/UserProfileResponse")
     * ),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getUserProfile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'data' => $user
        ], 200);
    }
}