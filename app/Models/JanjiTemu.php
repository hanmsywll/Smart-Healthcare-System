<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JanjiTemu extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'janji_temu';
    protected $primaryKey = 'id_janji_temu';

    protected $fillable = [
        'id_pasien',
        'id_dokter',
        'tanggal_janji',
        'waktu_janji',
        'status',
        'keluhan',
    ];

    protected $casts = [
        'tanggal_janji' => 'date',
        'waktu_janji' => 'datetime',
    ];

    public function pasien()
    {
        return $this->belongsTo(Pasien::class, 'id_pasien');
    }

    public function dokter()
    {
        return $this->belongsTo(Dokter::class, 'id_dokter');
    }

    public function rekamMedis()
    {
        return $this->hasOne(RekamMedis::class, 'id_janji_temu');
    }
}