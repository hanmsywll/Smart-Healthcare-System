<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Apoteker extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'apoteker';
    protected $primaryKey = 'id_apoteker';

    protected $fillable = [
        'id_pengguna',
        'no_lisensi',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function transaksiFarmasi()
    {
        return $this->hasMany(TransaksiFarmasi::class, 'id_apoteker', 'id_apoteker');
    }
}