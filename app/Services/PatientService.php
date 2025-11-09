<?php

namespace App\Services;

use App\Models\Pengguna;
use App\Repositories\PatientRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PatientService
{
    protected $patientRepository;

    public function __construct(PatientRepository $patientRepository)
    {
        $this->patientRepository = $patientRepository;
    }

    public function createPatient(array $data)
    {
        $validator = Validator::make($data, [
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:pengguna',
            'password' => 'required|string|min:8',
            'nomor_telepon' => 'required|string|max:20',
            'alamat' => 'required|string',
            'jenis_kelamin' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $pengguna = Pengguna::create([
            'nama_lengkap' => $data['nama'],
            'email' => $data['email'],
            'password_hash' => Hash::make($data['password']),
            'role' => 'pasien',
            'no_telepon' => $data['nomor_telepon'],
        ]);

        $data['id_pengguna'] = $pengguna->id_pengguna;

        return $this->patientRepository->create($data);
    }

    public function getPatient($id)
    {
        return $this->patientRepository->find($id);
    }

    public function updatePatient($id, array $data)
    {
        $validator = Validator::make($data, [
            'nama_lengkap' => 'sometimes|required|string|max:255',
            'no_telepon' => 'sometimes|required|string|max:20',
            'alamat' => 'sometimes|required|string',
            'tanggal_lahir' => 'sometimes|required|date',
            'jenis_kelamin' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        return $this->patientRepository->update($id, $validator->validated());
    }
}