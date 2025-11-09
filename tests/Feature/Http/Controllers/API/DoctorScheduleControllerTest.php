<?php

namespace Tests\Feature\Http\Controllers\API;

use App\Models\Dokter;
use App\Models\Pengguna;
use App\Services\DoctorScheduleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class DoctorScheduleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $user = Pengguna::factory()->create();
        $this->actingAs($user, 'sanctum');
    }

    public function test_can_get_all_schedules()
    {
        $pengguna1 = Pengguna::factory()->create();
        Dokter::factory()->create(['id_pengguna' => $pengguna1->id_pengguna]);

        $pengguna2 = Pengguna::factory()->create();
        Dokter::factory()->create(['id_pengguna' => $pengguna2->id_pengguna]);

        $response = $this->getJson('/api/doctors/schedules');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonStructure([
                '*' => [
                    'id_dokter',
                    'spesialisasi',
                    'no_lisensi',
                    'biaya_konsultasi',
                    'pengguna' => [
                        'id_pengguna',
                        'nama_lengkap',
                        'email',
                        'no_telepon',
                        'role',
                    ]
                ]
            ]);
    }

    public function test_can_get_schedules_by_specialization()
    {
        $pengguna1 = Pengguna::factory()->create();
        $dokter1 = Dokter::factory()->create([
            'id_pengguna' => $pengguna1->id_pengguna,
            'spesialisasi' => 'cardiology'
        ]);

        $pengguna2 = Pengguna::factory()->create();
        Dokter::factory()->create([
            'id_pengguna' => $pengguna2->id_pengguna,
            'spesialisasi' => 'neurology'
        ]);

        $response = $this->getJson('/api/doctors/schedules?specialization=cardiology');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonStructure([
                '*' => [
                    'id_dokter',
                    'spesialisasi',
                    'no_lisensi',
                    'biaya_konsultasi',
                    'pengguna' => [
                        'id_pengguna',
                        'nama_lengkap',
                        'email',
                        'no_telepon',
                        'role',
                    ]
                ]
            ])
            ->assertJson([
                [
                    'id_dokter' => $dokter1->id_dokter,
                    'spesialisasi' => 'cardiology'
                ]
            ]);
    }
}
