<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScanLog extends Model
{
    protected $fillable = ['user_id', 'platform', 'status', 'message', 'games_found', 'payload'];

    protected function casts(): array
    {
        return [
            'games_found' => 'integer',
            'payload' => 'array',
        ];
    }
}
