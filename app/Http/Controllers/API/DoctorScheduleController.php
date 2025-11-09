<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\DoctorScheduleService;
use Illuminate\Http\Request;

/**
 * @OA\Schema(
 * schema="Doctor",
 * title="Doctor (Model Lengkap)",
 * description="Model Doctor lengkap dari database",
 * @OA\Property(property="id_dokter", type="integer", readOnly=true),
 * @OA\Property(property="id_pengguna", type="integer"),
 * @OA\Property(property="spesialisasi", type="string"),
 * @OA\Property(property="no_lisensi", type="string"),
 * @OA\Property(property="biaya_konsultasi", type="number", format="float"),
 * @OA\Property(property="shift", type="string", enum={"pagi", "malam"}),
 * @OA\Property(property="pengguna", ref="#/components/schemas/Pengguna")
 * )
 *
 * @OA\Schema(
 * schema="DoctorScheduleResponse",
 * title="Doctor Schedule Response",
 * description="Data dokter yang disederhanakan untuk ditampilkan di jadwal",
 * @OA\Property(property="id_dokter", type="integer", example=1),
 * @OA\Property(property="nama_lengkap", type="string", example="Raihan Strange"),
 * @OA\Property(property="spesialisasi", type="string", example="Ahli Sihir"),
 * @OA\Property(property="shift", type="string", enum={"pagi", "malam"}, example="pagi"),
 * @OA\Property(property="biaya_konsultasi", type="number", format="float", example=100000)
 * )
 */
class DoctorScheduleController extends Controller
{
    protected $doctorScheduleService;

    public function __construct(DoctorScheduleService $doctorScheduleService)
    {
        $this->doctorScheduleService = $doctorScheduleService;
    }

    /**
     * @OA\Get(
     * path="/doctors/schedules",
     * operationId="getSchedules",
     * tags={"Doctors"},
     * summary="[AMAN] Get list of doctor schedules",
     * description="Probis #1, Alur 3: Returns list of doctor schedules",
     * security={{"sanctum":{}}},
     * @OA\Parameter(
     * name="specialization",
     * in="query",
     * description="Filter by specialization",
     * required=false,
     * @OA\Schema(
     * type="string"
     * )
     * ),
     * @OA\Response(
     * response=200,
     * description="Successful operation",
     * @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/DoctorScheduleResponse"))
     * ),
     * @OA\Response(
     * response=401,
     * description="Unauthenticated"
     * )
     * )
     */
    public function index(Request $request)
    {
        $schedules = $this->doctorScheduleService->getSchedules($request->all());
        return response()->json($schedules);
    }
}