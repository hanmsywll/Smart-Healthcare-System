<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Obat extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'obat';
    protected $primaryKey = 'id_obat';

    protected $fillable = [
        'nama_obat',
        'kategori',
        'harga',
        'stok',
    ];

    public function detailResep()
    {
        return $this->hasMany(DetailResep::class, 'id_obat');
    }

    public function resep()
    {
        return $this->belongsToMany(Resep::class, 'detail_resep', 'id_obat', 'id_resep')
                    ->withPivot('jumlah', 'dosis', 'instruksi')
                    ->withTimestamps();
    }
}