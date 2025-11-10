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
}