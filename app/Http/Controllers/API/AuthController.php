<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\Pasien;
use App\Models\Dokter;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     * path="/auth/login",
     * summary="Sign in",
     * description="Login by email, password",
     * operationId="authLogin",
     * tags={"Authentication"},
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
            'user' => [
                'id_pengguna' => $user->id_pengguna,
                'email' => $user->email,
                'role' => $user->role,
                'nama_lengkap' => $user->nama_lengkap,
            ],
        ]);
    }

    /**
     * Register Pasien
     */
    public function registerPasien(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('pengguna', 'email')],
            'password' => ['required', 'string', 'min:6'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'no_telepon' => ['nullable', 'string', 'max:255'],
            'tanggal_lahir' => ['nullable', 'date'],
            'golongan_darah' => ['nullable', 'string', 'max:5'],
            'alamat' => ['nullable', 'string'],
        ]);

        $user = null;
        $patient = null;
        DB::beginTransaction();
        try {
            $user = Pengguna::create([
                'email' => $validated['email'],
                'password_hash' => Hash::make($validated['password']),
                'role' => 'pasien',
                'nama_lengkap' => $validated['nama_lengkap'],
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            $patient = Pasien::create([
                'id_pengguna' => $user->id_pengguna,
                'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
                'golongan_darah' => $validated['golongan_darah'] ?? null,
                'alamat' => $validated['alamat'] ?? null,
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'register' => ['Failed to register patient: ' . $e->getMessage()],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => [
                'id_pengguna' => $user->id_pengguna,
                'email' => $user->email,
                'role' => $user->role,
                'nama_lengkap' => $user->nama_lengkap,
                'no_telepon' => $user->no_telepon,
            ],
            'pasien' => [
                'id_pasien' => $patient->id_pasien,
                'tanggal_lahir' => $patient->tanggal_lahir,
                'golongan_darah' => $patient->golongan_darah,
                'alamat' => $patient->alamat,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Register Dokter
     */
    public function registerDokter(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('pengguna', 'email')],
            'password' => ['required', 'string', 'min:6'],
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'no_telepon' => ['nullable', 'string', 'max:255'],
            'spesialisasi' => ['required', 'string', 'max:100'],
            'no_lisensi' => ['required', 'string', 'max:100', Rule::unique('dokter', 'no_lisensi')],
            'biaya_konsultasi' => ['nullable', 'numeric'],
            'shift' => ['nullable', Rule::in(['pagi', 'malam'])],
        ]);

        $user = null;
        $doctor = null;
        DB::beginTransaction();
        try {
            $user = Pengguna::create([
                'email' => $validated['email'],
                'password_hash' => Hash::make($validated['password']),
                'role' => 'dokter',
                'nama_lengkap' => $validated['nama_lengkap'],
                'no_telepon' => $validated['no_telepon'] ?? null,
            ]);

            $doctor = Dokter::create([
                'id_pengguna' => $user->id_pengguna,
                'spesialisasi' => $validated['spesialisasi'],
                'no_lisensi' => $validated['no_lisensi'],
                'biaya_konsultasi' => $validated['biaya_konsultasi'] ?? null,
                'shift' => $validated['shift'] ?? 'pagi',
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'register' => ['Failed to register doctor: ' . $e->getMessage()],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => [
                'id_pengguna' => $user->id_pengguna,
                'email' => $user->email,
                'role' => $user->role,
                'nama_lengkap' => $user->nama_lengkap,
                'no_telepon' => $user->no_telepon,
            ],
            'dokter' => [
                'id_dokter' => $doctor->id_dokter,
                'spesialisasi' => $doctor->spesialisasi,
                'no_lisensi' => $doctor->no_lisensi,
                'biaya_konsultasi' => $doctor->biaya_konsultasi,
                'shift' => $doctor->shift,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ], 200);
    }

    /**
     * @OA\Post(
     *   path="/auth/change-password",
     *   summary="[AMAN] Ganti password",
     *   description="Mengganti password pengguna yang sedang login. Memerlukan password saat ini dan password baru (dengan konfirmasi).",
     *   operationId="changePassword",
     *   tags={"Authentication"},
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"current_password","new_password","new_password_confirmation"},
     *       @OA\Property(property="current_password", type="string", format="password", example="qwerty123"),
     *       @OA\Property(property="new_password", type="string", format="password", example="passwordBaru123"),
     *       @OA\Property(property="new_password_confirmation", type="string", format="password", example="passwordBaru123")
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Password berhasil diubah",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Password berhasil diubah")
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    // [Removed] changePassword: dipangkas sesuai kebijakan, gunakan changePasswordPublicByEmail

    // [Removed] changePasswordByEmail: dipangkas sesuai kebijakan, gunakan changePasswordPublicByEmail

    // [Removed] requestPasswordReset: dipangkas sesuai kebijakan

    // [Removed] confirmPasswordReset: dipangkas sesuai kebijakan

    /**
     * @OA\Post(
     *   path="/auth/change-password-public",
     *   summary="[PUBLIK] Ganti password langsung berdasarkan email (tanpa login, tanpa OTP)",
     *   description="Endpoint publik untuk mengganti password hanya bermodal email dan password baru. Disarankan hanya diaktifkan untuk lingkungan pengembangan. Terkendali oleh env ALLOW_PUBLIC_PASSWORD_CHANGE.",
     *   operationId="changePasswordPublicByEmail",
     *   tags={"Authentication"},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"email","new_password","new_password_confirmation"},
     *       @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *       @OA\Property(property="new_password", type="string", format="password", example="passwordBaru123"),
     *       @OA\Property(property="new_password_confirmation", type="string", format="password", example="passwordBaru123")
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Password berhasil diubah",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Password berhasil diubah")
     *     )
     *   ),
     *   @OA\Response(response=403, description="Disabled by environment"),
     *   @OA\Response(response=404, description="User not found"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function changePasswordPublicByEmail(Request $request)
    {
        // Guard via env to prevent production misuse
        // Allow override for specific emails via PUBLIC_PASSWORD_CHANGE_WHITELIST
        if (! (bool) env('ALLOW_PUBLIC_PASSWORD_CHANGE', false)) {
            $requestedEmail = strtolower((string) $request->input('email'));
            $whitelistRaw = (string) env('PUBLIC_PASSWORD_CHANGE_WHITELIST', '');
            $whitelist = array_map('strtolower', array_filter(array_map('trim', explode(',', $whitelistRaw))));

            if (! $requestedEmail || ! in_array($requestedEmail, $whitelist)) {
                return response()->json(['message' => 'Fitur ini dinonaktifkan oleh konfigurasi environment'], 403);
            }
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = Pengguna::where('email', $validated['email'])->first();
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->password_hash = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Password berhasil diubah'
        ], 200);
    }
}