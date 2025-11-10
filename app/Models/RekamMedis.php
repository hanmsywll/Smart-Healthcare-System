<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RekamMedis extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rekam_medis';
    protected $primaryKey = 'id_rekam_medis';

    protected $fillable = [
        'id_pasien',
        'id_dokter',
        'id_janji_temu',
        'tanggal_kunjungan',
        'diagnosis',
        'tindakan',
        'catatan',
    ];

    // Relasi ke tabel Pasien
    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'id_pasien', 'id_pasien');
    }

    // Relasi ke tabel Dokter
    public function dokter()
    {
        return $this->belongsTo(Dokter::class, 'id_dokter', 'id_dokter');
    }

    // Relasi ke tabel JanjiTemu
    public function janjiTemu()
    {
        return $this->belongsTo(JanjiTemu::class, 'id_janji_temu', 'id_janji_temu');
    }
}