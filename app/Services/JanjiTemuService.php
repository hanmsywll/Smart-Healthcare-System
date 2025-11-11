<?php

namespace App\Services;

use App\Models\Dokter;
use App\Models\JanjiTemu;
use App\Models\Pasien;
use App\Models\RekamMedis;
use App\Models\Pengguna;
use App\Repositories\JanjiTemuRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;


class JanjiTemuService
{
    protected $janjiTemuRepository;


    public function __construct(JanjiTemuRepository $janjiTemuRepository)
    {
        $this->janjiTemuRepository = $janjiTemuRepository;
    }

    public function getAllKetersediaan()
    {
        $dokters = Dokter::with('pengguna')->get();
        $result = [];

        $today = Carbon::today();
        $nextWeek = $today->copy()->addDays(7);

        foreach ($dokters as $dokter) {
            $jadwal = [];

            for ($date = $today->copy(); $date <= $nextWeek; $date->addDay()) {
                $tanggal = $date->format('Y-m-d');
                $waktuTerisi = $this->janjiTemuRepository->getWaktuTerisi($dokter->id_dokter, $tanggal);

                $slotTersedia = $this->generateAvailableSlots($dokter->shift, $waktuTerisi->toArray());

                $jadwal[] = [
                    'tanggal' => $tanggal,
                    'hari' => $date->format('l'),
                    'jam_terisi' => $waktuTerisi->isEmpty() ? 'Belum ada janji temu' : $waktuTerisi->toArray(),
                    'slot_tersedia' => $slotTersedia,
                    'shift' => $dokter->shift
                ];
            }

            $result[] = [
                'id_dokter' => $dokter->id_dokter,
                'nama_dokter' => $dokter->pengguna->nama_lengkap,
                'spesialisasi' => $dokter->spesialisasi,
                'biaya_konsultasi' => $dokter->biaya_konsultasi,
                'shift' => $dokter->shift,
                'jadwal_ketersediaan' => $jadwal
            ];
        }

        return $result;
    }

    /**
     * Generate available time slots based on doctor's shift
     */
    private function generateAvailableSlots($shift, $bookedSlots)
    {
        $shiftSlots = [
            'pagi' => [
                '07:00',
                '08:00',
                '09:00',
                '10:00',
                '11:00',
                '12:00',
                '13:00',
                '14:00',
                '15:00',
                '16:00',
                '17:00',
                '18:00'
            ],
            'malam' => [
                '19:00',
                '20:00',
                '21:00',
                '22:00',
                '23:00',
                '00:00',
                '01:00',
                '02:00',
                '03:00',
                '04:00',
                '05:00',
                '06:00'
            ]
        ];

        $availableSlots = $shiftSlots[$shift] ?? [];

        return array_values(array_diff($availableSlots, $bookedSlots));
    }

