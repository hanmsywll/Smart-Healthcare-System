<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\JanjiTemuService;
use Illuminate\Http\Request;

/**
 * @OA\Schema(
 *     schema="JanjiTemu",
 *     title="Janji Temu",
 *     description="Janji Temu model",
 *     @OA\Property(property="id_janji_temu", type="integer", description="ID Janji Temu", readOnly=true),
 *     @OA\Property(property="id_pasien", type="integer", description="ID Pasien"),
 *     @OA\Property(property="id_dokter", type="integer", description="ID Dokter"),
 *     @OA\Property(property="tanggal_janji", type="string", format="date", description="Tanggal Janji Temu"),
 *     @OA\Property(property="waktu_janji", type="string", format="time", description="Waktu Janji Temu"),
 *     @OA\Property(property="status", type="string", enum={"dijadwalkan", "selesai", "dibatalkan"}, description="Status Janji Temu"),
 *     @OA\Property(property="keluhan", type="string", description="Keluhan Pasien"),
 *     @OA\Property(property="pasien", ref="#/components/schemas/Patient"),
 *     @OA\Property(property="dokter", ref="#/components/schemas/Doctor")
 * )
 *
 * @OA\Schema(
 *      schema="CreateJanjiTemuRequest",
 *      title="Create Janji Temu Request",
 *      description="Create Janji Temu request body",
 *      required={"id_pasien", "id_dokter", "tanggal_janji", "waktu_janji", "keluhan"},
 *      @OA\Property(property="id_pasien", type="integer", description="ID Pasien"),
 *      @OA\Property(property="id_dokter", type="integer", description="ID Dokter"),
 *      @OA\Property(property="tanggal_janji", type="string", format="date", description="Tanggal Janji Temu"),
 *      @OA\Property(property="waktu_janji", type="string", format="time", description="Waktu Janji Temu"),
 *      @OA\Property(property="keluhan", type="string", description="Keluhan Pasien")
 * )
 *
 * @OA\Schema(
 *     schema="UpdateJanjiTemuStatusRequest",
 *     title="Update Janji Temu Status Request",
 *     description="Update Janji Temu Status request body",
 *     required={"status"},
 *     @OA\Property(property="status", type="string", enum={"dijadwalkan", "selesai", "dibatalkan"}, description="Status Janji Temu")
 * )
 */
class AppointmentController extends Controller
{
    protected $janjiTemuService;

    public function __construct(JanjiTemuService $janjiTemuService)
    {
        $this->janjiTemuService = $janjiTemuService;
    }

    /**
     * @OA\Get(
     *      path="/appointments",
     *      operationId="getAppointments",
     *      tags={"Appointments"},
     *      summary="Get list of appointments",
     *      description="Returns list of appointments",
     *      @OA\Parameter(
     *          name="date",
     *          in="query",
     *          description="Filter by date",
     *          required=false,
     *          @OA\Schema(
     *              type="string",
     *              format="date"
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/JanjiTemu"))
     *       )
     * )
     */
    public function index(Request $request)
    {
        $appointments = $this->janjiTemuService->getAppointments($request->all());
        return response()->json($appointments);
    }

    /**
     * @OA\Post(
     *      path="/appointments",
     *      operationId="createAppointment",
     *      tags={"Appointments"},
     *      summary="Create a new appointment",
     *      description="Returns the created appointment data",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/CreateJanjiTemuRequest")
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Successful operation",
     *          @OA\JsonContent(ref="#/components/schemas/JanjiTemu")
     *       ),
     *      @OA\Response(
     *          response=422,
     *          description="Unprocessable Entity"
     *      )
     * )
     */
    public function store(Request $request)
    {
        $appointment = $this->janjiTemuService->createAppointment($request->all());
        return response()->json($appointment, 201);
    }

    /**
     * @OA\Get(
     *      path="/appointments/{id}",
     *      operationId="getAppointmentById",
     *      tags={"Appointments"},
     *      summary="Get appointment information",
     *      description="Returns appointment data",
     *      @OA\Parameter(
     *          name="id",
     *          description="Appointment id",
     *          required=true,
     *          in="path",
     *          @OA\Schema(
     *              type="integer"
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent()
     *       ),
     *      @OA\Response(
     *          response=404,
     *          description="Not Found"
     *      )
     * )
     */
    public function show(string $id)
    {
        $appointment = $this->janjiTemuService->getAppointmentById($id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        return response()->json($appointment);
    }

    /**
     * @OA\Patch(
     *      path="/appointments/{id}/status",
     *      operationId="updateAppointmentStatus",
     *      tags={"Appointments"},
     *      summary="Update appointment status",
     *      description="Returns updated appointment data",
     *      @OA\Parameter(
     *          name="id",
     *          description="Appointment id",
     *          required=true,
     *          in="path",
     *          @OA\Schema(
     *              type="integer"
     *          )
     *      ),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/UpdateJanjiTemuStatusRequest")
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(ref="#/components/schemas/JanjiTemu")
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
    public function update(Request $request, $id)
    {
        $appointment = $this->janjiTemuService->updateAppointmentStatus($id, $request->all());
        return response()->json($appointment);
    }
}
