<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RekamMedis;
use Illuminate\Http\Request;

/**
 * @OA\Schema(
 *   schema="RekamMedis",
 *   title="Rekam Medis (Respons)",
 *   description="Model Rekam Medis (Respons)",
 *   @OA\Property(property="id_rekam_medis", type="integer"),
 *   @OA\Property(property="id_pasien", type="integer"),
 *   @OA\Property(property="id_dokter", type="integer"),
 *   @OA\Property(property="id_janji_temu", type="integer", nullable=true),
 *   @OA\Property(property="tanggal_kunjungan", type="string", format="date"),
 *   @OA\Property(property="diagnosis", type="string", nullable=true),
 *   @OA\Property(property="tindakan", type="string", nullable=true),
 *   @OA\Property(property="catatan", type="string", nullable=true),
 *   @OA\Property(property="pasien", ref="#/components/schemas/Patient"),
 *   @OA\Property(property="dokter", ref="#/components/schemas/Doctor"),
 *   @OA\Property(property="janjiTemu", ref="#/components/schemas/JanjiTemu")
 * )
 *
 * @OA\Schema(
 *   schema="CreateRekamMedisRequest",
 *   title="Create Rekam Medis Request",
 *   description="Body request untuk membuat Rekam Medis",
 *   required={"id_pasien","id_dokter","tanggal_kunjungan"},
 *   @OA\Property(property="id_pasien", type="integer", example=1),
 *   @OA\Property(property="id_dokter", type="integer", example=1),
 *   @OA\Property(property="id_janji_temu", type="integer", nullable=true, example=10),
 *   @OA\Property(property="tanggal_kunjungan", type="string", format="date", example="2025-11-12"),
 *   @OA\Property(property="diagnosis", type="string", example="Hipertensi stadium 1"),
 *   @OA\Property(property="tindakan", type="string", example="Pemberian obat dan edukasi diet"),
 *   @OA\Property(property="catatan", type="string", example="Kontrol 2 minggu lagi")
 * )
 *
 * @OA\Schema(
 *   schema="UpdateRekamMedisRequest",
 *   title="Update Rekam Medis Request",
 *   description="Body request untuk memperbarui Rekam Medis",
 *   @OA\Property(property="id_pasien", type="integer", example=1),
 *   @OA\Property(property="id_dokter", type="integer", example=1),
 *   @OA\Property(property="id_janji_temu", type="integer", nullable=true, example=10),
 *   @OA\Property(property="tanggal_kunjungan", type="string", format="date", example="2025-11-13"),
 *   @OA\Property(property="diagnosis", type="string", example="Migrain"),
 *   @OA\Property(property="tindakan", type="string", example="Analgesik dan istirahat"),
 *   @OA\Property(property="catatan", type="string", example="Kurangi kafein")
 * )
 */

