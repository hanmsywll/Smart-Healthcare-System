<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\PatientService;
use Illuminate\Http\Request;
use Exception;



/**
 * @OA\Schema(
 * schema="Patient",
 * title="Patient",
 * description="Model Profil Pasien",
 * @OA\Property(property="id_pasien", type="integer", example=1),
 * @OA\Property(property="id_pengguna", type="integer", example=1),
 * @OA\Property(property="tanggal_lahir", type="string", format="date", example="2003-12-01"),
 * @OA\Property(property="golongan_darah", type="string", enum={"A", "B", "AB", "O"}),
 * @OA\Property(property="alamat", type="string", example="jalan avengers"),
 * @OA\Property(property="pengguna", ref="#/components/schemas/Pengguna")
 * )
 *  @OA\Schema(
 * schema="Pengguna",
 * title="Pengguna",
 * description="Model Pengguna (data dasar)",
 * @OA\Property(property="id_pengguna", type="integer", example=1),
 * @OA\Property(property="nama_lengkap", type="string", example="Raihan Stark"),
 * @OA\Property(property="email", type="string", format="email", example="raihanstark@gmail.com"),
 * @OA\Property(property="no_telepon", type="string", example="085156401611"),
 * @OA\Property(property="role", type="string", example="pasien")
 * )
 */
 
class PatientController extends Controller
{
    protected $patientService;

    public function __construct(PatientService $patientService)
    {
        $this->patientService = $patientService;
    }

        /**
     * @OA\Get(
     * path="/patients/{id}",
     * operationId="getPatientById",
     * tags={"Patients"},
     * summary="[AMAN] Get patient information",
     * description="Mendapatkan detail profil pasien.",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="id",
     * in="path",
     * description="Patient id",
     * required=true,
     * @OA\Schema(type="integer")
     * ),
     * @OA\Response(
     * response=200,
     * description="Successful operation",
     * @OA\JsonContent(ref="#/components/schemas/Patient")
     * ),
     * @OA\Response(response=404, description="Not Found"),
     * @OA\Response(response=401, description="Unauthenticated")
     * )
     */


    public function show(string $id)
    {
        try {
            $patient = $this->patientService->getPatient($id);
            return response()->json($patient);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Patient not found'], 404);
        } catch (Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        }
    }



    public function destroy(string $id)
    {
        return response()->json(['message' => 'Not Implemented'], 501);
    }
}
