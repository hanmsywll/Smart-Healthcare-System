<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DetailResep extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'detail_resep';
    protected $primaryKey = 'id_detail';

    protected $fillable = [
        'id_resep',
        'id_obat',
        'jumlah',
        'dosis',
        'instruksi',
    ];

    public function resep()
    {
        return $this->belongsTo(Resep::class, 'id_resep');
    }

    public function obat()
    {
        return $this->belongsTo(Obat::class, 'id_obat');
    }
}