class RekamMedisController extends Controller
{
    // Get all rekam medis
    //public function index()
    // {
    //     try {
    //         $data = RekamMedis::all();
    //         return response()->json($data, 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }
    /**
     * @OA\Get(
     *   path="/rekam-medis",
     *   operationId="listRekamMedis",
     *   tags={"Medical Records"},
     *   summary="[AMAN] Daftar semua rekam medis",
     *   description="Mengambil semua rekam medis beserta relasi pasien, dokter, dan janji temu.",
     *   security={{"sanctum":{}}},
     *   @OA\Response(
     *     response=200,
     *     description="Berhasil mengambil daftar rekam medis",
     *     @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/RekamMedis"))
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index()
    {
        $data = RekamMedis::with(['pasien', 'dokter', 'janjiTemu'])->get();
        return response()->json($data, 200);
    }

    // Store new rekam medis
    /**
     * @OA\Post(
     *   path="/rekam-medis",
     *   operationId="createRekamMedis",
     *   tags={"Medical Records"},
     *   summary="[AMAN] Tambah rekam medis",
     *   description="Membuat data rekam medis baru.",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(ref="#/components/schemas/CreateRekamMedisRequest")
     *   ),
     *   @OA\Response(
     *     response=201,
     *     description="Rekam medis berhasil ditambahkan",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Rekam medis berhasil ditambahkan"),
     *       @OA\Property(property="data", ref="#/components/schemas/RekamMedis")
     *     )
     *   ),
     *   @OA\Response(
     *     response=422,
     *     description="Validation error"
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_pasien' => 'required|exists:pasien,id_pasien',
            'id_dokter' => 'required|exists:dokter,id_dokter',
            'id_janji_temu' => 'nullable|exists:janji_temu,id_janji_temu',
            'tanggal_kunjungan' => 'required|date',
            'diagnosis' => 'nullable|string',
            'tindakan' => 'nullable|string',
            'catatan' => 'nullable|string',
        ]);

        $rekamMedis = RekamMedis::create($validated);

        return response()->json([
            'message' => 'Rekam medis berhasil ditambahkan',
            'data' => $rekamMedis
        ], 201);
    }

    // Show specific record
    /**
     * @OA\Get(
     *   path="/rekam-medis/{id}",
     *   operationId="getRekamMedis",
     *   tags={"Medical Records"},
     *   summary="[AMAN] Detail rekam medis",
     *   description="Mengambil detail satu rekam medis dengan relasi.",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="ID rekam medis",
     *     required=true,
     *     @OA\Schema(type="integer")
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Berhasil mengambil data",
     *     @OA\JsonContent(ref="#/components/schemas/RekamMedis")
     *   ),
     *   @OA\Response(response=404, description="Data tidak ditemukan"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $rekamMedis = RekamMedis::with(['pasien', 'dokter', 'janjiTemu'])->find($id);

        if (!$rekamMedis) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($rekamMedis, 200);
    }

    // Update record
    /**
     * @OA\Put(
     *   path="/rekam-medis/{id}",
     *   operationId="updateRekamMedis",
     *   tags={"Medical Records"},
     *   summary="[AMAN] Ubah rekam medis",
     *   description="Memperbarui data rekam medis yang ada.",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="ID rekam medis",
     *     required=true,
     *     @OA\Schema(type="integer")
     *   ),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(ref="#/components/schemas/UpdateRekamMedisRequest")
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Rekam medis berhasil diperbarui",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Rekam medis berhasil diperbarui"),
     *       @OA\Property(property="data", ref="#/components/schemas/RekamMedis")
     *     )
     *   ),
     *   @OA\Response(response=404, description="Data tidak ditemukan"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, $id)
    {
        $rekamMedis = RekamMedis::find($id);
        if (!$rekamMedis) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'id_pasien' => 'sometimes|exists:pasien,id_pasien',
            'id_dokter' => 'sometimes|exists:dokter,id_dokter',
            'id_janji_temu' => 'nullable|exists:janji_temu,id_janji_temu',
            'tanggal_kunjungan' => 'sometimes|date',
            'diagnosis' => 'nullable|string',
            'tindakan' => 'nullable|string',
            'catatan' => 'nullable|string',
        ]);

        $rekamMedis->update($validated);

        return response()->json([
            'message' => 'Rekam medis berhasil diperbarui',
            'data' => $rekamMedis
        ], 200);
    }

    // Delete record (soft delete)
    /**
     * @OA\Delete(
     *   path="/rekam-medis/{id}",
     *   operationId="deleteRekamMedis",
     *   tags={"Medical Records"},
     *   summary="[AMAN] Hapus rekam medis",
     *   description="Menghapus (soft delete) sebuah rekam medis.",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="ID rekam medis",
     *     required=true,
     *     @OA\Schema(type="integer")
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="Rekam medis berhasil dihapus",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Rekam medis berhasil dihapus")
     *     )
     *   ),
     *   @OA\Response(response=404, description="Data tidak ditemukan"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy($id)
    {
        $rekamMedis = RekamMedis::find($id);
        if (!$rekamMedis) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $rekamMedis->delete();
        return response()->json(['message' => 'Rekam medis berhasil dihapus'], 200);
    }
}
