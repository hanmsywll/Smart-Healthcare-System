<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\DoctorScheduleService;
use Illuminate\Http\Request;

/**
 * @OA\Schema(
 *     schema="Doctor",
 *     title="Doctor",
 *     description="Doctor model",
 *     @OA\Property(property="id_dokter", type="integer", description="ID Dokter", readOnly=true),
 *     @OA\Property(property="id_pengguna", type="integer", description="ID Pengguna"),
 *     @OA\Property(property="spesialisasi", type="string", description="Spesialisasi Dokter"),
 *     @OA\Property(property="no_lisensi", type="string", description="Nomor Lisensi Dokter"),
 *     @OA\Property(property="biaya_konsultasi", type="number", format="float", description="Biaya Konsultasi"),
 *     @OA\Property(property="pengguna", ref="#/components/schemas/Pengguna")
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
     *      path="/doctors/schedules",
     *      operationId="getSchedules",
     *      tags={"Doctor Schedules"},
     *      summary="Get list of doctor schedules",
     *      description="Returns list of doctor schedules",
     *      @OA\Parameter(
     *          name="specialization",
     *          in="query",
     *          description="Filter by specialization",
     *          required=false,
     *          @OA\Schema(
     *              type="string"
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Doctor"))
     *       )
     * )
     */
    public function index(Request $request)
    {
        $schedules = $this->doctorScheduleService->getSchedules($request->all());
        return response()->json($schedules);
    }
}
