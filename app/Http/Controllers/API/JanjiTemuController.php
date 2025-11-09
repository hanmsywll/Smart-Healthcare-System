<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\JanjiTemuService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\Access\AuthorizationException;
use App\Models\Pasien;
use Exception;

/**
 * @OA\Schema(
 * schema="JanjiTemu",
 * title="Janji Temu (Respons)",
 * description="Model Janji Temu (Respons)",
 * @OA\Property(property="id_janji_temu", type="integer"),
 * @OA\Property(property="id_pasien", type="integer"),
 * @OA\Property(property="id_dokter", type="integer"),
 * @OA\Property(property="tanggal_janji", type="string", format="date"),
 * @OA\Property(property="waktu_mulai", type="string", format="time", example="14:00"),
 * @OA\Property(property="waktu_selesai", type="string", format="time", example="15:00"),
 * @OA\Property(property="status", type="string", enum={"terjadwal", "selesai", "dibatalkan"}),
 * @OA\Property(property="keluhan", type="string"),
 * @OA\Property(property="pasien", ref="#/components/schemas/Patient"),
 * @OA\Property(property="dokter", ref="#/components/schemas/Doctor")
 * )
 *
 * @OA\Schema(
 * schema="CreateJanjiTemuRequest",
 * title="Create Janji Temu Request",
 * description="Body request untuk membuat Janji Temu",
 * required={"id_dokter", "tanggal_janji", "waktu_mulai", "keluhan"},
 * @OA\Property(property="id_pasien", type="integer", description="Opsional (Otomatis diisi jika login sbg Pasien)"),
 * @OA\Property(property="id_dokter", type="integer", description="ID Dokter"),
 * @OA\Property(property="tanggal_janji", type="string", format="date", example="2025-11-20"),
 * @OA\Property(property="waktu_mulai", type="string", format="time", description="Waktu Mulai (Format HH:mm)", example="14:00"),
 * @OA\Property(property="keluhan", type="string", description="Keluhan Pasien", example="Sakit kepala dan mual")
 * )
 *
 * @OA\Schema(
 * schema="UpdateJanjiTemuStatusRequest",
 * title="Update Janji Temu Status Request",
 * description="Body request untuk update status",
 * required={"status"},
 * @OA\Property(property="status", type="string", enum={"selesai", "dibatalkan"}, description="Status baru")
 * )
 *
 * @OA\Schema(
 * schema="SearchJanjiTemuResponse",
 * title="Search Janji Temu Response",
 * description="Response untuk pencarian janji temu",
 * @OA\Property(property="message", type="string", example="Pencarian janji temu berhasil"),
 * @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/JanjiTemu"))
 * )
 *
 * @OA\Schema(
 * schema="Doctor",
 * title="Doctor (Model Lengkap)",
 * description="Model Doctor lengkap dari database",
 * @OA\Property(property="id_dokter", type="integer", readOnly=true),
 * @OA\Property(property="id_pengguna", type="integer"),
 * @OA\Property(property="spesialisasi", type="string"),
 * @OA\Property(property="no_lisensi", type="string"),
 * @OA\Property(property="biaya_konsultasi", type="number", format="float"),
 * @OA\Property(property="shift", type="string", enum={"pagi", "malam"}),
 * @OA\Property(property="pengguna", ref="#/components/schemas/Pengguna")
 * )
 */

class JanjiTemuController extends Controller
{
    protected $janjiTemuService;

    public function __construct(JanjiTemuService $janjiTemuService)
    {
        $this->janjiTemuService = $janjiTemuService;
    }

