<?php

namespace App\Services;

use App\Models\Pengguna;
use App\Repositories\PasienRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PatientService
{
    protected $patientRepository;

    public function __construct(PasienRepository $pasienRepository)
    {
        $this->patientRepository = $pasienRepository;
    }

    public function getPatient($id)
    {
        return $this->patientRepository->getById($id);
    }


}