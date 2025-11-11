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

    /**
     * Mengambil janji temu dokter dengan sorting
     */
    public function getByDokterSorted($idDokter, $status = null, $order = 'desc')
    {
        $query = JanjiTemu::where('id_dokter', $idDokter)
            ->with(['pasien.pengguna', 'dokter.pengguna']);

        if ($status) {
            $query->where('status', $status);
        }

        $order = strtolower($order) === 'asc' ? 'asc' : 'desc';
        return $query->orderBy('tanggal_janji', $order)
                     ->orderBy('waktu_mulai', $order)
                     ->get();
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
    public function     getWaktuTerisi($idDokter, $tanggal)
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

        if ($tanggal) {
            $query->whereDate('tanggal_janji', $tanggal);
        }

        if ($namaDokter) {
            $query->whereHas('dokter.pengguna', function($q) use ($namaDokter) {
                $q->where('nama_lengkap', 'like', '%' . $namaDokter . '%');
            });
        }

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

    /**
     * Mengambil semua janji temu dengan relasi dan sorting
     */
    public function getAllWithRelationsSorted($order = 'desc')
    {
        $order = strtolower($order) === 'asc' ? 'asc' : 'desc';
        return JanjiTemu::with(['pasien.pengguna', 'dokter.pengguna'])
            ->orderBy('tanggal_janji', $order)
            ->orderBy('waktu_mulai', $order)
            ->get();
    }

    /**
     * Mengambil janji temu pasien dengan sorting
     */
    public function getByPasienSorted($idPasien, $status = null, $order = 'desc')
    {
        $query = JanjiTemu::where('id_pasien', $idPasien)
            ->with(['dokter.pengguna', 'pasien.pengguna']);

        if ($status) {
            $query->where('status', $status);
        }

        $order = strtolower($order) === 'asc' ? 'asc' : 'desc';
        return $query->orderBy('tanggal_janji', $order)
                     ->orderBy('waktu_mulai', $order)
                     ->get();
    }

    /**
     * Hitung total janji temu (semua) untuk admin
     */
    public function countAll(): int
    {
        return JanjiTemu::count();
    }

    /**
     * Hitung janji temu aktif untuk admin
     * Definisi aktif: status bukan 'selesai' dan bukan 'dibatalkan'
     */
    public function countActive(): int
    {
        return JanjiTemu::whereNotIn('status', ['selesai', 'dibatalkan'])->count();
    }

    /**
     * Hitung total janji temu untuk pasien tertentu
     */
    public function countByPasien(int $idPasien): int
    {
        return JanjiTemu::where('id_pasien', $idPasien)->count();
    }

    /**
     * Hitung janji temu aktif untuk pasien tertentu
     */
    public function countActiveByPasien(int $idPasien): int
    {
        return JanjiTemu::where('id_pasien', $idPasien)
            ->whereNotIn('status', ['selesai', 'dibatalkan'])
            ->count();
    }

    /**
     * Hitung total janji temu untuk dokter tertentu
     */
    public function countByDokter(int $idDokter): int
    {
        return JanjiTemu::where('id_dokter', $idDokter)->count();
    }

    /**
     * Hitung janji temu aktif untuk dokter tertentu
     */
    public function countActiveByDokter(int $idDokter): int
    {
        return JanjiTemu::where('id_dokter', $idDokter)
            ->whereNotIn('status', ['selesai', 'dibatalkan'])
            ->count();
    }
}
