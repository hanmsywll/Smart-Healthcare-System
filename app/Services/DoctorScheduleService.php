<?php

namespace App\Services;

// use App\Models\Dokter; // Hapus: Service tidak boleh panggil Model
use App\Repositories\DokterRepository; // Tambah: Import Repository

class DoctorScheduleService
{
    protected $dokterRepository; // Tambah

    /**
     * Inject Repository via constructor
     */
    public function __construct(DokterRepository $dokterRepository)
    {
        $this->dokterRepository = $dokterRepository;
    }

    /**
     * Mengambil daftar dokter yang tersedia untuk penjadwalan.
     * Hanya mengembalikan data yang relevan untuk frontend.
     */
    public function getSchedules(array $filters)
    {
        $doctors = $this->dokterRepository->getScheduledDoctors($filters);

        return $doctors->map(function ($dokter) {
            return [
                'id_dokter' => $dokter->id_dokter,
                'nama_lengkap' => $dokter->pengguna->nama_lengkap ?? 'Nama Tidak Tersedia',
                'spesialisasi' => $dokter->spesialisasi,
                'shift' => $dokter->shift,
                'biaya_konsultasi' => $dokter->biaya_konsultasi
            ];
        });
    }
}