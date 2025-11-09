<?php

namespace App\Services;

use App\Models\Dokter;
use App\Models\JanjiTemu;
use App\Models\Pengguna;
use App\Repositories\JanjiTemuRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Carbon\Carbon; // <-- Tambahkan Carbon

class JanjiTemuService
{
    protected $janjiTemuRepository;
    
    const DURASI_JANJI_MENIT = 60;

    public function __construct(JanjiTemuRepository $janjiTemuRepository)
    {
        $this->janjiTemuRepository = $janjiTemuRepository;
    }

    public function getKetersediaan(array $filters)
    {
        $validator = Validator::make($filters, [
            'id_dokter' => 'required|integer|exists:dokter,id_dokter',
            'tanggal' => 'required|date',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        return $this->janjiTemuRepository->getWaktuTerisi($filters['id_dokter'], $filters['tanggal']);
    }

    public function getJanjiTemu(array $filters, Pengguna $user)
    {
        if ($user->role == 'dokter') {
            $idDokter = $user->dokter->id_dokter ?? 0;
            return $this->janjiTemuRepository->getByDokter($idDokter, $filters['status'] ?? null);
        }

        if ($user->role == 'pasien') {
            $idPasien = $user->pasien->id_pasien ?? 0;
            return $this->janjiTemuRepository->getByPasien($idPasien, $filters['status'] ?? null);
        }

        return [];
    }

    public function createJanjiTemu(array $data)
    {
        $validator = Validator::make($data, [
            'id_pasien' => 'required|exists:pasien,id_pasien',
            'id_dokter' => 'required|exists:dokter,id_dokter',
            'tanggal_janji' => 'required|date',
            'waktu_mulai' => 'required|date_format:H:i',
            'keluhan' => 'required|string',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
        
        $waktu_mulai_str = $data['waktu_mulai'];
        $waktu_mulai_obj = Carbon::createFromFormat('H:i', $waktu_mulai_str);
        $waktu_selesai_obj = $waktu_mulai_obj->copy()->addMinutes(self::DURASI_JANJI_MENIT);
        $waktu_selesai_str = $waktu_selesai_obj->format('H:i');

        $dokter = Dokter::find($data['id_dokter']);
        $shift_dokter = $dokter->shift;
        
        if (!$this->isWaktuValid($waktu_mulai_str, $waktu_selesai_str, $shift_dokter)) {
            throw ValidationException::withMessages([
                'waktu_mulai' => "Jadwal ({$waktu_mulai_str} - {$waktu_selesai_str}) berada di luar jam shift dokter ({$shift_dokter})."
            ]);
        }
        
        $existingJanjiTemu = $this->janjiTemuRepository->checkConflict(
            $data['id_dokter'],
            $data['tanggal_janji'],
            $waktu_mulai_str,
            $waktu_selesai_str
        );

        if ($existingJanjiTemu) {
            throw ValidationException::withMessages([
                'waktu_mulai' => 'Jadwal dokter sudah terisi pada rentang waktu ini.'
            ]);
        }
        
        $data['status'] = 'terjadwal';
        $data['waktu_selesai'] = $waktu_selesai_str;

        return $this->janjiTemuRepository->create($data);
    }
    
    private function isWaktuValid($waktuMulai, $waktuSelesai, $shift)
    {
        if ($shift == 'pagi') {
            return ($waktuMulai >= '07:00' && $waktuSelesai <= '18:00' && $waktuMulai < $waktuSelesai);
        } elseif ($shift == 'malam') {
            if ($waktuMulai >= '19:00' && $waktuSelesai <= '23:59' && $waktuMulai < $waktuSelesai) {
                return true;
            }
            if (($waktuMulai >= '19:00' || $waktuMulai <= '06:00') && ($waktuSelesai <= '06:00' || $waktuSelesai >= '19:00')) {
                if ($waktuMulai <= '06:00' && $waktuSelesai <= '06:00' && $waktuMulai < $waktuSelesai) return true;
                if ($waktuMulai >= '19:00' && ($waktuSelesai < '06:00' || $waktuSelesai > $waktuMulai)) return true;
            }
        }
        return false;
    }


    public function getJanjiTemuById($id, Pengguna $user)
    {
        $janjiTemu = $this->janjiTemuRepository->findWithRelations($id); 
        if (!$janjiTemu) return null;

        $isPasienOwner = ($user->role == 'pasien' && $user->id_pengguna == $janjiTemu->pasien->id_pengguna);
        $isDokterOwner = ($user->role == 'dokter' && $user->id_pengguna == $janjiTemu->dokter->id_pengguna);

        if (!$isPasienOwner && !$isDokterOwner) {
            throw new AuthorizationException('Anda tidak punya hak akses ke janji temu ini.');
        }

        return $janjiTemu;
    }
    
    public function updateJanjiTemuStatus($id, array $data, Pengguna $user)
    {
        $validator = Validator::make($data, [
            'status' => 'required|string|in:terjadwal,selesai,dibatalkan',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        $janjiTemu = $this->janjiTemuRepository->findWithRelations($id);
        $newStatus = $data['status'];

        $isPasienOwner = ($user->role == 'pasien' && $user->id_pengguna == $janjiTemu->pasien->id_pengguna);
        $isDokterOwner = ($user->role == 'dokter' && $user->id_pengguna == $janjiTemu->dokter->id_pengguna);

        if (!$isPasienOwner && !$isDokterOwner) {
            throw new AuthorizationException('Anda tidak punya hak akses ke janji temu ini.');
        }

        if ($isPasienOwner && $newStatus != 'dibatalkan') {
            throw new AuthorizationException('Pasien hanya dapat membatalkan janji.');
        }

        if ($isDokterOwner && $newStatus == 'terjadwal') {
            throw new AuthorizationException('Dokter tidak dapat mengubah status kembali ke terjadwal.');
        }

        return $this->janjiTemuRepository->updateStatus($id, $newStatus);
    }
}