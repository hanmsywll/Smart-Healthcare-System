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
        'id_janji_temu',
        'catatan_konsultasi',
    ];

    public function janjiTemu()
    {
        return $this->belongsTo(JanjiTemu::class, 'id_janji_temu');
    }

    public function resep()
    {
        return $this->hasOne(Resep::class, 'id_rekam_medis');
    }
}