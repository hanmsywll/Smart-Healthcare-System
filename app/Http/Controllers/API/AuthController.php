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
     * summary="Sign in (Raihan)",
     * description="Login dengan email dan password. Jika ingin login sebagai pasien, maka bisa pakai akun berikut: raihanstark@gmail.com dgn password qwerty123. jika ingin login sebagai dokter, menggunakan raihanloki@gmail.com dgn password qwerty123",
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
     * @OA\Response(
     *   response=401,
     *   description="Invalid credentials",
     *   @OA\JsonContent(
     *     @OA\Property(property="message", type="string", example="Invalid credentials"),
     *     @OA\Property(property="errors", type="object",
     *       @OA\Property(property="email", type="array", @OA\Items(type="string", example="The provided credentials do not match our records."))
     *     )
     *   )
     * ),
     * @OA\Response(
     *   response=422,
     *   description="Validation error",
     *   @OA\JsonContent(
     *     @OA\Property(property="message", type="string", example="Isian email wajib diisi. (and 1 more error)"),
     *     @OA\Property(property="errors", type="object",
     *       @OA\Property(property="email", type="array", @OA\Items(type="string", example="Isian email wajib diisi.")),
     *       @OA\Property(property="password", type="array", @OA\Items(type="string", example="Isian password wajib diisi."))
     *     )
     *   )
     * )
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

        $user->load([
            'dokter:id_dokter,id_pengguna',
            'pasien:id_pasien,id_pengguna',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id_pengguna' => $user->id_pengguna,
                'email' => $user->email,
                'role' => $user->role,
                'nama_lengkap' => $user->nama_lengkap,
                'id_dokter' => optional($user->dokter)->id_dokter,
                'id_pasien' => optional($user->pasien)->id_pasien,
            ],
        ]);
    }

    /**
     * @OA\Post(
     *   path="/auth/register/pasien",
     *   summary="Register Pasien (Raihan)",
     *   description="Mendaftarkan akun baru sebagai pasien dan langsung mengembalikan token akses.",
     *   operationId="registerPasien",
     *   tags={"Authentication"},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"email","password","nama_lengkap"},
     *       @OA\Property(property="email", type="string", format="email", example="raihanstark@gmail.com"),
     *       @OA\Property(property="password", type="string", format="password", example="qwerty123"),
     *       @OA\Property(property="nama_lengkap", type="string", example="Budi Santoso"),
     *       @OA\Property(property="no_telepon", type="string", example="081234567890"),
     *       @OA\Property(property="tanggal_lahir", type="string", format="date", example="2000-05-10"),
     *       @OA\Property(property="golongan_darah", type="string", example="O"),
     *       @OA\Property(property="alamat", type="string", example="Jl. Mawar No. 1 Jakarta")
     *     )
     *   ),
     *   @OA\Response(
     *     response=201,
     *     description="Registration successful",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Registration successful"),
     *       @OA\Property(property="user", type="object",
     *         @OA\Property(property="id_pengguna", type="integer", example=1),
     *         @OA\Property(property="email", type="string", format="email", example="raihanstark@gmail.com"),
     *         @OA\Property(property="role", type="string", example="pasien"),
     *         @OA\Property(property="nama_lengkap", type="string", example="Budi Santoso"),
     *         @OA\Property(property="no_telepon", type="string", example="081234567890")
     *       ),
     *       @OA\Property(property="pasien", type="object",
     *         @OA\Property(property="id_pasien", type="integer", example=1),
     *         @OA\Property(property="tanggal_lahir", type="string", format="date", example="2000-05-10"),
     *         @OA\Property(property="golongan_darah", type="string", example="O"),
     *         @OA\Property(property="alamat", type="string", example="Jl. Mawar No. 1 Jakarta")
     *       ),
     *       @OA\Property(property="access_token", type="string"),
     *       @OA\Property(property="token_type", type="string", example="Bearer")
     *     )
     *   ),
     *   @OA\Response(
     *     response=422,
     *     description="Validation error",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="The given data was invalid."),
     *       @OA\Property(property="errors", type="object",
     *         @OA\Property(property="email", type="array", @OA\Items(type="string", example="The email has already been taken.")),
     *         @OA\Property(property="password", type="array", @OA\Items(type="string", example="The password must be at least 6 characters.")),
     *         @OA\Property(property="nama_lengkap", type="array", @OA\Items(type="string", example="The nama lengkap field is required."))
     *       )
     *     )
     *   )
     * )
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
     * @OA\Post(
     *   path="/auth/register/dokter",
     *   summary="Register Dokter (Raihan)",
     *   description="Mendaftarkan akun baru sebagai dokter dan langsung mengembalikan token akses.",
     *   operationId="registerDokter",
     *   tags={"Authentication"},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"email","password","nama_lengkap","spesialisasi","no_lisensi"},
     *       @OA\Property(property="email", type="string", format="email", example="raihanloki@gmail.com"),
     *       @OA\Property(property="password", type="string", format="password", example="qwerty123"),
     *       @OA\Property(property="nama_lengkap", type="string", example="Dr. Siti"),
     *       @OA\Property(property="no_telepon", type="string", example="081298765432"),
     *       @OA\Property(property="spesialisasi", type="string", example="Anak"),
     *       @OA\Property(property="no_lisensi", type="string", example="ABCD-1234"),
     *       @OA\Property(property="biaya_konsultasi", type="number", format="float", example=150000),
     *       @OA\Property(property="shift", type="string", enum={"pagi","malam"}, example="pagi")
     *     )
     *   ),
     *   @OA\Response(
     *     response=201,
     *     description="Registration successful",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Registration successful"),
     *       @OA\Property(property="user", type="object",
     *         @OA\Property(property="id_pengguna", type="integer", example=1),
     *         @OA\Property(property="email", type="string", format="email", example="raihanloki@gmail.com"),
     *         @OA\Property(property="role", type="string", example="dokter"),
     *         @OA\Property(property="nama_lengkap", type="string", example="Dr. Siti"),
     *         @OA\Property(property="no_telepon", type="string", example="081298765432")
     *       ),
     *       @OA\Property(property="dokter", type="object",
     *         @OA\Property(property="id_dokter", type="integer", example=10),
     *         @OA\Property(property="spesialisasi", type="string", example="Anak"),
     *         @OA\Property(property="no_lisensi", type="string", example="ABCD-1234"),
     *         @OA\Property(property="biaya_konsultasi", type="number", format="float", example=150000),
     *         @OA\Property(property="shift", type="string", example="pagi")
     *       ),
     *       @OA\Property(property="access_token", type="string"),
     *       @OA\Property(property="token_type", type="string", example="Bearer")
     *     )
     *   ),
     *   @OA\Response(
     *     response=422,
     *     description="Validation error",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="The given data was invalid."),
     *       @OA\Property(property="errors", type="object",
     *         @OA\Property(property="email", type="array", @OA\Items(type="string", example="The email has already been taken.")),
     *         @OA\Property(property="password", type="array", @OA\Items(type="string", example="The password must be at least 6 characters.")),
     *         @OA\Property(property="spesialisasi", type="array", @OA\Items(type="string", example="The spesialisasi field is required.")),
     *         @OA\Property(property="no_lisensi", type="array", @OA\Items(type="string", example="The no lisensi has already been taken."))
     *       )
     *     )
     *   )
     * )
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

    /**
     * @OA\Post(
     *   path="/auth/logout",
     *   summary="Logout (Raihan)",
     *   description="Menghapus token akses saat ini. Perlu autentikasi.",
     *   operationId="authLogout",
     *   tags={"Authentication"},
     *   security={{"sanctum":{}}},
     *   @OA\Response(
     *     response=200,
     *     description="Successfully logged out",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Successfully logged out")
     *     )
     *   ),
     *   @OA\Response(
     *     response=401,
     *     description="Unauthenticated",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Unauthenticated.")
     *     )
     *   )
     * )
     */
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
     *   @OA\Response(
     *     response=401,
     *     description="Unauthenticated",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Unauthenticated.")
     *     )
     *   ),
     *   @OA\Response(
     *     response=422,
     *     description="Validation error",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="The given data was invalid."),
     *       @OA\Property(property="errors", type="object",
     *         @OA\Property(property="current_password", type="array", @OA\Items(type="string", example="The current password field is required.")),
     *         @OA\Property(property="new_password", type="array", @OA\Items(type="string", example="The new password must be at least 8 characters.")),
     *         @OA\Property(property="new_password_confirmation", type="array", @OA\Items(type="string", example="The new password confirmation does not match."))
     *       )
     *     )
     *   )
     * )
     */
    // [Removed] changePassword: dipangkas sesuai kebijakan, gunakan changePasswordPublicByEmail

    // [Removed] changePasswordByEmail: dipangkas sesuai kebijakan, gunakan changePasswordPublicByEmail

    // [Removed] requestPasswordReset: dipangkas sesuai kebijakan

    // [Removed] confirmPasswordReset: dipangkas sesuai kebijakan

    /**
     * @OA\Post(
     *   path="/auth/change-password-public",
     *   summary="[PUBLIK] Ganti password langsung berdasarkan email (tanpa login, tanpa OTP) (Raihan)",
     *   description="Endpoint publik untuk mengganti password hanya bermodal email dan password baru. Disarankan hanya diaktifkan untuk lingkungan pengembangan. Terkendali oleh env ALLOW_PUBLIC_PASSWORD_CHANGE.",
     *   operationId="changePasswordPublicByEmail",
     *   tags={"Authentication"},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"email","new_password","new_password_confirmation"},
     *       @OA\Property(property="email", type="string", format="email", example="raihanstark@gmail.com"),
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
     *   @OA\Response(
     *     response=403,
     *     description="Disabled by environment",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Fitur ini dinonaktifkan oleh konfigurasi environment")
     *     )
     *   ),
     *   @OA\Response(
     *     response=404,
     *     description="User not found",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="User not found")
     *     )
     *   ),
     *   @OA\Response(
     *     response=422,
     *     description="Validation error",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="The given data was invalid."),
     *       @OA\Property(property="errors", type="object",
     *         @OA\Property(property="email", type="array", @OA\Items(type="string", example="The email field must be a valid email address.")),
     *         @OA\Property(property="new_password", type="array", @OA\Items(type="string", example="The new password must be at least 8 characters.")),
     *         @OA\Property(property="new_password_confirmation", type="array", @OA\Items(type="string", example="The new password confirmation does not match."))
     *       )
     *     )
     *   )
     * )
     */
    public function changePasswordPublicByEmail(Request $request)
    {
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