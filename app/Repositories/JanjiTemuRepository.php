<?php

namespace App\Repositories;

use App\Models\JanjiTemu;
use Carbon\Carbon;

class JanjiTemuRepository
{
    public function create($data)
    {
        return JanjiTemu::create($data);
    }

    public function getByDokter($idDokter, $status = null)
    {
        $query = JanjiTemu::where('id_dokter', $idDokter)
            ->with(['pasien.pengguna', 'dokter.pengguna']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('tanggal_janji', 'asc')->orderBy('waktu_mulai', 'asc')->get();
    }

    public function getByPasien($idPasien, $status = null)
    {
        $query = JanjiTemu::where('id_pasien', $idPasien)
            ->with(['dokter.pengguna', 'pasien.pengguna']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('tanggal_janji', 'asc')->orderBy('waktu_mulai', 'asc')->get();
    }

    public function updateStatus($idJanji, $status)
    {
        $janjiTemu = JanjiTemu::findOrFail($idJanji);
        $janjiTemu->update(['status' => $status]);
        return $janjiTemu;
    }

    /**
     * Mengecek bentrokan (overlap).
     * Rumus: (StartA < EndB) AND (EndA > StartB)
     */
    public function checkConflict($idDokter, $tanggal, $waktuMulaiBaru, $waktuSelesaiBaru)
    {
        $waktuMulaiBaruCarbon = Carbon::parse($waktuMulaiBaru);
        $waktuSelesaiBaruCarbon = Carbon::parse($waktuSelesaiBaru);

        return JanjiTemu::where('id_dokter', $idDokter)
            ->where('tanggal_janji', $tanggal)
            ->where('status', '!=', 'dibatalkan')
            ->where(function ($query) use ($waktuMulaiBaruCarbon, $waktuSelesaiBaruCarbon) {
                $query->where(function ($q) use ($waktuMulaiBaruCarbon, $waktuSelesaiBaruCarbon) {
                    $q->whereRaw("waktu_mulai < ? AND waktu_selesai > ?", [
                        $waktuSelesaiBaruCarbon->format('H:i:s'),
                        $waktuMulaiBaruCarbon->format('H:i:s')
                    ]);
                });
            })
            ->exists();
    }

    /**
     * Mengambil HANYA jam mulai yang sudah terisi untuk endpoint publik
     */
    public function getWaktuTerisi($idDokter, $tanggal)
    {
        return JanjiTemu::where('id_dokter', $idDokter)
            ->where('tanggal_janji', $tanggal)
            ->where('status', '!=', 'dibatalkan')
            ->pluck('waktu_mulai')
            ->map(function ($time) {
                return Carbon::parse($time)->format('H:i');
            });
    }

    /**
     * Mengambil Janji Temu lengkap dengan relasinya
     */
    public function findWithRelations($id)
    {
        return JanjiTemu::with(['pasien.pengguna', 'dokter.pengguna'])->findOrFail($id);
    }

    /**
     * Mengambil Janji Temu lengkap dengan relasinya (termasuk yang sudah dihapus)
     */
    public function findWithRelationsTrashed($id)
    {
        return JanjiTemu::with(['pasien.pengguna', 'dokter.pengguna'])->withTrashed()->findOrFail($id);
    }

    /**
     * Mengambil semua janji temu dengan relasi
     */
    public function getAllWithRelations()
    {
        return JanjiTemu::with(['pasien.pengguna', 'dokter.pengguna'])->get();
    }

    /**
     * Search janji temu berdasarkan tanggal dan nama dokter
     */
    public function searchWithFilters($tanggal = null, $namaDokter = null, $idPasien = null)
    {
        $query = JanjiTemu::with(['pasien.pengguna', 'dokter.pengguna']);

        // Filter berdasarkan tanggal
        if ($tanggal) {
            $query->whereDate('tanggal_janji', $tanggal);
        }

        // Filter berdasarkan nama dokter
        if ($namaDokter) {
            $query->whereHas('dokter.pengguna', function($q) use ($namaDokter) {
                $q->where('nama_lengkap', 'like', '%' . $namaDokter . '%');
            });
        }

        // Filter berdasarkan pasien (untuk riwayat pribadi)
        if ($idPasien) {
            $query->where('id_pasien', $idPasien);
        }

        return $query->orderBy('tanggal_janji', 'desc')
                     ->orderBy('waktu_mulai', 'desc')
                     ->get();
    }

    /**
     * Update data janji temu
     */
    public function update($id, $data)
    {
        $janjiTemu = JanjiTemu::findOrFail($id);
        $janjiTemu->update($data);
        return $janjiTemu;
    }

    /**
     * Hapus janji temu (soft delete)
     */
    public function delete($id)
    {
        $janjiTemu = JanjiTemu::findOrFail($id);
        $janjiTemu->delete();
        return $janjiTemu;
    }
}
