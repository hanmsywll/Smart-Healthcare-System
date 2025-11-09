<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TransaksiFarmasi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'transaksi_farmasi';
    protected $primaryKey = 'id_transaksi';

    protected $fillable = [
        'id_resep',
        'id_apoteker',
        'tanggal_transaksi',
        'total_harga',
    ];

    protected $casts = [
        'tanggal_transaksi' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function resep()
    {
        return $this->belongsTo(Resep::class, 'id_resep', 'id_resep');
    }

    public function apoteker()
    {
        return $this->belongsTo(Apoteker::class, 'id_apoteker', 'id_apoteker');
    }
}