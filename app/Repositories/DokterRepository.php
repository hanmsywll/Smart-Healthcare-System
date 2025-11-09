<?php

namespace App\Repositories;

use App\Models\Dokter;

class DokterRepository
{
    /**
     * Mengambil daftar dokter untuk jadwal,
     * sudah termasuk filter, eager-load, dan select kolom.
     */
    public function getScheduledDoctors(array $filters)
    {
        $query = Dokter::query();

        if (isset($filters['specialization'])) {
            $query->where('spesialisasi', $filters['specialization']);
        }

        $query->with(['pengguna' => function ($q) {
            $q->select('id_pengguna', 'nama_lengkap');
        }]);

        return $query->select([
            'id_dokter',
            'id_pengguna',
            'spesialisasi',
            'shift',
            'biaya_konsultasi'
        ])->get();
    }

    /**
     */
    public function getAllBySpesialisasi($spesialisasi = null)
    {
        $query = Dokter::query()->with('pengguna');

        if ($spesialisasi) {
            $query->where('spesialisasi', $spesialisasi);
        }

        return $query->get();
    }

    public function getById($id)
    {
        return Dokter::with('pengguna')->findOrFail($id);
    }

    public function getByShift($shift)
    {
        return Dokter::where('shift', $shift)->get();
    }
}