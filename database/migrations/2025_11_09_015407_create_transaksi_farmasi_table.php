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
        Schema::create('transaksi_farmasi', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->foreignId('id_resep')->constrained('resep', 'id_resep')->onDelete('cascade');
            $table->foreignId('id_apoteker')->constrained('apoteker', 'id_apoteker')->onDelete('cascade');
            $table->timestamp('tanggal_transaksi')->nullable();
            $table->decimal('total_harga', 10, 2);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_farmasi');
    }
};
