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
        return JanjiTemu::where('id_dokter', $idDokter)
            ->where('tanggal_janji', $tanggal)
            ->where('status', '!=', 'dibatalkan')
            ->where('waktu_mulai', '<', $waktuSelesaiBaru) 
            ->where('waktu_selesai', '>', $waktuMulaiBaru)
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
}