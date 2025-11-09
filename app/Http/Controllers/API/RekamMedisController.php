<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RekamMedis;
use Illuminate\Http\Request;

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
    public function index()
    {
        $data = RekamMedis::with(['pasien', 'dokter', 'janjiTemu'])->get();
        return response()->json($data, 200);
    }

    // Store new rekam medis
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
    public function show($id)
    {
        $rekamMedis = RekamMedis::with(['pasien', 'dokter', 'janjiTemu'])->find($id);

        if (!$rekamMedis) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($rekamMedis, 200);
    }

    // Update record
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
