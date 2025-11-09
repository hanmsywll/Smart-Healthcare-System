<?php

namespace App\Services;

use App\Models\Dokter;

class DoctorScheduleService
{
    public function getSchedules(array $filters)
    {
        $query = Dokter::with('pengguna');

        if (isset($filters['specialization'])) {
            $query->where('spesialisasi', $filters['specialization']);
        }

        return $query->get();
    }
}