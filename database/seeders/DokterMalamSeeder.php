<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use App\Models\Dokter;
use Illuminate\Support\Facades\Hash;

class DokterMalamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Doctor RaihanWong - Shift Malam
        $dokterMalamPengguna = Pengguna::create([
            'email' => 'raihanwong.malam@clinic.com',
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
    }
}
