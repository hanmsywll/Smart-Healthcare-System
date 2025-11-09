<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\JanjiTemuService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
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
     * path="/janji/ketersediaan",
     * operationId="getKetersediaan",
     * tags={"JanjiTemu"},
     * summary="[PUBLIK] Cek jam terisi",
     * description="Endpoint publik untuk melihat jam (mulai) yang SUDAH TERISI.",
     * @OA\Parameter(
     * name="id_dokter",
     * in="query",
     * description="ID Dokter",
     * required=true,
     * @OA\Schema(type="integer")
     * ),
     * @OA\Parameter(
     * name="tanggal",
     * in="query",
     * description="Tanggal (YYYY-MM-DD)",
     * required=true,
     * @OA\Schema(type="string", format="date")
     * ),
     * @OA\Response(
     * response=200,
     * description="Daftar jam (H:i) yang sudah terisi",
     * @OA\JsonContent(type="array", @OA\Items(type="string", example="14:00"))
     * ),
     * @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function getKetersediaan(Request $request)
    {
        try {
            $bookedSlots = $this->janjiTemuService->getKetersediaan($request->all());
            return response()->json($bookedSlots);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        }
    }


    /**
     * @OA\Get(
     * path="/janji",
     * operationId="getJanjiTemu",
     * tags={"JanjiTemu"},
     * summary="[AMAN] Get list Janji Temu (by Role)",
     * description="Probis #2: Returns list of Janji Temu (sesuai role user)",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="status",
     * in="query",
     * description="Filter by status (terjadwal, selesai, dibatalkan)",
     * required=false,
     * @OA\Schema(type="string")
     * ),
     * @OA\Response(
     * response=200,
     * description="Successful operation",
     * @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/JanjiTemu"))
     * ),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $filters = $request->query(); 
            $janjitemu = $this->janjiTemuService->getJanjiTemu($filters, $user);
            return response()->json($janjitemu);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Post(
     * path="/janji",
     * operationId="createJanjiTemu",
     * tags={"JanjiTemu"},
     * summary="[AMAN] Create a new Janji Temu",
     * description="Probis #1: Pasien Membuat Janji Temu (otomatis 60 menit)",
     * security={{"sanctum":{}}},
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(ref="#/components/schemas/CreateJanjiTemuRequest")
     * ),
     * @OA\Response(
     * response=201,
     * description="Janji Temu berhasil dibuat",
     * @OA\JsonContent(ref="#/components/schemas/JanjiTemu")
     * ),
     * @OA\Response(response=422, description="Validasi gagal (bentrok/luar shift)"),
     * @OA\Response(response=403, description="Forbidden (Pasien tidak ditemukan)"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            $data = $request->all();

            if ($user->role == 'pasien') {
                $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
                if ($pasien) {
                    $data['id_pasien'] = $pasien->id_pasien;
                } else {
                     throw new AuthorizationException('Profil pasien tidak ditemukan.');
                }
            }
            
            $janjitemu = $this->janjiTemuService->createJanjiTemu($data);
            
            return response()->json($janjitemu, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal. Cek data, shift, atau bentrokan jadwal.', 
                'errors' => $e->errors()
            ], 422);
        } catch (AuthorizationException $e) {
             return response()->json(['message' => $e->getMessage()], 403);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     * path="/janji/{id}",
     * operationId="getJanjiTemuById",
     * tags={"JanjiTemu"},
     * summary="[AMAN] Get Janji Temu by ID",
     * description="Mendapat detail Janji Temu (jika user punya hak)",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * description="Janji Temu id",
     * required=true,
     * @OA\Schema(type="integer")
     * ),
     * @OA\Response(
     * response=200,
     * description="Successful operation",
     * @OA\JsonContent(ref="#/components/schemas/JanjiTemu")
     * ),
     * @OA\Response(response=404, description="Not Found"),
     * @OA\Response(response=403, description="Forbidden"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(Request $request, string $id)
    {
        try {
            $user = $request->user();
            $janjitemu = $this->janjiTemuService->getJanjiTemuById($id, $user);
            return response()->json($janjitemu);
        } catch (AuthorizationException $e) {
             return response()->json(['message' => $e->getMessage()], 403);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
             return response()->json(['message' => 'Janji Temu tidak ditemukan.'], 404);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Put(
     * path="/janji/{id}",
     * operationId="updateJanjiTemuStatus",
     * tags={"JanjiTemu"},
     * summary="[AMAN] Update status Janji Temu (Selesai / Batal)",
     * description="Probis #3 & #4: Pembatalan atau Penyelesaian Janji",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * description="Janji Temu id",
     * required=true,
     * @OA\Schema(type="integer")
     * ),
     * @OA\RequestBody(
     * required=true,
     * @OA\JsonContent(ref="#/components/schemas/UpdateJanjiTemuStatusRequest")
     * ),
     * @OA\Response(
     * response=200,
     * description="Successful operation",
     * @OA\JsonContent(ref="#/components/schemas/JanjiTemu")
     * ),
     * @OA\Response(response=404, description="Not Found"),
     * @OA\Response(response=403, description="Forbidden (Misal: Pasien ingin 'selesai')"),
     * @OA\Response(response=422, description="Validation error"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, string $id)
    {
        try {
            $user = $request->user();
            $janjitemu = $this->janjiTemuService->updateJanjiTemuStatus($id, $request->all(), $user);
            return response()->json($janjitemu);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $e->errors()], 422);
        } catch (AuthorizationException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
             return response()->json(['message' => 'Janji Temu tidak ditemukan.'], 404);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Delete(
     * path="/janji/{id}",
     * operationId="deleteJanjiTemu",
     * tags={"JanjiTemu"},
     * summary="[AMAN] Delete Janji Temu (Not Allowed)",
     * description="Gunakan PUT /janji/{id} dengan status 'dibatalkan' (Sesuai Probis #3)",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * description="Janji Temu id",
     * required=true,
     * @OA\Schema(type="integer")
     * ),
     * @OA\Response(response=405, description="Method Not Allowed")
     * )
     */
    public function destroy(string $id)
    {
        return response()->json(['message' => 'Fungsi ini tidak diizinkan. Gunakan PUT untuk membatalkan.'], 405);
    }
}