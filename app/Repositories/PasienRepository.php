<?php

namespace App\Repositories;

use App\Models\Pasien;

class PasienRepository
{
    public function getByIdPengguna($idPengguna)
    {
        return Pasien::where('id_pengguna', $idPengguna)->firstOrFail();
    }

    public function getById($id)
    {
        return Pasien::findOrFail($id);
    }
}
