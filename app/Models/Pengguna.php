<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class Pengguna extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'pengguna';
    protected $primaryKey = 'id_pengguna';

    protected $fillable = [
        'email',
        'password_hash',
        'role',
        'nama_lengkap',
        'no_telepon',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function dokter()
    {
        return $this->hasOne(Dokter::class, 'id_pengguna');
    }

    public function pasien()
    {
        return $this->hasOne(Pasien::class, 'id_pengguna');
    }

    public function apoteker()
    {
        return $this->hasOne(Apoteker::class, 'id_pengguna');
    }
}