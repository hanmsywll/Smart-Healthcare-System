<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     * path="/auth/login",
     * summary="Sign in",
     * description="Login by email, password",
     * operationId="authLogin",
     * tags={"Auth"},
     * @OA\RequestBody(
     * required=true,
     * description="Pass user credentials",
     * @OA\JsonContent(
     * required={"email","password"},
     * @OA\Property(property="email", type="string", format="email", example="raihanstark@gmail.com"),
     * @OA\Property(property="password", type="string", format="password", example="qwerty123"),
     * ),
     * ),
     * @OA\Response(
     * response=200,
     * description="Success",
     * @OA\JsonContent(
     * @OA\Property(property="access_token", type="string"),
     * @OA\Property(property="token_type", type="string", example="Bearer")
     * )
     * ),
     * @OA\Response(response=401, description="Invalid credentials"),
     * @OA\Response(response=422, description="Validation error")
     * )
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = Pengguna::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    // Registrasi akun
    public function register(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:pengguna,email',
            'password' => 'required|min:6',
            'role' => 'required|in:pasien,dokter,apoteker,admin',
            'nama_lengkap' => 'required|string',
            'no_telepon' => 'nullable|string|max:20',
        ]);

        $pengguna = Pengguna::create([
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'no_telepon' => $validated['no_telepon'] ?? null,
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil',
            'data' => $pengguna
        ], 201);
    }

    // Logout
    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Logout berhasil']);
    }

    // Cek user login
    public function me()
    {
        return response()->json(auth()->user());
    }
}