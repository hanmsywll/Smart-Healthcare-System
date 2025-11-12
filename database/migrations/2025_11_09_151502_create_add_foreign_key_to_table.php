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
        Schema::table('apoteker', function (Blueprint $table) {
            $table->foreign('id_pengguna', 'apoteker_id_pengguna_foreign')
                  ->references('id_pengguna')->on('pengguna')
                  ->onDelete('cascade');
        });

        Schema::table('detail_resep', function (Blueprint $table) {
            $table->foreign('id_obat', 'detail_resep_id_obat_foreign')
                  ->references('id_obat')->on('obat')
                  ->onDelete('cascade');
            $table->foreign('id_resep', 'detail_resep_id_resep_foreign')
                  ->references('id_resep')->on('resep')
                  ->onDelete('cascade');
        });

        Schema::table('dokter', function (Blueprint $table) {
            $table->foreign('id_pengguna', 'dokter_id_pengguna_foreign')
                  ->references('id_pengguna')->on('pengguna')
                  ->onDelete('cascade');
        });

        Schema::table('janji_temu', function (Blueprint $table) {
            $table->foreign('id_dokter', 'janji_temu_id_dokter_foreign')
                  ->references('id_dokter')->on('dokter')
                  ->onDelete('cascade');
            $table->foreign('id_pasien', 'janji_temu_id_pasien_foreign')
                  ->references('id_pasien')->on('pasien')
                  ->onDelete('cascade');
        });

        Schema::table('pasien', function (Blueprint $table) {
            $table->foreign('id_pengguna', 'pasien_id_pengguna_foreign')
                  ->references('id_pengguna')->on('pengguna')
                  ->onDelete('cascade');
        });

        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->foreign('id_dokter', 'rekam_medis_id_dokter_foreign')
                  ->references('id_dokter')->on('dokter')
                  ->onDelete('cascade');
            $table->foreign('id_janji_temu', 'rekam_medis_id_janji_temu_foreign')
                  ->references('id_janji_temu')->on('janji_temu')
                  ->onDelete('set null'); // Sesuai DDL Anda
            $table->foreign('id_pasien', 'rekam_medis_id_pasien_foreign')
                  ->references('id_pasien')->on('pasien')
                  ->onDelete('cascade');
        });

        Schema::table('resep', function (Blueprint $table) {
            $table->foreign('id_rekam_medis', 'resep_id_rekam_medis_foreign')
                  ->references('id_rekam_medis')->on('rekam_medis')
                  ->onDelete('cascade');
        });

        Schema::table('transaksi_farmasi', function (Blueprint $table) {
            $table->foreign('id_apoteker', 'transaksi_farmasi_id_apoteker_foreign')
                  ->references('id_apoteker')->on('apoteker')
                  ->onDelete('cascade');
            $table->foreign('id_resep', 'transaksi_farmasi_id_resep_foreign')
                  ->references('id_resep')->on('resep')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hapus foreign keys dalam urutan terbalik
        Schema::table('transaksi_farmasi', function (Blueprint $table) {
            $table->dropForeign('transaksi_farmasi_id_apoteker_foreign');
            $table->dropForeign('transaksi_farmasi_id_resep_foreign');
        });

        Schema::table('resep', function (Blueprint $table) {
            $table->dropForeign('resep_id_rekam_medis_foreign');
        });

        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->dropForeign('rekam_medis_id_dokter_foreign');
            $table->dropForeign('rekam_medis_id_janji_temu_foreign');
            $table->dropForeign('rekam_medis_id_pasien_foreign');
        });

        Schema::table('pasien', function (Blueprint $table) {
            $table->dropForeign('pasien_id_pengguna_foreign');
        });

        Schema::table('janji_temu', function (Blueprint $table) {
            $table->dropForeign('janji_temu_id_dokter_foreign');
            $table->dropForeign('janji_temu_id_pasien_foreign');
        });

        Schema::table('dokter', function (Blueprint $table) {
            $table->dropForeign('dokter_id_pengguna_foreign');
        });

        Schema::table('detail_resep', function (Blueprint $table) {
            $table->dropForeign('detail_resep_id_obat_foreign');
            $table->dropForeign('detail_resep_id_resep_foreign');
        });

        Schema::table('apoteker', function (Blueprint $table) {
            $table->dropForeign('apoteker_id_pengguna_foreign');
        });
    }
};