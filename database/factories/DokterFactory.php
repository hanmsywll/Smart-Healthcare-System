<?php

namespace Database\Factories;

use App\Models\Dokter;
use App\Models\Pengguna;
use Illuminate\Database\Eloquent\Factories\Factory;

class DokterFactory extends Factory
{
    protected $model = Dokter::class;

    public function definition()
    {
        return [
            'id_pengguna' => Pengguna::factory(),
            'spesialisasi' => $this->faker->word,
            'no_lisensi' => $this->faker->unique()->numerify('##########'),
            'biaya_konsultasi' => $this->faker->randomFloat(2, 100000, 500000),
        ];
    }
}