    /**
     * @OA\Get(
     * path="/janji/ketersediaan-all",
     * operationId="getAllKetersediaan",
     * tags={"Appointment Management"},
     * summary="[PUBLIK] Cek semua ketersediaan dokter",
     * description="Endpoint publik untuk melihat ketersediaan semua dokter untuk 7 hari ke depan tanpa parameter.",
     * @OA\Response(
     * response=200,
     * description="Daftar ketersediaan semua dokter",
     * @OA\JsonContent(type="array", @OA\Items(
     * @OA\Property(property="id_dokter", type="integer"),
     * @OA\Property(property="nama_dokter", type="string"),
     * @OA\Property(property="spesialisasi", type="string"),
     * @OA\Property(property="biaya_konsultasi", type="number"),
     * @OA\Property(property="shift", type="string"),
     * @OA\Property(property="jadwal_ketersediaan", type="array", @OA\Items(
     * @OA\Property(property="tanggal", type="string", format="date"),
     * @OA\Property(property="hari", type="string"),
     * @OA\Property(property="jam_terisi", type="array", @OA\Items(type="string")),
     * @OA\Property(property="shift", type="string")
     * ))
     * ))
     * ),
     * @OA\Response(response=500, description="Server error")
     * )
     */
    public function getAllKetersediaan(Request $request)
    {
        try {
            $allKetersediaan = $this->janjiTemuService->getAllKetersediaan();
            return response()->json($allKetersediaan);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        }
    }

