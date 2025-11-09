<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pengguna>
 */
class PenggunaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => $this->faker->unique()->safeEmail,
            'password_hash' => bcrypt('password'), // password
            'role' => 'pasien',
            'nama_lengkap' => $this->faker->name,
            'no_telepon' => $this->faker->phoneNumber,
        ];
    }
}
