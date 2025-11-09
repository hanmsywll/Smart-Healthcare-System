<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use App\Models\Dokter;
use App\Models\Pasien;
use Illuminate\Support\Facades\Hash;

class TestingUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Doctor
        $dokterPengguna = Pengguna::create([
            'email' => 'raihanstrange@gmail.com',
            'password_hash' => Hash::make('qwerty123'),
            'role' => 'dokter',
            'nama_lengkap' => 'Raihan Strange',
            'no_telepon' => '085156401610',
        ]);

        Dokter::create([
            'id_pengguna' => $dokterPengguna->id_pengguna,
            'spesialisasi' => 'Ahli Sihir',
            'no_lisensi' => '12345678',
            'biaya_konsultasi' => 100000,
        ]);

        // Create Doctor RaihanWong - Shift Malam
        $dokterMalamPengguna = Pengguna::create([
            'email' => 'raihanwong@clinic.com',
            'password_hash' => Hash::make('qwerty123'),
            'role' => 'dokter',
            'nama_lengkap' => 'Raihan Wong',
            'no_telepon' => '081234567890',
        ]);

        Dokter::create([
            'id_pengguna' => $dokterMalamPengguna->id_pengguna,
            'spesialisasi' => 'Umum',
            'no_lisensi' => '87654321',
            'biaya_konsultasi' => 150000,
            'shift' => 'malam',
        ]);

        // Create Patient
        $pasienPengguna = Pengguna::create([
            'email' => 'raihanstark@gmail.com',
            'password_hash' => Hash::make('qwerty123'),
            'role' => 'pasien',
            'nama_lengkap' => 'Raihan Stark',
            'no_telepon' => '085156401611',
        ]);

        Pasien::create([
            'id_pengguna' => $pasienPengguna->id_pengguna,
            'tanggal_lahir' => '2003-12-01',
            'alamat' => 'jalan avengers',
            'golongan_darah' => 'O',
        ]);
    }
}
