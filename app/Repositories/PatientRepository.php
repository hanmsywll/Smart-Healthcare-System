<?php

namespace App\Repositories;

use App\Models\Pasien;

class PatientRepository
{
    public function create(array $data)
    {
        $pasien = Pasien::create($data);
        return $pasien->load('pengguna');
    }

    public function find($id)
    {
        return Pasien::with('pengguna')->find($id);
    }

    public function update($id, array $data)
    {
        $pasien = Pasien::find($id);
        $pasien->update($data);
        return $pasien->load('pengguna');
    }
}