    /**
     * @OA\Post(
     * path="/janji/booking-cepat",
     * operationId="bookingCepat",
     * tags={"Appointment Management"},
     * summary="[AMAN] Booking Janji Temu Cepat",
     * description="Endpoint untuk membuat janji temu secara cepat dengan validasi slot tersedia",
     * security={{"sanctum":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * required={"id_dokter", "tanggal", "waktu_mulai"},
     * @OA\Property(property="id_dokter", type="integer", description="ID Dokter", example=1),
     * @OA\Property(property="tanggal", type="string", format="date", description="Tanggal janji temu (YYYY-MM-DD)", example="2025-11-20"),
     * @OA\Property(property="waktu_mulai", type="string", description="Waktu mulai (HH:mm) - Format 24 jam", example="09:00"),
     * @OA\Property(property="keluhan", type="string", description="Keluhan pasien (opsional)", example="Sakit kepala berdenyut dan mual sejak pagi")
     * )
     * ),
     * @OA\Response(
     * response=201,
     * description="Janji temu berhasil dibooking",
     * @OA\JsonContent(
     * @OA\Property(property="message", type="string", example="Janji temu berhasil dibooking"),
     * @OA\Property(property="data", ref="#/components/schemas/JanjiTemu")
     * )
     * ),
     * @OA\Response(response=400, description="Slot sudah terisi atau error validasi"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function bookingCepat(Request $request)
    {
        try {
            $user = $request->user();
            $data = $request->all();

            $janjiTemu = $this->janjiTemuService->bookingCepat($data, $user);

            return response()->json([
                'success' => true,
                'message' => 'Yeay! Janji temu Anda berhasil dibooking 🎉',
                'data' => $janjiTemu,
                'timestamp' => now()->toISOString()
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mohon periksa kembali data yang Anda masukkan',
                'errors' => $e->errors(),
                'timestamp' => now()->toISOString()
            ], 422);
        } catch (Exception $e) {
            $errorMessage = $e->getMessage();
            
            if (str_contains($errorMessage, 'sudah terisi')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, slot waktu ini sudah penuh. Silakan pilih waktu lain',
                    'timestamp' => now()->toISOString()
                ], 409);
            }
            
            if (str_contains($errorMessage, 'diluar jam kerja')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dokter tidak tersedia pada jam ini. Silakan pilih waktu lain',
                    'timestamp' => now()->toISOString()
                ], 400);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Maaf, terjadi kesalahan saat membooking janji temu',
                'debug' => config('app.debug') ? $errorMessage : null,
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     * path="/janji",
     * operationId="getAllJanjiTemu",
     * tags={"Appointment Management"},
     * summary="[AMAN] Dapatkan semua janji temu",
     * description="Endpoint untuk mendapatkan semua janji temu (Admin/Dokter bisa lihat semua, Pasien hanya lihat miliknya)",
     * security={{"sanctum":{}}},
     * @OA\Response(
     * response=200,
     * description="Daftar semua janji temu",
     * @OA\JsonContent(
     * @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/JanjiTemu"))
     * )
     * ),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getAllJanjiTemu(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->role === 'pasien') {
                $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
                if (!$pasien) {
                    return response()->json(['message' => 'Data pasien tidak ditemukan'], 404);
                }
                $janjiTemu = $this->janjiTemuService->getJanjiTemuByPasien($pasien->id_pasien);
            } else {
                $janjiTemu = $this->janjiTemuService->getAllJanjiTemu();
            }

            return response()->json([
                'data' => $janjiTemu
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     * path="/janji/{id}",
     * operationId="getJanjiTemuById",
     * tags={"Appointment Management"},
     * summary="[AMAN] Lihat detail janji temu",
     * description="Endpoint untuk melihat detail janji temu berdasarkan ID.",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * @OA\Schema(type="integer"),
     * description="ID Janji Temu"
     * ),
     * @OA\Response(
     * response=200,
     * description="Detail janji temu",
     * @OA\JsonContent(
     * @OA\Property(property="data", ref="#/components/schemas/JanjiTemu")
     * )
     * ),
     * @OA\Response(response=404, description="Janji temu tidak ditemukan"),
     * @OA\Response(response=403, description="Tidak memiliki akses"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function getJanjiTemuById(Request $request, $id)
    {
        try {
            $user = $request->user();
            $janjiTemu = $this->janjiTemuService->getJanjiTemuById($id);

            if ($user->role === 'pasien') {
                $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
                if (!$pasien || $janjiTemu->id_pasien !== $pasien->id_pasien) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Maaf, Anda tidak memiliki akses ke janji temu ini',
                        'timestamp' => now()->toISOString()
                    ], 403);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail janji temu berhasil ditemukan',
                'data' => $janjiTemu,
                'timestamp' => now()->toISOString()
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Janji temu tidak ditemukan atau sudah dihapus',
                'timestamp' => now()->toISOString()
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Maaf, terjadi kesalahan saat mengambil data janji temu',
                'debug' => config('app.debug') ? $e->getMessage() : null,
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     * path="/janji/search",
     * operationId="searchJanjiTemu",
     * tags={"Appointment Management"},
     * summary="[AMAN] Cari janji temu",
     * description="Endpoint untuk mencari janji temu berdasarkan tanggal dan/atau nama dokter.",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="tanggal",
     * in="query",
     * description="Filter berdasarkan tanggal (YYYY-MM-DD)",
     * required=false,
     * @OA\Schema(type="string", format="date", example="2025-11-20")
     * ),
     * @OA\Parameter(
     * name="nama_dokter",
     * in="query",
     * description="Filter berdasarkan nama dokter (partial match)",
     * required=false,
     * @OA\Schema(type="string", example="Raihan")
     * ),
     * @OA\Response(
     * response=200,
     * description="Daftar janji temu yang sesuai filter",
     * @OA\JsonContent(ref="#/components/schemas/SearchJanjiTemuResponse")
     * ),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function searchJanjiTemu(Request $request)
    {
        try {
            $tanggal = $request->query('tanggal');
            $namaDokter = $request->query('nama_dokter');
            
            $user = $request->user();
            $results = $this->janjiTemuService->searchJanjiTemu($tanggal, $namaDokter, $user);
            
            if (empty($results)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tidak ada janji temu yang sesuai dengan pencarian Anda',
                    'data' => [],
                    'timestamp' => now()->toISOString()
                ], 200);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Berhasil menemukan ' . count($results) . ' janji temu',
                'data' => $results,
                'timestamp' => now()->toISOString()
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Maaf, terjadi kesalahan saat mencari janji temu',
                'debug' => config('app.debug') ? $e->getMessage() : null,
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     * path="/janji/{id}",
     * operationId="updateJanjiTemu",
     * tags={"Appointment Management"},
     * summary="[AMAN] Update janji temu",
     * description="Endpoint untuk memperbarui janji temu.",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * @OA\Schema(type="integer"),
     * description="ID Janji Temu"
     * ),
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(
     * @OA\Property(property="tanggal_janji", type="string", format="date", description="Tanggal janji (opsional)", example="2025-11-20"),
     * @OA\Property(property="waktu_mulai", type="string", description="Waktu mulai (opsional)", example="10:00"),
     * @OA\Property(property="waktu_selesai", type="string", description="Waktu selesai (opsional)"),
     * @OA\Property(property="status", type="string", enum={"terjadwal", "selesai", "dibatalkan"}, description="Status (opsional)", example="terjadwal"),
     * @OA\Property(property="keluhan", type="string", description="Keluhan pasien (opsional)", example="Sakit kepala berdenyut dan mual sejak pagi")
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Janji temu berhasil diupdate",
     * @OA\JsonContent(
     * @OA\Property(property="message", type="string", example="Janji temu berhasil diupdate"),
     * @OA\Property(property="data", ref="#/components/schemas/JanjiTemu")
     * )
     * ),
     * @OA\Response(response=400, description="Validasi gagal"),
     * @OA\Response(response=403, description="Tidak memiliki akses"),
     * @OA\Response(response=404, description="Janji temu tidak ditemukan"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function updateJanjiTemu(Request $request, $id)
    {
        try {
            $user = $request->user();
            $data = $request->all();

            $janjiTemu = $this->janjiTemuService->updateJanjiTemu($id, $data, $user);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal janji temu berhasil diperbarui',
                'data' => $janjiTemu,
                'timestamp' => now()->toISOString()
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Maaf, data yang Anda masukkan tidak valid',
                'errors' => $e->errors(),
                'timestamp' => now()->toISOString()
            ], 422);
        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk memperbarui janji temu ini',
                'timestamp' => now()->toISOString()
            ], 403);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Janji temu yang Anda cari tidak ditemukan',
                'timestamp' => now()->toISOString()
            ], 404);
        } catch (Exception $e) {
            $errorMessage = $e->getMessage();
            
            // Handle specific error messages with user-friendly alternatives
            if (str_contains($errorMessage, 'sudah ada janji temu')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, jadwal ini sudah terisi. Silakan pilih waktu lain',
                    'timestamp' => now()->toISOString()
                ], 409);
            }
            
            if (str_contains($errorMessage, 'diluar jam kerja')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, jadwal ini berada di luar jam kerja dokter',
                    'timestamp' => now()->toISOString()
                ], 400);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui janji temu. Silakan coba lagi',
                'debug' => config('app.debug') ? $errorMessage : null,
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     * path="/janji/{id}",
     * operationId="deleteJanjiTemu",
     * tags={"Appointment Management"},
     * summary="[AMAN] Hapus janji temu",
     * description="Endpoint untuk menghapus janji temu (soft delete).",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * @OA\Schema(type="integer"),
     * description="ID Janji Temu"
     * ),
     * @OA\Response(
     * response=200,
     * description="Janji temu berhasil dihapus",
     * @OA\JsonContent(
     * @OA\Property(property="message", type="string", example="Janji temu berhasil dihapus")
     * )
     * ),
     * @OA\Response(response=403, description="Tidak memiliki akses"),
     * @OA\Response(response=404, description="Janji temu tidak ditemukan"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function deleteJanjiTemu(Request $request, $id)
    {
        try {
            $user = $request->user();

            $this->janjiTemuService->deleteJanjiTemu($id, $user);

            return response()->json([
                'success' => true,
                'message' => 'Janji temu berhasil dibatalkan',
                'timestamp' => now()->toISOString()
            ], 200);
        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Maaf, Anda tidak memiliki izin untuk membatalkan janji temu ini',
                'timestamp' => now()->toISOString()
            ], 403);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Janji temu tidak ditemukan atau sudah dibatalkan',
                'timestamp' => now()->toISOString()
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Maaf, terjadi kesalahan saat membatalkan janji temu',
                'debug' => config('app.debug') ? $e->getMessage() : null,
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }
}
