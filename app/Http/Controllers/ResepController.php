<?php

namespace App\Http\Controllers;

use App\Models\Resep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Access\AuthorizationException;

use App\Models\Pasien;
use App\Models\Dokter;
use App\Models\RekamMedis;

/**
 * @OA\Tag(
 *     name="Resep",
 *     description="API untuk mengelola resep"
 * )
 */
class ResepController extends Controller
{
    /**
     * @OA\Get(
     *     path="/resep",
     *     tags={"Resep"},
     *     summary="Get all resep",
     *     description="Mengambil semua data resep. Pasien hanya bisa melihat miliknya, Dokter bisa melihat semua.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter berdasarkan status resep (menunggu, diserahkan, dibatalkan)",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="tanggal",
     *         in="query",
     *         description="Filter berdasarkan tanggal resep (format: YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Resep::with([
            'rekamMedis.pasien.pengguna', 
            'rekamMedis.dokter.pengguna', 
            'obat'
        ]);

        // Simplified Role-based authorization
        if ($user->role === 'pasien') {
            $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->firstOrFail();
            $query->whereHas('rekamMedis', function ($q) use ($pasien) {
                $q->where('id_pasien', $pasien->id_pasien);
            });
        }
        // If role is 'dokter', they have full access, so no specific filter is applied.

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('tanggal')) {
            $query->whereDate('tanggal_resep', $request->tanggal);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * @OA\Post(
     *     path="/resep",
     *     tags={"Resep"},
     *     summary="Create new resep",
     *     description="Membuat resep baru beserta detail obatnya. Hanya dokter yang bisa.",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"id_rekam_medis", "tanggal_resep", "status", "details"},
     *             @OA\Property(property="id_rekam_medis", type="integer", example=1),
     *             @OA\Property(property="tanggal_resep", type="string", format="date", example="2025-11-12"),
     *             @OA\Property(property="status", type="string", enum={"menunggu", "diserahkan", "dibatalkan"}, example="menunggu"),
     *             @OA\Property(
     *                 property="details",
     *                 type="array",
     *                 @OA\Items(
     *                     required={"id_obat", "jumlah", "dosis"},
     *                     @OA\Property(property="id_obat", type="integer", example=1),
     *                     @OA\Property(property="jumlah", type="integer", example=10),
     *                     @OA\Property(property="dosis", type="string", example="3x1 sehari"),
     *                     @OA\Property(property="instruksi", type="string", example="Setelah makan"),
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Created"),
     *     @OA\Response(response=422, description="Validation Error"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'dokter') {
            throw new AuthorizationException('Hanya dokter yang bisa membuat resep.');
        }

        $validator = Validator::make($request->all(), [
            'id_rekam_medis' => 'required|exists:rekam_medis,id_rekam_medis',
            'tanggal_resep' => 'required|date',
            'status' => 'required|in:menunggu,diserahkan,dibatalkan',
            'details' => 'required|array|min:1',
            'details.*.id_obat' => 'required|exists:obat,id_obat',
            'details.*.jumlah' => 'required|integer|min:1',
            'details.*.dosis' => 'required|string|max:100',
            'details.*.instruksi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $resep = DB::transaction(function () use ($request) {
            $resep = Resep::create($request->only('id_rekam_medis', 'tanggal_resep', 'status'));

            $detailsData = [];
            foreach ($request->details as $detail) {
                $detailsData[$detail['id_obat']] = [
                    'jumlah' => $detail['jumlah'],
                    'dosis' => $detail['dosis'],
                    'instruksi' => $detail['instruksi'] ?? null,
                ];
            }
            $resep->obat()->attach($detailsData);

            return $resep;
        });

        return response()->json($resep->load('obat'), 201);
    }

    /**
     * @OA\Get(
     *     path="/resep/{id}",
     *     tags={"Resep"},
     *     summary="Get resep by ID",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success"),
     *     @OA\Response(response=404, description="Not Found"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function show(Request $request, $id)
    {
        $resep = Resep::with([
            'rekamMedis.pasien.pengguna', 
            'rekamMedis.dokter.pengguna', 
            'obat'
        ])->findOrFail($id);

        $this->authorizeOwnership($request, $resep);
        
        return response()->json($resep);
    }

    /**
     * @OA\Put(
     *     path="/resep/{id}",
     *     tags={"Resep"},
     *     summary="Update resep status only",
     *     description="Hanya memperbarui status dari sebuah resep. Pasien tidak bisa, Dokter bisa semua.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"menunggu", "diserahkan", "dibatalkan"}, example="diserahkan")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Updated"),
     *     @OA\Response(response=422, description="Validation Error"),
     *     @OA\Response(response=404, description="Not Found"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function update(Request $request, $id)
    {
        $resep = Resep::findOrFail($id);
        $this->authorizeOwnership($request, $resep);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:menunggu,diserahkan,dibatalkan',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $resep->status = $request->status;
        $resep->save();

        return response()->json($resep->load('obat'));
    }

    /**
     * @OA\Delete(
     *     path="/resep/{id}",
     *     tags={"Resep"},
     *     summary="Delete resep",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Deleted"),
     *     @OA\Response(response=404, description="Not Found"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function destroy(Request $request, $id)
    {
        $resep = Resep::findOrFail($id);
        $this->authorizeOwnership($request, $resep);
        
        $resep->delete();
        
        return response()->json(['message' => 'Resep berhasil dihapus']);
    }

    /**
     * Checks if the authenticated user has ownership or the right role to access the prescription.
     *
     * @param Request $request
     * @param Resep $resep
     * @return void
     * @throws AuthorizationException
     */
    private function authorizeOwnership(Request $request, Resep $resep)
    {
        $user = $request->user();

        if ($user->role === 'pasien') {
            $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
            if (!$pasien || $resep->rekamMedis->id_pasien != $pasien->id_pasien) {
                throw new AuthorizationException('This action is unauthorized.');
            }
        } elseif ($user->role !== 'dokter') {
            // If the user is not a patient and not a doctor, they are unauthorized.
            throw new AuthorizationException('This action is unauthorized.');
        }
        // If user is a doctor, they are authorized.
    }
}
