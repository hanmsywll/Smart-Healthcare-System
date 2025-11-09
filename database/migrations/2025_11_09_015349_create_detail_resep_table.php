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
        Schema::create('detail_resep', function (Blueprint $table) {
            $table->id('id_detail');
            $table->foreignId('id_resep')->constrained('resep', 'id_resep')->onDelete('cascade');
            $table->foreignId('id_obat')->constrained('obat', 'id_obat')->onDelete('cascade');
            $table->integer('jumlah');
            $table->string('dosis', 100)->nullable();
            $table->text('instruksi')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_resep');
    }
};
