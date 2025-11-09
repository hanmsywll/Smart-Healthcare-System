<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Pengguna;
use App\Models\Pasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_patient()
    {
        $pengguna = Pengguna::factory()->create();
        $this->actingAs($pengguna, 'sanctum');

        $data = [
            'email' => 'testuser@example.com',
            'password' => 'password',
            'nama' => 'Test User',
            'nomor_telepon' => '1234567890',
            'alamat' => '123 Test Street',
            'jenis_kelamin' => 'Laki-laki',
            'tanggal_lahir' => '1990-01-15',
            'golongan_darah' => 'A',
        ];

        $response = $this->postJson('/api/patients', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id_pasien',
                'pengguna' => [
                    'id_pengguna',
                    'nama_lengkap',
                    'email',
                    'no_telepon',
                    'role',
                ],
                'tanggal_lahir',
                'golongan_darah',
                'alamat',
            ]);
    }

    public function test_can_get_patient()
    {
        $pengguna = Pengguna::factory()->create();
        $this->actingAs($pengguna, 'sanctum');
        $pasien = Pasien::factory()->create(['id_pengguna' => $pengguna->id_pengguna]);

        $response = $this->getJson('/api/patients/' . $pasien->id_pasien);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id_pasien',
                'pengguna' => [
                    'id_pengguna',
                    'nama_lengkap',
                    'email',
                    'no_telepon',
                    'role',
                ],
                'tanggal_lahir',
                'golongan_darah',
                'alamat',
            ]);
    }

    public function test_can_update_patient()
    {
        $pengguna = Pengguna::factory()->create();
        $this->actingAs($pengguna, 'sanctum');
        $pasien = Pasien::factory()->create(['id_pengguna' => $pengguna->id_pengguna]);

        $data = [
            'alamat' => '456 Updated Street',
        ];

        $response = $this->putJson('/api/patients/' . $pasien->id_pasien, $data);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id_pasien',
                'pengguna' => [
                    'id_pengguna',
                    'nama_lengkap',
                    'email',
                    'no_telepon',
                    'role',
                ],
                'tanggal_lahir',
                'golongan_darah',
                'alamat',
            ])
            ->assertJson([
                'id_pasien' => $pasien->id_pasien,
                'alamat' => '456 Updated Street',
            ]);
    }
}