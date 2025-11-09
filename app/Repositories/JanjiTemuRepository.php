<?php

namespace App\Repositories;

use App\Models\JanjiTemu;

class JanjiTemuRepository
{
    public function get(array $filters)
    {
        $query = JanjiTemu::query()->with(['pasien', 'dokter']);

        if (isset($filters['tanggal_janji'])) {
            $query->whereDate('tanggal_janji', $filters['tanggal_janji']);
        }

        if (isset($filters['id_dokter'])) {
            $query->where('id_dokter', $filters['id_dokter']);
        }

        if (isset($filters['id_pasien'])) {
            $query->where('id_pasien', $filters['id_pasien']);
        }

        return $query->get();
    }

    public function create(array $data)
    {
        $janjiTemu = JanjiTemu::create($data);
        return $janjiTemu->load(['pasien.pengguna', 'dokter.pengguna']);
    }

    public function find($id)
    {
        return JanjiTemu::with(['pasien', 'dokter'])->find($id);
    }

    public function updateStatus($id, $status)
    {
        $janjiTemu = JanjiTemu::findOrFail($id);
        $janjiTemu->update(['status' => $status]);
        return $janjiTemu;
    }
}