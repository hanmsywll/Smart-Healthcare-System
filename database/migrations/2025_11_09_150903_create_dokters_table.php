<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dokter', function (Blueprint $table) {
            $table->bigIncrements('id_dokter');
            $table->unsignedBigInteger('id_pengguna'); // Foreign key ditambah di file terpisah
            $table->string('spesialisasi', 100);
            $table->string('no_lisensi', 100)->unique();
            $table->decimal('biaya_konsultasi', 10, 2)->nullable();
            $table->enum('shift', ['pagi', 'malam'])->default('pagi'); // Sesuai SQL dump Anda
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokter');
    }
};