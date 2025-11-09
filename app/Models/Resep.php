<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resep extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'resep';
    protected $primaryKey = 'id_resep';

    protected $fillable = [
        'id_rekam_medis',
        'tanggal_resep',
        'status',
    ];

    protected $casts = [
        'tanggal_resep' => 'date',
    ];

    public function rekamMedis()
    {
        return $this->belongsTo(RekamMedis::class, 'id_rekam_medis');
    }

    public function detailResep()
    {
        return $this->hasMany(DetailResep::class, 'id_resep');
    }

    public function transaksiFarmasi()
    {
        return $this->hasOne(TransaksiFarmasi::class, 'id_resep');
    }

    public function obat()
    {
        return $this->belongsToMany(Obat::class, 'detail_resep', 'id_resep', 'id_obat')
                    ->withPivot('jumlah', 'dosis', 'instruksi')
                    ->withTimestamps();
    }
}