    /**
     * Quick booking for immediate appointment
     */
    public function bookingCepat(array $data, Pengguna $user)
    {
        $validator = Validator::make($data, [
            'id_dokter' => 'required|integer|exists:dokter,id_dokter',
            'tanggal' => 'required|date|after_or_equal:today',
            'waktu_mulai' => 'required|string',
            'keluhan' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        if ($user->role !== 'pasien') {
            throw new \Exception('Hanya pasien yang dapat membuat janji temu');
        }

        $dokter = Dokter::find($data['id_dokter']);
        if (!$dokter) {
            throw new \Exception('Dokter tidak ditemukan');
        }

        $waktuMulai = $data['waktu_mulai'];
        $jamMulai = (int) substr($waktuMulai, 0, 2);

        if ($dokter->shift === 'pagi') {
            if ($jamMulai < 7 || $jamMulai >= 18) {
                throw new \Exception('Dokter ini hanya tersedia pada shift pagi (07:00 - 18:00)');
            }
        } elseif ($dokter->shift === 'malam') {
            if ($jamMulai >= 7 && $jamMulai < 19) {
                throw new \Exception('Dokter ini hanya tersedia pada shift malam (19:00 - 06:00)');
            }
        }

        $waktuMulaiBaru = $data['waktu_mulai'];
        $waktuSelesaiBaru = Carbon::parse($waktuMulaiBaru)->addHour()->format('H:i:s');

        if ($this->janjiTemuRepository->checkConflict($data['id_dokter'], $data['tanggal'], $waktuMulaiBaru, $waktuSelesaiBaru)) {
            throw new \Exception('Slot waktu ini bertabrakan dengan janji temu yang sudah ada');
        }

        $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
        if (!$pasien) {
            throw new \Exception('Data pasien tidak ditemukan');
        }

        $waktuSelesai = Carbon::parse($data['waktu_mulai'])->addHour()->format('H:i:s');

        $janjiData = [
            'id_pasien' => $pasien->id_pasien,
            'id_dokter' => $data['id_dokter'],
            'tanggal_janji' => $data['tanggal'],
            'waktu_mulai' => $data['waktu_mulai'],
            'waktu_selesai' => $waktuSelesai,
            'status' => 'terjadwal',
            'keluhan' => $data['keluhan'] ?? null,
        ];

        return $this->janjiTemuRepository->create($janjiData);
    }

    /**
     * Mendapatkan semua janji temu
     */
    public function getAllJanjiTemu($sort = null)
    {
        $order = null;
        if ($sort) {
            $sort = strtolower($sort);
            $order = in_array($sort, ['asc','desc']) ? $sort : ($sort === 'terlama' ? 'asc' : ($sort === 'terbaru' ? 'desc' : null));
        }

        $items = $order
            ? $this->janjiTemuRepository->getAllWithRelationsSorted($order)
            : $this->janjiTemuRepository->getAllWithRelations();
        foreach ($items as $item) {
            $this->autoCancelIfPast($item);
        }
        return $items;
    }

    /**
     * Mendapatkan detail janji temu berdasarkan ID
     */
    public function getJanjiTemuById($id)
    {
        $janjiTemu = $this->janjiTemuRepository->findWithRelations($id);
        if ($janjiTemu) {
            $this->autoCancelIfPast($janjiTemu);
        }
        return $janjiTemu;
    }

    /**
     * Mendapatkan janji temu berdasarkan pasien
     */
    public function getJanjiTemuByPasien($idPasien, $status = null, $sort = null)
    {
        $order = null;
        if ($sort) {
            $sort = strtolower($sort);
            $order = in_array($sort, ['asc','desc']) ? $sort : ($sort === 'terlama' ? 'asc' : ($sort === 'terbaru' ? 'desc' : null));
        }

        $items = $order
            ? $this->janjiTemuRepository->getByPasienSorted($idPasien, $status, $order)
            : $this->janjiTemuRepository->getByPasien($idPasien, $status);
        foreach ($items as $item) {
            $this->autoCancelIfPast($item);
        }
        return $items;
    }

    /**
     * Mendapatkan janji temu berdasarkan dokter
     */
    public function getJanjiTemuByDokter($idDokter, $status = null, $sort = null)
    {
        $order = null;
        if ($sort) {
            $sort = strtolower($sort);
            $order = in_array($sort, ['asc','desc']) ? $sort : ($sort === 'terlama' ? 'asc' : ($sort === 'terbaru' ? 'desc' : null));
        }

        $items = $order
            ? $this->janjiTemuRepository->getByDokterSorted($idDokter, $status, $order)
            : $this->janjiTemuRepository->getByDokter($idDokter, $status);
        foreach ($items as $item) {
            $this->autoCancelIfPast($item);
        }
        return $items;
    }

    /**
     * Search janji temu berdasarkan tanggal dan nama dokter
     */
    public function searchJanjiTemu($tanggal = null, $namaDokter = null, $user = null)
    {
        $idPasien = null;
        
        if ($user && $user->role === 'pasien') {
            $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
            if (!$pasien) {
                throw new \Exception('Data pasien tidak ditemukan');
            }
            $idPasien = $pasien->id_pasien;
        }
        
        $items = $this->janjiTemuRepository->searchWithFilters($tanggal, $namaDokter, $idPasien);
        foreach ($items as $item) {
            $this->autoCancelIfPast($item);
        }
        return $items;
    }

    /**
     * Statistik janji temu: total dan aktif sesuai role pengguna
     * Definisi aktif: status bukan 'selesai' dan bukan 'dibatalkan'
     */
    public function getJanjiStats(Pengguna $user): array
    {
        if ($user->role === 'pasien') {
            $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
            if (!$pasien) {
                throw new \Exception('Data pasien tidak ditemukan');
            }
            return [
                'total' => $this->janjiTemuRepository->countByPasien($pasien->id_pasien),
                'aktif' => $this->janjiTemuRepository->countActiveByPasien($pasien->id_pasien),
            ];
        }

        if ($user->role === 'dokter') {
            $dokter = Dokter::where('id_pengguna', $user->id_pengguna)->first();
            if (!$dokter) {
                throw new \Exception('Data dokter tidak ditemukan');
            }
            return [
                'total' => $this->janjiTemuRepository->countByDokter($dokter->id_dokter),
                'aktif' => $this->janjiTemuRepository->countActiveByDokter($dokter->id_dokter),
            ];
        }

        return [
            'total' => $this->janjiTemuRepository->countAll(),
            'aktif' => $this->janjiTemuRepository->countActive(),
        ];
    }

    /**
     * Update janji temu
     */
    public function updateJanjiTemu($id, array $data, Pengguna $user)
    {
        $validator = Validator::make($data, [
            'id_pasien' => 'sometimes|required|integer|exists:pasien,id_pasien',
            'id_dokter' => 'sometimes|required|integer|exists:dokter,id_dokter',
            'tanggal_janji' => 'sometimes|required|date',
            'waktu_mulai' => 'sometimes|required|string',
            'waktu_selesai' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:terjadwal,selesai,dibatalkan',
            'keluhan' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        $janjiTemu = $this->janjiTemuRepository->findWithRelations($id);

        if ($user->role === 'pasien') {
            $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
            if (!$pasien || $janjiTemu->id_pasien !== $pasien->id_pasien) {
                throw new AuthorizationException('Anda tidak memiliki akses ke janji temu ini');
            }
            // Pasien hanya boleh update ke 'dibatalkan'
            if (isset($data['status']) && $data['status'] !== 'dibatalkan') {
                throw new AuthorizationException('Pasien hanya dapat membatalkan janji temu');
            }
        }

        if ($user->role === 'dokter') {
            $dokter = Dokter::where('id_pengguna', $user->id_pengguna)->first();
            if (!$dokter || $janjiTemu->id_dokter !== $dokter->id_dokter) {
                throw new AuthorizationException('Anda hanya dapat mengakses janji temu milik Anda');
            }
            // Dokter boleh: 1) menandai selesai, atau 2) meng-assign ke dokter lain (ubah id_dokter)
            // Batasi agar dokter tidak mengubah field lain selain 'status' dan 'id_dokter'
            $allowedKeys = ['id_dokter', 'status'];
            $unknownKeys = array_diff(array_keys($data), $allowedKeys);
            if (!empty($unknownKeys)) {
                throw new AuthorizationException('Dokter hanya dapat mengubah dokter penanggung jawab atau menandai selesai');
            }
            // Jika mengubah status, dokter hanya boleh ke 'selesai'
            if (isset($data['status']) && $data['status'] !== 'selesai') {
                throw new AuthorizationException('Dokter hanya dapat menandai janji temu sebagai selesai');
            }
            // Jika dokter menandai selesai, pastikan rekam medis untuk janji temu ini sudah ada
            if (isset($data['status']) && $data['status'] === 'selesai') {
                $rekamMedis = RekamMedis::where('id_janji_temu', $id)->first();
                if (!$rekamMedis) {
                    throw new \Exception('rekam medis belum tersedia untuk janji temu ini');
                }
                // Pastikan konsistensi data rekam medis dengan janji temu
                if (($rekamMedis->id_dokter ?? null) !== $janjiTemu->id_dokter || ($rekamMedis->id_pasien ?? null) !== $janjiTemu->id_pasien) {
                    throw new \Exception('rekam medis tidak sesuai dengan janji temu ini');
                }
            }
            // Jika dokter melakukan assign ke dokter lain (ubah id_dokter), validasi akan diproses di bawah:
            // - Validasi shift dokter tujuan terhadap waktu_mulai saat ini
            // - Validasi bentrok jadwal (overlap) dengan janji dokter tujuan
        }

        // Otomatis hitung waktu_selesai jika waktu_mulai diupdate
        if (isset($data['waktu_mulai']) && !isset($data['waktu_selesai'])) {
            $data['waktu_selesai'] = Carbon::parse($data['waktu_mulai'])->addHour()->format('H:i:s');
        }

        if (isset($data['id_dokter']) || isset($data['waktu_mulai'])) {
            $idDokter = $data['id_dokter'] ?? $janjiTemu->id_dokter;
            $waktuMulai = $data['waktu_mulai'] ?? $janjiTemu->waktu_mulai;

            $dokter = Dokter::find($idDokter);
            if ($dokter) {
                $jamMulai = (int) substr($waktuMulai, 0, 2);

                if ($dokter->shift === 'pagi') {
                    if ($jamMulai < 7 || $jamMulai >= 18) {
                        throw new \Exception('Dokter ini hanya tersedia pada shift pagi (07:00 - 18:00)');
                    }
                } elseif ($dokter->shift === 'malam') {
                    if ($jamMulai >= 7 && $jamMulai < 19) {
                        throw new \Exception('Dokter ini hanya tersedia pada shift malam (19:00 - 06:00)');
                    }
                }
            }
        }

        if (isset($data['id_dokter']) || isset($data['tanggal_janji']) || isset($data['waktu_mulai']) || isset($data['waktu_selesai'])) {
            $idDokter = $data['id_dokter'] ?? $janjiTemu->id_dokter;
            $tanggal = $data['tanggal_janji'] ?? $janjiTemu->tanggal_janji;
            $waktuMulai = $data['waktu_mulai'] ?? $janjiTemu->waktu_mulai;
            $waktuSelesai = $data['waktu_selesai'] ?? $janjiTemu->waktu_selesai;

            $existingAppointments = JanjiTemu::where('id_dokter', $idDokter)
                ->where('tanggal_janji', $tanggal)
                ->where('status', '!=', 'dibatalkan')
                ->where('id_janji_temu', '!=', $id)
                ->get();

            foreach ($existingAppointments as $appointment) {
                if ($this->isTimeOverlap($waktuMulai, $waktuSelesai, $appointment->waktu_mulai, $appointment->waktu_selesai)) {
                    throw new \Exception('Slot waktu ini bertabrakan dengan janji temu yang sudah ada');
                }
            }
        }

        return $this->janjiTemuRepository->update($id, $data);
    }

    /**
     * Hapus janji temu
     */
    public function deleteJanjiTemu($id, Pengguna $user)
    {
        $janjiTemu = $this->janjiTemuRepository->findWithRelations($id);

        if ($user->role === 'pasien') {
            $pasien = Pasien::where('id_pengguna', $user->id_pengguna)->first();
            if (!$pasien || $janjiTemu->id_pasien !== $pasien->id_pasien) {
                throw new AuthorizationException('Anda tidak memiliki akses ke janji temu ini');
            }
        }

        if ($janjiTemu->status === 'selesai') {
            throw new \Exception('Janji temu yang sudah selesai tidak dapat dihapus');
        }

        return $this->janjiTemuRepository->delete($id);
    }

    /**
     * Cek overlap waktu
     */
    private function isTimeOverlap($startA, $endA, $startB, $endB)
    {
        $startA = Carbon::parse($startA);
        $endA = Carbon::parse($endA);
        $startB = Carbon::parse($startB);
        $endB = Carbon::parse($endB);

        return ($startA < $endB) && ($endA > $startB);
    }

    /**
     * Auto-cancel janji temu: jika status terjadwal dan harinya sudah lewat, ubah ke dibatalkan.
     * Tidak mengubah jika status sudah selesai.
     */
    private function autoCancelIfPast(JanjiTemu $janjiTemu)
    {
        try {
            if (!$janjiTemu) return;
            if ($janjiTemu->status === 'selesai') return;
            if ($janjiTemu->status !== 'terjadwal') return;

            $tanggal = Carbon::parse($janjiTemu->tanggal_janji);
            if ($tanggal->isBefore(Carbon::today())) {
                $janjiTemu->status = 'dibatalkan';
                $janjiTemu->save();
            }
        } catch (\Throwable $e) {

        }
    }
}
