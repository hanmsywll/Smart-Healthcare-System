<?php

namespace Tests\Feature\Http\Controllers\API;

use App\Models\Dokter;
use App\Models\Pasien;
use App\Services\JanjiTemuService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

use App\Models\Pengguna;
use Laravel\Sanctum\Sanctum;

class AppointmentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_appointment()
    {
        $pasienPengguna = Pengguna::factory()->create(['role' => 'pasien']);
        $pasien = Pasien::factory()->create(['id_pengguna' => $pasienPengguna->id_pengguna]);

        $dokterPengguna = Pengguna::factory()->create(['role' => 'dokter']);
        $dokter = Dokter::factory()->create(['id_pengguna' => $dokterPengguna->id_pengguna]);

        Sanctum::actingAs($pasienPengguna, ['*']);

        $appointmentData = [
            'id_pasien' => $pasien->id_pasien,
            'id_dokter' => $dokter->id_dokter,
            'tanggal_janji_temu' => '2024-12-31',
            'waktu_janji_temu' => '10:00:00',
            'status' => 'dijadwalkan',
        ];

        $response = $this->postJson('/api/appointments', $appointmentData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id_janji_temu',
                'pasien' => [
                    'id_pasien',
                    'pengguna' => [
                        'id_pengguna',
                        'nama_lengkap',
                        'email'
                    ]
                ],
                'dokter' => [
                    'id_dokter',
                    'pengguna' => [
                        'id_pengguna',
                        'nama_lengkap',
                        'email'
                    ]
                ],
                'tanggal_janji_temu',
                'waktu_janji_temu',
                'status'
            ]);
    }
}
