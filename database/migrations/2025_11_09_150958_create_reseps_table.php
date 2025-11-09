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
        Schema::create('resep', function (Blueprint $table) {
            $table->bigIncrements('id_resep');
            $table->unsignedBigInteger('id_rekam_medis');
            $table->date('tanggal_resep');
            $table->enum('status', ['menunggu', 'diserahkan', 'dibatalkan'])->default('menunggu');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resep');
    }
};