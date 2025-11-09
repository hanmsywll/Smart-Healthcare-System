<?php

namespace App\Services;

use App\Repositories\JanjiTemuRepository;
use Illuminate\Support\Facades\Validator;

class JanjiTemuService
{
    protected $janjiTemuRepository;

    public function __construct(JanjiTemuRepository $janjiTemuRepository)
    {
        $this->janjiTemuRepository = $janjiTemuRepository;
    }

    public function getAppointments(array $filters)
    {
        return $this->janjiTemuRepository->get($filters);
    }

    public function createAppointment(array $data)
    {
        $validator = Validator::make($data, [
            'id_pasien' => 'required|exists:pasien,id_pasien',
            'id_dokter' => 'required|exists:dokter,id_dokter',
            'tanggal_janji' => 'required|date',
            'waktu_janji' => 'required|date_format:H:i',
            'keluhan' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data['status'] = 'dijadwalkan';

        return $this->janjiTemuRepository->create($data);
    }

    public function getAppointmentById($id)
    {
        return $this->janjiTemuRepository->find($id);
    }

    public function updateAppointmentStatus($id, array $data)
    {
        $validator = Validator::make($data, [
            'status' => 'required|string|in:dijadwalkan,selesai,dibatalkan',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        return $this->janjiTemuRepository->updateStatus($id, $data['status']);
    }
}