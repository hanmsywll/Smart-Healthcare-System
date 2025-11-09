<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pasien extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pasien';
    protected $primaryKey = 'id_pasien';

    protected $fillable = [
        'id_pengguna',
        'tanggal_lahir',
        'golongan_darah',
        'alamat',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna');
    }

    public function janjiTemu()
    {
        return $this->hasMany(JanjiTemu::class, 'id_pasien');
    }

    public function rekamMedis()
    {
        return $this->hasMany(RekamMedis::class, 'id_pasien');
    }
}