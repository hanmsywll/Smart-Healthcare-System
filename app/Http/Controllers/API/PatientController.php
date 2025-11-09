<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\PatientService;
use Illuminate\Http\Request;

/**
 * @OA\Schema(
 *     schema="CreatePatientRequest",
 *     required={"nama", "email", "password", "nomor_telepon", "alamat", "jenis_kelamin", "tanggal_lahir", "golongan_darah"},
 *     @OA\Property(property="nama", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
 *     @OA\Property(property="password", type="string", format="password", minLength=8, example="password"),
 *     @OA\Property(property="nomor_telepon", type="string", maxLength=20, example="081234567890"),
 *     @OA\Property(property="alamat", type="string", example="123 Main Street"),
 *     @OA\Property(property="jenis_kelamin", type="string", enum={"Laki-laki", "Perempuan"}),
 *     @OA\Property(property="tanggal_lahir", type="string", format="date", example="1990-01-01"),
 *     @OA\Property(property="golongan_darah", type="string", enum={"A", "B", "AB", "O"})
 * )
 * @OA\Schema(
 *     schema="UpdatePatientRequest",
 *     @OA\Property(property="nama", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
 *     @OA\Property(property="nomor_telepon", type="string", maxLength=20, example="081234567890"),
 *     @OA\Property(property="alamat", type="string", example="123 Main Street"),
 *     @OA\Property(property="jenis_kelamin", type="string", enum={"Laki-laki", "Perempuan"}),
 *     @OA\Property(property="tanggal_lahir", type="string", format="date", example="1990-01-01"),
 *     @OA\Property(property="golongan_darah", type="string", enum={"A", "B", "AB", "O"})
 * )
 * @OA\Schema(
 *     schema="Patient",
 *     @OA\Property(property="id_pasien", type="integer", example=1),
 *     @OA\Property(property="pengguna", ref="#/components/schemas/Pengguna"),
 *     @OA\Property(property="tanggal_lahir", type="string", format="date", example="1990-01-01"),
 *     @OA\Property(property="golongan_darah", type="string", enum={"A", "B", "AB", "O"}),
 *     @OA\Property(property="alamat", type="string", example="123 Main Street")
 * )
 * @OA\Schema(
 *     schema="Pengguna",
 *     @OA\Property(property="id_pengguna", type="integer", example=1),
 *     @OA\Property(property="nama_lengkap", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
 *     @OA\Property(property="no_telepon", type="string", example="081234567890"),
 *     @OA\Property(property="role", type="string", example="pasien")
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
     * @OA\Post(
     *      path="/patients",
     *      operationId="createPatient",
     *      tags={"Patients"},
     *      summary="Create a new patient",
     *      description="Returns the created patient data",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/CreatePatientRequest")
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Successful operation",
     *          @OA\JsonContent(ref="#/components/schemas/Patient")
     *       ),
     *      @OA\Response(
     *          response=422,
     *          description="Unprocessable Entity"
     *      )
     * )
     */
    public function store(Request $request)
    {
        $patient = $this->patientService->createPatient($request->all());

        return response()->json($patient, 201);
    }

    /**
     * @OA\Get(
     *      path="/patients/{id}",
     *      operationId="getPatientById",
     *      tags={"Patients"},
     *      summary="Get patient information",
     *      description="Returns patient data",
     *      @OA\Parameter(
     *          name="id",
     *          description="Patient id",
     *          required=true,
     *          in="path",
     *          @OA\Schema(
     *              type="integer"
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(ref="#/components/schemas/Patient")
     *       ),
     *      @OA\Response(
     *          response=404,
     *          description="Not Found"
     *      )
     * )
     */
    public function show(string $id)
    {
        $patient = $this->patientService->getPatient($id);

        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        return response()->json($patient);
    }

    /**
     * @OA\Put(
     *      path="/patients/{id}",
     *      operationId="updatePatient",
     *      tags={"Patients"},
     *      summary="Update existing patient",
     *      description="Returns updated patient data",
     *      @OA\Parameter(
     *          name="id",
     *          description="Patient id",
     *          required=true,
     *          in="path",
     *          @OA\Schema(
     *              type="integer"
     *          )
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/UpdatePatientRequest")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(ref="#/components/schemas/Patient")
     *       ),
     *      @OA\Response(
     *          response=404,
     *          description="Not Found"
     *      ),
     *      @OA\Response(
     *          response=422,
     *          description="Unprocessable Entity"
     *      )
     * )
     */
    public function update(Request $request, string $id)
    {
        $patient = $this->patientService->updatePatient($id, $request->all());

        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        return response()->json($patient);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
